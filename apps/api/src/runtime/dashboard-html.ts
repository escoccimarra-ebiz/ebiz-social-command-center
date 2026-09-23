export const dashboardHtml = String.raw`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>eBiz Social Command Center</title>
    <style>
      :root {
        color-scheme: light;
        --blue: #0077ff;
        --blue-soft: #eaf4ff;
        --nav: #202733;
        --nav-2: #18202c;
        --ink: #1a1a1a;
        --muted: #6b7280;
        --line: #dde3eb;
        --bg: #f5f7fa;
        --white: #ffffff;
        --ok: #12805c;
        --warn: #a15c00;
        --danger: #b42318;
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: var(--ink);
        background: var(--bg);
        font-family: Montserrat, "Aptos", "Segoe UI", system-ui, sans-serif;
      }
      button, input, select, textarea { font: inherit; }
      button {
        min-height: 36px;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: var(--white);
        color: var(--ink);
        font-weight: 650;
        cursor: pointer;
      }
      button.primary { background: var(--blue); border-color: var(--blue); color: var(--white); }
      button.dark { background: var(--nav); border-color: var(--nav); color: var(--white); }
      button.danger { color: var(--danger); border-color: #f0b6b0; }
      textarea, select, input {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: var(--white);
        color: var(--ink);
      }
      textarea { min-height: 82px; resize: vertical; padding: 10px; }
      select, input { min-height: 36px; padding: 8px 10px; }

      .app {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 232px 1fr;
      }
      .nav {
        background: var(--nav);
        color: #cbd5e1;
        padding: 18px 12px;
        display: grid;
        align-content: start;
        gap: 24px;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 10px;
        color: var(--white);
        font-weight: 800;
      }
      .brand-mark {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        background: var(--white);
        color: var(--blue);
      }
      .nav-section { display: grid; gap: 6px; }
      .nav-label {
        padding: 0 10px 5px;
        color: #8fa0b8;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .nav-item {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 38px;
        padding: 8px 10px;
        border-radius: 6px;
        color: #d9e2ee;
        font-weight: 650;
      }
      .nav-item.active {
        background: #143b66;
        color: var(--white);
        box-shadow: inset 3px 0 0 var(--blue);
      }

      .main {
        min-width: 0;
        display: grid;
        grid-template-rows: auto auto 1fr;
      }
      .topbar {
        min-height: 64px;
        background: var(--white);
        border-bottom: 1px solid var(--line);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 24px;
      }
      .crumbs { color: var(--muted); font-size: 13px; }
      .top-actions { display: flex; align-items: center; gap: 12px; }
      .search { width: 240px; }
      .status { display: flex; align-items: center; gap: 7px; color: var(--muted); font-size: 13px; }
      .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--ok); }

      .page-head {
        padding: 24px;
        display: grid;
        gap: 16px;
      }
      .title-row {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        align-items: end;
      }
      h1, h2, h3, p { margin: 0; }
      h1 { font-size: 32px; line-height: 1.1; }
      .subtitle { color: var(--muted); margin-top: 6px; }
      .metrics {
        display: grid;
        grid-template-columns: repeat(5, minmax(140px, 1fr));
        gap: 12px;
      }
      .metric, .card {
        background: var(--white);
        border: 1px solid var(--line);
        border-radius: 7px;
      }
      .metric { padding: 14px 16px; }
      .metric span {
        display: block;
        color: var(--muted);
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
      }
      .metric strong { display: block; font-size: 28px; margin-top: 6px; }

      .workspace {
        min-height: 0;
        padding: 0 24px 24px;
        display: grid;
        grid-template-columns: 360px minmax(0, 1fr) 360px;
        gap: 16px;
      }
      .card { min-height: 0; overflow: hidden; display: grid; grid-template-rows: auto 1fr; }
      .card-head {
        padding: 14px 16px;
        border-bottom: 1px solid var(--line);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .card-head h2 { font-size: 16px; }
      .inbox-list, .thread, .side-scroll { overflow: auto; }

      .thread-row {
        width: 100%;
        border: 0;
        border-bottom: 1px solid var(--line);
        border-radius: 0;
        background: var(--white);
        text-align: left;
        padding: 14px 16px;
      }
      .thread-row.active { background: var(--blue-soft); box-shadow: inset 4px 0 0 var(--blue); }
      .person-line { display: flex; gap: 10px; align-items: center; }
      .avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: var(--nav);
        color: var(--white);
        display: grid;
        place-items: center;
        font-weight: 800;
        flex: 0 0 auto;
      }
      .person-main { min-width: 0; flex: 1; }
      .person-main strong { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .muted, .preview { color: var(--muted); font-size: 12px; line-height: 1.35; }
      .preview { margin-top: 9px; }
      .badges { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 9px; }
      .badge {
        display: inline-flex;
        align-items: center;
        min-height: 22px;
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 3px 8px;
        font-size: 11px;
        font-weight: 750;
        color: var(--muted);
        background: var(--white);
      }
      .badge.blue { border-color: #b7d8ff; color: var(--blue); }
      .badge.warn { border-color: #f0cd9a; color: var(--warn); }
      .badge.danger { border-color: #efaaa3; color: var(--danger); }
      .badge.ok { border-color: #99d3b5; color: var(--ok); }

      .conversation-head {
        padding: 18px 20px;
        border-bottom: 1px solid var(--line);
        background: var(--white);
      }
      .conversation-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
      }
      .conversation-title h2 { font-size: 24px; }
      .thread {
        padding: 20px;
        display: grid;
        align-content: start;
        gap: 12px;
        background: #f8fafc;
      }
      .message {
        max-width: 76%;
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 11px 13px;
        background: var(--white);
      }
      .message.internal { margin-left: auto; background: var(--nav); border-color: var(--nav); color: var(--white); }
      .message strong { display: block; font-size: 12px; margin-bottom: 5px; }
      .message p { white-space: pre-wrap; line-height: 1.45; }
      .message small { display: block; margin-top: 7px; color: var(--muted); }
      .message.internal small { color: #cbd5e1; }
      .composer {
        padding: 14px;
        border-top: 1px solid var(--line);
        background: var(--white);
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 10px;
      }

      .side-scroll { padding: 16px; display: grid; align-content: start; gap: 16px; }
      .profile-card {
        display: grid;
        gap: 10px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--line);
      }
      .profile-card .avatar { width: 52px; height: 52px; }
      .form-block { display: grid; gap: 9px; }
      .form-block h3 { font-size: 14px; }
      .actions { display: flex; flex-wrap: wrap; gap: 8px; }
      .actions button { padding: 7px 10px; }
      .audit {
        display: grid;
        gap: 8px;
      }
      .audit-row {
        border: 1px dashed var(--line);
        border-radius: 6px;
        padding: 8px 10px;
        background: #fbfcfe;
      }
      .audit-row strong { display: block; font-size: 12px; }
      .empty { color: var(--muted); text-align: center; padding: 28px; }

      @media (max-width: 1200px) {
        .workspace { grid-template-columns: 320px minmax(0, 1fr); }
        .workspace .card:last-child { grid-column: 1 / -1; }
        .metrics { grid-template-columns: repeat(3, minmax(140px, 1fr)); }
      }
      @media (max-width: 820px) {
        .app { grid-template-columns: 1fr; }
        .nav { display: none; }
        .workspace, .metrics { grid-template-columns: 1fr; }
        .composer { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <div class="app">
      <aside class="nav">
        <div class="brand"><div class="brand-mark">e</div><div>eBiz</div></div>
        <div class="nav-section">
          <div class="nav-label">Overview</div>
          <div class="nav-item active">Dashboard</div>
        </div>
        <div class="nav-section">
          <div class="nav-label">Work</div>
          <div class="nav-item active">Social Inbox</div>
          <div class="nav-item">Aprobaciones</div>
          <div class="nav-item">Actividad</div>
        </div>
        <div class="nav-section">
          <div class="nav-label">AI Workforce</div>
          <div class="nav-item">Florencia-MKT</div>
          <div class="nav-item">Operadores</div>
          <div class="nav-item">Reglas</div>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div class="crumbs">eBiz / Produccion / Social Command Center</div>
          <div class="top-actions">
            <input class="search" id="search" placeholder="Buscar remitente o mensaje..." />
            <div class="status"><span class="dot"></span><span id="runtime-status">Conectando</span></div>
          </div>
        </header>

        <section class="page-head">
          <div class="title-row">
            <div>
              <h1>Social Command Center</h1>
              <p class="subtitle">Inbox operativo para Florencia-MKT, operadores humanos y escalamiento ejecutivo.</p>
            </div>
            <div class="actions">
              <button class="primary" id="refresh">Actualizar</button>
              <button id="seed">Demo</button>
            </div>
          </div>
          <div class="metrics" id="metrics"></div>
        </section>

        <section class="workspace">
          <article class="card">
            <div class="card-head"><h2>Inbox</h2><span class="muted" id="inbox-count"></span></div>
            <div class="inbox-list" id="threads"></div>
          </article>

          <article class="card">
            <div id="conversation-head" class="conversation-head"></div>
            <div class="thread" id="thread"></div>
            <div class="composer">
              <textarea id="operator-text" placeholder="Nota o intervencion interna del operador"></textarea>
              <button class="dark" id="operator-send">Registrar</button>
            </div>
          </article>

          <aside class="card">
            <div class="card-head"><h2>Operacion</h2></div>
            <div class="side-scroll">
              <section class="profile-card" id="profile"></section>
              <section class="form-block">
                <h3>Florencia-MKT</h3>
                <textarea id="mkt-output" placeholder="Borrador, clasificacion o motivo de escalamiento"></textarea>
                <select id="escalation-reason">
                  <option value="ambiguous">Informacion ambigua</option>
                  <option value="missing_info">Informacion ausente</option>
                  <option value="sensitive">Caso sensible</option>
                </select>
                <div class="actions">
                  <button data-agent-action="classify">Clasificar</button>
                  <button class="primary" data-agent-action="draft">Borrador</button>
                  <button class="danger" data-agent-action="escalate">Escalar</button>
                </div>
              </section>
              <section class="form-block">
                <h3>Control humano</h3>
                <textarea id="control-reason" placeholder="Motivo auditable"></textarea>
                <div class="actions">
                  <button class="dark" data-control-action="take_control">Tomar control</button>
                  <button data-control-action="return_to_agent">Devolver a MKT</button>
                  <button data-control-action="resolve">Resolver</button>
                </div>
              </section>
              <section class="form-block">
                <h3>Bitacora</h3>
                <div class="audit" id="audit"></div>
              </section>
            </div>
          </aside>
        </section>
      </main>
    </div>

    <script>
      let state = null;
      let selectedThreadId = null;
      const threadsEl = document.getElementById("threads");
      const threadEl = document.getElementById("thread");
      const headEl = document.getElementById("conversation-head");
      const profileEl = document.getElementById("profile");
      const auditEl = document.getElementById("audit");
      const metricsEl = document.getElementById("metrics");
      const statusEl = document.getElementById("runtime-status");
      const searchEl = document.getElementById("search");

      document.getElementById("refresh").addEventListener("click", () => load());
      document.getElementById("seed").addEventListener("click", async () => {
        await fetch("/api/demo-seed", { method: "POST" });
        await load();
      });
      document.getElementById("operator-send").addEventListener("click", recordOperatorIntervention);
      searchEl.addEventListener("input", renderAll);
      for (const button of document.querySelectorAll("[data-agent-action]")) {
        button.addEventListener("click", () => runMktAgent(button.dataset.agentAction));
      }
      for (const button of document.querySelectorAll("[data-control-action]")) {
        button.addEventListener("click", () => changeConversationControl(button.dataset.controlAction));
      }

      async function load(preferredId) {
        const response = await fetch("/api/inbox");
        state = await response.json();
        statusEl.textContent = "Operativo";
        const threads = filteredThreads();
        selectedThreadId = preferredId ?? selectedThreadId ?? threads[0]?.id ?? null;
        renderAll();
      }

      function renderAll() {
        const threads = filteredThreads();
        if (!threads.some((thread) => thread.id === selectedThreadId)) {
          selectedThreadId = threads[0]?.id ?? null;
        }
        renderMetrics();
        renderThreads(threads);
        renderConversation();
      }

      function getThreads() {
        const conversations = state.conversations.map((conversation) => {
          const profile = profileById(conversation.participantProfileId);
          const messages = state.messages.filter((message) => message.conversationId === conversation.id);
          const latest = messages.toSorted((a, b) => timeOf(b).localeCompare(timeOf(a)))[0];
          return {
            kind: "conversation",
            id: conversation.id,
            title: profile?.displayName ?? conversation.participantExternalId,
            status: conversation.status,
            owner: conversation.ownerActorId ?? "florencia-mkt",
            preview: latest?.text || "(sin texto visible)",
            at: latest?.createdAt ?? conversation.updatedAt,
            conversation,
            profile,
            item: latest
          };
        });
        const comments = state.comments.map((comment) => {
          const profile = profileByExternalId(comment.authorExternalId);
          return {
            kind: "comment",
            id: comment.id,
            title: profile?.displayName ?? "Comentario IG",
            status: comment.status,
            owner: comment.status === "requires_esteban" ? "esteban" : "florencia-mkt",
            preview: comment.text || "(sin texto visible)",
            at: comment.createdAt,
            profile,
            item: comment
          };
        });
        return [...conversations, ...comments].sort((a, b) => b.at.localeCompare(a.at));
      }

      function filteredThreads() {
        const q = searchEl.value.trim().toLowerCase();
        if (!q) return getThreads();
        return getThreads().filter((thread) =>
          [thread.title, thread.preview, thread.profile?.username, thread.profile?.externalId]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q))
        );
      }

      function renderMetrics() {
        const conversations = state.conversations.length;
        const pending = state.conversations.filter((item) => item.status === "pending_human_approval").length;
        const escalated = state.conversations.filter((item) => item.status === "requires_esteban" || item.escalationReason).length;
        const prospects = state.participantProfiles?.length ?? 0;
        const inbound = state.messages.filter((item) => item.direction === "inbound").length + state.comments.length;
        metricsEl.innerHTML = [
          metric("Conversaciones", conversations),
          metric("Entradas IG", inbound),
          metric("Prospectos", prospects),
          metric("Pendientes", pending),
          metric("Escaladas", escalated)
        ].join("");
      }

      function metric(label, value) {
        return '<div class="metric"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(value) + '</strong></div>';
      }

      function renderThreads(threads) {
        document.getElementById("inbox-count").textContent = threads.length + " items";
        if (threads.length === 0) {
          threadsEl.innerHTML = '<div class="empty">Sin conversaciones</div>';
          return;
        }
        threadsEl.innerHTML = "";
        for (const thread of threads) {
          const button = document.createElement("button");
          button.className = "thread-row" + (thread.id === selectedThreadId ? " active" : "");
          button.innerHTML =
            '<div class="person-line"><div class="avatar">' + initials(thread.title) + '</div><div class="person-main"><strong>' +
            escapeHtml(thread.title) + '</strong><span class="muted">' +
            escapeHtml(thread.profile?.username ? "instagram.com/" + thread.profile.username : thread.profile?.externalId ?? thread.kind) +
            '</span></div></div><div class="preview">' +
            escapeHtml(thread.preview) + '</div><div class="badges">' +
            badge(thread.status, statusTone(thread.status)) + badge(thread.owner, thread.owner === "esteban" ? "danger" : "blue") +
            '</div>';
          button.addEventListener("click", () => { selectedThreadId = thread.id; renderAll(); });
          threadsEl.appendChild(button);
        }
      }

      function renderConversation() {
        const thread = getThreads().find((item) => item.id === selectedThreadId);
        if (!thread) {
          headEl.innerHTML = '<div class="empty">Sin seleccion</div>';
          threadEl.innerHTML = "";
          profileEl.innerHTML = "";
          auditEl.innerHTML = "";
          return;
        }
        const profile = thread.profile;
        headEl.innerHTML =
          '<div class="conversation-title"><div class="person-line"><div class="avatar">' + initials(thread.title) +
          '</div><div><h2>' + escapeHtml(thread.title) + '</h2><div class="muted">' +
          escapeHtml(profile?.profileUrl ?? profile?.externalId ?? "Instagram") + '</div></div></div><div class="badges">' +
          badge(thread.status, statusTone(thread.status)) + badge("dueno: " + thread.owner, thread.owner === "esteban" ? "danger" : "blue") +
          (thread.conversation?.escalationReason ? badge(thread.conversation.escalationReason, "warn") : "") + '</div></div>';
        threadEl.innerHTML = conversationMessages(thread);
        profileEl.innerHTML = renderProfile(thread);
        auditEl.innerHTML = renderAudit(thread);
      }

      function conversationMessages(thread) {
        const entries = [];
        if (thread.kind === "conversation") {
          for (const message of state.messages.filter((item) => item.conversationId === thread.id)) {
            entries.push({
              at: message.createdAt,
              internal: message.direction === "internal",
              who: message.direction === "internal" ? message.authorExternalId : (thread.profile?.displayName ?? "Prospecto"),
              text: message.text || "(evento sin texto: posible adjunto/reaccion)"
            });
          }
        } else {
          entries.push({ at: thread.item.createdAt, internal: false, who: thread.title, text: thread.item.text || "(comentario sin texto)" });
        }
        if (entries.length === 0) return '<div class="empty">Sin mensajes</div>';
        return entries.sort((a, b) => a.at.localeCompare(b.at)).map((entry) =>
          '<article class="message ' + (entry.internal ? "internal" : "") + '"><strong>' +
          escapeHtml(entry.who) + '</strong><p>' + escapeHtml(entry.text) + '</p><small>' + escapeHtml(entry.at) + '</small></article>'
        ).join("");
      }

      function renderProfile(thread) {
        const profile = thread.profile;
        return '<div class="person-line"><div class="avatar">' + initials(thread.title) + '</div><div class="person-main"><strong>' +
          escapeHtml(thread.title) + '</strong><span class="muted">' + escapeHtml(profile?.username ? "@" + profile.username : profile?.externalId ?? "sin perfil enriquecido") +
          '</span></div></div><div class="badges">' + badge(profile?.kind ?? "unknown") + badge(thread.kind) + '</div>' +
          '<p class="muted">Remitente visible como perfil operativo. Si Meta entrega username, se muestra link directo; si no, se conserva el ID IG-scoped para trazabilidad.</p>';
      }

      function renderAudit(thread) {
        const targetIds = new Set([thread.id, thread.item?.id]);
        if (thread.kind === "conversation") {
          for (const message of state.messages.filter((item) => item.conversationId === thread.id)) targetIds.add(message.id);
        }
        const rows = [
          ...state.agentActions.filter((item) => targetIds.has(item.inboxItemId)).map((item) => ({ at: item.createdAt, title: "MKT · " + item.action, text: item.output })),
          ...state.approvals.filter((item) => targetIds.has(item.inboxItemId)).map((item) => ({ at: item.decidedAt, title: item.state, text: item.reason ?? item.decidedBy })),
          ...state.auditLog.filter((item) => targetIds.has(item.entityId)).map((item) => ({ at: item.createdAt, title: item.action, text: item.metadata?.reason ?? item.metadata?.detail ?? item.actorId }))
        ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);
        if (rows.length === 0) return '<div class="muted">Sin actividad interna.</div>';
        return rows.map((row) => '<div class="audit-row"><strong>' + escapeHtml(row.title) + '</strong><div class="muted">' + escapeHtml(row.text ?? "") + '</div><div class="muted">' + escapeHtml(row.at ?? "") + '</div></div>').join("");
      }

      async function recordOperatorIntervention() {
        const thread = getThreads().find((item) => item.id === selectedThreadId && item.kind === "conversation");
        const textEl = document.getElementById("operator-text");
        const text = textEl.value.trim();
        if (!thread || !text) { textEl.focus(); return; }
        await postJson("/api/operator-intervention", { conversationId: thread.id, actorId: "operador-humano", text });
        textEl.value = "";
        await load(thread.id);
      }

      async function runMktAgent(action) {
        const target = currentTarget();
        const outputEl = document.getElementById("mkt-output");
        const output = outputEl.value.trim();
        if (!target || !output) { outputEl.focus(); return; }
        await postJson("/api/mkt-agent", {
          conversationId: target.conversationId,
          inboxItemType: target.inboxItemType,
          inboxItemId: target.inboxItemId,
          action,
          output,
          escalationReason: document.getElementById("escalation-reason").value
        });
        outputEl.value = "";
        await load(target.threadId);
      }

      async function changeConversationControl(action) {
        const thread = getThreads().find((item) => item.id === selectedThreadId && item.kind === "conversation");
        const reasonEl = document.getElementById("control-reason");
        const reason = reasonEl.value.trim();
        if (!thread || !reason) { reasonEl.focus(); return; }
        await postJson("/api/conversation-control", {
          conversationId: thread.id,
          actorId: action === "return_to_agent" ? "florencia-mkt" : "operador-humano",
          action,
          reason
        });
        reasonEl.value = "";
        await load(thread.id);
      }

      function currentTarget() {
        const thread = getThreads().find((item) => item.id === selectedThreadId);
        if (!thread) return null;
        if (thread.kind === "comment") {
          return { threadId: thread.id, conversationId: state.conversations[0]?.id ?? "", inboxItemType: "comment", inboxItemId: thread.item.id };
        }
        const latest = state.messages.filter((item) => item.conversationId === thread.id && item.direction === "inbound")
          .toSorted((a, b) => timeOf(b).localeCompare(timeOf(a)))[0];
        return latest ? { threadId: thread.id, conversationId: thread.id, inboxItemType: "message", inboxItemId: latest.id } : null;
      }

      async function postJson(path, body) {
        const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message || payload.error || "request failed");
        }
        return response.json();
      }

      function profileById(id) { return state.participantProfiles?.find((item) => item.id === id); }
      function profileByExternalId(id) { return state.participantProfiles?.find((item) => item.externalId === id); }
      function timeOf(item) { return item.createdAt ?? item.receivedAt ?? item.updatedAt ?? ""; }
      function initials(value) { return String(value || "?").replace(/^@/, "").split(/[^a-z0-9]+/i).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?"; }
      function statusTone(status) {
        if (status === "requires_esteban" || status === "rejected_internal") return "danger";
        if (status === "pending_human_approval" || status === "pending_review") return "warn";
        if (status === "approved_internal" || status === "archived") return "ok";
        return "blue";
      }
      function badge(text, tone = "") { return '<span class="badge ' + tone + '">' + escapeHtml(text) + '</span>'; }
      function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
      }
      load().catch((error) => {
        statusEl.textContent = "Error";
        threadEl.innerHTML = '<div class="empty">' + escapeHtml(error.message) + '</div>';
      });
    </script>
  </body>
</html>`;
