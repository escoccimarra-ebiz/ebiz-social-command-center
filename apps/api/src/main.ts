import type { AutoReplyStatus } from "./modules/auto-reply/auto-reply-service.js";
import { outboundPolicy } from "./policy/outbound-policy.js";
import { SocialInboxStore } from "./modules/social-inbox/social-inbox-store.js";

export function getHealth(autoReply?: AutoReplyStatus) {
  return {
    service: "ebiz-social-command-center-api",
    status: "ok",
    outboundPolicy: autoReply === undefined ? outboundPolicy : { ...outboundPolicy, auto_reply: autoReply.enabled },
    ...(autoReply === undefined ? {} : { autoReply })
  };
}

export function createSocialInboxStore() {
  return new SocialInboxStore();
}

