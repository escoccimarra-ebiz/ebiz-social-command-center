import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyAsFlorencia,
  decideHumanGate,
  draftAsFlorencia
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
});
