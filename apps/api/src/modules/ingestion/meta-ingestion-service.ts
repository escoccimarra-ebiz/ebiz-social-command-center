import { importMetaWebhook } from "../../../../../packages/integrations/meta/src/import-contract.js";
import type { MetaWebhookEnvelope } from "../../../../../packages/shared/src/types/meta-webhook.js";
import { SocialInboxStore } from "../social-inbox/social-inbox-store.js";

export interface IngestionResult {
  importedMessages: number;
  importedComments: number;
}

export function ingestMetaWebhook(
  store: SocialInboxStore,
  envelope: MetaWebhookEnvelope
): IngestionResult {
  const events = importMetaWebhook(envelope);
  let importedMessages = 0;
  let importedComments = 0;

  for (const event of events) {
    store.upsertAccount(event.account);
    store.upsertParticipantProfile(event.participantProfile);

    if (event.type === "message") {
      store.upsertConversation(event.conversation);
      store.upsertMessage(event.message);
      importedMessages += 1;
      store.addAuditLog({
        id: `audit:${event.message.id}:received`,
        actorId: "system:lxc112-import",
        action: "social_inbox.message.received",
        entityType: "message",
        entityId: event.message.id,
        createdAt: event.message.createdAt
      });
      continue;
    }

    store.upsertComment(event.comment);
    importedComments += 1;
    store.addAuditLog({
      id: `audit:${event.comment.id}:received`,
      actorId: "system:lxc112-import",
      action: "social_inbox.comment.received",
      entityType: "comment",
      entityId: event.comment.id,
      createdAt: event.comment.createdAt
    });
  }

  return { importedMessages, importedComments };
}
