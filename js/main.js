(() => {
  const $ = (sel) => document.querySelector(sel);

  console.log("✅ main.js loaded");

  const DEFAULTS = {
    fullName: "Arina Mirzakhani",
    title: "Programmer",
  };

  // -----------------------------
  // SAFE OPTIONAL FEATURES
  // -----------------------------
  function safeCall(fnName) {
    try {
      const fn = window[fnName];
      if (typeof fn === "function") fn();
    } catch (e) {
      console.warn(`⚠️ Optional feature failed: ${fnName}`, e);
    }
  }

  // -----------------------------
  // NAV
  // -----------------------------
  const navToggle = $(".nav-toggle");
  const navMenu = $("#navMenu");

  function setNavOpen(open) {
    if (!navMenu || !navToggle) return;
    navMenu.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = !navMenu.classList.contains("open");
      setNavOpen(open);
    });

    navMenu.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link) setNavOpen(false);
    });

    document.addEventListener("click", (e) => {
      const insideNav = e.target.closest(".nav");
      if (!insideNav) setNavOpen(false);
    });
  }

  // -----------------------------
  // PRINT + YEAR
  // -----------------------------
  const printBtn = $("#printResumeBtn");
  if (printBtn) printBtn.addEventListener("click", () => window.print());

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // -----------------------------
  // MODAL
  // -----------------------------
  const modal = $("#modal");
  const modalContent = $("#modalContent");
  const modalCloseBtn = $("#modalCloseBtn");

  function openModal(html) {
    if (!modal || !modalContent) return;
    modalContent.innerHTML = html;
    modal.showModal();
  }

  function closeModal() {
    if (!modal) return;
    modal.close();
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      const rect = modal.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      setNavOpen(false);
    }
  });

  // -----------------------------
  // BIND HELPERS
  // -----------------------------
  function setTextBind(rootKey, value) {
    document.querySelectorAll(`[data-bind="${rootKey}"]`).forEach((el) => {
      el.textContent = value ?? "";
    });
  }

  function setHrefBind(rootKey, value) {
    document.querySelectorAll(`[data-bind-href="${rootKey}"]`).forEach((el) => {
      const ok =
        value &&
        value !== "[add link]" &&
        value !== "[add live link later]" &&
        value !== "[add demo video link later]" &&
        value !== "[optional file link]" &&
        value !== "[live demo link]" &&
        value !== "[repo link]" &&
        value !== "[optional transcript link]";
      el.setAttribute("href", ok ? value : "#");
      el.setAttribute("rel", "noopener noreferrer");
      el.setAttribute("target", ok ? "_blank" : "_self");
    });
  }

  function elTag(tag, className, inner) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (inner !== undefined) el.innerHTML = inner;
    return el;
  }

  function safeLink(url) {
    return (
      url &&
      url !== "[add link]" &&
      url !== "[add live link later]" &&
      url !== "[add demo video link later]" &&
      url !== "[optional file link]" &&
      url !== "[live demo link]" &&
      url !== "[repo link]" &&
      url !== "[optional transcript link]"
    );
  }

  function renderPills(highlights) {
    const row = $("#pillRow");
    if (!row) return;
    row.innerHTML = "";
    (highlights || []).slice(0, 3).forEach((h) => {
      const pill = elTag("div", "pill");
      pill.innerHTML = `
        <strong>${h.title ?? "Highlight"}</strong>
        <span>${h.subtitle ?? ""}</span>
      `;
      row.appendChild(pill);
    });
  }

  function renderList(listId, items, formatter) {
    const ul = $(listId);
    if (!ul) return;
    ul.innerHTML = "";
    (items || []).forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = formatter(item);
      ul.appendChild(li);
    });
  }

  function sampleCard(sample, isProfessional = false) {
    const techTags = (sample.tech || []).map((t) => `<span class="tag">${t}</span>`).join("");
    const evidenceLinks = (sample.evidence || [])
      .map((ev) => {
        const ok = safeLink(ev.url);
        const href = ok ? ev.url : "#";
        const target = ok ? ` target="_blank" rel="noopener noreferrer"` : "";
        return `<a class="btn small ghost" href="${href}"${target}>${ev.label}</a>`;
      })
      .join("");

    const typeTag = sample.type ? `<span class="tag">${sample.type}</span>` : "";

    const moreBtn = !isProfessional
      ? `<button class="btn small" type="button" data-more="1">View Details</button>`
      : "";

    const card = elTag("article", "card sample");
    card.innerHTML = `
      <div class="tagrow">${typeTag}${techTags}</div>
      <div class="title">${sample.title ?? "Sample"}</div>
      <p class="desc">${sample.description ?? ""}</p>
      <div class="links">
        ${evidenceLinks}
        ${moreBtn}
      </div>
    `;

    if (!isProfessional) {
      const btn = card.querySelector("[data-more='1']");
      if (btn) {
        btn.addEventListener("click", () => {
          const keywords = (sample.keywords || []).map((k) => `<span class="tag">${k}</span>`).join("");
          const ev = (sample.evidence || [])
            .map((e) => {
              const ok = safeLink(e.url);
              const href = ok ? e.url : "#";
              const target = ok ? ` target="_blank" rel="noopener noreferrer"` : "";
              return `<li><a href="${href}"${target}>${e.label}</a></li>`;
            })
            .join("");

          openModal(`
            <h3 style="margin:0 0 8px;">${sample.title ?? "Sample"}</h3>
            <p class="muted" style="margin:0 0 12px;">${sample.description ?? ""}</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin:0 0 10px;">
              ${typeTag}
              ${techTags}
              ${keywords}
            </div>
            <h4 style="margin:10px 0 6px;">Evidence / Links</h4>
            <ul class="list" style="margin-top:0;">${ev || "<li>Add links in data/content.json</li>"}</ul>
          `);
        });
      }
    }

    return card;
  }

  function renderAcademicSamples(samples) {
    const grid = $("#academicSamplesGrid");
    if (!grid) return;
    grid.innerHTML = "";
    (samples || []).forEach((s) => grid.appendChild(sampleCard(s, false)));
  }

  // -----------------------------
  // COVER LETTER
  // -----------------------------
  const generateCLBtn = $("#generateCLBtn");
  const copyCLBtn = $("#copyCLBtn");
  const out = $("#coverLetterOutput");

  function buildCoverLetter({ role, company, manager, fullName }) {
    const today = new Date().toLocaleDateString();
    const name = fullName || DEFAULTS.fullName;

    return `${today}

${manager || "[Hiring Manager Name]"}
${company || "[Company Name]"}
[Company Address]
[City, Province, Postal Code]

Dear ${manager || "Hiring Manager"},

I am writing to apply for the ${role || "[Target Role]"} position at ${company || "[Company Name]"}. I bring strong technical fundamentals, a consistent track record of delivering academic projects, and a practical mindset focused on building reliable, user-friendly solutions. I am confident I can contribute quickly while continuing to grow within your team.

In my recent projects, I have worked through the full development cycle: defining requirements, building and testing features, documenting decisions, and presenting results. I prioritize clear communication, thoughtful problem-solving, and continuous improvement—whether collaborating with teammates or independently managing deadlines and deliverables.

I would welcome the opportunity to discuss how my skills and motivation align with ${company || "[Company Name]"}’s needs. Thank you for your time and consideration.

Sincerely,
${name}
(647) 809-6126 • arinamirzakhani02@gmail.com`;
  }

  // -----------------------------
  // LOAD JSON
  // -----------------------------
  async function loadContent() {
    // ✅ Works even when opened as a local file (file://) or when /data folder isn't present.
    const inline = document.getElementById("contentData");
    if (inline && inline.textContent.trim()) {
      try {
        return JSON.parse(inline.textContent);
      } catch (e) {
        console.warn("⚠️ Could not parse inline contentData JSON", e);
      }
    }

    // Try common paths (hosted or simple folder structure)
    const paths = ["./data/content.json", "./content.json"];
    for (const p of paths) {
      try {
        const res = await fetch(p, { cache: "no-store" });
        if (res.ok) return res.json();
      } catch (e) {
        // ignore and try next
      }
    }
    throw new Error("Failed to load portfolio content (inline JSON or content.json).");
  }

  function bindAll(data) {
    console.log("✅ content.json loaded", data);

    const fullName = data.personal?.fullName || DEFAULTS.fullName;
    const title = data.personal?.title || DEFAULTS.title;

    setTextBind("personal.fullName", fullName);
    setTextBind("personal.title", title);
    setTextBind("personal.headline", data.personal?.headline);
    setTextBind("personal.summary", data.personal?.summary);
    setTextBind("personal.careerSummary", data.personal?.careerSummary);
    setTextBind("personal.bio", data.personal?.bio);
    setTextBind("personal.philosophy", data.personal?.philosophy);
    setTextBind("personal.email", data.personal?.email);
    setTextBind("personal.phone", data.personal?.phone);
    setTextBind("personal.location", data.personal?.location);

    setTextBind("links.portfolioUrl", data.links?.portfolioUrl);
    setTextBind("links.videoUrl", data.links?.videoUrl);
    setTextBind("links.expiryDate", data.links?.expiryDate);

    setHrefBind("links.github", data.links?.github);
    setHrefBind("links.linkedin", data.links?.linkedin);
    setHrefBind("links.portfolioUrl", data.links?.portfolioUrl);
    setHrefBind("links.videoUrl", data.links?.videoUrl);
    setHrefBind("links.coverLetterFile", data.links?.coverLetterFile);

    setTextBind("academic.transcriptNote", data.academic?.transcriptNote);
    setHrefBind("academic.transcriptFile", data.academic?.transcriptFile);

    setTextBind("capstone.summary", data.capstone?.summary);
    setTextBind("capstone.vision", data.capstone?.vision);
    setTextBind("capstone.requirements", data.capstone?.requirements);
    setTextBind("capstone.implementation", data.capstone?.implementation);
    setHrefBind("capstone.demoLink", data.capstone?.demoLink);
    setHrefBind("capstone.repoLink", data.capstone?.repoLink);

    renderPills(data.highlights);

    renderList("#credentialsList", data.academic?.credentials, (c) =>
      `<strong>${c.name}</strong> — ${c.school} <span class="tiny muted">(${c.date})</span>`
    );

    renderList("#certificationsList", data.academic?.certifications, (c) =>
      `<strong>${c.name}</strong> — ${c.issuer} <span class="tiny muted">(${c.date})</span>`
    );

    renderList("#awardsAcademicList", data.academic?.awards, (a) =>
      `<strong>${a.name}</strong> <span class="tiny muted">(${a.date})</span> — ${a.details || ""}`
    );

    renderList("#capstoneDocsList", data.capstone?.docs, (d) => {
      const ok = safeLink(d.url);
      const href = ok ? d.url : "#";
      const target = ok ? ` target="_blank" rel="noopener noreferrer"` : "";
      return `<a href="${href}"${target}>${d.name}</a>`;
    });

    renderList("#marketableSkillsList", data.personal?.marketableSkills, (s) => `${s}`);
    renderList("#accomplishmentsList", data.personal?.accomplishments, (a) => `${a}`);

    renderAcademicSamples(data.academicSamples || []);

    // Search + filter
    const search = $("#workSearch");
    const filter = $("#workFilter");

    function applyTools() {
      const q = (search?.value || "").toLowerCase().trim();
      const f = filter?.value || "all";

      const all = data.academicSamples || [];
      const filtered = all.filter((s) => {
        const typeOk = f === "all" || String(s.type).toLowerCase() === f;
        const blob = [s.title, s.description, ...(s.tech || []), ...(s.keywords || [])]
          .join(" ")
          .toLowerCase();
        const searchOk = !q || blob.includes(q);
        return typeOk && searchOk;
      });

      renderAcademicSamples(filtered);
    }

    if (search) search.addEventListener("input", applyTools);
    if (filter) filter.addEventListener("change", applyTools);

    // Cover letter buttons
    if (generateCLBtn && out) {
      generateCLBtn.addEventListener("click", () => {
        const role = $("#clRole")?.value?.trim();
        const company = $("#clCompany")?.value?.trim();
        const manager = $("#clManager")?.value?.trim();
        out.value = buildCoverLetter({ role, company, manager, fullName });
      });
    }

    if (copyCLBtn && out) {
      copyCLBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(out.value);
          copyCLBtn.textContent = "Copied!";
          setTimeout(() => (copyCLBtn.textContent = "Copy"), 900);
        } catch {
          out.select();
          document.execCommand("copy");
        }
      });
    }

    // ✅ Optional fancy effects (won't crash if missing)
    safeCall("initCardTilt");
    safeCall("initScrollReveal");
  }

  // Run
  loadContent()
    .then(bindAll)
    .catch((err) => {
      console.error("❌ Portfolio load error:", err);
      setTextBind("personal.fullName", DEFAULTS.fullName);
      setTextBind("personal.title", DEFAULTS.title);

      const grid = $("#academicSamplesGrid");
      if (grid) grid.innerHTML = `<div class="card"><strong>Error:</strong> Could not load data/content.json</div>`;
    });
})();