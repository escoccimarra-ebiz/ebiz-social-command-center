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
          sender: {
            id: "user-1",
            username: "meli.emprende",
            name: "Meli Emprende",
            profile_pic: "https://cdn.example.test/meli.jpg"
          },
          recipient: { id: "17841400000000000" },
          timestamp: 1790159001000,
          message: {
            mid: "mid-1",
            text: "Hola, quiero info del cowork"
          }
        },
        {
          sender: { id: "17841400000000000" },
          recipient: { id: "user-1" },
          timestamp: 1790159001500,
          message: {
            mid: "mid-echo-ignored",
            text: "Auto respuesta vieja que no debe ensuciar inbox",
            is_echo: true
          }
        },
        {
          sender: {
            id: "user-1",
            username: "meli.emprende",
            name: "Meli Emprende",
            profile_pic: "https://cdn.example.test/meli.jpg"
          },
          recipient: { id: "17841400000000000" },
          timestamp: 1790159001800,
          message: {
            mid: "mid-story",
            reply_to: {
              story: {
                id: "story-1",
                link_sticker_url: "https://ebiz.com.ar/coworking-rosario/reservar"
              }
            }
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

    assert.equal(events.length, 3);
    assert.equal(events[0]?.type, "message");
    assert.equal(events[1]?.type, "message");
    assert.equal(events[2]?.type, "comment");
  });

  it("persists imported events into the Social Inbox model", () => {
    const store = new SocialInboxStore();
    const result = ingestMetaWebhook(store, fixture);
    const snapshot = store.snapshot();

    assert.deepEqual(result, {
      importedMessages: 2,
      importedComments: 1
    });
    assert.equal(snapshot.socialAccounts.length, 1);
    assert.equal(snapshot.participantProfiles.length, 2);
    assert.equal(snapshot.conversations.length, 1);
    assert.equal(snapshot.messages.length, 2);
    assert.equal(snapshot.comments.length, 1);
    assert.equal(snapshot.auditLog.length, 3);
    assert.equal(snapshot.messages[0]?.text, "Hola, quiero info del cowork");
    assert.equal(
      snapshot.messages[1]?.text,
      "[Respuesta a historia de Instagram] Link: https://ebiz.com.ar/coworking-rosario/reservar"
    );
    assert.equal(snapshot.comments[0]?.text, "Me interesa");
    assert.equal(snapshot.conversations[0]?.participantProfileId, "profile:meta:instagram:17841400000000000:user-1");
    assert.equal(snapshot.participantProfiles[0]?.displayName, "@meli.emprende");
    assert.equal(snapshot.participantProfiles[0]?.username, "meli.emprende");
    assert.equal(snapshot.participantProfiles[0]?.profileUrl, "https://www.instagram.com/meli.emprende/");
    assert.equal(snapshot.participantProfiles[0]?.avatarUrl, "https://cdn.example.test/meli.jpg");
    assert.equal(snapshot.participantProfiles[1]?.displayName, "@prospecto");
    assert.equal(snapshot.participantProfiles[1]?.profileUrl, "https://www.instagram.com/prospecto/");
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
