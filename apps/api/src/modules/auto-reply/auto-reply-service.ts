import type {
  Conversation,
  EscalationReason,
  SocialMessage
} from "../../../../../packages/shared/src/types/social-inbox.js";
import type { InstagramOutboundClient } from "../instagram/instagram-outbound-client.js";
import { escalateAsFlorencia, sendOperatorReplyToInstagram } from "../social-inbox/human-gate-service.js";
import { SocialInboxStore, stableId } from "../social-inbox/social-inbox-store.js";

export const AUTO_REPLY_OWNER = "florencia-mkt";
const ELIGIBLE_STATUSES = new Set(["received", "normalized"]);
const MAX_FAILED_ATTEMPTS = 3;
const HISTORY_LIMIT = 10;

export interface FlorenciaDecisionRequest {
  agent: "florencia-mkt";
  channel: string;
  conversationId: string;
  message: { id: string; text: string; receivedAt: string; attachmentCount: number };
  history: Array<{ direction: string; author: string; text: string; at: string }>;
}

export type FlorenciaDecision =
  | { action: "reply"; text: string; sensitive?: boolean }
  | { action: "escalate"; reason: EscalationReason; detail: string }
  | { action: "skip"; detail?: string };

export interface FlorenciaDecisionClient {
  decide(request: FlorenciaDecisionRequest): Promise<FlorenciaDecision>;
}

export class HttpFlorenciaDecisionClient implements FlorenciaDecisionClient {
  constructor(
    private readonly endpoint: string,
    private readonly sharedSecret?: string,
    private readonly timeoutMs = 20000
  ) {}

  async decide(request: FlorenciaDecisionRequest): Promise<FlorenciaDecision> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(this.sharedSecret === undefined ? {} : { "x-scc-internal-secret": this.sharedSecret })
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.timeoutMs)
    });
    const rawText = await response.text();
    if (!response.ok) {
      throw new Error(`Florencia decision endpoint answered ${response.status}`);
    }
    return parseDecision(rawText.length === 0 ? undefined : JSON.parse(rawText));
  }
}

export function parseDecision(raw: unknown): FlorenciaDecision {
  const value = (raw ?? {}) as Record<string, unknown>;
  if (value.action === "reply") {
    if (typeof value.text !== "string" || value.text.trim().length === 0) {
      throw new Error("Florencia decision 'reply' without text");
    }
    return { action: "reply", text: value.text, sensitive: value.sensitive === true };
  }
  if (value.action === "escalate") {
    const reason: EscalationReason =
      value.reason === "sensitive" || value.reason === "missing_info" ? value.reason : "ambiguous";
    return { action: "escalate", reason, detail: typeof value.detail === "string" && value.detail !== "" ? value.detail : "Escalado por Florencia-MKT" };
  }
  if (value.action === "skip") {
    return { action: "skip", detail: typeof value.detail === "string" ? value.detail : undefined };
  }
  throw new Error("Florencia decision has unknown action");
}

export interface AutoReplyConfig {
  enabled: boolean;
  decisionUrlConfigured: boolean;
  outboundConfigured: boolean;
  cutoff: string;
  maxAgeMs: number;
  /** Ventana tras una intervencion humana durante la cual Florencia-MKT no responde sola. */
  humanQuietMs: number;
}

