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
      .conversation-card {
        align-self: start;
        max-height: calc(100vh - 260px);
        grid-template-rows: auto minmax(0, auto) auto;
      }
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
      .conversation-card .thread {
        max-height: calc(100vh - 410px);
      }
      .message {
        max-width: 76%;
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 11px 13px;
        background: var(--white);
      }
      .message.internal { margin-left: auto; background: #eef2f7; border-color: #ccd6e4; color: var(--ink); }
      .message.outbound { margin-left: auto; background: var(--nav); border-color: var(--nav); color: var(--white); }
      .message strong { display: block; font-size: 12px; margin-bottom: 5px; }
      .message p { white-space: pre-wrap; line-height: 1.45; }
      .message small { display: block; margin-top: 7px; color: var(--muted); }
      .message.outbound small { color: #cbd5e1; }
      .attachments { display: grid; gap: 8px; margin-top: 10px; }
      .attachment {
        display: grid;
        gap: 6px;
        border: 1px solid var(--line);
        border-radius: 6px;
        padding: 8px;
        background: #fbfcfe;
      }
      .message.outbound .attachment { background: #111827; border-color: #374151; }
      .attachment img {
        display: block;
        max-width: min(360px, 100%);
        max-height: 280px;
        border-radius: 6px;
        object-fit: contain;
        background: var(--white);
      }
      .attachment a { color: var(--blue); font-weight: 700; overflow-wrap: anywhere; }
      .message.outbound .attachment a { color: #93c5fd; }
      .composer {
        padding: 14px;
        border-top: 1px solid var(--line);
        background: var(--white);
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 10px;
        align-items: start;
      }
      .composer-main { display: grid; gap: 8px; min-width: 0; }
      .composer > button { white-space: nowrap; padding: 0 16px; min-height: 42px; }
      .attachment-input input { max-width: 100%; min-width: 0; }
      .attachment-input {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .attachment-input input { width: auto; min-height: 0; padding: 0; border: 0; }
      .attachment-chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .attachment-chip {
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 4px 8px;
        background: #f8fafc;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
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
      .nav-item { cursor: pointer; user-select: none; }
      .nav-item:hover { background: #2a3444; }
      .nav-item.active:hover { background: #143b66; }
      .ownership {
        display: grid;
        gap: 8px;
        padding: 12px;
        border: 1px solid #b7d8ff;
        border-radius: 7px;
        background: var(--blue-soft);
      }
      .ownership.human { border-color: #efaaa3; background: #fff5f4; }
      .ownership strong { font-size: 14px; }
      .flow { margin: 0; padding-left: 18px; color: var(--muted); font-size: 12px; line-height: 1.5; }
      .hint { color: var(--muted); font-size: 12px; line-height: 1.4; }
      button:disabled { opacity: .55; cursor: progress; }
      .toast {
        position: fixed;
        right: 20px;
        bottom: 20px;
        max-width: 420px;
        padding: 12px 16px;
        border-radius: 7px;
        background: var(--nav);
        color: var(--white);
        font-size: 13px;
        font-weight: 650;
        box-shadow: 0 8px 24px rgba(0,0,0,.25);
        z-index: 10;
      }
      .toast.error { background: var(--danger); }
      .toast.ok { background: var(--ok); }
      .toast[hidden] { display: none; }

      @media (max-width: 1200px) {
        .workspace { grid-template-columns: 320px minmax(0, 1fr); }
        .workspace .card:last-child { grid-column: 1 / -1; }
        .metrics { grid-template-columns: repeat(3, minmax(140px, 1fr)); }
      }
      @media (max-width: 820px) {
        .app { grid-template-columns: 1fr; }
        .nav { display: none; }
        .workspace, .metrics { grid-template-columns: 1fr; }
        .composer { grid-template-columns: minmax(0, 1fr); }
        .composer > button { width: 100%; }
        .conversation-card { max-height: none; }
        .conversation-card .thread { max-height: 60vh; }
        .title-row, .topbar { flex-wrap: wrap; }
        .search { width: 100%; }
      }
    </style>
  </head>
  <body>
    <div class="app">
      <aside class="nav">
        <div class="brand"><div class="brand-mark">e</div><div>eBiz</div></div>
        <div class="nav-section">
          <div class="nav-label">Overview</div>
          <div class="nav-item active" role="button" tabindex="0" data-view="all">Dashboard</div>
        </div>
        <div class="nav-section">
          <div class="nav-label">Supervision</div>
          <div class="nav-item" role="button" tabindex="0" data-view="all">Social Inbox</div>
          <div class="nav-item" role="button" tabindex="0" data-view="approvals">Requieren humano</div>
          <div class="nav-item" role="button" tabindex="0" data-view="activity">Actividad reciente</div>
        </div>
        <div class="nav-section">
          <div class="nav-label">AI Workforce</div>
          <div class="nav-item" role="button" tabindex="0" data-view="florencia">Florencia-MKT</div>
          <div class="nav-item" role="button" tabindex="0" data-view="humans">Intervenidas por humanos</div>
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
              <p class="subtitle">Florencia-MKT (agente LXC104) atiende por defecto todas las conversaciones de Instagram. Aca supervisas, auditas e intervenis.</p>
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
            <div class="card-head"><h2 id="inbox-title">Conversaciones</h2><span class="muted" id="inbox-count"></span></div>
            <div class="inbox-list" id="threads"></div>
          </article>

          <article class="card conversation-card">
            <div id="conversation-head" class="conversation-head"></div>
            <div class="thread" id="thread"></div>
            <div class="composer">
              <div class="composer-main">
                <textarea id="operator-text" placeholder="Intervencion humana: respuesta directa al usuario por Instagram (reemplaza a Florencia en este mensaje)"></textarea>
                <div class="attachment-input">
                  <input id="operator-attachments" type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" />
                  <div class="attachment-chips" id="operator-attachment-list"></div>
                </div>
              </div>
              <button class="dark" id="operator-reply">Responder al usuario</button>
            </div>
          </article>

          <aside class="card">
            <div class="card-head"><h2>Supervision y control</h2></div>
            <div class="side-scroll">
              <section class="profile-card" id="profile"></section>
              <section class="ownership" id="ownership"></section>
              <section class="form-block">
                <h3>1. Florencia-MKT (agente)</h3>
                <p class="hint">Registra el trabajo de Florencia sobre el ultimo mensaje entrante. SCC no genera texto con IA: lo que escribas aca queda como su salida en la bitacora.</p>
                <textarea id="mkt-output" placeholder="Salida de Florencia: clasificacion, borrador o motivo para pedir ayuda"></textarea>
                <select id="escalation-reason">
                  <option value="ambiguous">Informacion ambigua</option>
                  <option value="missing_info">Informacion ausente</option>
                  <option value="sensitive">Caso sensible (pasa a Esteban)</option>
                </select>
                <div class="actions">
                  <button data-agent-action="classify">Clasificar</button>
                  <button class="primary" data-agent-action="draft">Borrador</button>
                  <button class="danger" data-agent-action="escalate">Pedir ayuda</button>
                </div>
              </section>
              <section class="form-block">
                <h3>2. Intervencion humana</h3>
                <p class="hint">Cambia quien atiende la conversacion. El motivo es opcional y queda en la bitacora; la nota interna nunca se envia al usuario.</p>
                <textarea id="control-reason" placeholder="Motivo / nota interna (no se envia al usuario)"></textarea>
                <div class="actions">
                  <button class="dark" data-control-action="take_control">Asignar a humano</button>
                  <button data-control-action="return_to_agent">Asignar a Florencia</button>
                  <button data-control-action="resolve">Cerrar caso</button>
                </div>
                <button id="operator-note">Guardar nota interna</button>
              </section>
              <section class="form-block">
                <h3>3. Respuesta sugerida</h3>
                <textarea id="suggested-reply-text" placeholder="Respuesta que Florencia propone para enviar al usuario por Instagram"></textarea>
                <select id="suggested-reply-sensitivity">
                  <option value="standard">Caso estandar</option>
                  <option value="sensitive">Caso sensible: requiere Esteban</option>
                </select>
                <div class="actions">
                  <button class="primary" id="suggest-reply">Crear sugerencia</button>
                </div>
                <div class="audit" id="suggested-replies"></div>
              </section>
              <section class="form-block">
                <h3>Bitacora de auditoria</h3>
                <div class="audit" id="audit"></div>
              </section>
            </div>
          </aside>
        </section>
      </main>
    </div>

    <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>
    <script>
      let state = null;
      let currentView = "all";
      let selectedThreadId = null;
      const threadsEl = document.getElementById("threads");
      const threadEl = document.getElementById("thread");
      const headEl = document.getElementById("conversation-head");
      const profileEl = document.getElementById("profile");
      const auditEl = document.getElementById("audit");
      const suggestedRepliesEl = document.getElementById("suggested-replies");
      const metricsEl = document.getElementById("metrics");
      const statusEl = document.getElementById("runtime-status");
      const searchEl = document.getElementById("search");
      const operatorAttachmentsEl = document.getElementById("operator-attachments");
      const operatorAttachmentListEl = document.getElementById("operator-attachment-list");

      const toastEl = document.getElementById("toast");
      let toastTimer = null;
      const OWNER_LABELS = { "florencia-mkt": "Florencia-MKT", "operador-humano": "Operador humano", esteban: "Esteban", system: "Sistema" };
      const VIEW_TITLES = { all: "Conversaciones", approvals: "Requieren humano", activity: "Actividad reciente", florencia: "Atendidas por Florencia-MKT", humans: "Intervenidas por humanos" };

      function toast(message, tone) {
        toastEl.textContent = message;
        toastEl.className = "toast " + (tone || "");
        toastEl.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toastEl.hidden = true; }, tone === "error" ? 7000 : 3500);
      }

      // Envuelve cada accion: deshabilita el boton mientras corre y muestra exito o error visible.
      function guarded(button, successMessage, fn) {
        return async () => {
          if (button.disabled) return;
          button.disabled = true;
          try {
            const done = await fn();
            if (done !== false) toast(successMessage, "ok");
          } catch (error) {
            toast("No se pudo completar: " + (error && error.message ? error.message : error), "error");
          } finally {
            button.disabled = false;
          }
        };
      }
      function bind(button, successMessage, fn) { button.addEventListener("click", guarded(button, successMessage, fn)); }

      function needConversation() {
        const thread = getThreads().find((item) => item.id === selectedThreadId);
        if (!thread) { toast("Elegi una conversacion primero.", "error"); return null; }
        if (thread.kind !== "conversation") { toast("Esta accion aplica a conversaciones de mensajes directos, no a comentarios.", "error"); return null; }
        return thread;
      }

      bind(document.getElementById("refresh"), "Actualizado.", () => load());
      bind(document.getElementById("seed"), "Datos demo cargados.", async () => {
        await postJson("/api/demo-seed", {});
        await load();
      });
      bind(document.getElementById("operator-reply"), "Respuesta enviada al usuario.", sendOperatorReply);
      bind(document.getElementById("operator-note"), "Nota interna guardada.", recordOperatorIntervention);
      bind(document.getElementById("suggest-reply"), "Sugerencia creada.", createSuggestedReply);
      for (const item of document.querySelectorAll("[data-view]")) {
        const activate = () => {
          currentView = item.dataset.view;
          for (const other of document.querySelectorAll("[data-view]")) other.classList.toggle("active", other === item);
          if (state) renderAll();
        };
        item.addEventListener("click", activate);
        item.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
      }
      operatorAttachmentsEl.addEventListener("change", renderSelectedAttachments);
      searchEl.addEventListener("input", renderAll);
      const AGENT_OK = { classify: "Clasificacion registrada.", draft: "Borrador registrado.", escalate: "Pedido de ayuda registrado: la conversacion paso a un humano." };
      const CONTROL_OK = { take_control: "Conversacion asignada a humano.", return_to_agent: "Conversacion devuelta a Florencia-MKT.", resolve: "Caso cerrado." };
      for (const button of document.querySelectorAll("[data-agent-action]")) {
        bind(button, AGENT_OK[button.dataset.agentAction], () => runMktAgent(button.dataset.agentAction));
      }
      for (const button of document.querySelectorAll("[data-control-action]")) {
        bind(button, CONTROL_OK[button.dataset.controlAction], () => changeConversationControl(button.dataset.controlAction));
      }

      async function load(preferredId) {
        const response = await fetch("/api/inbox");
        state = await response.json();
        statusEl.textContent = "Operativo";
        const threads = filteredThreads();
        selectedThreadId = preferredId ?? selectedThreadId ?? threads[0]?.id ?? null;
        renderAll();
        return true;
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

      function inView(thread) {
        const human = thread.owner === "operador-humano" || thread.owner === "esteban";
        if (currentView === "approvals") return human || thread.status === "pending_human_approval" || thread.status === "requires_esteban";
        if (currentView === "humans") return human;
        if (currentView === "florencia") return thread.owner === "florencia-mkt";
        if (currentView === "activity") return Boolean(thread.conversation?.lastAgentActionAt || thread.conversation?.lastHumanInterventionAt);
        return true;
      }

      function filteredThreads() {
        const q = searchEl.value.trim().toLowerCase();
        const inScope = getThreads().filter(inView);
        if (!q) return inScope;
        return inScope.filter((thread) =>
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
        document.getElementById("inbox-title").textContent = VIEW_TITLES[currentView] ?? "Conversaciones";
        document.getElementById("inbox-count").textContent = threads.length + " items";
        if (threads.length === 0) {
          threadsEl.innerHTML = '<div class="empty">Sin conversaciones en esta vista</div>';
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
            badge(thread.status, statusTone(thread.status)) + badge(ownerLabel(thread.owner), ownerTone(thread.owner)) +
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
          document.getElementById("ownership").innerHTML = "";
          suggestedRepliesEl.innerHTML = "";
          auditEl.innerHTML = "";
          return;
        }
        const profile = thread.profile;
        headEl.innerHTML =
          '<div class="conversation-title"><div class="person-line"><div class="avatar">' + initials(thread.title) +
          '</div><div><h2>' + escapeHtml(thread.title) + '</h2><div class="muted">' +
          escapeHtml(profileLabel(profile)) + '</div></div></div><div class="badges">' +
          badge(thread.status, statusTone(thread.status)) + badge("dueno: " + ownerLabel(thread.owner), ownerTone(thread.owner)) +
          (thread.conversation?.escalationReason ? badge(thread.conversation.escalationReason, "warn") : "") + '</div></div>';
        threadEl.innerHTML = conversationMessages(thread);
        threadEl.scrollTop = threadEl.scrollHeight;
        profileEl.innerHTML = renderProfile(thread);
        const ownershipEl = document.getElementById("ownership");
        ownershipEl.className = "ownership" + (isHumanOwner(thread.owner) ? " human" : "");
        ownershipEl.innerHTML = renderOwnership(thread);
        suggestedRepliesEl.innerHTML = renderSuggestedReplies(thread);
        auditEl.innerHTML = renderAudit(thread);
      }

      function conversationMessages(thread) {
        const entries = [];
        if (thread.kind === "conversation") {
          for (const message of state.messages.filter((item) => item.conversationId === thread.id)) {
            entries.push({
              at: message.createdAt,
              mode: message.direction,
              who: message.direction === "inbound" ? (thread.profile?.displayName ?? "Prospecto") : message.authorExternalId,
              text: message.text || "(evento sin texto: posible adjunto/reaccion)",
              attachments: message.attachments ?? []
            });
          }
        } else {
          entries.push({ at: thread.item.createdAt, mode: "inbound", who: thread.title, text: thread.item.text || "(comentario sin texto)", attachments: [] });
        }
        if (entries.length === 0) return '<div class="empty">Sin mensajes</div>';
        return entries.sort((a, b) => a.at.localeCompare(b.at)).map((entry) =>
          '<article class="message ' + escapeHtml(entry.mode === "outbound" ? "outbound" : entry.mode === "internal" ? "internal" : "") + '"><strong>' +
          escapeHtml(entry.who) + '</strong><p>' + escapeHtml(entry.text) + '</p>' + renderAttachments(entry.attachments) +
          '<small>' + escapeHtml(entry.at) + '</small></article>'
        ).join("");
      }

      function renderAttachments(attachments) {
        if (!attachments || attachments.length === 0) return "";
        return '<div class="attachments">' + attachments.map((attachment) => {
          const href = attachment.url || attachment.dataUrl || "";
          const label = attachment.name || attachment.type || "adjunto";
          const media = attachment.type === "image" && href
            ? '<img src="' + escapeAttribute(href) + '" alt="' + escapeAttribute(label) + '" loading="lazy" />'
            : attachment.type === "video" && href
              ? '<video src="' + escapeAttribute(href) + '" controls preload="metadata" style="max-width:100%;max-height:280px"></video>'
              : attachment.type === "audio" && href
                ? '<audio src="' + escapeAttribute(href) + '" controls preload="metadata"></audio>'
                : "";
          const link = href
            ? '<a href="' + escapeAttribute(href) + '" target="_blank" rel="noreferrer">Abrir ' + escapeHtml(label) + '</a>'
            : '<span class="muted">' + escapeHtml(label) + '</span>';
          return '<div class="attachment">' + media + link + '<span class="muted">' + escapeHtml(attachment.mimeType || attachment.type || "archivo") + '</span></div>';
        }).join("") + '</div>';
      }

      function ownerLabel(owner) { return OWNER_LABELS[owner] ?? owner; }
      function isHumanOwner(owner) { return owner === "operador-humano" || owner === "esteban"; }
      function ownerTone(owner) { return owner === "esteban" ? "danger" : isHumanOwner(owner) ? "warn" : "blue"; }

      function renderOwnership(thread) {
        const human = isHumanOwner(thread.owner);
        const escalation = thread.conversation?.escalationReason;
        const head = human
          ? '<strong>Atiende: ' + escapeHtml(ownerLabel(thread.owner)) + '</strong><p class="hint">Un humano tomo esta conversacion' +
            (escalation ? ' (motivo: ' + escapeHtml(escalation) + ')' : '') + '. Florencia-MKT queda en pausa hasta que se la reasigne.</p>'
          : '<strong>Atiende: Florencia-MKT (por defecto)</strong><p class="hint">Florencia-MKT (agente LXC104) es la duena de toda conversacion de Instagram. Solo intervenis vos si hace falta.</p>';
        return head + '<div class="badges">' + badge("estado: " + thread.status, statusTone(thread.status)) + '</div>' +
          '<ol class="flow"><li>Entra el mensaje: dueno inicial Florencia-MKT.</li><li>Florencia clasifica, responde o pide ayuda.</li>' +
          '<li>Si escala o vos intervenis, pasa a humano.</li><li>Devolves a Florencia o cerras el caso.</li></ol>' +
          '<p class="hint">SCC registra y audita. El envio automatico de respuestas lo ejecuta Florencia fuera de SCC; aca no hay motor de IA propio.</p>';
      }

      function renderProfile(thread) {
        const profile = thread.profile;
        return '<div class="person-line"><div class="avatar">' + initials(thread.title) + '</div><div class="person-main"><strong>' +
          escapeHtml(thread.title) + '</strong><span class="muted">' + escapeHtml(profileLabel(profile)) +
          '</span></div></div><div class="badges">' + badge(profile?.kind ?? "unknown") + badge(thread.kind) + '</div>' +
          '<p class="muted">Identidad del remitente/prospecto. Cuando Meta entrega username se muestra @usuario; si no, queda el ID IG para trazabilidad.</p>';
      }

      function renderAudit(thread) {
        const targetIds = new Set([thread.id, thread.item?.id]);
        if (thread.kind === "conversation") {
          for (const message of state.messages.filter((item) => item.conversationId === thread.id)) targetIds.add(message.id);
          for (const reply of state.suggestedReplies.filter((item) => item.conversationId === thread.id)) targetIds.add(reply.id);
        }
        const rows = [
          ...state.agentActions.filter((item) => targetIds.has(item.inboxItemId)).map((item) => ({ at: item.createdAt, title: "MKT · " + item.action, text: item.output })),
          ...state.approvals.filter((item) => targetIds.has(item.inboxItemId)).map((item) => ({ at: item.decidedAt, title: item.state, text: item.reason ?? item.decidedBy })),
          ...state.auditLog.filter((item) => targetIds.has(item.entityId)).map((item) => ({ at: item.createdAt, title: item.action, text: item.metadata?.reason ?? item.metadata?.detail ?? item.actorId }))
        ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);
        if (rows.length === 0) return '<div class="muted">Sin actividad interna.</div>';
        return rows.map((row) => '<div class="audit-row"><strong>' + escapeHtml(row.title) + '</strong><div class="muted">' + escapeHtml(row.text ?? "") + '</div><div class="muted">' + escapeHtml(row.at ?? "") + '</div></div>').join("");
      }

      function renderSuggestedReplies(thread) {
        if (thread.kind !== "conversation") return '<div class="muted">Selecciona una conversacion.</div>';
        const rows = state.suggestedReplies.filter((item) => item.conversationId === thread.id)
          .sort((a, b) => b.draftedAt.localeCompare(a.draftedAt));
        if (rows.length === 0) return '<div class="muted">Sin respuestas sugeridas.</div>';
        return rows.map((reply) =>
          '<div class="audit-row"><strong>' + escapeHtml(reply.state) + '</strong><div>' + escapeHtml(reply.text) +
          '</div><div class="muted">' + escapeHtml(reply.draftedAt) + '</div><div class="actions">' +
          '<button data-reply-id="' + escapeHtml(reply.id) + '" data-reply-decision="approve_ready_to_send">Aprobar para envio</button>' +
          (reply.state === "ready_to_send" ? '<button class="dark" data-send-reply-id="' + escapeHtml(reply.id) + '">Enviar al usuario</button>' : "") +
          '<button data-reply-id="' + escapeHtml(reply.id) + '" data-reply-decision="reject">Rechazar</button>' +
          '<button class="danger" data-reply-id="' + escapeHtml(reply.id) + '" data-reply-decision="escalate_esteban">Esteban</button>' +
          '</div></div>'
        ).join("");
      }

      suggestedRepliesEl.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-reply-decision]");
        if (!button) return;
        const reason = document.getElementById("control-reason").value.trim() || "Decision humana desde consola SCC.";
        await guarded(button, "Decision registrada.", async () => {
          await postJson("/api/suggested-reply-decision", {
            replyId: button.dataset.replyId,
            decidedBy: button.dataset.replyDecision === "escalate_esteban" ? "esteban" : "operador-humano",
            decision: button.dataset.replyDecision,
            reason
          });
          await load(selectedThreadId);
        })();
      });

      suggestedRepliesEl.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-send-reply-id]");
        if (!button) return;
        await guarded(button, "Respuesta enviada al usuario.", async () => {
          await postJson("/api/suggested-reply-send", {
            replyId: button.dataset.sendReplyId,
            actorId: "operador-humano"
          });
          await load(selectedThreadId);
        })();
      });

      async function recordOperatorIntervention() {
        const thread = needConversation();
        if (!thread) return false;
        const textEl = document.getElementById("control-reason");
        const text = textEl.value.trim();
        if (!text) { toast("Escribi la nota interna antes de guardarla.", "error"); textEl.focus(); return false; }
        await postJson("/api/operator-intervention", { conversationId: thread.id, actorId: "operador-humano", text });
        textEl.value = "";
        await load(thread.id);
      }

      async function sendOperatorReply() {
        const thread = needConversation();
        if (!thread) return false;
        const textEl = document.getElementById("operator-text");
        const text = textEl.value.trim();
        const attachments = await readSelectedAttachments();
        if (!text && attachments.length === 0) { toast("Escribi una respuesta o adjunta un archivo.", "error"); textEl.focus(); return false; }
        await postJson("/api/operator-reply", { conversationId: thread.id, actorId: "operador-humano", text, attachments });
        textEl.value = "";
        operatorAttachmentsEl.value = "";
        renderSelectedAttachments();
        await load(thread.id);
      }

      function renderSelectedAttachments() {
        const files = Array.from(operatorAttachmentsEl.files ?? []);
        operatorAttachmentListEl.innerHTML = files.map((file) =>
          '<span class="attachment-chip">' + escapeHtml(file.name) + '</span>'
        ).join("");
      }

      async function readSelectedAttachments() {
        const files = Array.from(operatorAttachmentsEl.files ?? []);
        return Promise.all(files.map((file) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.addEventListener("load", () => resolve({
            name: file.name,
            mimeType: file.type || "application/octet-stream",
            sizeBytes: file.size,
            dataUrl: String(reader.result)
          }));
          reader.addEventListener("error", () => reject(reader.error));
          reader.readAsDataURL(file);
        })));
      }

      async function runMktAgent(action) {
        const target = currentTarget();
        if (!target) { toast("Elegi una conversacion con un mensaje entrante.", "error"); return false; }
        const outputEl = document.getElementById("mkt-output");
        const defaults = {
          classify: "Clasificada por operador desde SCC (sin detalle).",
          escalate: "Florencia pidio ayuda desde SCC (sin detalle)."
        };
        const output = outputEl.value.trim() || defaults[action] || "";
        if (!output) { toast("Escribi el borrador de Florencia antes de registrarlo.", "error"); outputEl.focus(); return false; }
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

      async function createSuggestedReply() {
        const target = currentTarget();
        if (!target) { toast("Elegi una conversacion con un mensaje entrante.", "error"); return false; }
        const textEl = document.getElementById("suggested-reply-text");
        const text = textEl.value.trim();
        if (!text) { toast("Escribi el texto de la respuesta sugerida.", "error"); textEl.focus(); return false; }
        await postJson("/api/suggested-reply", {
          conversationId: target.conversationId,
          inboxItemType: target.inboxItemType,
          inboxItemId: target.inboxItemId,
          text,
          sensitivity: document.getElementById("suggested-reply-sensitivity").value
        });
        textEl.value = "";
        await load(target.threadId);
      }

      async function changeConversationControl(action) {
        const thread = needConversation();
        if (!thread) return false;
        const reasonEl = document.getElementById("control-reason");
        const defaultReasons = {
          take_control: "Asignada a humano desde consola SCC.",
          return_to_agent: "Devuelta a Florencia-MKT desde consola SCC.",
          resolve: "Caso cerrado desde consola SCC."
        };
        const reason = reasonEl.value.trim() || defaultReasons[action];
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
      function profileLabel(profile) {
        if (!profile) return "Instagram";
        if (profile.username) return "@" + profile.username;
        return profile.externalId ?? "Instagram";
      }
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
      function escapeAttribute(value) {
        return escapeHtml(value).replace(/\x60/g, "&#96;");
      }
      load().catch((error) => {
        toast("No se pudo cargar el inbox: " + error.message, "error");
        statusEl.textContent = "Error";
        threadEl.innerHTML = '<div class="empty">' + escapeHtml(error.message) + '</div>';
      });
    </script>
  </body>
</html>`;
