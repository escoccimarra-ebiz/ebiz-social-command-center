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
      if (messageEvent.message?.mid === undefined) {
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
    createdAt: receivedAt,
    updatedAt: receivedAt
  };

  return {
    type: "message",
    account,
    participantProfile: makeParticipantProfile(account, messageEvent.sender.id, receivedAt),
    conversation,
    message: {
      id: `message:${account.id}:${messageEvent.message?.mid}`,
      accountId: account.id,
      conversationId: conversation.id,
      externalId: messageEvent.message?.mid ?? "",
      direction: "inbound",
      text: messageEvent.message?.text ?? "",
      authorExternalId: messageEvent.sender.id,
      status: "received",
      receivedAt,
      createdAt: receivedAt
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

function makeParticipantProfile(
  account: SocialAccount,
  externalId: string,
  seenAt: string,
  username?: string
): ParticipantProfile {
  const displayName = username === undefined ? `Instagram ${shortId(externalId)}` : `@${username}`;
  return {
    id: profileId(account, externalId),
    provider: "meta",
    channel: account.channel,
    externalId,
    displayName,
    username,
    profileUrl: username === undefined ? undefined : `https://www.instagram.com/${username}/`,
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
