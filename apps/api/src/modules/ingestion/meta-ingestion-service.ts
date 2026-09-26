import { importMetaWebhook } from "../../../../../packages/integrations/meta/src/import-contract.js";
import type { MetaWebhookEnvelope } from "../../../../../packages/shared/src/types/meta-webhook.js";
import { SocialInboxStore } from "../social-inbox/social-inbox-store.js";

export const DEFAULT_COMMERCIAL_OWNER = "ebiz-commercial";

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
      const existing = store.getConversation(event.conversation.id);
      store.upsertConversation(
        existing === undefined
          ? { ...event.conversation, ownerActorId: event.conversation.ownerActorId ?? DEFAULT_COMMERCIAL_OWNER }
          : {
              // Un mensaje nuevo no debe pisar dueño/escalamiento/intervención humana existentes.
              ...existing,
              status: existing.status === "archived" ? "received" : existing.status,
              ownerActorId: existing.ownerActorId ?? DEFAULT_COMMERCIAL_OWNER,
              updatedAt: event.conversation.updatedAt
            }
      );
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
