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
        --charcoal: #202733;
        --ink: #1a1a1a;
        --neutral: #6b7280;
        --line: #dde3eb;
        --soft: #f4f7fb;
        --white: #ffffff;
        --danger: #b42318;
        --warn: #a15c00;
        --ok: #177245;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--soft);
        color: var(--ink);
        font-family:
          Montserrat, "Aptos", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      }

      button,
      select,
      textarea {
        font: inherit;
      }

      button {
        min-height: 36px;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: var(--white);
        color: var(--charcoal);
        cursor: pointer;
        font-weight: 600;
      }

      button.primary {
        border-color: var(--blue);
        background: var(--blue);
        color: var(--white);
      }

      button.dark {
        border-color: var(--charcoal);
        background: var(--charcoal);
        color: var(--white);
      }

      button.danger {
        border-color: #f0b6b0;
        color: var(--danger);
      }

      textarea,
      select {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: var(--white);
        color: var(--ink);
      }

      textarea {
        min-height: 88px;
        padding: 10px;
        resize: vertical;
      }

      select {
        min-height: 36px;
        padding: 7px 9px;
      }

      .shell {
        min-height: 100vh;
        display: grid;
        grid-template-rows: auto 1fr;
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        background: var(--white);
        border-bottom: 1px solid var(--line);
        padding: 14px 18px;
      }

      .brand {
        display: grid;
        gap: 2px;
      }

      .brand strong {
        color: var(--charcoal);
        font-size: 18px;
      }

      .brand span,
      .runtime {
        color: var(--neutral);
        font-size: 12px;
        font-weight: 500;
      }

      .runtime {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--ok);
      }

      .layout {
        min-height: 0;
        display: grid;
        grid-template-columns: 340px minmax(0, 1fr) 360px;
      }

      .column {
        min-height: 0;
        background: var(--white);
        border-right: 1px solid var(--line);
        display: grid;
        grid-template-rows: auto 1fr;
      }

      .column:last-child {
        border-right: 0;
        border-left: 1px solid var(--line);
      }

      .section-head {
        padding: 14px 16px;
        border-bottom: 1px solid var(--line);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      h1,
      h2,
      h3 {
        margin: 0;
        color: var(--charcoal);
      }

      h2 {
        font-size: 15px;
      }

      h3 {
        font-size: 13px;
      }

      .toolbar,
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .toolbar button,
      .actions button {
        padding: 7px 10px;
      }

      .inbox-list {
        overflow: auto;
      }

      .thread-row {
        width: 100%;
        border: 0;
        border-bottom: 1px solid var(--line);
        border-radius: 0;
        background: var(--white);
        padding: 14px 16px;
        text-align: left;
      }

      .thread-row.active {
        background: #eef6ff;
        box-shadow: inset 4px 0 0 var(--blue);
      }

      .thread-top {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
      }

      .thread-title {
        font-weight: 700;
        color: var(--charcoal);
      }

      .thread-preview,
      .muted {
        color: var(--neutral);
        font-size: 12px;
        line-height: 1.35;
      }

      .workspace {
        min-width: 0;
        display: grid;
        grid-template-rows: auto 1fr auto;
        min-height: 0;
      }

      .conversation-head {
        padding: 18px 22px;
        border-bottom: 1px solid var(--line);
        background: var(--white);
      }

      .conversation-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 10px;
      }

      .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      .badge {
        border: 1px solid var(--line);
        border-radius: 999px;
        color: var(--neutral);
        background: var(--white);
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 600;
      }

      .badge.blue {
        border-color: #b7d8ff;
        color: var(--blue);
      }

      .badge.warn {
        border-color: #f0cd9a;
        color: var(--warn);
      }

      .badge.danger {
        border-color: #efaaa3;
        color: var(--danger);
      }

      .badge.ok {
        border-color: #99d3b5;
        color: var(--ok);
      }

      .timeline {
        min-height: 0;
        overflow: auto;
        padding: 22px;
        display: grid;
        align-content: start;
        gap: 14px;
      }

      .bubble {
        max-width: min(760px, 86%);
        border: 1px solid var(--line);
        background: var(--white);
        border-radius: 8px;
        padding: 12px 14px;
        box-shadow: 0 1px 0 rgba(32, 39, 51, 0.04);
      }

      .bubble.internal {
        margin-left: auto;
        background: var(--charcoal);
        color: var(--white);
        border-color: var(--charcoal);
      }

      .bubble.agent {
        border-color: #b7d8ff;
        background: #f6fbff;
      }

      .bubble.audit {
        max-width: 100%;
        background: transparent;
        border-style: dashed;
        box-shadow: none;
      }

      .bubble strong {
        display: block;
        font-size: 12px;
        margin-bottom: 5px;
      }

      .bubble p {
        margin: 0;
        white-space: pre-wrap;
        line-height: 1.45;
      }

      .bubble small {
        display: block;
        margin-top: 7px;
        color: var(--neutral);
      }

      .bubble.internal small {
        color: #cbd5e1;
      }

      .composer {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 10px;
        padding: 14px 18px;
        background: var(--white);
        border-top: 1px solid var(--line);
      }

      .side-body {
        overflow: auto;
        padding: 16px;
        display: grid;
        align-content: start;
        gap: 18px;
      }

      .block {
        display: grid;
        gap: 10px;
      }

      .divider {
        height: 1px;
        background: var(--line);
      }

      .empty {
        color: var(--neutral);
        padding: 24px;
        text-align: center;
      }

      @media (max-width: 1180px) {
        .layout {
          grid-template-columns: 320px minmax(0, 1fr);
        }

        .column:last-child {
          grid-column: 1 / -1;
          border-left: 0;
          border-top: 1px solid var(--line);
        }
      }

      @media (max-width: 760px) {
        .layout {
          grid-template-columns: 1fr;
        }

        .column {
          border-right: 0;
          border-bottom: 1px solid var(--line);
        }

        .conversation-title,
        .composer {
          grid-template-columns: 1fr;
          display: grid;
        }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <header class="topbar">
        <div class="brand">
          <strong>eBiz Social Command Center</strong>
          <span>MVP1.2 · Inbox operativo con gate humano</span>
        </div>
        <div class="runtime"><span class="dot"></span><span id="runtime-status">Conectando</span></div>
      </header>

      <main class="layout">
        <aside class="column">
          <div class="section-head">
            <h2>Inbox</h2>
            <div class="toolbar">
              <button class="primary" id="refresh">Actualizar</button>
              <button id="seed">Demo</button>
            </div>
          </div>
          <div class="inbox-list" id="threads"></div>
        </aside>

        <section class="workspace">
          <div class="conversation-head" id="conversation-head"></div>
          <div class="timeline" id="timeline"></div>
          <div class="composer">
            <textarea id="operator-text" placeholder="Intervencion interna del operador humano"></textarea>
            <button class="dark" id="operator-send">Registrar intervencion</button>
          </div>
        </section>

        <aside class="column">
          <div class="section-head">
            <h2>Gestion MKT</h2>
          </div>
          <div class="side-body">
            <div class="block">
              <h3>Agente MKT</h3>
              <textarea id="mkt-output" placeholder="Clasificacion, borrador o motivo de escalamiento"></textarea>
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
            </div>

            <div class="divider"></div>

            <div class="block">
              <h3>Control humano</h3>
              <textarea id="control-reason" placeholder="Motivo auditable"></textarea>
              <div class="actions">
                <button class="dark" data-control-action="take_control">Tomar control</button>
                <button data-control-action="return_to_agent">Devolver a MKT</button>
                <button data-control-action="resolve">Resolver</button>
              </div>
            </div>

            <div class="divider"></div>

            <div class="block">
              <h3>Gate interno</h3>
              <textarea id="gate-reason" placeholder="Motivo interno"></textarea>
              <div class="actions">
                <button class="primary" data-gate-decision="approve_internal">Aprobar</button>
                <button data-gate-decision="reject_internal">Rechazar</button>
                <button class="danger" data-gate-decision="escalate_esteban">Escalar a Esteban</button>
              </div>
              <p class="muted">Las acciones registran auditoria. En MVP1.2 no se envia ninguna respuesta externa.</p>
            </div>
          </div>
        </aside>
      </main>
    </div>

    <script>
      let state = null;
      let selectedThreadId = null;

      const threadsEl = document.getElementById("threads");
      const headEl = document.getElementById("conversation-head");
      const timelineEl = document.getElementById("timeline");
      const statusEl = document.getElementById("runtime-status");

      document.getElementById("refresh").addEventListener("click", () => load());
      document.getElementById("seed").addEventListener("click", async () => {
        await fetch("/api/demo-seed", { method: "POST" });
        await load();
      });
      document.getElementById("operator-send").addEventListener("click", recordOperatorIntervention);

      for (const button of document.querySelectorAll("[data-agent-action]")) {
        button.addEventListener("click", () => runMktAgent(button.dataset.agentAction));
      }

      for (const button of document.querySelectorAll("[data-control-action]")) {
        button.addEventListener("click", () => changeConversationControl(button.dataset.controlAction));
      }

      for (const button of document.querySelectorAll("[data-gate-decision]")) {
        button.addEventListener("click", () => decideGate(button.dataset.gateDecision));
      }

      async function load(preferredId) {
        const response = await fetch("/api/inbox");
        state = await response.json();
        statusEl.textContent = "Operativo";
        const threads = getThreads();
        selectedThreadId = preferredId ?? selectedThreadId ?? threads[0]?.id ?? null;
        renderThreads(threads);
        renderConversation();
      }

      function getThreads() {
        const conversations = state.conversations.map((conversation) => {
          const messages = state.messages.filter((message) => message.conversationId === conversation.id);
          const latest = messages.toSorted((a, b) => getTime(b).localeCompare(getTime(a)))[0];
          return {
            kind: "conversation",
            id: conversation.id,
            title: conversation.participantExternalId,
            status: conversation.status,
            owner: conversation.ownerActorId ?? "sin-dueno",
            preview: latest?.text ?? "(sin mensajes)",
            at: latest?.createdAt ?? conversation.updatedAt,
            conversation,
            item: latest
          };
        });

        const comments = state.comments.map((comment) => ({
          kind: "comment",
          id: comment.id,
          title: "Comentario",
          status: comment.status,
          owner: comment.status === "requires_esteban" ? "esteban" : "florencia-mkt",
          preview: comment.text,
          at: comment.createdAt,
          item: comment
        }));

        return [...conversations, ...comments].sort((a, b) => b.at.localeCompare(a.at));
      }

      function renderThreads(threads) {
        if (threads.length === 0) {
          threadsEl.innerHTML = '<div class="empty">Sin conversaciones</div>';
          return;
        }

        threadsEl.innerHTML = "";
        for (const thread of threads) {
          const button = document.createElement("button");
          button.className = "thread-row" + (thread.id === selectedThreadId ? " active" : "");
          button.innerHTML =
            '<div class="thread-top"><span class="thread-title">' +
            escapeHtml(thread.title) +
            '</span>' +
            badge(thread.status, statusTone(thread.status)) +
            "</div>" +
            '<div class="thread-preview">' +
            escapeHtml(thread.preview) +
            "</div>" +
            '<div class="badges" style="margin-top:9px">' +
            badge(thread.kind) +
            badge(thread.owner, thread.owner === "esteban" ? "danger" : "blue") +
            "</div>";
          button.addEventListener("click", () => {
            selectedThreadId = thread.id;
            renderThreads(threads);
            renderConversation();
          });
          threadsEl.appendChild(button);
        }
      }

      function renderConversation() {
        const thread = getThreads().find((candidate) => candidate.id === selectedThreadId);
        if (!thread) {
          headEl.innerHTML = '<div class="empty">Cargá una demo o esperá eventos Meta</div>';
          timelineEl.innerHTML = "";
          return;
        }

        const owner = thread.conversation?.ownerActorId ?? thread.owner;
        headEl.innerHTML =
          '<div class="conversation-title"><h1>' +
          escapeHtml(thread.title) +
          '</h1><div class="badges">' +
          badge(thread.status, statusTone(thread.status)) +
          badge("dueno: " + owner, owner === "esteban" ? "danger" : "blue") +
          (thread.conversation?.escalationReason ? badge(thread.conversation.escalationReason, "warn") : "") +
          "</div></div>" +
          '<div class="muted">Ultima actividad: ' +
          escapeHtml(thread.at) +
          "</div>";

        timelineEl.innerHTML = timeline(thread);
      }

      function timeline(thread) {
        const entries = [];
        if (thread.kind === "conversation") {
          for (const message of state.messages.filter((item) => item.conversationId === thread.id)) {
            entries.push({
              at: message.createdAt,
              type: message.direction === "internal" ? "internal" : "inbound",
              title: message.direction === "internal" ? message.authorExternalId : "Cliente / prospecto",
              text: message.text
            });
          }
          for (const action of state.agentActions.filter((item) => item.inboxItemId.startsWith("message:"))) {
            const message = state.messages.find((candidate) => candidate.id === action.inboxItemId);
            if (message?.conversationId === thread.id) {
              entries.push({ at: action.createdAt, type: "agent", title: "Florencia-MKT · " + action.action, text: action.output });
            }
          }
          for (const audit of state.auditLog.filter((entry) => entry.entityId === thread.id)) {
            entries.push({ at: audit.createdAt, type: "audit", title: audit.action, text: audit.metadata?.reason ?? audit.metadata?.detail ?? audit.actorId });
          }
        } else {
          entries.push({ at: thread.item.createdAt, type: "inbound", title: "Comentario", text: thread.item.text });
          for (const action of state.agentActions.filter((item) => item.inboxItemId === thread.id)) {
            entries.push({ at: action.createdAt, type: "agent", title: "Florencia-MKT · " + action.action, text: action.output });
          }
          for (const audit of state.auditLog.filter((entry) => entry.entityId === thread.id)) {
            entries.push({ at: audit.createdAt, type: "audit", title: audit.action, text: audit.metadata?.reason ?? audit.actorId });
          }
        }

        if (entries.length === 0) return '<div class="empty">Sin historial</div>';
        return entries
          .sort((a, b) => a.at.localeCompare(b.at))
          .map((entry) => {
            return (
              '<article class="bubble ' +
              entry.type +
              '"><strong>' +
              escapeHtml(entry.title) +
              "</strong><p>" +
              escapeHtml(entry.text) +
              "</p><small>" +
              escapeHtml(entry.at) +
              "</small></article>"
            );
          })
          .join("");
      }

      async function recordOperatorIntervention() {
        const thread = currentConversationThread();
        const textarea = document.getElementById("operator-text");
        const text = textarea.value.trim();
        if (!thread || !text) {
          textarea.focus();
          return;
        }

        await postJson("/api/operator-intervention", {
          conversationId: thread.id,
          actorId: "operador-humano",
          text
        });
        textarea.value = "";
        await load(thread.id);
      }

      async function runMktAgent(action) {
        const target = currentInboxTarget();
        const outputEl = document.getElementById("mkt-output");
        const output = outputEl.value.trim();
        if (!target || !output) {
          outputEl.focus();
          return;
        }

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
        const thread = currentConversationThread();
        const reasonEl = document.getElementById("control-reason");
        const reason = reasonEl.value.trim();
        if (!thread || !reason) {
          reasonEl.focus();
          return;
        }

        await postJson("/api/conversation-control", {
          conversationId: thread.id,
          actorId: action === "return_to_agent" ? "florencia-mkt" : "operador-humano",
          action,
          reason
        });
        reasonEl.value = "";
        await load(thread.id);
      }

      async function decideGate(decision) {
        const target = currentInboxTarget();
        const reasonEl = document.getElementById("gate-reason");
        const reason = reasonEl.value.trim();
        if (!target || !reason) {
          reasonEl.focus();
          return;
        }

        await postJson("/api/human-gate", {
          inboxItemType: target.inboxItemType,
          inboxItemId: target.inboxItemId,
          decision,
          reason,
          decidedBy: decision === "escalate_esteban" ? "florencia-mkt" : "esteban",
          sensitivity: inferSensitivity(target.text)
        });
        reasonEl.value = "";
        await load(target.threadId);
      }

      function currentConversationThread() {
        return getThreads().find((thread) => thread.id === selectedThreadId && thread.kind === "conversation");
      }

      function currentInboxTarget() {
        const thread = getThreads().find((candidate) => candidate.id === selectedThreadId);
        if (!thread) return null;
        if (thread.kind === "comment") {
          return {
            threadId: thread.id,
            conversationId: state.conversations[0]?.id ?? "",
            inboxItemType: "comment",
            inboxItemId: thread.item.id,
            text: thread.item.text
          };
        }
        const latestInbound = state.messages
          .filter((message) => message.conversationId === thread.id && message.direction === "inbound")
          .toSorted((a, b) => getTime(b).localeCompare(getTime(a)))[0];
        return latestInbound
          ? {
              threadId: thread.id,
              conversationId: thread.id,
              inboxItemType: "message",
              inboxItemId: latestInbound.id,
              text: latestInbound.text
            }
          : null;
      }

      async function postJson(path, body) {
        const response = await fetch(path, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body)
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message || payload.error || "request failed");
        }
        return response.json();
      }

      function badge(text, tone = "") {
        return '<span class="badge ' + tone + '">' + escapeHtml(text) + "</span>";
      }

      function statusTone(status) {
        if (status === "requires_esteban" || status === "rejected_internal") return "danger";
        if (status === "pending_human_approval" || status === "pending_review") return "warn";
        if (status === "approved_internal" || status === "archived") return "ok";
        return "blue";
      }

      function inferSensitivity(text) {
        return /legal|abogado|denuncia|reclamo|crisis|esteban/i.test(text) ? "sensitive" : "standard";
      }

      function getTime(item) {
        return item.createdAt ?? item.receivedAt ?? item.updatedAt ?? "";
      }

      function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
        });
      }

      load().catch((error) => {
        statusEl.textContent = "Error";
        headEl.innerHTML = '<div class="empty">' + escapeHtml(error.message) + "</div>";
      });
    </script>
  </body>
</html>`;
