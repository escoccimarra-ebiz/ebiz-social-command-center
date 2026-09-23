# Security Boundaries

- Secrets stay outside Git.
- `.env.example` documents names only, never real values.
- MVP1 blocks outbound `send`, `publish`, `reply`, and `auto_reply` in code.
- Human approval must be auditable inside the platform.
- LXC112 ingest credentials and LXC121 runtime credentials must be separated.
- Dry-run/sandbox is the default for any future external action.
- Production deploys require traceable commit SHA, workflow run, approver, artifact checksum, and release tag.

