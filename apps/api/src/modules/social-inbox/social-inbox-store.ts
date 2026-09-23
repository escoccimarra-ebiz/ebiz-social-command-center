import type {
  AgentAction,
  Approval,
  AuditLogEntry,
  Assignment,
  Conversation,
  InboxItemType,
  SocialAccount,
  SocialComment,
  SocialInboxState,
  SocialMessage,
  Task
} from "../../../../../packages/shared/src/types/social-inbox.js";

type Entity =
  | SocialAccount
  | Conversation
  | SocialMessage
  | SocialComment
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
    this.state.conversations = structuredClone(nextState.conversations);
    this.state.messages = structuredClone(nextState.messages);
    this.state.comments = structuredClone(nextState.comments);
    this.state.tasks = structuredClone(nextState.tasks);
    this.state.assignments = structuredClone(nextState.assignments);
    this.state.approvals = structuredClone(nextState.approvals);
    this.state.auditLog = structuredClone(nextState.auditLog);
    this.state.agentActions = structuredClone(nextState.agentActions);
  }

  snapshot(): SocialInboxState {
    return structuredClone(this.state);
  }

  upsertAccount(account: SocialAccount): SocialAccount {
    return this.upsert(this.state.socialAccounts, account);
  }

  upsertConversation(conversation: Conversation): Conversation {
    return this.upsert(this.state.conversations, conversation);
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
    conversations: [],
    messages: [],
    comments: [],
    tasks: [],
    assignments: [],
    approvals: [],
    auditLog: [],
    agentActions: []
  };
}

export function stableId(...parts: string[]): string {
  return parts
    .map((part) => part.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"))
    .join(":")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}
