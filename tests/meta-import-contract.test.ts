import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";
import { ingestMetaWebhook } from "../apps/api/src/modules/ingestion/meta-ingestion-service.js";
import { SocialInboxStore } from "../apps/api/src/modules/social-inbox/social-inbox-store.js";
import {
  importMetaWebhook,
  verifyMetaSignature
} from "../packages/integrations/meta/src/import-contract.js";
import type { MetaWebhookEnvelope } from "../packages/shared/src/types/meta-webhook.js";

const fixture: MetaWebhookEnvelope = {
  object: "instagram",
  entry: [
    {
      id: "17841400000000000",
      time: 1790159000,
      messaging: [
        {
          sender: { id: "user-1" },
          recipient: { id: "17841400000000000" },
          timestamp: 1790159001000,
          message: {
            mid: "mid-1",
            text: "Hola, quiero info del cowork"
          }
        }
      ],
      changes: [
        {
          field: "comments",
          value: {
            comment_id: "comment-1",
            text: "Me interesa",
            from: { id: "user-2", username: "prospecto" },
            media: { id: "post-1" },
            created_time: 1790159002
          }
        }
      ]
    }
  ]
};

describe("Meta import contract", () => {
  it("normalizes messages and comments without outbound side effects", () => {
    const events = importMetaWebhook(fixture);

    assert.equal(events.length, 2);
    assert.equal(events[0]?.type, "message");
    assert.equal(events[1]?.type, "comment");
  });

  it("persists imported events into the Social Inbox model", () => {
    const store = new SocialInboxStore();
    const result = ingestMetaWebhook(store, fixture);
    const snapshot = store.snapshot();

    assert.deepEqual(result, {
      importedMessages: 1,
      importedComments: 1
    });
    assert.equal(snapshot.socialAccounts.length, 1);
    assert.equal(snapshot.conversations.length, 1);
    assert.equal(snapshot.messages.length, 1);
    assert.equal(snapshot.comments.length, 1);
    assert.equal(snapshot.auditLog.length, 2);
    assert.equal(snapshot.messages[0]?.text, "Hola, quiero info del cowork");
    assert.equal(snapshot.comments[0]?.text, "Me interesa");
  });

  it("verifies Meta-style HMAC signatures without storing secrets", () => {
    const rawBody = JSON.stringify(fixture);
    const appSecret = "test-secret-only";
    const signatureHeader = `sha256=${createHmac("sha256", appSecret)
      .update(rawBody)
      .digest("hex")}`;

    assert.equal(
      verifyMetaSignature({
        rawBody,
        appSecret,
        signatureHeader
      }),
      true
    );

    assert.equal(
      verifyMetaSignature({
        rawBody,
        appSecret,
        signatureHeader: "sha256=bad"
      }),
      false
    );
  });
});

