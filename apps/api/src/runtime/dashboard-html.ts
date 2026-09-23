export const dashboardHtml = String.raw`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>eBiz Social Command Center</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #171717;
        --muted: #666f7a;
        --line: #d9dee5;
        --surface: #f7f8fa;
        --panel: #ffffff;
        --accent: #0f766e;
        --accent-strong: #0b4f4a;
        --warn: #b45309;
        --danger: #b42318;
        --ok: #247a3e;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: var(--ink);
        background: var(--surface);
      }

      button,
      input,
      select,
      textarea {
        font: inherit;
      }

      .shell {
        min-height: 100vh;
        display: grid;
        grid-template-rows: auto 1fr;
      }

      header {
        background: var(--panel);
        border-bottom: 1px solid var(--line);
        padding: 14px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      h1 {
        font-size: 18px;
        line-height: 1.2;
        margin: 0;
        font-weight: 700;
      }

      .status {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--muted);
        font-size: 13px;
      }

      .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--ok);
      }

      main {
        display: grid;
        grid-template-columns: minmax(260px, 360px) 1fr;
        min-height: 0;
      }

      aside {
        border-right: 1px solid var(--line);
        background: var(--panel);
        min-height: 0;
        display: grid;
        grid-template-rows: auto 1fr;
      }

      .toolbar {
        display: flex;
        gap: 8px;
        padding: 12px;
        border-bottom: 1px solid var(--line);
      }

      .toolbar button,
      .decision button {
        min-height: 34px;
        border: 1px solid var(--line);
        background: var(--panel);
        color: var(--ink);
        padding: 7px 10px;
        cursor: pointer;
        border-radius: 6px;
      }

      .toolbar button.primary,
      .decision button.primary {
        border-color: var(--accent);
        background: var(--accent);
        color: #fff;
      }

      .list {
        overflow: auto;
      }

      .item {
        width: 100%;
        border: 0;
        border-bottom: 1px solid var(--line);
        background: transparent;
        text-align: left;
        padding: 13px 14px;
        cursor: pointer;
      }

      .item.active {
        background: #e9f5f3;
        box-shadow: inset 3px 0 0 var(--accent);
      }

      .item-title {
        font-weight: 700;
        margin-bottom: 5px;
      }

      .item-text {
        color: var(--muted);
        line-height: 1.35;
        max-height: 38px;
        overflow: hidden;
      }

      .content {
        min-width: 0;
        padding: 20px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(260px, 360px);
        gap: 18px;
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 8px;
        min-width: 0;
      }

      .panel h2 {
        margin: 0;
        padding: 14px 16px;
        font-size: 16px;
        border-bottom: 1px solid var(--line);
      }

      .panel-body {
        padding: 16px;
      }

      .message {
        white-space: pre-wrap;
        line-height: 1.45;
        font-size: 15px;
      }

      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 14px;
      }

      .badge {
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 4px 8px;
        color: var(--muted);
        font-size: 12px;
        background: #fff;
      }

      .badge.warn {
        border-color: #f1c27d;
        color: var(--warn);
      }

      .badge.danger {
        border-color: #f4a6a0;
        color: var(--danger);
      }

      .timeline {
        display: grid;
        gap: 10px;
      }

      .event {
        border-bottom: 1px solid var(--line);
        padding-bottom: 10px;
      }

      .event:last-child {
        border-bottom: 0;
        padding-bottom: 0;
      }

      .event strong {
        display: block;
        font-size: 13px;
      }

      .event span {
        color: var(--muted);
        font-size: 12px;
      }

      textarea {
        width: 100%;
        min-height: 78px;
        resize: vertical;
        border: 1px solid var(--line);
        border-radius: 6px;
        padding: 8px;
      }

      .decision {
        display: grid;
        gap: 10px;
      }

      .decision-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .empty {
        color: var(--muted);
        padding: 28px;
        text-align: center;
      }

      @media (max-width: 860px) {
        main,
        .content {
          grid-template-columns: 1fr;
        }

        aside {
          border-right: 0;
          border-bottom: 1px solid var(--line);
        }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <header>
        <h1>eBiz Social Command Center</h1>
        <div class="status"><span class="dot"></span><span id="runtime-status">Conectando</span></div>
      </header>
      <main>
        <aside>
          <div class="toolbar">
            <button class="primary" id="refresh">Actualizar</button>
            <button id="seed">Demo</button>
          </div>
          <div class="list" id="items"></div>
        </aside>
        <section class="content">
          <article class="panel">
            <h2>Inbox</h2>
            <div class="panel-body" id="detail"></div>
          </article>
          <aside class="panel">
            <h2>Gate humano</h2>
            <div class="panel-body">
              <div class="decision">
                <textarea id="reason" placeholder="Motivo interno"></textarea>
                <div class="decision-actions">
                  <button class="primary" data-decision="approve_internal">Aprobar</button>
                  <button data-decision="reject_internal">Rechazar</button>
                  <button data-decision="escalate_esteban">Escalar</button>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
    <script>
      let state = null;
      let selected = null;

      const itemsEl = document.getElementById("items");
      const detailEl = document.getElementById("detail");
      const statusEl = document.getElementById("runtime-status");
      const reasonEl = document.getElementById("reason");

      document.getElementById("refresh").addEventListener("click", load);
      document.getElementById("seed").addEventListener("click", async () => {
        await fetch("/api/demo-seed", { method: "POST" });
        await load();
      });

      for (const button of document.querySelectorAll("[data-decision]")) {
        button.addEventListener("click", async () => {
          if (!selected) return;

          const reason = reasonEl.value.trim();
          if (!reason) {
            reasonEl.focus();
            return;
          }

          await fetch("/api/human-gate", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              inboxItemType: selected.type,
              inboxItemId: selected.item.id,
              decision: button.dataset.decision,
              reason,
              decidedBy: button.dataset.decision === "escalate_esteban" ? "florencia-mkt" : "esteban",
              sensitivity: selected.sensitivity
            })
          });

          reasonEl.value = "";
          await load(selected.item.id);
        });
      }

      async function load(preferredId) {
        const response = await fetch("/api/inbox");
        state = await response.json();
        statusEl.textContent = "Operativo";
        const rows = getRows();
        selected = rows.find((row) => row.item.id === preferredId) ?? rows[0] ?? null;
        renderList(rows);
        renderDetail();
      }

      function getRows() {
        const messages = state.messages.map((item) => ({ type: "message", item }));
        const comments = state.comments.map((item) => ({ type: "comment", item }));
        return [...messages, ...comments].sort((a, b) =>
          getCreatedAt(b).localeCompare(getCreatedAt(a))
        );
      }

      function renderList(rows) {
        if (rows.length === 0) {
          itemsEl.innerHTML = '<div class="empty">Sin eventos</div>';
          return;
        }

        itemsEl.innerHTML = "";
        for (const row of rows) {
          const button = document.createElement("button");
          button.className = "item" + (selected?.item.id === row.item.id ? " active" : "");
          button.innerHTML =
            '<div class="item-title">' +
            escapeHtml(row.type === "message" ? "Mensaje" : "Comentario") +
            "</div>" +
            '<div class="item-text">' +
            escapeHtml(row.item.text || "(sin texto)") +
            "</div>";
          button.addEventListener("click", () => {
            selected = row;
            renderList(rows);
            renderDetail();
          });
          itemsEl.appendChild(button);
        }
      }

      function renderDetail() {
        if (!selected) {
          detailEl.innerHTML = '<div class="empty">Cargá eventos para operar el inbox</div>';
          return;
        }

        const approvals = state.approvals.filter((approval) => approval.inboxItemId === selected.item.id);
        const actions = state.agentActions.filter((action) => action.inboxItemId === selected.item.id);
        const audits = state.auditLog.filter((entry) => entry.entityId === selected.item.id);
        selected.sensitivity = inferSensitivity(selected.item.text);

        detailEl.innerHTML =
          '<div class="meta">' +
          badge(selected.type) +
          badge(selected.item.status) +
          badge(selected.sensitivity, selected.sensitivity === "sensitive" ? "danger" : "warn") +
          "</div>" +
          '<div class="message">' +
          escapeHtml(selected.item.text || "(sin texto)") +
          "</div>" +
          "<h2>Actividad</h2>" +
          timeline([...actions, ...approvals, ...audits]);
      }

      function timeline(entries) {
        if (entries.length === 0) return '<div class="empty">Sin actividad</div>';

        return (
          '<div class="timeline">' +
          entries
            .map((entry) => {
              const title = entry.action ?? entry.state ?? "evento";
              const at = entry.createdAt ?? entry.decidedAt ?? "";
              const detail = entry.output ?? entry.reason ?? entry.actorId ?? "";
              return (
                '<div class="event"><strong>' +
                escapeHtml(title) +
                "</strong><span>" +
                escapeHtml([at, detail].filter(Boolean).join(" · ")) +
                "</span></div>"
              );
            })
            .join("") +
          "</div>"
        );
      }

      function badge(text, tone = "") {
        return '<span class="badge ' + tone + '">' + escapeHtml(text) + "</span>";
      }

      function inferSensitivity(text) {
        return /legal|abogado|denuncia|reclamo|crisis|esteban/i.test(text) ? "sensitive" : "standard";
      }

      function getCreatedAt(row) {
        return row.item.createdAt ?? row.item.receivedAt ?? "";
      }

      function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (char) => {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
        });
      }

      load().catch((error) => {
        statusEl.textContent = "Error";
        detailEl.innerHTML = '<div class="empty">' + escapeHtml(error.message) + "</div>";
      });
    </script>
  </body>
</html>`;
