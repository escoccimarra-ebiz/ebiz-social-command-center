import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  approveInternal,
  assertOutboundAllowed,
  outboundPolicy
} from "../apps/api/src/policy/outbound-policy.js";

describe("MVP1 outbound policy", () => {
  it("keeps every external outbound action disabled", () => {
    assert.deepEqual(outboundPolicy, {
      send: false,
      publish: false,
      reply: false,
      auto_reply: false
    });
  });

  for (const action of ["send", "publish", "reply", "auto_reply"] as const) {
    it(`fails closed for ${action}`, () => {
      assert.throws(
        () => assertOutboundAllowed(action),
        new Error(`Outbound action disabled in MVP1: ${action}`)
      );
    });
  }

  it("approves only as an internal state transition", () => {
    assert.equal(approveInternal("pending_review"), "approved_internal");
  });
});
