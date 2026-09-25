import type {
  AgentAction,
  Approval,
  AuditLogEntry,
  Assignment,
  Conversation,
  HumanGateActor,
  InboxItemType,
  ParticipantProfile,
  SocialAccount,
  SocialComment,
  SocialAttachment,
  SocialInboxState,
  SocialMessage,
  SuggestedReply,
  Task
} from "../../../../../packages/shared/src/types/social-inbox.js";

type Entity =
  | SocialAccount
  | ParticipantProfile
  | Conversation
  | SocialMessage
  | SocialComment
  | SuggestedReply
  | Task
  | Assignment
  | Approval
  | AuditLogEntry
  | AgentAction;

export class SocialInboxStore {
  private readonly state: SocialInboxState;

  constructor(initialState?: SocialInboxState) {
    this.state = initialState === undefined ? createEmptySocialInboxState() : structuredClone(initialState);
  }

  static emptyState(): SocialInboxState {
    return createEmptySocialInboxState();
  }

  replaceState(nextState: SocialInboxState): void {
    this.state.socialAccounts = structuredClone(nextState.socialAccounts);
    this.state.participantProfiles = structuredClone(nextState.participantProfiles ?? []);
    this.state.conversations = structuredClone(nextState.conversations);
    this.state.messages = structuredClone(nextState.messages);
    this.state.comments = structuredClone(nextState.comments);
    this.state.tasks = structuredClone(nextState.tasks);
    this.state.assignments = structuredClone(nextState.assignments);
    this.state.approvals = structuredClone(nextState.approvals);
    this.state.auditLog = structuredClone(nextState.auditLog);
    this.state.agentActions = structuredClone(nextState.agentActions);
    this.state.suggestedReplies = structuredClone(nextState.suggestedReplies ?? []);
  }

  snapshot(): SocialInboxState {
    return structuredClone(this.state);
  }

  upsertAccount(account: SocialAccount): SocialAccount {
    return this.upsert(this.state.socialAccounts, account);
  }

  getAccount(accountId: string): SocialAccount | undefined {
    return this.state.socialAccounts.find((account) => account.id === accountId);
  }

  upsertParticipantProfile(profile: ParticipantProfile): ParticipantProfile {
    return this.upsert(this.state.participantProfiles, profile);
  }

  upsertConversation(conversation: Conversation): Conversation {
    return this.upsert(this.state.conversations, conversation);
  }

  getConversation(conversationId: string): Conversation | undefined {
    return this.state.conversations.find((conversation) => conversation.id === conversationId);
  }

  updateConversation(
    conversationId: string,
    patch: Partial<
      Pick<
        Conversation,
        | "status"
        | "ownerActorId"
        | "lastHumanInterventionAt"
        | "lastAgentActionAt"
        | "escalationReason"
        | "updatedAt"
      >
    >
  ): Conversation {
    const conversation = this.getConversation(conversationId);
    if (conversation === undefined) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    Object.assign(conversation, patch);
    return conversation;
  }

  upsertMessage(message: SocialMessage): SocialMessage {
    return this.upsert(this.state.messages, message);
  }

  upsertComment(comment: SocialComment): SocialComment {
    return this.upsert(this.state.comments, comment);
  }

  addAuditLog(entry: AuditLogEntry): AuditLogEntry {
    this.state.auditLog.push(entry);
    return entry;
  }

  addTask(task: Task): Task {
    this.state.tasks.push(task);
    return task;
  }

  addAssignment(assignment: Assignment): Assignment {
    this.state.assignments.push(assignment);
    return assignment;
  }

  addApproval(approval: Approval): Approval {
    this.state.approvals.push(approval);
    return approval;
  }

  addAgentAction(action: AgentAction): AgentAction {
    this.state.agentActions.push(action);
    return action;
  }

  addSuggestedReply(reply: SuggestedReply): SuggestedReply {
    this.state.suggestedReplies.push(reply);
    return reply;
  }

  getSuggestedReply(replyId: string): SuggestedReply | undefined {
    return this.state.suggestedReplies.find((reply) => reply.id === replyId);
  }

  updateSuggestedReply(replyId: string, patch: Partial<SuggestedReply>): SuggestedReply {
    const reply = this.getSuggestedReply(replyId);
    if (reply === undefined) {
      throw new Error(`Suggested reply not found: ${replyId}`);
    }

    Object.assign(reply, patch);
    return reply;
  }

