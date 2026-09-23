import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { FileSocialInboxRepository } from "../apps/api/src/runtime/file-social-inbox-repository.js";
import { SocialInboxStore } from "../apps/api/src/modules/social-inbox/social-inbox-store.js";

describe("file-backed social inbox persistence", () => {
  it("saves and reloads the social inbox state durably", async () => {
    const dir = await mkdtemp(join(tmpdir(), "scc-store-"));
    const filePath = join(dir, "state.json");

    try {
      const repository = new FileSocialInboxRepository(filePath);
      const store = new SocialInboxStore(await repository.load());

      store.upsertAccount({
        id: "meta:instagram:acct-1",
        provider: "meta",
        channel: "instagram",
        externalId: "acct-1",
        displayName: "Instagram eBiz",
        createdAt: "2026-09-23T14:00:00.000Z"
      });

      await repository.save(store.snapshot());

      const raw = await readFile(filePath, "utf8");
      const reloaded = await repository.load();

      assert.match(raw, /Instagram eBiz/);
      assert.equal(reloaded.socialAccounts.length, 1);
      assert.equal(reloaded.socialAccounts[0]?.id, "meta:instagram:acct-1");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
