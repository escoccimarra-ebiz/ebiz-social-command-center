# GitHub Controls

## Applied

- Repository is private.
- Issues are enabled.
- Projects are enabled.
- Wiki is disabled.
- Dependabot vulnerability alerts are enabled.
- CI workflow runs lint, tests, build, and dependency audit.
- Secret Scan workflow runs Gitleaks on push and pull requests.

## Current Platform Limitations

GitHub native secret scanning and push protection are not available for this repository on the current plan.

Branch protection for this private repository returned:

```text
HTTP 403: Upgrade to GitHub Pro or make this repository public to enable this feature.
```

The repository must stay private. Do not make it public to unlock branch protection.

## Compensating Controls

- Keep all changes in pull requests whenever the plan allows enforcement.
- Treat direct pushes to `main` as emergency-only until branch protection is available.
- Require human review by process for every non-documentation change.
- Keep Gitleaks CI as the active secret scanning control.
- Keep dependency audit in CI.

## Production Gate

MVP1 is not production-approved until native branch protection or an equivalent enforced control is available.

