import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { SocialInboxState } from "../../../../packages/shared/src/types/social-inbox.js";
import { createEmptySocialInboxState } from "../modules/social-inbox/social-inbox-store.js";

export class FileSocialInboxRepository {
  constructor(private readonly filePath: string) {}

  async load(): Promise<SocialInboxState> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      return normalizeState(JSON.parse(raw) as Partial<SocialInboxState>);
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        return createEmptySocialInboxState();
      }

      throw error;
    }
  }

  async save(state: SocialInboxState): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
    await rename(tempPath, this.filePath);
  }
}

function normalizeState(input: Partial<SocialInboxState>): SocialInboxState {
  const empty = createEmptySocialInboxState();

  return {
    socialAccounts: Array.isArray(input.socialAccounts) ? input.socialAccounts : empty.socialAccounts,
    participantProfiles: Array.isArray(input.participantProfiles)
      ? input.participantProfiles
      : empty.participantProfiles,
    conversations: Array.isArray(input.conversations) ? input.conversations : empty.conversations,
    messages: Array.isArray(input.messages) ? input.messages : empty.messages,
    comments: Array.isArray(input.comments) ? input.comments : empty.comments,
    tasks: Array.isArray(input.tasks) ? input.tasks : empty.tasks,
    assignments: Array.isArray(input.assignments) ? input.assignments : empty.assignments,
    approvals: Array.isArray(input.approvals) ? input.approvals : empty.approvals,
    auditLog: Array.isArray(input.auditLog) ? input.auditLog : empty.auditLog,
    agentActions: Array.isArray(input.agentActions) ? input.agentActions : empty.agentActions,
    suggestedReplies: Array.isArray(input.suggestedReplies)
      ? input.suggestedReplies
      : empty.suggestedReplies
  };
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
