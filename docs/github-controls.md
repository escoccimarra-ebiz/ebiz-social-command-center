# GitHub Controls

## Applied

- Repository is public with Esteban's explicit authorization, because native GitHub controls were blocked on the private plan.
- Issues are enabled.
- Projects are enabled.
- Wiki is disabled.
- Dependabot vulnerability alerts are enabled.
- GitHub native secret scanning is enabled.
- GitHub secret scanning push protection is enabled.
- Branch protection is enabled on `main`.
- Pull requests require 1 approving review before merge.
- Required checks: `lint-test-build` and `gitleaks`.
- CI workflow runs lint, tests, build, and dependency audit.
- Secret Scan workflow runs Gitleaks on push and pull requests.

## Former Platform Limitations

GitHub native secret scanning, push protection, and branch protection were not available while the repository was private on the current plan.

Branch protection for this private repository returned:

```text
HTTP 403: Upgrade to GitHub Pro or make this repository public to enable this feature.
```

CHEF initially kept the repository private and treated this as a production gate. Esteban later explicitly authorized making the repository public if that resolved the controls gate. CHEF changed visibility to public, then enabled native controls.

## Controls

- Keep all changes in pull requests.
- Require human review for every non-documentation change.
- Keep Gitleaks CI alongside GitHub native secret scanning.
- Keep dependency audit in CI.

## Production Gate

MVP1 is not production-approved until app runtime, secrets, backup restore, and human gates are verified on LXC121.
