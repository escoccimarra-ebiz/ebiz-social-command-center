# Deployment

MVP1 deploy is enabled for internal use on LXC121 only. It is not a public production deploy.

Target runtime:

- LXC ID: `121`
- Hostname: `lxc121-social-command-center`
- IP: `192.168.0.211/24`
- Gateway: `192.168.0.1`
- Owner: OPS

Production deploys must be traceable to a GitHub release, commit SHA, workflow run ID, approver, and artifact checksum.

## Internal Runtime

Default service:

- Host: `0.0.0.0`
- Port: `3121`
- Data directory: `/data/ebiz-social-command-center`
- State file: `/data/ebiz-social-command-center/social-inbox-state.json`

Commands:

```bash
npm ci
npm run build
SCC_DATA_DIR=/data/ebiz-social-command-center PORT=3121 npm start
```

Internal checks:

```bash
curl http://127.0.0.1:3121/health
curl http://127.0.0.1:3121/api/inbox
```

Seed demo data for smoke testing:

```bash
curl -X POST http://127.0.0.1:3121/api/demo-seed
```

## Systemd Unit

```ini
[Unit]
Description=eBiz Social Command Center
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/opt/ebiz-social-command-center
Environment=NODE_ENV=production
Environment=HOST=0.0.0.0
Environment=PORT=3121
Environment=SCC_DATA_DIR=/data/ebiz-social-command-center
ExecStart=/usr/bin/node dist/apps/api/src/server.js
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/data/ebiz-social-command-center

[Install]
WantedBy=multi-user.target
```

## MVP1 Boundaries

- Internal dashboard only.
- No outbound Meta Graph API calls.
- No send, publish, reply, or auto-reply behavior.
- Demo seed is for smoke testing and must not be confused with production ingest.
