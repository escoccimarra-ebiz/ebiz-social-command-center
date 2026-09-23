export const allowedMvp1Events = [
  "social_inbox.message.received",
  "social_inbox.message.normalized",
  "social_inbox.item.approved_internal",
  "social_inbox.outbound_blocked"
] as const;

export const blockedMvp1EventSuffixes = [
  ".send",
  ".publish",
  ".reply",
  ".auto_reply"
] as const;

