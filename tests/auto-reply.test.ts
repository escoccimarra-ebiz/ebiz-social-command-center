import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AutoReplyService,
  parseDecision,
  type AutoReplyConfig,
  type FlorenciaDecision,
  type FlorenciaDecisionClient
} from "../apps/api/src/modules/auto-reply/auto-reply-service.js";
import type { InstagramOutboundClient } from "../apps/api/src/modules/instagram/instagram-outbound-client.js";
import { SocialInboxStore } from "../apps/api/src/modules/social-inbox/social-inbox-store.js";
import { getHealth } from "../apps/api/src/main.js";
import type { Conversation } from "../packages/shared/src/types/social-inbox.js";

const NOW = new Date("2026-09-25T12:00:00.000Z");
const CONV = "conversation:1";

const baseConfig: AutoReplyConfig = {
  enabled: true,
  decisionUrlConfigured: true,
  outboundConfigured: true,
  cutoff: "2026-09-25T11:00:00.000Z",
  maxAgeMs: 60 * 60000,
  humanQuietMs: 30 * 60000
};

function setup(options: {
  conversation?: Partial<Conversation>;
  inbound?: { receivedAt?: string; author?: string };
  config?: Partial<AutoReplyConfig>;
  decide?: () => Promise<FlorenciaDecision>;
  send?: () => Promise<void>;
  noDecisionClient?: boolean;
}) {
  const store = new SocialInboxStore();
  store.upsertAccount({
    id: "acc",
    provider: "meta",
    channel: "instagram",
    externalId: "ig-biz",
    displayName: "eBiz",
    createdAt: NOW.toISOString()
  });
  store.upsertConversation({
    id: CONV,
    accountId: "acc",
    participantProfileId: "p",
    externalThreadId: "t",
    participantExternalId: "user-1",
    status: "received",
    ownerActorId: "florencia-mkt",
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...options.conversation
  });
  const receivedAt = options.inbound?.receivedAt ?? "2026-09-25T11:59:00.000Z";
  store.upsertMessage({
    id: "msg-1",
    accountId: "acc",
    conversationId: CONV,
    externalId: "mid-1",
    direction: "inbound",
    text: "Hola, precio?",
    authorExternalId: options.inbound?.author ?? "user-1",
    status: "received",
    receivedAt,
    createdAt: receivedAt
  });
  const calls = { decide: 0, send: 0, saves: 0 };
  const decisionClient: FlorenciaDecisionClient = {
    async decide() {
      calls.decide += 1;
      return (options.decide ?? (async () => ({ action: "reply", text: "Hola! Te paso info." })))();
    }
  };
  const outboundClient: InstagramOutboundClient = {
    async sendText() {
      calls.send += 1;
      await options.send?.();
      return { ok: true, providerMessageId: "out-1" };
    }
  };
  const service = new AutoReplyService({
    store,
    config: { ...baseConfig, ...options.config },
    decisionClient: options.noDecisionClient === true ? undefined : decisionClient,
    outboundClient,
    persist: async () => {
      calls.saves += 1;
    },
    now: () => NOW
  });
  return { store, service, calls };
}

