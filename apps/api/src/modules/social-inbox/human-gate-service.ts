import type {
  AgentAction,
  Approval,
  EscalationReason,
  HumanGateActor,
  InboxItemType,
  SensitivityLevel,
  SocialAttachment,
  SuggestedReply
} from "../../../../../packages/shared/src/types/social-inbox.js";
import { assertOutboundAllowed } from "../../policy/outbound-policy.js";
import type { InstagramOutboundClient } from "../instagram/instagram-outbound-client.js";
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

interface SuggestedReplyParams extends InboxItemRef {
  conversationId: string;
  createdAt: string;
  text: string;
  sensitivity: SensitivityLevel;
}

interface SuggestedReplyDecisionParams {
  replyId: string;
  decidedAt: string;
  decidedBy: HumanGateActor;
  decision: "approve_ready_to_send" | "reject" | "escalate_esteban";
  reason: string;
}

interface OperatorReplyParams {
  conversationId: string;
  actorId: HumanGateActor;
  text: string;
  sentAt: string;
  client: InstagramOutboundClient;
  attachments?: SocialAttachment[];
  /** Respuesta automatica de Florencia-MKT: no cuenta como intervencion humana. */
  automated?: boolean;
}

interface SuggestedReplySendParams {
  replyId: string;
  actorId: HumanGateActor;
  sentAt: string;
  client: InstagramOutboundClient;
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

export function suggestReplyAsFlorencia(
  store: SocialInboxStore,
  params: SuggestedReplyParams
): SuggestedReply {
  if (params.text.trim().length === 0) {
    throw new Error("Suggested replies require text");
  }

  const conversation = store.getConversation(params.conversationId);
  if (conversation === undefined) {
    throw new Error(`Conversation not found: ${params.conversationId}`);
  }

  const account = store.getAccount(conversation.accountId);
  if (account === undefined) {
    throw new Error(`Social account not found: ${conversation.accountId}`);
  }

  const reply = store.addSuggestedReply({
    id: stableId("suggested-reply", params.conversationId, params.inboxItemId, params.createdAt),
    conversationId: params.conversationId,
    inboxItemType: params.inboxItemType,
    inboxItemId: params.inboxItemId,
    channel: account.channel,
    provider: account.provider,
    text: params.text,
    state: params.sensitivity === "sensitive" ? "requires_esteban" : "drafted",
    draftedBy: "florencia-mkt",
    draftedAt: params.createdAt,
    sensitivity: params.sensitivity,
    externalSendBlocked: true
  });

  const action = draftAsFlorencia(store, {
    inboxItemType: params.inboxItemType,
    inboxItemId: params.inboxItemId,
    createdAt: params.createdAt,
    output: params.text
  });

  store.updateConversation(params.conversationId, {
    status: params.sensitivity === "sensitive" ? "requires_esteban" : "pending_human_approval",
    ownerActorId: params.sensitivity === "sensitive" ? "esteban" : "operador-humano",
    lastAgentActionAt: params.createdAt,
    updatedAt: params.createdAt
  });

  store.addAuditLog({
    id: stableId("audit", reply.id),
    actorId: "florencia-mkt",
    action: "reply.suggested",
    entityType: "suggested_reply",
    entityId: reply.id,
    createdAt: params.createdAt,
    metadata: {
      agentActionId: action.id,
      conversationId: params.conversationId,
      inboxItemId: params.inboxItemId,
      sensitivity: params.sensitivity,
      externalSendBlocked: true
    }
  });

  return reply;
}

export function decideSuggestedReply(
  store: SocialInboxStore,
  params: SuggestedReplyDecisionParams
): SuggestedReply {
  if (params.reason.trim().length === 0) {
    throw new Error("Suggested reply decisions require an audit reason");
  }

  assertExternalResponseStillBlocked();

  const reply = store.getSuggestedReply(params.replyId);
  if (reply === undefined) {
    throw new Error(`Suggested reply not found: ${params.replyId}`);
  }

  if (reply.sensitivity === "sensitive" && params.decision === "approve_ready_to_send") {
    requireEsteban(params.decidedBy);
  }

  const state =
    params.decision === "approve_ready_to_send"
      ? "ready_to_send"
      : params.decision === "reject"
        ? "rejected"
        : "requires_esteban";

  const decidedReply = store.updateSuggestedReply(params.replyId, {
    state,
    decidedBy: params.decidedBy,
    decidedAt: params.decidedAt,
    decisionReason: params.reason,
    externalSendBlocked: true
  });

  store.addAuditLog({
    id: stableId("audit", "suggested-reply", params.decision, params.replyId, params.decidedAt),
    actorId: params.decidedBy,
    action: `reply.${state}`,
    entityType: "suggested_reply",
    entityId: params.replyId,
    createdAt: params.decidedAt,
    metadata: {
      conversationId: reply.conversationId,
      reason: params.reason,
      externalSendBlocked: true
    }
  });

  return decidedReply;
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

export async function sendOperatorReplyToInstagram(
  store: SocialInboxStore,
  params: OperatorReplyParams
) {
  if (params.text.trim().length === 0 && (params.attachments ?? []).length === 0) {
    throw new Error("Instagram replies require text or attachments");
  }

  const conversation = store.getConversation(params.conversationId);
  if (conversation === undefined) {
    throw new Error(`Conversation not found: ${params.conversationId}`);
  }

  const account = store.getAccount(conversation.accountId);
  if (account === undefined) {
    throw new Error(`Social account not found: ${conversation.accountId}`);
  }

  if (account.channel !== "instagram") {
    throw new Error("Controlled external send is only available for Instagram conversations");
  }

  const result = await params.client.sendText({
    igBusinessAccountId: account.externalId,
    recipientId: conversation.participantExternalId,
    text: params.text,
    attachments: params.attachments?.map((attachment) => ({
      type: attachment.type,
      name: attachment.name ?? attachment.id,
      mimeType: attachment.mimeType ?? "application/octet-stream",
      dataUrl: attachment.dataUrl ?? "",
      sizeBytes: attachment.sizeBytes ?? 0
    }))
  });

  return store.addOutboundConversationMessage({
    conversationId: conversation.id,
    accountId: account.id,
    actorId: params.actorId,
    text: params.text,
    providerMessageId: result.providerMessageId,
    createdAt: params.sentAt,
    attachments: params.attachments,
    automated: params.automated
  });
}

export async function sendSuggestedReplyToInstagram(
  store: SocialInboxStore,
  params: SuggestedReplySendParams
) {
  const reply = store.getSuggestedReply(params.replyId);
  if (reply === undefined) {
    throw new Error(`Suggested reply not found: ${params.replyId}`);
  }

  if (reply.state !== "ready_to_send") {
    throw new Error("Suggested reply must be approved before sending");
  }

  const message = await sendOperatorReplyToInstagram(store, {
    conversationId: reply.conversationId,
    actorId: params.actorId,
    text: reply.text,
    sentAt: params.sentAt,
    client: params.client
  });

  store.updateSuggestedReply(reply.id, {
    state: "sent",
    decidedBy: params.actorId,
    decidedAt: params.sentAt,
    externalSendBlocked: false
  });

  store.addAuditLog({
    id: stableId("audit", "suggested-reply-sent", reply.id, params.sentAt),
    actorId: params.actorId,
    action: "reply.sent_to_instagram",
    entityType: "suggested_reply",
    entityId: reply.id,
    createdAt: params.sentAt,
    metadata: {
      conversationId: reply.conversationId,
      messageId: message.id,
      providerMessageId: message.externalId
    }
  });

  return { reply: store.getSuggestedReply(reply.id), message };
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
