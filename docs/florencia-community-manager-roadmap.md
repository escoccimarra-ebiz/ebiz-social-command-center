# Florencia-MKT Community Manager Roadmap

Florencia-MKT must become an active community manager for eBiz social channels, with Instagram first, then LinkedIn, then Google Business Profile.

The product goal is not a generic inbox. It is an operating cockpit where Florencia can monitor, classify, draft, schedule, escalate, and eventually respond or publish with explicit channel permissions, audit, and human override.

## Mission

Florencia-MKT owns the day-to-day social workflow:

- Read inbound Instagram DMs, story replies, mentions, and comments.
- Classify each interaction by intent, urgency, sensitivity, and business value.
- Draft replies in eBiz tone and brand criteria.
- Escalate ambiguous, missing-information, sensitive, legal, pricing, contractual, or reputation-risk cases.
- Manage a calendar for feed posts and stories.
- Keep every decision auditable for Esteban and human operators.

## Operating Principles

- Instagram is the first active channel.
- LinkedIn is second, after Instagram reply and calendar workflows are stable.
- Google Business Profile is third, focused on reviews, Q&A, posts, and local visibility.
- External replies and publications are never fire-and-forget. They require an auditable policy decision.
- Sensitive cases require Esteban approval.
- The system must distinguish clearly between:
  - client/prospect conversation,
  - Florencia suggestions,
  - human operator notes,
  - audit/system history.

## Autonomy Levels

### Level 0: Observe

Florencia reads messages and comments, but does not act externally.

Current status: available for Instagram ingest.

### Level 1: Assist

Florencia classifies, summarizes, drafts replies, and suggests next actions. A human sends or rejects.

Required next:

- Persistent agent action queue.
- Per-conversation suggested reply surface.
- Required reason for reject/escalate.
- Human override.

### Level 2: Controlled Send

Florencia can send approved Instagram replies through the platform after policy checks.

MVP1.5 status:

- Meta outbound adapter isolated in LXC112, not in the SCC runtime.
- Operator-controlled Instagram send path with audit.
- Internal notes are visually and technically separated from external replies.
- Sender profile enrichment is attempted through Graph before forwarding to SCC.

Required next:

- Message templates and refusal rules.
- Rate limit, retry, and failure reporting.
- Canary mode for Esteban/Florencia only.

### Level 3: Scheduled Publishing

Florencia manages feed and story calendar, prepares assets/copy, and routes posts for approval.

Required next:

- Content calendar model.
- Draft post/story model.
- Brand asset provenance fields.
- Approval workflow for feed and stories.
- Publishing adapter disabled until permissions and review are confirmed.

### Level 4: Multi-Channel Community Ops

Extend the same model to LinkedIn and Google Business Profile.

Required next:

- LinkedIn channel adapter.
- Google Business Profile review/Q&A/post adapter.
- Channel-specific permissions and risk gates.
- Unified operator inbox without mixing channel semantics.

## First Implementation Slice

MVP1.4 should focus on Instagram active assistance:

1. Add `suggestedReplies` and outbound intent states.
2. Show suggested reply in the conversation panel.
3. Add human approve/reject/escalate controls specifically for reply drafts.
4. Keep external send disabled by default.
5. Add an auditable `ready_to_send` state for approved replies.

This creates a real community manager workflow before enabling external Graph API sends.

## Production Gates Before Actual Sending

- Confirm Meta app permissions for Instagram messaging replies.
- Rotate/verify Meta secrets before enabling any outbound adapter.
- Add auth/roles beyond temporary Basic Auth.
- Add durable database or migration plan before scale.
- Add monitoring for LXC112 -> LXC121 ingest and outbound failures.
- Run live canary: one Esteban-approved reply from the console to a test IG conversation.

## Channel Order

1. Instagram inbox and replies.
2. Instagram feed/stories calendar.
3. LinkedIn calendar and publishing workflow.
4. LinkedIn inbox/comments if API permissions allow.
5. Google Business Profile reviews, Q&A, and posts.