export function readAutoReplyConfig(env: NodeJS.ProcessEnv, now: Date): AutoReplyConfig {
  const cutoff = env.SCC_AUTO_REPLY_CUTOFF ?? now.toISOString();
  if (Number.isNaN(Date.parse(cutoff))) {
    throw new Error("SCC_AUTO_REPLY_CUTOFF must be an ISO date");
  }
  const maxAgeMinutes = Number.parseInt(env.SCC_AUTO_REPLY_MAX_AGE_MINUTES ?? "60", 10);
  const quietMinutes = Number.parseInt(env.SCC_AUTO_REPLY_HUMAN_QUIET_MINUTES ?? "30", 10);
  return {
    humanQuietMs: (Number.isFinite(quietMinutes) && quietMinutes >= 0 ? quietMinutes : 30) * 60000,
    enabled: env.SCC_AUTO_REPLY_ENABLED === "true",
    decisionUrlConfigured: (env.SCC_FLORENCIA_DECISION_URL ?? "") !== "",
    outboundConfigured: (env.SCC_META_OUTBOUND_URL ?? "") !== "",
    cutoff,
    maxAgeMs: (Number.isFinite(maxAgeMinutes) && maxAgeMinutes > 0 ? maxAgeMinutes : 60) * 60000
  };
}

export type AutoReplyOutcome =
  | "sent"
  | "escalated"
  | "skipped"
  | "ineligible"
  | "failed"
  | "blocked";

export interface AutoReplyStatus {
  enabled: boolean;
  owner: typeof AUTO_REPLY_OWNER;
  status: "disabled" | "idle" | "blocked" | "error";
  cutoff: string;
  blockers: string[];
  lastAttemptAt?: string;
  lastOutcome?: AutoReplyOutcome;
  lastConversationId?: string;
  lastError?: string;
  counters: Record<AutoReplyOutcome, number>;
}

export interface AutoReplyDeps {
  store: SocialInboxStore;
  config: AutoReplyConfig;
  decisionClient?: FlorenciaDecisionClient;
  outboundClient: InstagramOutboundClient;
  persist: () => Promise<void>;
  now?: () => Date;
}

export class AutoReplyService {
  private enabled: boolean;
  private readonly inFlight = new Set<string>();
  private lastAttemptAt?: string;
  private lastOutcome?: AutoReplyOutcome;
  private lastConversationId?: string;
  private lastError?: string;
  private readonly counters: Record<AutoReplyOutcome, number> = {
    sent: 0,
    escalated: 0,
    skipped: 0,
    ineligible: 0,
    failed: 0,
    blocked: 0
  };

