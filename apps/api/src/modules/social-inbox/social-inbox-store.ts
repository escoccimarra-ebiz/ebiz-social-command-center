import type {
  AgentAction,
  Approval,
  AuditLogEntry,
  Assignment,
  Conversation,
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
  private readonly state: SocialInboxState = {
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

  approveInternal(params: {
    inboxItemType: "message" | "comment";
    inboxItemId: string;
    approvedBy: string;
    approvedAt: string;
  }): Approval {
    const approval: Approval = {
      id: stableId("approval", params.inboxItemType, params.inboxItemId, params.approvedAt),
      inboxItemType: params.inboxItemType,
      inboxItemId: params.inboxItemId,
      state: "approved_internal",
      approvedBy: params.approvedBy,
      approvedAt: params.approvedAt
    };

    this.state.approvals.push(approval);
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

export function stableId(...parts: string[]): string {
  return parts
    .map((part) => part.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"))
    .join(":")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

