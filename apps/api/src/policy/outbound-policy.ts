export type OutboundAction = "send" | "publish" | "reply" | "auto_reply";

export const outboundPolicy: Record<OutboundAction, false> = {
  send: false,
  publish: false,
  reply: false,
  auto_reply: false
} as const;

export function assertOutboundAllowed(action: OutboundAction): never {
  void outboundPolicy[action];
  throw new Error(`Outbound action disabled in MVP1: ${action}`);
}

export function approveInternal(currentState: string): "approved_internal" {
  if (currentState.length === 0) {
    throw new Error("Cannot approve an item without a current state");
  }

  return "approved_internal";
}

