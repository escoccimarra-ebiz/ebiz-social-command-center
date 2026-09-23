# Architecture

## MVP1 Flow

```text
LXC112 Meta-Webhooks
  -> signed event export/import contract
  -> LXC121 Social Command Center API
  -> event store / PostgreSQL
  -> workers / normalizers
  -> Social Inbox UI
  -> tasks, assignments, internal approvals, audit log
  -> Florencia-MKT suggestions under human gates
```

## Runtime Boundaries

- LXC112 remains the lightweight Meta ingest endpoint.
- LXC121 hosts the Social Command Center runtime after OPS preflight.
- DEV does not own infra, secrets, LXC provisioning, or production gates.
- MVP1 stores and reviews events; it does not publish or reply externally.

## Canonical MVP1 Entities

- `socialAccounts`
- `conversations`
- `messages`
- `comments`
- `tasks`
- `assignments`
- `approvals`
- `auditLog`
- `agentActions`

## LXC112 Import Contract

LXC112 exports Meta webhook-shaped events. LXC121 imports them through a neutral contract:

- Verify HMAC signature at the boundary.
- Normalize message/comment payloads.
- Upsert social account, conversation, message, and comment records.
- Write audit entries with actor `system:lxc112-import`.
- Never call outbound Graph API endpoints during import.

