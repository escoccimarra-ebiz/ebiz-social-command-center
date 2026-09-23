# eBiz Social Command Center

Private MVP for eBiz social operations.

## Scope

- Ingest Meta-originated social events from the approved ingestion path.
- Normalize incoming messages, comments, and moderation items.
- Provide internal review, assignment, approval state, and audit history.
- Let Florencia-MKT suggest classifications and drafts under human gates.
- Block all outbound `send`, `publish`, `reply`, and `auto_reply` behavior in MVP1 by code.

## Hard Boundaries

- No production changes without explicit authorization.
- No secrets in Git.
- LXC112 remains Meta ingest only.
- The runtime target is LXC121 after OPS preflight and provisioning.
- `approve` is an internal state transition only.
- MVP1 does not post, reply, publish, auto-reply, or call outbound Graph API endpoints.

## Status

- Repo: private GitHub repository.
- Product runtime: pending LXC121 provisioning.
- MVP1: Social Inbox, audit, internal approvals, no outbound.

