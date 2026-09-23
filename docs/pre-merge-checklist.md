# Pre-Merge Checklist

- [ ] No secrets or production values.
- [ ] No production resource changes.
- [ ] No continuous runtime dependency on LXC112.
- [ ] `send` remains blocked by code.
- [ ] `publish` remains blocked by code.
- [ ] `reply` remains blocked by code.
- [ ] `auto_reply` remains blocked by code.
- [ ] `approve` only changes internal state.
- [ ] Negative outbound tests pass.
- [ ] Lint, test, and build pass.
- [ ] Secret Scan workflow passes.
- [ ] PR references its AO task.
- [ ] Branch protection limitation reviewed if merging to `main`.
