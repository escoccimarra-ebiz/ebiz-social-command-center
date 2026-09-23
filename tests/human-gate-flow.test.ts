import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyAsFlorencia,
  decideConversationControl,
  decideHumanGate,
  draftAsFlorencia,
  escalateAsFlorencia
} from "../apps/api/src/modules/social-inbox/human-gate-service.js";
import { SocialInboxStore } from "../apps/api/src/modules/social-inbox/social-inbox-store.js";

describe("Florencia-MKT human gate flow", () => {
  it("lets Florencia classify and draft while writing audit evidence", () => {
    const store = new SocialInboxStore();

    const classification = classifyAsFlorencia(store, {
      inboxItemType: "message",
      inboxItemId: "message-1",
      createdAt: "2026-09-23T13:05:00.000Z",
      output: "lead:cowork-day-pass"
    });
    const draft = draftAsFlorencia(store, {
      inboxItemType: "message",
      inboxItemId: "message-1",
      createdAt: "2026-09-23T13:06:00.000Z",
      output: "Hola, gracias por escribir. Te paso opciones disponibles."
    });

    const snapshot = store.snapshot();

    assert.equal(classification.action, "classify");
    assert.equal(draft.action, "draft");
    assert.equal(snapshot.agentActions.length, 2);
    assert.equal(snapshot.auditLog.length, 2);
    assert.equal(snapshot.auditLog[1]?.metadata?.externalResponseBlocked, true);
  });

  it("records human approval as an internal decision only", () => {
    const store = new SocialInboxStore();

    const approval = decideHumanGate(store, {
      inboxItemType: "comment",
      inboxItemId: "comment-1",
      decidedAt: "2026-09-23T13:07:00.000Z",
      decidedBy: "florencia-mkt",
      decision: "approve_internal",
      reason: "Respuesta informativa estandar, sin datos sensibles.",
      sensitivity: "standard"
    });
    const snapshot = store.snapshot();

    assert.equal(approval.state, "approved_internal");
    assert.equal(approval.decidedBy, "florencia-mkt");
    assert.equal(snapshot.approvals.length, 1);
    assert.equal(snapshot.auditLog.length, 1);
    assert.equal(snapshot.auditLog[0]?.metadata?.externalResponseBlocked, true);
  });

  it("requires Esteban for sensitive approvals", () => {
    const store = new SocialInboxStore();

    assert.throws(
      () =>
        decideHumanGate(store, {
          inboxItemType: "message",
          inboxItemId: "message-sensitive",
          decidedAt: "2026-09-23T13:08:00.000Z",
          decidedBy: "florencia-mkt",
          decision: "approve_internal",
          reason: "Consulta sensible sobre conflicto comercial.",
          sensitivity: "sensitive"
        }),
      new Error("Sensitive social cases require Esteban approval")
    );

    const approval = decideHumanGate(store, {
      inboxItemType: "message",
      inboxItemId: "message-sensitive",
      decidedAt: "2026-09-23T13:09:00.000Z",
      decidedBy: "esteban",
      decision: "approve_internal",
      reason: "Esteban reviso el caso sensible.",
      sensitivity: "sensitive"
    });

    assert.equal(approval.state, "approved_internal");
    assert.equal(approval.decidedBy, "esteban");
  });

  it("rejects unaudited decisions", () => {
    const store = new SocialInboxStore();

    assert.throws(
      () =>
        decideHumanGate(store, {
          inboxItemType: "comment",
          inboxItemId: "comment-2",
          decidedAt: "2026-09-23T13:10:00.000Z",
          decidedBy: "florencia-mkt",
          decision: "reject_internal",
          reason: " ",
          sensitivity: "standard"
        }),
      new Error("Human gate decisions require an audit reason")
    );
  });

  it("records human operator intervention inside the conversation history", () => {
    const store = seededConversationStore();

    decideConversationControl(store, {
      conversationId: "conversation-1",
      decidedAt: "2026-09-23T13:11:00.000Z",
      actorId: "operador-humano",
      action: "take_control",
      reason: "MKT necesita validar informacion comercial antes de responder."
    });
    const message = store.addInternalConversationMessage({
      conversationId: "conversation-1",
      accountId: "account-1",
      actorId: "operador-humano",
      text: "Valido disponibilidad y precio antes de autorizar respuesta.",
      createdAt: "2026-09-23T13:12:00.000Z"
    });

    const snapshot = store.snapshot();
    const conversation = snapshot.conversations[0];

    assert.equal(message.direction, "internal");
    assert.equal(message.authorExternalId, "operador-humano");
    assert.equal(conversation?.ownerActorId, "operador-humano");
    assert.equal(conversation?.lastHumanInterventionAt, "2026-09-23T13:12:00.000Z");
    assert.equal(snapshot.auditLog.at(-1)?.metadata?.externalResponseBlocked, true);
  });

  it("lets Florencia escalate ambiguous, missing, or sensitive cases to a human", () => {
    const store = seededConversationStore();

    const escalation = escalateAsFlorencia(store, {
      conversationId: "conversation-1",
      inboxItemType: "message",
      inboxItemId: "message-1",
      createdAt: "2026-09-23T13:13:00.000Z",
      reason: "missing_info",
      detail: "Falta precio vigente del day pass."
    });

    const snapshot = store.snapshot();
    const conversation = snapshot.conversations[0];

    assert.equal(escalation.action, "escalate");
    assert.equal(conversation?.status, "pending_human_approval");
    assert.equal(conversation?.ownerActorId, "operador-humano");
    assert.equal(conversation?.escalationReason, "missing_info");
    assert.match(escalation.output, /Falta precio vigente/);
  });
});

function seededConversationStore(): SocialInboxStore {
  const store = new SocialInboxStore();
  store.upsertAccount({
    id: "account-1",
    provider: "meta",
    channel: "instagram",
    externalId: "ig-ebiz",
    displayName: "Instagram eBiz",
    createdAt: "2026-09-23T13:00:00.000Z"
  });
  store.upsertConversation({
    id: "conversation-1",
    accountId: "account-1",
    externalThreadId: "thread-1",
    participantExternalId: "lead-rosario",
    status: "pending_review",
    ownerActorId: "florencia-mkt",
    createdAt: "2026-09-23T13:00:00.000Z",
    updatedAt: "2026-09-23T13:00:00.000Z"
  });
  store.upsertMessage({
    id: "message-1",
    accountId: "account-1",
    conversationId: "conversation-1",
    externalId: "external-message-1",
    direction: "inbound",
    text: "Cuanto sale el day pass?",
    authorExternalId: "lead-rosario",
    status: "pending_review",
    receivedAt: "2026-09-23T13:00:00.000Z",
    createdAt: "2026-09-23T13:00:00.000Z"
  });

  return store;
}
