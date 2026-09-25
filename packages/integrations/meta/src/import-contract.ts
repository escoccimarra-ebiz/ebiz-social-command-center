import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  MetaChangeEvent,
  MetaMessagingEvent,
  MetaWebhookEnvelope
} from "../../../shared/src/types/meta-webhook.js";
import type {
  Conversation,
  ParticipantProfile,
  SocialAccount,
  SocialAttachment,
  SocialComment,
  SocialMessage
} from "../../../shared/src/types/social-inbox.js";

export type ImportedMetaEvent =
  | {
      type: "message";
      account: SocialAccount;
      participantProfile: ParticipantProfile;
      conversation: Conversation;
      message: SocialMessage;
    }
  | {
      type: "comment";
      account: SocialAccount;
    comment: SocialComment;
      participantProfile: ParticipantProfile;
    };

export function verifyMetaSignature(params: {
  rawBody: string;
  appSecret: string;
  signatureHeader: string;
}): boolean {
  const expected = `sha256=${createHmac("sha256", params.appSecret)
    .update(params.rawBody)
    .digest("hex")}`;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(params.signatureHeader);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function importMetaWebhook(envelope: MetaWebhookEnvelope): ImportedMetaEvent[] {
  const imported: ImportedMetaEvent[] = [];

  for (const entry of envelope.entry) {
    const account = makeAccount(envelope.object, entry.id, entry.time);

    for (const messageEvent of entry.messaging ?? []) {
      if (messageEvent.message?.mid === undefined || messageEvent.message.is_echo === true) {
        continue;
      }

      imported.push(importMessage(account, messageEvent));
    }

    for (const changeEvent of entry.changes ?? []) {
      const comment = importComment(account, changeEvent, entry.time);
      if (comment !== null) {
        imported.push(comment);
      }
    }
  }

  return imported;
}

function makeAccount(
  object: MetaWebhookEnvelope["object"],
  externalId: string,
  unixSeconds: number
): SocialAccount {
  return {
    id: `meta:${object}:${externalId}`,
    provider: "meta",
    channel: object === "instagram" ? "instagram" : "facebook",
    externalId,
    displayName: `${object}:${externalId}`,
    createdAt: isoFromUnixSeconds(unixSeconds)
  };
}

function importMessage(
  account: SocialAccount,
  messageEvent: MetaMessagingEvent
): ImportedMetaEvent {
  const receivedAt = isoFromUnixMs(messageEvent.timestamp);
  const conversation: Conversation = {
    id: `conversation:${account.id}:${messageEvent.sender.id}`,
    accountId: account.id,
    participantProfileId: profileId(account, messageEvent.sender.id),
    externalThreadId: messageEvent.sender.id,
    participantExternalId: messageEvent.sender.id,
    status: "received",
    ownerActorId: "florencia-mkt",
    createdAt: receivedAt,
    updatedAt: receivedAt
  };

  return {
    type: "message",
    account,
    participantProfile: makeParticipantProfile(
      account,
      messageEvent.sender.id,
      receivedAt,
      messageEvent.sender.username,
      messageEvent.sender.name,
      messageEvent.sender.profile_pic
    ),
    conversation,
    message: {
      id: `message:${account.id}:${messageEvent.message?.mid}`,
      accountId: account.id,
      conversationId: conversation.id,
      externalId: messageEvent.message?.mid ?? "",
      direction: "inbound",
      text: summarizeMessageEvent(messageEvent),
      authorExternalId: messageEvent.sender.id,
      status: "received",
      receivedAt,
      createdAt: receivedAt,
      attachments: mapAttachments(messageEvent)
    }
  };
}

function importComment(
  account: SocialAccount,
  changeEvent: MetaChangeEvent,
  fallbackUnixSeconds: number
): ImportedMetaEvent | null {
  if (changeEvent.field !== "comments" && changeEvent.field !== "comment") {
    return null;
  }

  const externalId = changeEvent.value.comment_id ?? changeEvent.value.id;
  const postExternalId = changeEvent.value.media?.id ?? changeEvent.value.parent_id;

  if (externalId === undefined || postExternalId === undefined) {
    return null;
  }

  const receivedAt =
    changeEvent.value.created_time !== undefined
      ? isoFromUnixSeconds(changeEvent.value.created_time)
      : isoFromUnixSeconds(fallbackUnixSeconds);

    return {
      type: "comment",
      account,
      participantProfile: makeParticipantProfile(
        account,
        changeEvent.value.from?.id ?? "unknown",
        receivedAt,
        changeEvent.value.from?.username
      ),
      comment: {
      id: `comment:${account.id}:${externalId}`,
      accountId: account.id,
      externalId,
      parentExternalId: changeEvent.value.parent_id,
      postExternalId,
      authorExternalId: changeEvent.value.from?.id ?? "unknown",
      text: changeEvent.value.text ?? "",
      status: "received",
      receivedAt,
      createdAt: receivedAt
    }
  };
}

function summarizeMessageEvent(messageEvent: MetaMessagingEvent): string {
  const text = messageEvent.message?.text?.trim();
  if (text !== undefined && text.length > 0) {
    return text;
  }

  const story = messageEvent.message?.reply_to?.story;
  if (story !== undefined) {
    const sticker = story.link_sticker_url === undefined ? "" : ` Link: ${story.link_sticker_url}`;
    return `[Respuesta a historia de Instagram]${sticker}`;
  }

  const attachments = messageEvent.message?.attachments ?? [];
  if (attachments.length > 0) {
    const attachmentTypes = attachments.map((attachment) => attachment.type).join(", ");
    return `[Adjunto de Instagram: ${attachmentTypes}]`;
  }

  return "[Evento de Instagram sin texto visible]";
}

function mapAttachments(messageEvent: MetaMessagingEvent): SocialAttachment[] | undefined {
  const attachments = messageEvent.message?.attachments ?? [];
  if (attachments.length === 0) {
    return undefined;
  }

  return attachments.map((attachment, index) => ({
    id: `${messageEvent.message?.mid ?? "attachment"}:${index}`,
    type: normalizeAttachmentType(attachment.type),
    url: attachment.payload?.url
  }));
}

function normalizeAttachmentType(type: string): SocialAttachment["type"] {
  if (type === "image" || type === "video" || type === "audio" || type === "file") {
    return type;
  }

  return "unknown";
}

function makeParticipantProfile(
  account: SocialAccount,
  externalId: string,
  seenAt: string,
  username?: string,
  name?: string,
  avatarUrl?: string
): ParticipantProfile {
  const displayName = username === undefined ? (name ?? `Instagram ${shortId(externalId)}`) : `@${username}`;
  return {
    id: profileId(account, externalId),
    provider: "meta",
    channel: account.channel,
    externalId,
    displayName,
    username,
    profileUrl: username === undefined ? undefined : `https://www.instagram.com/${username}/`,
    avatarUrl,
    kind: "unknown",
    lastSeenAt: seenAt,
    createdAt: seenAt
  };
}

function profileId(account: SocialAccount, externalId: string): string {
  return `profile:${account.id}:${externalId}`;
}

function shortId(externalId: string): string {
  return externalId.length <= 8 ? externalId : `${externalId.slice(0, 4)}...${externalId.slice(-4)}`;
}

function isoFromUnixMs(unixMs: number): string {
  return new Date(unixMs).toISOString();
}

function isoFromUnixSeconds(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString();
}