  constructor(private readonly deps: AutoReplyDeps) {
    this.enabled = deps.config.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  status(): AutoReplyStatus {
    const blockers = this.blockers();
    return {
      enabled: this.enabled,
      owner: AUTO_REPLY_OWNER,
      status: !this.enabled
        ? "disabled"
        : blockers.length > 0
          ? "blocked"
          : this.lastOutcome === "failed"
            ? "error"
            : "idle",
      cutoff: this.deps.config.cutoff,
      blockers,
      lastAttemptAt: this.lastAttemptAt,
      lastOutcome: this.lastOutcome,
      lastConversationId: this.lastConversationId,
      lastError: this.lastError,
      counters: { ...this.counters }
    };
  }

  /** Revisa todas las conversaciones candidatas (barrido periodico y tras el webhook). */
  async sweep(): Promise<void> {
    if (!this.enabled) {
      return;
    }
    for (const conversation of [...this.deps.store.peek().conversations]) {
      if (this.eligibility(conversation.id) === undefined) {
        continue;
      }
      await this.processConversation(conversation.id);
    }
  }

  async processConversation(conversationId: string): Promise<AutoReplyOutcome> {
    if (!this.enabled) {
      return "ineligible";
    }
    const blockers = this.blockers();
    if (blockers.length > 0) {
      // Solo se registra bloqueo si habia algo para responder.
      if (this.eligibility(conversationId) !== undefined) {
        return this.record("blocked", conversationId, blockers.join("; "));
      }
      return "ineligible";
    }
    if (this.inFlight.has(conversationId)) {
      return "ineligible";
    }
    this.inFlight.add(conversationId);
    try {
      return await this.attempt(conversationId);
    } finally {
      this.inFlight.delete(conversationId);
    }
  }

  private async attempt(conversationId: string): Promise<AutoReplyOutcome> {
    const { store } = this.deps;
    const inbound = this.eligibility(conversationId);
    if (inbound === undefined) {
      return "ineligible";
    }
    const conversation = store.getConversation(conversationId) as Conversation;
    const account = store.getAccount(conversation.accountId);
    if (account === undefined) {
      return "ineligible";
    }
    const now = this.now();

    // Claim persistido antes de enviar: como maximo un envio por mensaje inbound, tambien tras reinicios.
    store.addAuditLog({
      id: stableId("audit", "auto-reply", "claimed", inbound.id, String(this.failedAttempts(inbound.id))),
      actorId: AUTO_REPLY_OWNER,
      action: "auto_reply.claimed",
      entityType: "message",
      entityId: inbound.id,
      createdAt: now,
      metadata: { conversationId }
    });
    await this.deps.persist();

    try {
      const history = store
        .peek()
        .messages.filter((message) => message.conversationId === conversationId)
        .sort(byReceivedAt)
        .slice(-HISTORY_LIMIT)
        .map((message) => ({
          direction: message.direction,
          author: message.authorExternalId,
          text: message.text,
          at: message.receivedAt
        }));
      const decision = await (this.deps.decisionClient as FlorenciaDecisionClient).decide({
        agent: AUTO_REPLY_OWNER,
        channel: account.channel,
        conversationId,
        message: {
          id: inbound.id,
          text: inbound.text,
          receivedAt: inbound.receivedAt,
          attachmentCount: inbound.attachments?.length ?? 0
        },
        history
      });

      // Recheck: durante la consulta un humano pudo tomar la conversacion o llegar otro mensaje.
      if (this.eligibility(conversationId, true)?.id !== inbound.id) {
        this.audit("auto_reply.aborted_recheck", inbound.id, conversationId);
        await this.deps.persist();
        return this.record("ineligible", conversationId);
      }

      if (decision.action === "skip") {
        this.audit("auto_reply.skipped", inbound.id, conversationId, { detail: decision.detail });
        await this.deps.persist();
        return this.record("skipped", conversationId);
      }

      if (decision.action === "escalate" || decision.sensitive === true) {
        escalateAsFlorencia(store, {
          conversationId,
          inboxItemType: "message",
          inboxItemId: inbound.id,
          createdAt: this.now(),
          reason: decision.action === "escalate" ? decision.reason : "sensitive",
          detail: decision.action === "escalate" ? decision.detail : "Respuesta marcada sensible por Florencia-MKT"
        });
        this.audit("auto_reply.escalated", inbound.id, conversationId);
        await this.deps.persist();
        return this.record("escalated", conversationId);
      }

      await sendOperatorReplyToInstagram(store, {
        conversationId,
        actorId: AUTO_REPLY_OWNER,
        text: decision.text,
        sentAt: this.now(),
        client: this.deps.outboundClient,
        automated: true
      });
      this.audit("auto_reply.sent", inbound.id, conversationId);
      await this.deps.persist();
      return this.record("sent", conversationId);
    } catch (error) {
      const message = sanitize(error);
      this.audit("auto_reply.failed", inbound.id, conversationId, { error: message });
      await this.deps.persist();
      return this.record("failed", conversationId, message);
    }
  }

  /** Devuelve el mensaje inbound a responder, o undefined si la conversacion no es elegible. */
  eligibility(conversationId: string, ownClaimHeld = false): SocialMessage | undefined {
    const { store, config } = this.deps;
    const snapshot = store.peek();
    const conversation = snapshot.conversations.find((item) => item.id === conversationId);
    if (conversation === undefined || conversation.ownerActorId !== AUTO_REPLY_OWNER) {
      return undefined;
    }
    if (!ELIGIBLE_STATUSES.has(conversation.status)) {
      return undefined;
    }
    const account = snapshot.socialAccounts.find((item) => item.id === conversation.accountId);
    if (account === undefined || account.channel !== "instagram") {
      return undefined;
    }
    const last = snapshot.messages
      .filter((message) => message.conversationId === conversationId)
      .sort(byReceivedAt)
      .at(-1);
    // Ultimo mensaje debe ser inbound del participante: un outbound/nota interna posterior cierra el turno.
    if (
      last === undefined ||
      last.direction !== "inbound" ||
      last.authorExternalId === account.externalId ||
      last.authorExternalId !== conversation.participantExternalId
    ) {
      return undefined;
    }
    const receivedMs = Date.parse(last.receivedAt);
    const floor = Math.max(Date.parse(config.cutoff), this.nowMs() - config.maxAgeMs);
    if (Number.isNaN(receivedMs) || receivedMs < floor) {
      return undefined;
    }
    if (
      conversation.lastHumanInterventionAt !== undefined &&
      (Date.parse(conversation.lastHumanInterventionAt) >= receivedMs ||
        Date.parse(conversation.lastHumanInterventionAt) > this.nowMs() - config.humanQuietMs)
    ) {
      return undefined;
    }
    const audit = snapshot.auditLog.filter((entry) => entry.entityId === last.id);
    if (audit.some((entry) => ["auto_reply.sent", "auto_reply.skipped", "auto_reply.escalated"].includes(entry.action))) {
      return undefined;
    }
    if (this.failedAttempts(last.id) >= MAX_FAILED_ATTEMPTS) {
      return undefined;
    }
    // Un claim sin resultado (crash a mitad de envio) no se reintenta: evita duplicados.
    const claims = audit.filter((entry) => entry.action === "auto_reply.claimed").length;
    const results = audit.filter((entry) => entry.action === "auto_reply.failed").length;
    if (claims > results + (ownClaimHeld ? 1 : 0)) {
      return undefined;
    }
    return last;
  }

  private failedAttempts(messageId: string): number {
    return this.deps.store
      .peek()
      .auditLog.filter((entry) => entry.entityId === messageId && entry.action === "auto_reply.failed").length;
  }

  private blockers(): string[] {
    const blockers: string[] = [];
    if (!this.deps.config.decisionUrlConfigured || this.deps.decisionClient === undefined) {
      blockers.push("SCC_FLORENCIA_DECISION_URL no configurada (endpoint de decision Florencia-MKT/LXC104)");
    }
    if (!this.deps.config.outboundConfigured) {
      blockers.push("SCC_META_OUTBOUND_URL no configurada (canal de salida Instagram)");
    }
    return blockers;
  }

  private audit(action: string, messageId: string, conversationId: string, metadata: Record<string, unknown> = {}): void {
    this.deps.store.addAuditLog({
      id: stableId("audit", action, messageId, this.now(), String(Math.random()).slice(2, 8)),
      actorId: AUTO_REPLY_OWNER,
      action,
      entityType: "message",
      entityId: messageId,
      createdAt: this.now(),
      metadata: { conversationId, ...metadata }
    });
  }

  private record(outcome: AutoReplyOutcome, conversationId: string, error?: string): AutoReplyOutcome {
    this.lastAttemptAt = this.now();
    this.lastOutcome = outcome;
    this.lastConversationId = conversationId;
    this.lastError = error;
    this.counters[outcome] += 1;
    return outcome;
  }

  private now(): string {
    return (this.deps.now?.() ?? new Date()).toISOString();
  }

  private nowMs(): number {
    return (this.deps.now?.() ?? new Date()).getTime();
  }
}

function byReceivedAt(a: SocialMessage, b: SocialMessage): number {
  return a.receivedAt.localeCompare(b.receivedAt);
}

/** Mensaje de error sin URLs, tokens ni secretos. */
function sanitize(error: unknown): string {
  const raw = error instanceof Error ? error.message : "Unknown error";
  return raw.replace(/https?:\/\/\S+/g, "<url>").replace(/(secret|token|key)[=:]\s*\S+/gi, "$1=***").slice(0, 300);
}
