import { outboundPolicy } from "./policy/outbound-policy.js";
import { SocialInboxStore } from "./modules/social-inbox/social-inbox-store.js";

export function getHealth() {
  return {
    service: "ebiz-social-command-center-api",
    status: "ok",
    outboundPolicy
  };
}

export function createSocialInboxStore() {
  return new SocialInboxStore();
}

