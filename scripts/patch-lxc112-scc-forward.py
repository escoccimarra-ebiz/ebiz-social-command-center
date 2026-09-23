from pathlib import Path

server_path = Path("/opt/ebiz/apps/meta-webhooks/server.js")
source = server_path.read_text()

if "SCC_INGEST_URL" not in source:
    source = source.replace(
        'const autoReplyText = process.env.META_AUTO_REPLY_TEXT || "Hola, gracias por escribir a eBiz. Recibimos tu mensaje y te respondemos a la brevedad.";\n',
        'const autoReplyText = process.env.META_AUTO_REPLY_TEXT || "Hola, gracias por escribir a eBiz. Recibimos tu mensaje y te respondemos a la brevedad.";\n'
        "const socialCommandCenterIngestUrl = process.env.SCC_INGEST_URL;\n",
    )

    source = source.replace(
        "async function sendInstagramMessage({ igBusinessAccountId, recipientId, text }) {\n",
        """async function forwardToSocialCommandCenter(body, log) {
  if (!socialCommandCenterIngestUrl) {
    log.warn({ action: "scc_forward_skipped", reason: "SCC_INGEST_URL_not_configured" });
    return;
  }

  const response = await fetch(socialCommandCenterIngestUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(`SCC forward failed ${response.status}: ${responseBody}`);
  }

  log.info({ action: "scc_forwarded", status: response.status });
}

async function sendInstagramMessage({ igBusinessAccountId, recipientId, text }) {
""",
    )

    source = source.replace(
        '  fs.appendFileSync(eventLogPath, `${JSON.stringify(record)}\\n`, { encoding: "utf8" });\n\n  if (autoReplyEnabled) {',
        """  fs.appendFileSync(eventLogPath, `${JSON.stringify(record)}\\n`, { encoding: "utf8" });

  try {
    await forwardToSocialCommandCenter(request.body, request.log);
  } catch (error) {
    request.log.error({
      platform: request.body?.object || "unknown",
      action: "scc_forward_failed",
      error: error.message,
    });
  }

  if (autoReplyEnabled) {""",
    )

server_path.write_text(source)

env_path = Path("/etc/meta-webhooks/env")
lines = env_path.read_text().splitlines()

def set_env(key: str, value: str) -> None:
    for index, line in enumerate(lines):
        if line.startswith(f"{key}="):
            lines[index] = f"{key}={value}"
            return
    lines.append(f"{key}={value}")

set_env("SCC_INGEST_URL", "http://192.168.0.211:3121/api/meta-webhook")
set_env("META_AUTO_REPLY_ENABLED", "false")
env_path.write_text("\n".join(lines) + "\n")
