export type SocialProvider = "meta";
export type SocialChannel = "instagram" | "facebook";
export type InboxDirection = "inbound" | "internal";
export type InboxItemStatus =
  | "received"
  | "normalized"
  | "pending_review"
  | "pending_human_approval"
  | "requires_esteban"
  | "approved_internal"
  | "rejected_internal"
  | "archived";
export type InboxItemType = "message" | "comment";
export type HumanGateActor = "florencia-mkt" | "esteban" | "operador-humano" | "system";
export type SensitivityLevel = "standard" | "sensitive";
export type EscalationReason = "ambiguous" | "missing_info" | "sensitive";
export type ApprovalState =
  | "pending_human_approval"
  | "requires_esteban"
  | "approved_internal"
  | "rejected_internal";

export interface SocialAccount {
  id: string;
  provider: SocialProvider;
  channel: SocialChannel;
  externalId: string;
  displayName: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  accountId: string;
  participantProfileId: string;
  externalThreadId: string;
  participantExternalId: string;
  status: InboxItemStatus;
  ownerActorId?: HumanGateActor;
  lastHumanInterventionAt?: string;
  lastAgentActionAt?: string;
  escalationReason?: EscalationReason;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantProfile {
  id: string;
  provider: SocialProvider;
  channel: SocialChannel;
  externalId: string;
  displayName: string;
  username?: string;
  profileUrl?: string;
  avatarUrl?: string;
  kind: "prospect" | "client" | "unknown";
  lastSeenAt: string;
  createdAt: string;
}

export interface SocialMessage {
  id: string;
  accountId: string;
  conversationId: string;
  externalId: string;
  direction: InboxDirection;
  text: string;
  authorExternalId: string;
  status: InboxItemStatus;
  receivedAt: string;
  createdAt: string;
}

export interface SocialComment {
  id: string;
  accountId: string;
  externalId: string;
  parentExternalId?: string;
  postExternalId: string;
  authorExternalId: string;
  text: string;
  status: InboxItemStatus;
  receivedAt: string;
  createdAt: string;
}

export interface Task {
  id: string;
  inboxItemType: InboxItemType;
  inboxItemId: string;
  title: string;
  status: "open" | "done";
  assigneeId?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  taskId: string;
  assigneeId: string;
  assignedBy: string;
  assignedAt: string;
}

export interface Approval {
  id: string;
  inboxItemType: InboxItemType;
  inboxItemId: string;
  state: ApprovalState;
  requestedBy?: string;
  requestedAt?: string;
  decidedBy?: string;
  decidedAt?: string;
  reason?: string;
  sensitivity: SensitivityLevel;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface AgentAction {
  id: string;
  agentId: "florencia-mkt";
  action: "classify" | "draft" | "summarize" | "escalate";
  inboxItemType: InboxItemType;
  inboxItemId: string;
  status: "suggested" | "accepted" | "rejected";
  createdAt: string;
  output: string;
}

export interface SocialInboxState {
  socialAccounts: SocialAccount[];
  participantProfiles: ParticipantProfile[];
  conversations: Conversation[];
  messages: SocialMessage[];
  comments: SocialComment[];
  tasks: Task[];
  assignments: Assignment[];
  approvals: Approval[];
  auditLog: AuditLogEntry[];
  agentActions: AgentAction[];
}
