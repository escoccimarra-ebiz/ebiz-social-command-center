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