  addInternalConversationMessage(params: {
    conversationId: string;
    accountId: string;
    actorId: HumanGateActor;
    text: string;
    createdAt: string;
  }): SocialMessage {
    const message = this.upsertMessage({
      id: stableId("message", "internal", params.conversationId, params.actorId, params.createdAt),
      accountId: params.accountId,
      conversationId: params.conversationId,
      externalId: stableId("internal", params.actorId, params.createdAt),
      direction: "internal",
      text: params.text,
      authorExternalId: params.actorId,
      status: "approved_internal",
      receivedAt: params.createdAt,
      createdAt: params.createdAt
    });

    this.addAuditLog({
      id: stableId("audit", "operator-intervention", message.id),
      actorId: params.actorId,
      action: "conversation.operator_intervention_recorded",
      entityType: "conversation",
      entityId: params.conversationId,
      createdAt: params.createdAt,
      metadata: {
        messageId: message.id,
        externalResponseBlocked: true
      }
    });

    this.updateConversation(params.conversationId, {
      status: "pending_human_approval",
      ownerActorId: params.actorId,
      lastHumanInterventionAt: params.createdAt,
      updatedAt: params.createdAt
    });

    return message;
  }

  addOutboundConversationMessage(params: {
    conversationId: string;
    accountId: string;
    actorId: HumanGateActor;
    text: string;
    providerMessageId?: string;
    createdAt: string;
    attachments?: SocialAttachment[];
  }): SocialMessage {
    const message = this.upsertMessage({
      id: stableId("message", "outbound", params.conversationId, params.actorId, params.createdAt),
      accountId: params.accountId,
      conversationId: params.conversationId,
      externalId: params.providerMessageId ?? stableId("outbound", params.actorId, params.createdAt),
      direction: "outbound",
      text: params.text,
      authorExternalId: params.actorId,
      status: "sent",
      receivedAt: params.createdAt,
      createdAt: params.createdAt,
      attachments: params.attachments
    });

    this.addAuditLog({
      id: stableId("audit", "operator-reply-sent", message.id),
      actorId: params.actorId,
      action: "conversation.operator_reply_sent",
      entityType: "conversation",
      entityId: params.conversationId,
      createdAt: params.createdAt,
      metadata: {
        messageId: message.id,
        providerMessageId: params.providerMessageId
      }
    });

    this.updateConversation(params.conversationId, {
      status: "normalized",
      ownerActorId: "florencia-mkt",
      lastHumanInterventionAt: params.createdAt,
      updatedAt: params.createdAt
    });

    return message;
  }

  approveInternal(params: {
    inboxItemType: InboxItemType;
    inboxItemId: string;
    approvedBy: string;
    approvedAt: string;
    sensitivity?: "standard" | "sensitive";
  }): Approval {
    const approval: Approval = {
      id: stableId("approval", params.inboxItemType, params.inboxItemId, params.approvedAt),
      inboxItemType: params.inboxItemType,
      inboxItemId: params.inboxItemId,
      state: "approved_internal",
      decidedBy: params.approvedBy,
      decidedAt: params.approvedAt,
      sensitivity: params.sensitivity ?? "standard"
    };

    this.addApproval(approval);
    this.addAuditLog({
      id: stableId("audit", approval.id),
      actorId: params.approvedBy,
      action: "approved_internal",
      entityType: params.inboxItemType,
      entityId: params.inboxItemId,
      createdAt: params.approvedAt
    });

    return approval;
  }

  private upsert<T extends Entity>(collection: T[], entity: T): T {
    const index = collection.findIndex((item) => item.id === entity.id);
    if (index === -1) {
      collection.push(entity);
      return entity;
    }

    collection[index] = entity;
    return entity;
  }
}

export function createEmptySocialInboxState(): SocialInboxState {
  return {
    socialAccounts: [],
    participantProfiles: [],
    conversations: [],
    messages: [],
    comments: [],
    tasks: [],
    assignments: [],
    approvals: [],
    auditLog: [],
    agentActions: [],
    suggestedReplies: []
  };
}

export function stableId(...parts: string[]): string {
  return parts
    .map((part) => part.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"))
    .join(":")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}
