import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { join } from "node:path";
import { getHealth } from "./main.js";
import { ingestMetaWebhook } from "./modules/ingestion/meta-ingestion-service.js";
import {
  classifyAsFlorencia,
  decideHumanGate,
  decideConversationControl,
  decideSuggestedReply,
  draftAsFlorencia,
  escalateAsFlorencia,
  sendOperatorReplyToInstagram,
  suggestReplyAsFlorencia
} from "./modules/social-inbox/human-gate-service.js";
import {
  DisabledInstagramOutboundClient,
  HttpInstagramOutboundClient
} from "./modules/instagram/instagram-outbound-client.js";
import { SocialInboxStore, stableId } from "./modules/social-inbox/social-inbox-store.js";
import { dashboardHtml } from "./runtime/dashboard-html.js";
import { FileSocialInboxRepository } from "./runtime/file-social-inbox-repository.js";
import type { MetaWebhookEnvelope } from "../../../packages/shared/src/types/meta-webhook.js";
import type {
  HumanGateActor,
  InboxItemType,
  EscalationReason,
  SensitivityLevel
} from "../../../packages/shared/src/types/social-inbox.js";

const port = Number.parseInt(process.env.PORT ?? "3121", 10);
const host = process.env.HOST ?? "0.0.0.0";
const dataDir = process.env.SCC_DATA_DIR ?? "/data/ebiz-social-command-center";
const repository = new FileSocialInboxRepository(join(dataDir, "social-inbox-state.json"));
const store = new SocialInboxStore(await repository.load());
const instagramOutboundClient =
  process.env.SCC_META_OUTBOUND_URL === undefined
    ? new DisabledInstagramOutboundClient()
    : new HttpInstagramOutboundClient(process.env.SCC_META_OUTBOUND_URL, process.env.SCC_INTERNAL_SECRET);

