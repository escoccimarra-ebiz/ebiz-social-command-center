from pathlib import Path

server_path = Path("/opt/ebiz/apps/meta-webhooks/server.js")
source = server_path.read_text()

if "const internalSccSecret = process.env.SCC_INTERNAL_SECRET;" not in source:
    source = source.replace(
        "const socialCommandCenterIngestUrl = process.env.SCC_INGEST_URL;\n",
        "const socialCommandCenterIngestUrl = process.env.SCC_INGEST_URL;\n"
        "const internalSccSecret = process.env.SCC_INTERNAL_SECRET;\n",
    )

if "async function getInstagramProfile" not in source:
    source = source.replace(
        "async function forwardToSocialCommandCenter(body, log) {\n",
        """async function getInstagramProfile(userId) {
  if (!instagramAccessToken || !userId) {
    return null;
  }

  const url = new URL(`https://graph.facebook.com/${graphApiVersion}/${userId}`);
  url.searchParams.set("fields", "name,username,profile_pic");
  url.searchParams.set("access_token", instagramAccessToken);

  const response = await fetch(url);
  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(`Instagram profile lookup failed ${response.status}: ${responseBody}`);
  }

  return responseBody ? JSON.parse(responseBody) : null;
}

async function enrichInstagramProfiles(body, log) {
  if (!body || body.object !== "instagram" || !Array.isArray(body.entry)) {
    return body;
  }

  const enriched = structuredClone(body);
  const cache = new Map();
  for (const entry of enriched.entry) {
    for (const event of entry.messaging ?? []) {
      const senderId = event?.sender?.id;
      if (!senderId || event?.sender?.username) {
        continue;
      }

      try {
        if (!cache.has(senderId)) {
          cache.set(senderId, await getInstagramProfile(senderId));
        }
        const profile = cache.get(senderId);
        if (profile?.username) {
          event.sender.username = profile.username;
        }
        if (profile?.name) {
          event.sender.name = profile.name;
        }
        if (profile?.profile_pic) {
          event.sender.profile_pic = profile.profile_pic;
        }
      } catch (error) {
        log.warn({ action: "instagram_profile_lookup_failed", senderId, error: error.message });
      }
    }
  }

  return enriched;
}

async function forwardToSocialCommandCenter(body, log) {
""",
    )

    source = source.replace(
        '    body: JSON.stringify(body),\n',
        '    body: JSON.stringify(await enrichInstagramProfiles(body, log)),\n',
        1,
    )

if 'fastify.post("/internal/scc/instagram/send"' not in source:
    source = source.replace(
        'fastify.post("/webhooks/meta", async (request, reply) => {\n',
        '''fastify.post("/internal/scc/instagram/send", async (request, reply) => {
  if (internalSccSecret && request.headers["x-scc-internal-secret"] !== internalSccSecret) {
    return reply.code(403).send({ ok: false, error: "forbidden" });
  }

  const { igBusinessAccountId, recipientId, text } = request.body || {};
  if (!igBusinessAccountId || !recipientId || !text) {
    return reply.code(400).send({ ok: false, error: "missing_fields" });
  }

  const graphResponse = await sendInstagramMessage({ igBusinessAccountId, recipientId, text });
  request.log.info({
    platform: "instagram",
    action: "scc_operator_reply_sent",
    recipientId,
    graphResponse,
  });
  return reply.send({ ok: true, ...graphResponse });
});

fastify.post("/webhooks/meta", async (request, reply) => {
''',
    )

server_path.write_text(source)