describe("Florencia-MKT auto reply", () => {
  it("replies to an eligible Instagram inbound and records it as agent action", async () => {
    const { store, service, calls } = setup({});
    assert.equal(await service.processConversation(CONV), "sent");
    assert.equal(calls.send, 1);
    const conversation = store.getConversation(CONV);
    assert.equal(conversation?.ownerActorId, "florencia-mkt");
    assert.equal(conversation?.lastHumanInterventionAt, undefined);
    assert.equal(conversation?.lastAgentActionAt, NOW.toISOString());
    assert.equal(store.snapshot().messages.filter((m) => m.direction === "outbound").length, 1);
    assert.equal(service.status().lastOutcome, "sent");
    assert.equal(service.status().counters.sent, 1);
  });

  it("never replies twice to the same inbound message", async () => {
    const { service, calls } = setup({});
    await service.processConversation(CONV);
    await service.processConversation(CONV);
    await service.sweep();
    assert.equal(calls.send, 1);
    assert.equal(calls.decide, 1);
  });

  it("does not answer concurrently in-flight for the same conversation", async () => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const { service, calls } = setup({ send: () => gate });
    const first = service.processConversation(CONV);
    const second = await service.processConversation(CONV);
    release();
    await first;
    assert.equal(second, "ineligible");
    assert.equal(calls.send, 1);
  });

  for (const [name, conversation] of [
    ["assigned to human", { ownerActorId: "operador-humano" as const, status: "pending_human_approval" as const }],
    ["owned by esteban", { ownerActorId: "esteban" as const }],
    ["archived", { status: "archived" as const }],
    ["requires esteban", { status: "requires_esteban" as const }],
    ["human intervened after the inbound", { lastHumanInterventionAt: "2026-09-25T11:59:30.000Z" }],
    ["human replied recently (quiet window)", { lastHumanInterventionAt: "2026-09-25T11:45:00.000Z" }]
  ] as const) {
    it(`does not reply when conversation is ${name}`, async () => {
      const { service, calls } = setup({ conversation });
      assert.equal(await service.processConversation(CONV), "ineligible");
      assert.equal(calls.decide, 0);
      assert.equal(calls.send, 0);
    });
  }

  it("ignores messages older than the cutoff (restart safety)", async () => {
    const { service, calls } = setup({ inbound: { receivedAt: "2026-09-25T10:00:00.000Z" } });
    assert.equal(await service.processConversation(CONV), "ineligible");
    assert.equal(calls.send, 0);
  });

  it("ignores messages older than the max age even with an old cutoff", async () => {
    const { service } = setup({
      inbound: { receivedAt: "2026-09-25T10:30:00.000Z" },
      config: { cutoff: "2026-09-01T00:00:00.000Z" }
    });
    assert.equal(await service.processConversation(CONV), "ineligible");
  });

  it("does not answer the business own messages (loop guard)", async () => {
    const { service, calls } = setup({ inbound: { author: "ig-biz" } });
    assert.equal(await service.processConversation(CONV), "ineligible");
    assert.equal(calls.send, 0);
  });

  it("does not answer when the last message is already outbound or an internal note", async () => {
    const { store, service, calls } = setup({});
    store.addInternalConversationMessage({
      conversationId: CONV,
      accountId: "acc",
      actorId: "esteban",
      text: "nota",
      createdAt: "2026-09-25T11:59:40.000Z"
    });
    assert.equal(await service.processConversation(CONV), "ineligible");
    assert.equal(calls.send, 0);
  });

  it("rechecks before sending and aborts if a human took control during the decision", async () => {
    const holder: { store?: SocialInboxStore } = {};
    const ctx = setup({
      decide: async () => {
        holder.store?.updateConversation(CONV, { ownerActorId: "operador-humano" });
        return { action: "reply", text: "tarde" };
      }
    });
    holder.store = ctx.store;
    assert.equal(await ctx.service.processConversation(CONV), "ineligible");
    assert.equal(ctx.calls.send, 0);
    assert.equal(ctx.store.getConversation(CONV)?.ownerActorId, "operador-humano");
  });

  it("escalates to a human instead of replying when Florencia escalates", async () => {
    const { store, service, calls } = setup({
      decide: async () => ({ action: "escalate", reason: "sensitive", detail: "reclamo" })
    });
    assert.equal(await service.processConversation(CONV), "escalated");
    assert.equal(calls.send, 0);
    assert.equal(store.getConversation(CONV)?.ownerActorId, "esteban");
    assert.equal(await service.processConversation(CONV), "ineligible");
  });

  it("treats a sensitive reply as escalation and never sends it", async () => {
    const { service, calls } = setup({ decide: async () => ({ action: "reply", text: "x", sensitive: true }) });
    assert.equal(await service.processConversation(CONV), "escalated");
    assert.equal(calls.send, 0);
  });

  it("records skip and does not retry", async () => {
    const { service, calls } = setup({ decide: async () => ({ action: "skip" }) });
    assert.equal(await service.processConversation(CONV), "skipped");
    await service.processConversation(CONV);
    assert.equal(calls.decide, 1);
  });

  it("retries failures up to a cap and exposes a sanitized lastError", async () => {
    const { service, calls } = setup({
      decide: async () => {
        throw new Error("fetch failed http://10.0.0.5:9/x secret=abc123");
      }
    });
    for (let i = 0; i < 5; i += 1) {
      await service.processConversation(CONV);
    }
    assert.equal(calls.decide, 3);
    const status = service.status();
    assert.equal(status.status, "error");
    assert.equal(status.lastOutcome, "failed");
    assert.ok(!JSON.stringify(status).includes("abc123"));
    assert.ok(!JSON.stringify(status).includes("10.0.0.5"));
  });

  it("does not resend when the outbound step fails after claim (no duplicates)", async () => {
    const { store, service, calls } = setup({
      send: async () => {
        throw new Error("meta 500");
      }
    });
    assert.equal(await service.processConversation(CONV), "failed");
    assert.equal(store.snapshot().messages.filter((m) => m.direction === "outbound").length, 0);
    assert.equal(calls.send, 1);
  });

  it("reports the exact blocker when the LXC104 decision endpoint is missing", async () => {
    const { service, calls } = setup({
      noDecisionClient: true,
      config: { decisionUrlConfigured: false }
    });
    assert.equal(await service.processConversation(CONV), "blocked");
    const status = service.status();
    assert.equal(status.status, "blocked");
    assert.match(status.blockers[0] ?? "", /SCC_FLORENCIA_DECISION_URL/);
    assert.match(status.lastError ?? "", /SCC_FLORENCIA_DECISION_URL/);
    assert.equal(calls.send, 0);
  });

  it("reports the outbound blocker when SCC_META_OUTBOUND_URL is missing", async () => {
    const { service } = setup({ config: { outboundConfigured: false } });
    assert.equal(await service.processConversation(CONV), "blocked");
    assert.match(service.status().blockers.join(" "), /SCC_META_OUTBOUND_URL/);
  });

  it("does nothing when disabled and can be toggled at runtime", async () => {
    const { service, calls } = setup({ config: { enabled: false } });
    assert.equal(service.status().status, "disabled");
    await service.sweep();
    assert.equal(calls.send, 0);
    service.setEnabled(true);
    await service.sweep();
    assert.equal(calls.send, 1);
  });

  it("does not answer Facebook conversations", async () => {
    const { store, service } = setup({});
    store.upsertAccount({
      id: "acc",
      provider: "meta",
      channel: "facebook",
      externalId: "ig-biz",
      displayName: "fb",
      createdAt: NOW.toISOString()
    });
    assert.equal(await service.processConversation(CONV), "ineligible");
  });

  it("surfaces auto_reply in health without secrets", () => {
    const { service } = setup({});
    const health = getHealth(service.status());
    assert.equal(health.outboundPolicy.auto_reply, true);
    assert.equal(health.autoReply?.owner, "florencia-mkt");
    assert.equal(getHealth().outboundPolicy.auto_reply, false);
  });

  it("parses decision payloads strictly", () => {
    assert.deepEqual(parseDecision({ action: "reply", text: "hola" }), { action: "reply", text: "hola", sensitive: false });
    assert.throws(() => parseDecision({ action: "reply" }));
    assert.throws(() => parseDecision({ action: "nope" }));
    assert.equal(parseDecision({ action: "escalate" }).action, "escalate");
  });
});
