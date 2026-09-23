import type {
  AgentAction,
  Approval,
  EscalationReason,
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

interface ConversationControlParams {
  conversationId: string;
  decidedAt: string;
  actorId: HumanGateActor;
  action: "take_control" | "return_to_agent" | "resolve";
  reason: string;
}

interface EscalationParams {
  conversationId: string;
  inboxItemType: InboxItemType;
  inboxItemId: string;
  createdAt: string;
  reason: EscalationReason;
  detail: string;
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

export function escalateAsFlorencia(store: SocialInboxStore, params: EscalationParams): AgentAction {
  if (params.detail.trim().length === 0) {
    throw new Error("Escalations require an audit detail");
  }

  const output = `Escalar a operador humano por ${params.reason}: ${params.detail}`;
  const action = store.addAgentAction({
    id: stableId("agent-action", "florencia-mkt", "escalate", params.inboxItemId, params.createdAt),
    agentId: "florencia-mkt",
    action: "escalate",
    inboxItemType: params.inboxItemType,
    inboxItemId: params.inboxItemId,
    status: "suggested",
    createdAt: params.createdAt,
    output
  });

  store.updateConversation(params.conversationId, {
    status: params.reason === "sensitive" ? "requires_esteban" : "pending_human_approval",
    ownerActorId: params.reason === "sensitive" ? "esteban" : "operador-humano",
    lastAgentActionAt: params.createdAt,
    escalationReason: params.reason,
    updatedAt: params.createdAt
  });

  store.addAuditLog({
    id: stableId("audit", action.id),
    actorId: "florencia-mkt",
    action: "agent.escalated_to_human",
    entityType: "conversation",
    entityId: params.conversationId,
    createdAt: params.createdAt,
    metadata: {
      agentActionId: action.id,
      reason: params.reason,
      detail: params.detail,
      externalResponseBlocked: true
    }
  });

  return action;
}

export function decideConversationControl(
  store: SocialInboxStore,
  params: ConversationControlParams
): void {
  if (params.reason.trim().length === 0) {
    throw new Error("Conversation control changes require an audit reason");
  }

  assertExternalResponseStillBlocked();

  const status =
    params.action === "take_control"
      ? "pending_human_approval"
      : params.action === "return_to_agent"
        ? "normalized"
        : "archived";

  store.updateConversation(params.conversationId, {
    status,
    ownerActorId: params.action === "return_to_agent" ? "florencia-mkt" : params.actorId,
    lastHumanInterventionAt:
      params.action === "take_control" || params.action === "resolve" ? params.decidedAt : undefined,
    updatedAt: params.decidedAt
  });

  store.addAuditLog({
    id: stableId("audit", "conversation-control", params.action, params.conversationId, params.decidedAt),
    actorId: params.actorId,
    action: `conversation.${params.action}`,
    entityType: "conversation",
    entityId: params.conversationId,
    createdAt: params.decidedAt,
    metadata: {
      reason: params.reason,
      externalResponseBlocked: true
    }
  });
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
