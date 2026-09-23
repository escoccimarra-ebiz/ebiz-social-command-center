import { outboundPolicy } from "./policy/outbound-policy.js";

export function getHealth() {
  return {
    service: "ebiz-social-command-center-api",
    status: "ok",
    outboundPolicy
  };
}

