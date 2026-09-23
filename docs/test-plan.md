# Test Plan

## Required Before Merge

- Lint.
- TypeScript build.
- Unit tests for outbound policy.
- Negative tests for `send`, `publish`, `reply`, and `auto_reply`.
- Internal approval tests proving `approve` does not trigger external calls.
- Florencia-MKT classification and draft tests with audit evidence.
- Human gate tests for standard approval, sensitive Esteban-only approval, and rejected unaudited decisions.
- Meta import contract tests for messages and comments.
- HMAC verification tests with test-only secrets.

## Required Before Production

- Simulated Meta ingest fixture.
- Event normalization integration test.
- Audit log write/read test.
- Restore test for LXC121 backups.
