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

- Repo: public GitHub repository with native secret scanning and branch protection.
- Product runtime: LXC121 deployed for internal navigation.
- MVP1.3: Real Meta ingest bridge, participant profiles, Factory-style Social Inbox, conversation history, Florencia-MKT agent actions, human operator intervention, escalation for ambiguous/missing/sensitive cases, audit, internal approvals, no outbound.
- GitHub controls: see `docs/github-controls.md`.

## MVP1.2 Operating Flow

- Incoming Meta events become inbox conversations or comments.
- Incoming Meta events from LXC112 are forwarded into LXC121 instead of staying only in webhook logs.
- Prospect/client identity is modeled as a participant profile with Instagram username/profile URL when Meta provides it, and with an IG-scoped external id otherwise.
- Florencia-MKT can classify, draft, and escalate with an auditable reason.
- A human operator can take control of a conversation, add an internal intervention, return it to MKT, or resolve it.
- Ambiguous, missing, or sensitive information is escalated instead of answered automatically.
- All actions remain internal during MVP1.2: no external send, publish, reply, auto-reply, or outbound Graph API call is enabled.

## Brand Application

The internal dashboard uses the eBiz identity v1.2 tokens:

- eBiz Blue `#0077FF`
- eBiz Charcoal `#202733`
- eBiz White `#FFFFFF`
- eBiz Ink `#1A1A1A`
- eBiz Neutral `#6B7280`
- Montserrat-first typography fallback

Do not reintroduce the old Arizonia/gold local kit without explicit approval.