const server = createServer(async (request, response) => {
  try {
    await route(request, response);
  } catch (error) {
    json(response, 500, {
      error: "internal_error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

server.listen(port, host, () => {
  process.stdout.write(`eBiz Social Command Center listening on http://${host}:${port}\n`);
});

async function route(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "GET" && url.pathname === "/") {
    html(response, dashboardHtml);
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    json(response, 200, {
      ...getHealth(),
      persistence: "file",
      dataPath: join(dataDir, "social-inbox-state.json")
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/inbox") {
    json(response, 200, store.snapshot());
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/meta-webhook") {
    const envelope = (await readJson(request)) as MetaWebhookEnvelope;
    const result = ingestMetaWebhook(store, envelope);
    await repository.save(store.snapshot());
    json(response, 202, result);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/human-gate") {
    const body = (await readJson(request)) as Partial<HumanGateRequest>;
    const decision = decideHumanGate(store, {
      inboxItemType: requireInboxItemType(body.inboxItemType),
      inboxItemId: requireString(body.inboxItemId, "inboxItemId"),
      decidedAt: new Date().toISOString(),
      decidedBy: requireHumanGateActor(body.decidedBy),
      decision: requireDecision(body.decision),
      reason: requireString(body.reason, "reason"),
      sensitivity: requireSensitivity(body.sensitivity)
    });
    await repository.save(store.snapshot());
    json(response, 201, decision);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/conversation-control") {
    const body = (await readJson(request)) as Partial<ConversationControlRequest>;
    decideConversationControl(store, {
      conversationId: requireString(body.conversationId, "conversationId"),
      decidedAt: new Date().toISOString(),
      actorId: requireHumanGateActor(body.actorId),
      action: requireConversationControlAction(body.action),
      reason: requireString(body.reason, "reason")
    });
    await repository.save(store.snapshot());
    json(response, 201, { status: "recorded" });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/operator-intervention") {
    const body = (await readJson(request)) as Partial<OperatorInterventionRequest>;
    const conversationId = requireString(body.conversationId, "conversationId");
    const conversation = store.getConversation(conversationId);
    if (conversation === undefined) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    const message = store.addInternalConversationMessage({
      conversationId,
      accountId: conversation.accountId,
      actorId: requireHumanGateActor(body.actorId),
      text: requireString(body.text, "text"),
      createdAt: new Date().toISOString()
    });
    await repository.save(store.snapshot());
    json(response, 201, message);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/operator-reply") {
    const body = (await readJson(request)) as Partial<OperatorInterventionRequest>;
    const message = await sendOperatorReplyToInstagram(store, {
      conversationId: requireString(body.conversationId, "conversationId"),
      actorId: requireHumanGateActor(body.actorId),
      text: requireString(body.text, "text"),
      sentAt: new Date().toISOString(),
      client: instagramOutboundClient
    });
    await repository.save(store.snapshot());
    json(response, 201, message);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/mkt-agent") {
    const body = (await readJson(request)) as Partial<MktAgentRequest>;
    const action = requireMktAgentAction(body.action);
    const createdAt = new Date().toISOString();
    const conversationId = requireString(body.conversationId, "conversationId");
    const inboxItemType = requireInboxItemType(body.inboxItemType);
    const inboxItemId = requireString(body.inboxItemId, "inboxItemId");

    const result =
      action === "classify"
        ? classifyAsFlorencia(store, {
            inboxItemType,
            inboxItemId,
            createdAt,
            output: requireString(body.output, "output")
          })
        : action === "draft"
          ? draftAsFlorencia(store, {
              inboxItemType,
              inboxItemId,
              createdAt,
              output: requireString(body.output, "output")
            })
          : escalateAsFlorencia(store, {
              conversationId,
              inboxItemType,
              inboxItemId,
              createdAt,
              reason: requireEscalationReason(body.escalationReason),
              detail: requireString(body.output, "output")
            });

    store.updateConversation(conversationId, {
      lastAgentActionAt: createdAt,
      updatedAt: createdAt
    });
    await repository.save(store.snapshot());
    json(response, 201, result);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/suggested-reply") {
    const body = (await readJson(request)) as Partial<SuggestedReplyRequest>;
    const reply = suggestReplyAsFlorencia(store, {
      conversationId: requireString(body.conversationId, "conversationId"),
      inboxItemType: requireInboxItemType(body.inboxItemType),
      inboxItemId: requireString(body.inboxItemId, "inboxItemId"),
      createdAt: new Date().toISOString(),
      text: requireString(body.text, "text"),
      sensitivity: requireSensitivity(body.sensitivity)
    });
    await repository.save(store.snapshot());
    json(response, 201, reply);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/suggested-reply-decision") {
    const body = (await readJson(request)) as Partial<SuggestedReplyDecisionRequest>;
    const reply = decideSuggestedReply(store, {
      replyId: requireString(body.replyId, "replyId"),
      decidedAt: new Date().toISOString(),
      decidedBy: requireHumanGateActor(body.decidedBy),
      decision: requireSuggestedReplyDecision(body.decision),
      reason: requireString(body.reason, "reason")
    });
    await repository.save(store.snapshot());
    json(response, 201, reply);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/demo-seed") {
    seedDemoData();
    await repository.save(store.snapshot());
    json(response, 201, { status: "seeded" });
    return;
  }

  json(response, 404, { error: "not_found" });
}

interface HumanGateRequest {
  inboxItemType: InboxItemType;
  inboxItemId: string;
  decidedBy: HumanGateActor;
  decision: "approve_internal" | "reject_internal" | "escalate_esteban";
  reason: string;
  sensitivity: SensitivityLevel;
}

interface ConversationControlRequest {
  conversationId: string;
  actorId: HumanGateActor;
  action: "take_control" | "return_to_agent" | "resolve";
  reason: string;
}

interface OperatorInterventionRequest {
  conversationId: string;
  actorId: HumanGateActor;
  text: string;
}

interface MktAgentRequest {
  conversationId: string;
  inboxItemType: InboxItemType;
  inboxItemId: string;
  action: "classify" | "draft" | "escalate";
  output: string;
  escalationReason?: EscalationReason;
}

interface SuggestedReplyRequest {
  conversationId: string;
  inboxItemType: InboxItemType;
  inboxItemId: string;
  text: string;
  sensitivity?: SensitivityLevel;
}

interface SuggestedReplyDecisionRequest {
  replyId: string;
  decidedBy: HumanGateActor;
  decision: "approve_ready_to_send" | "reject" | "escalate_esteban";
  reason: string;
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (raw.trim().length === 0) {
    return {};
  }

  return JSON.parse(raw);
}

function seedDemoData(): void {
  const now = new Date().toISOString();
  const account = store.upsertAccount({
    id: "meta:instagram:ebiz-demo",
    provider: "meta",
    channel: "instagram",
    externalId: "ebiz-demo",
    displayName: "Instagram eBiz",
    createdAt: now
  });
  const conversation = store.upsertConversation({
    id: "conversation:meta:instagram:ebiz-demo:lead-rosario",
    accountId: account.id,
    participantProfileId: "profile:meta:instagram:ebiz-demo:lead-rosario",
    externalThreadId: "lead-rosario",
    participantExternalId: "lead-rosario",
    status: "pending_human_approval",
    ownerActorId: "florencia-mkt",
    lastAgentActionAt: now,
    createdAt: now,
    updatedAt: now
  });
  store.upsertParticipantProfile({
    id: "profile:meta:instagram:ebiz-demo:lead-rosario",
    provider: "meta",
    channel: "instagram",
    externalId: "lead-rosario",
    displayName: "@lead_rosario",
    username: "lead_rosario",
    profileUrl: "https://www.instagram.com/lead_rosario/",
    kind: "prospect",
    lastSeenAt: now,
    createdAt: now
  });
  const message = store.upsertMessage({
    id: "message:meta:instagram:ebiz-demo:lead-coworking-001",
    accountId: account.id,
    conversationId: conversation.id,
    externalId: "lead-coworking-001",
    direction: "inbound",
    text: "Hola, queria saber si tienen lugar para trabajar manana y si se puede pagar por dia.",
    authorExternalId: "lead-rosario",
    status: "pending_human_approval",
    receivedAt: now,
    createdAt: now
  });
  const comment = store.upsertComment({
    id: "comment:meta:instagram:ebiz-demo:comment-legal-001",
    accountId: account.id,
    externalId: "comment-legal-001",
    postExternalId: "post-coworking-001",
    authorExternalId: "user-sensitive",
    text: "Necesito hablar con Esteban por un reclamo importante.",
    status: "requires_esteban",
    receivedAt: now,
    createdAt: now
  });

  classifyAsFlorencia(store, {
    inboxItemType: "message",
    inboxItemId: message.id,
    createdAt: now,
    output: "Lead coworking: responder disponibilidad, precio por dia y horario."
  });
  draftAsFlorencia(store, {
    inboxItemType: "message",
    inboxItemId: message.id,
    createdAt: now,
    output: "Hola! Si, tenemos day pass. Te puedo pasar opciones y horarios para manana."
  });
  classifyAsFlorencia(store, {
    inboxItemType: "comment",
    inboxItemId: comment.id,
    createdAt: now,
    output: "Caso sensible: escalar a Esteban antes de responder."
  });
  escalateAsFlorencia(store, {
    conversationId: conversation.id,
    inboxItemType: "message",
    inboxItemId: message.id,
    createdAt: now,
    reason: "missing_info",
    detail: "Falta confirmar disponibilidad real, horario y precio vigente antes de responder."
  });
  store.addInternalConversationMessage({
    conversationId: conversation.id,
    accountId: account.id,
    actorId: "operador-humano",
    text: "Nota interna: validar cupos del dia y precio actual antes de enviar respuesta.",
    createdAt: now
  });
  store.addAuditLog({
    id: stableId("audit", "demo-seed", now),
    actorId: "system",
    action: "runtime.demo_seeded",
    entityType: "runtime",
    entityId: "demo",
    createdAt: now
  });
}

function html(response: ServerResponse, body: string): void {
  response.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(body);
}

function json(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(body));
}

function requireString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} is required`);
  }

  return value;
}

function requireInboxItemType(value: unknown): InboxItemType {
  if (value === "message" || value === "comment") {
    return value;
  }

  throw new Error("inboxItemType must be message or comment");
}

function requireHumanGateActor(value: unknown): HumanGateActor {
  if (value === "florencia-mkt" || value === "esteban" || value === "operador-humano" || value === "system") {
    return value;
  }

  throw new Error("decidedBy is invalid");
}

function requireConversationControlAction(value: unknown): ConversationControlRequest["action"] {
  if (value === "take_control" || value === "return_to_agent" || value === "resolve") {
    return value;
  }

  throw new Error("conversation control action is invalid");
}

function requireMktAgentAction(value: unknown): MktAgentRequest["action"] {
  if (value === "classify" || value === "draft" || value === "escalate") {
    return value;
  }

  throw new Error("MKT agent action is invalid");
}

function requireEscalationReason(value: unknown): EscalationReason {
  if (value === "ambiguous" || value === "missing_info" || value === "sensitive") {
    return value;
  }

  throw new Error("escalationReason is invalid");
}

function requireSensitivity(value: unknown): SensitivityLevel {
  if (value === "standard" || value === "sensitive") {
    return value;
  }

  return "standard";
}

function requireDecision(value: unknown): HumanGateRequest["decision"] {
  if (value === "approve_internal" || value === "reject_internal" || value === "escalate_esteban") {
    return value;
  }

  throw new Error("decision is invalid");
}

function requireSuggestedReplyDecision(value: unknown): SuggestedReplyDecisionRequest["decision"] {
  if (value === "approve_ready_to_send" || value === "reject" || value === "escalate_esteban") {
    return value;
  }

  throw new Error("suggested reply decision is invalid");
}
