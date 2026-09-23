import type {
  AgentAction,
  Approval,
  HumanGateActor,
  InboxItemType,
  SensitivityLevel
} from "../../../../../packages/shared/src/types/social-inbox.js";
import { assertOutboundAllowed } from "../../policy/outbound-policy.js";
import { SocialInboxStore, stableId } from "./social-inbox-store.js";

interface InboxItemRef {
  inboxItemType: InboxItemType;
  inboxItemId: string;
}

interface FlorenciaActionParams extends InboxItemRef {
  createdAt: string;
  output: string;
}

interface HumanGateParams extends InboxItemRef {
  decidedAt: string;
  decidedBy: HumanGateActor;
  decision: "approve_internal" | "reject_internal" | "escalate_esteban";
  reason: string;
  sensitivity: SensitivityLevel;
}

export function classifyAsFlorencia(
  store: SocialInboxStore,
  params: FlorenciaActionParams
): AgentAction {
  const action = store.addAgentAction({
    id: stableId("agent-action", "florencia-mkt", "classify", params.inboxItemId, params.createdAt),
    agentId: "florencia-mkt",
    action: "classify",
    inboxItemType: params.inboxItemType,
    inboxItemId: params.inboxItemId,
    status: "suggested",
    createdAt: params.createdAt,
    output: params.output
  });

  store.addAuditLog({
    id: stableId("audit", action.id),
    actorId: "florencia-mkt",
    action: "human_gate.classification_suggested",
    entityType: params.inboxItemType,
    entityId: params.inboxItemId,
    createdAt: params.createdAt,
    metadata: { agentActionId: action.id }
  });

  return action;
}

export function draftAsFlorencia(store: SocialInboxStore, params: FlorenciaActionParams): AgentAction {
  const action = store.addAgentAction({
    id: stableId("agent-action", "florencia-mkt", "draft", params.inboxItemId, params.createdAt),
    agentId: "florencia-mkt",
    action: "draft",
    inboxItemType: params.inboxItemType,
    inboxItemId: params.inboxItemId,
    status: "suggested",
    createdAt: params.createdAt,
    output: params.output
  });

  store.addAuditLog({
    id: stableId("audit", action.id),
    actorId: "florencia-mkt",
    action: "human_gate.draft_suggested",
    entityType: params.inboxItemType,
    entityId: params.inboxItemId,
    createdAt: params.createdAt,
    metadata: {
      agentActionId: action.id,
      externalResponseBlocked: true
    }
  });

  return action;
}

export function decideHumanGate(store: SocialInboxStore, params: HumanGateParams): Approval {
  if (params.reason.trim().length === 0) {
    throw new Error("Human gate decisions require an audit reason");
  }

  assertExternalResponseStillBlocked();

  if (params.sensitivity === "sensitive" && params.decision === "approve_internal") {
    requireEsteban(params.decidedBy);
  }

  const state =
    params.decision === "approve_internal"
      ? "approved_internal"
      : params.decision === "reject_internal"
        ? "rejected_internal"
        : "requires_esteban";

  const approval = store.addApproval({
    id: stableId("approval", params.decision, params.inboxItemType, params.inboxItemId, params.decidedAt),
    inboxItemType: params.inboxItemType,
    inboxItemId: params.inboxItemId,
    state,
    decidedBy: params.decidedBy,
    decidedAt: params.decidedAt,
    reason: params.reason,
    sensitivity: params.sensitivity
  });

  store.addAuditLog({
    id: stableId("audit", approval.id),
    actorId: params.decidedBy,
    action: `human_gate.${state}`,
    entityType: params.inboxItemType,
    entityId: params.inboxItemId,
    createdAt: params.decidedAt,
    metadata: {
      approvalId: approval.id,
      reason: params.reason,
      sensitivity: params.sensitivity,
      externalResponseBlocked: true
    }
  });

  return approval;
}

function requireEsteban(actor: HumanGateActor): void {
  if (actor !== "esteban") {
    throw new Error("Sensitive social cases require Esteban approval");
  }
}

function assertExternalResponseStillBlocked(): void {
  try {
    assertOutboundAllowed("reply");
  } catch {
    return;
  }

  throw new Error("Unexpected outbound reply capability enabled during MVP1");
}
