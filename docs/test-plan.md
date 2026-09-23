# Test Plan

## Required Before Merge

- Lint.
- TypeScript build.
- Unit tests for outbound policy.
- Negative tests for `send`, `publish`, `reply`, and `auto_reply`.
- Internal approval tests proving `approve` does not trigger external calls.

## Required Before Production

- Simulated Meta ingest fixture.
- Event normalization integration test.
- Audit log write/read test.
- Restore test for LXC121 backups.

