# Branch, Commit, and PR Conventions

## Branches

- `main`: protected stable branch.
- `feature/AO-YYYYMMDD-NNN-short-name`
- `fix/AO-YYYYMMDD-NNN-short-name`
- `docs/AO-YYYYMMDD-NNN-short-name`

## Commits

- `feat(api): add internal approval state`
- `fix(policy): block outbound reply in MVP1`
- `docs(repo): add pre-merge checklist`
- `test(policy): assert publish remains disabled`

## Pull Requests

- One functional unit per PR.
- Reference the AO task ID.
- Include test evidence.
- Declare whether the PR touches runtime, infra, secrets, or outbound behavior.

