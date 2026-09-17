(function () {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const canAnimate = !reduced && window.gsap && window.ScrollTrigger;
  const shareUrl = location.origin + location.pathname + "#karya";

  /* ---------- Site info ---------- */
  $$("[data-site]").forEach(el => { el.textContent = SITE[el.dataset.site]; });
  $$("[data-site-href]").forEach(el => { el.href = SITE[el.dataset.siteHref]; });
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Toast ---------- */
  const toast = $(".toast");
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  /* ---------- Featured project + AR launcher ---------- */
  const screen = $("#ar-screen");
  const launch = $("#ar-launch");
  const fsBtn = $("#fullscreen-btn");
  let current, iframe;

  function renderFeatured(p) {
    current = p;
    $("#project-title").textContent = p.title;
    $("#project-subject").textContent = p.subject;
    $("#project-desc").textContent = p.description;
    $("#ar-thumb").src = p.thumbnail;
    $("#ar-thumb").alt = p.title;

    const box = $("#project-interactions");
    box.replaceChildren(...(p.interactions || []).map((it, i) => {
      const card = document.createElement("div");
      card.className = "interaction reveal";
      const num = document.createElement("span");
      num.className = "interaction-num";
      num.textContent = i + 1;
      const body = document.createElement("div");
      const h = document.createElement("h3");
      h.textContent = it.title;
      const t = document.createElement("p");
      t.textContent = it.text;
      body.append(h, t);
      card.append(num, body);
      return card;
    }));

    if (iframe) iframe.remove();
    iframe = null;
    launch.hidden = false;
    fsBtn.disabled = true;
  }

  // Layar penuh via CSS (position: fixed), karena iOS Safari tidak mendukung Fullscreen API pada iframe.
  function setExpanded(on) {
    screen.classList.toggle("is-expanded", on);
    document.documentElement.classList.toggle("ar-open", on);
    if (lenis) on ? lenis.stop() : lenis.start();
  }

  $("#start-ar").addEventListener("click", () => {
    iframe = document.createElement("iframe");
    iframe.src = current.embedUrl;
    iframe.title = current.title;
    iframe.allow = "camera; microphone; gyroscope; accelerometer; magnetometer; xr-spatial-tracking; fullscreen";
    iframe.allowFullscreen = true;
    screen.appendChild(iframe);
    launch.hidden = true;
    fsBtn.disabled = false;
    if (matchMedia("(max-width: 899px)").matches) setExpanded(true);
  });

  fsBtn.addEventListener("click", () => { if (iframe) setExpanded(true); });
  $("#ar-close").addEventListener("click", () => setExpanded(false));
  addEventListener("keydown", e => { if (e.key === "Escape") setExpanded(false); });

  renderFeatured(PROJECTS[0]);

  if (PROJECTS.length > 1) {
    $("#more-projects").hidden = false;
    $("#more-grid").replaceChildren(...PROJECTS.map(p => {
      const card = document.createElement("button");
      card.className = "more-card";
      const img = document.createElement("img");
      img.src = p.thumbnail;
      img.alt = "";
      img.loading = "lazy";
      const label = document.createElement("span");
      label.textContent = p.title;
      card.append(img, label);
      card.addEventListener("click", () => {
        renderFeatured(p);
        scrollToTarget($("#karya"));
      });
      return card;
    }));
  }

  /* ---------- Copy link + QR ---------- */
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    showToast("Link disalin ✓");
  }
  $$(".copy-link").forEach(b => b.addEventListener("click", copyLink));

  if (window.qrcode) {
    const qr = qrcode(0, "M");
    qr.addData(shareUrl);
    qr.make();
    $("#qr").innerHTML = qr.createSvgTag({ cellSize: 6, margin: 0, scalable: true });
  }

  /* ---------- Mobile menu ---------- */
  const toggle = $(".menu-toggle");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open);
    $(".mobile-menu").setAttribute("aria-hidden", !open);
  }
  toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  $$(".mobile-menu a").forEach(a => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Scrolling ---------- */
  let lenis;
  function scrollToTarget(el) {
    if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }

  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const target = $(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    scrollToTarget(target);
  }));

  const nav = $(".nav");
  let lastY = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    nav.classList.toggle("is-hidden", y > lastY && y > 300 && !document.body.classList.contains("menu-open"));
    lastY = y;
  }, { passive: true });

  /* ---------- No animation path ---------- */
  function finishLoading() {
    $(".preloader")?.remove();
    document.body.classList.remove("is-loading");
  }

  if (!canAnimate) {
    finishLoading();
    $$("[data-count]").forEach(el => { el.textContent = el.dataset.count + (el.dataset.suffix || ""); });
    return;
  }

  /* ---------- Animations ---------- */
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09 });
    lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const fontsReady = Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]);

  fontsReady.then(() => {
    // ponytail: split sekali saat load; kalau layar diputar, baris tidak di-split ulang.
    const splits = window.SplitType
      ? $$(".split").map(el => ({ el, words: new SplitType(el, { types: "lines,words" }).words }))
      : [];

    const heroSplit = splits.find(s => s.el.classList.contains("hero-title"));
    if (heroSplit) gsap.set(heroSplit.words, { yPercent: 110 });
    gsap.set(".hero .reveal", { y: 30, opacity: 0 });
    gsap.set(".hero-visual", { y: 80, opacity: 0, rotate: 6 });

    const counter = { v: 0 };
    gsap.timeline()
      .to(counter, {
        v: 100,
        duration: 1.3,
        ease: "power2.inOut",
        onUpdate: () => { $("#count").textContent = Math.round(counter.v); }
      })
      .to(".preloader-bar span", { width: "100%", duration: 1.3, ease: "power2.inOut" }, 0)
      .to(".preloader", { yPercent: -100, duration: 1, ease: "expo.inOut" })
      .add(() => {
        finishLoading();
        lenis?.start();
      })
      .to(heroSplit ? heroSplit.words : [], { yPercent: 0, duration: 1.1, stagger: 0.05, ease: "expo.out" }, "-=0.5")
      .to(".hero .reveal", { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: "expo.out" }, "-=0.9")
      .to(".hero-visual", { y: 0, opacity: 1, rotate: 0, duration: 1.4, ease: "expo.out" }, "-=1");

    splits.filter(s => s !== heroSplit).forEach(({ el, words }) => {
      gsap.from(words, {
        yPercent: 110,
        duration: 1,
        stagger: 0.035,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });

    $$(".reveal").filter(el => !el.closest(".hero")).forEach(el => {
      gsap.from(el, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%" }
      });
    });

    $$(".reveal-scale").forEach(el => {
      gsap.from(el, {
        scale: 0.88,
        opacity: 0,
        duration: 1.3,
        ease: "expo.out",
        clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });

    [".step", ".logic-card"].forEach(sel => {
      gsap.from(sel, {
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: $(sel).parentElement, start: "top 80%" }
      });
    });

    $$("[data-count]").forEach(el => {
      const obj = { v: 0 };
      const end = +el.dataset.count;
      const suffix = el.dataset.suffix || "";
      el.textContent = "0" + suffix;
      gsap.to(obj, {
        v: end,
        duration: 1.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
        onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; }
      });
    });

    gsap.to(".poster-card", {
      yPercent: -8,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    gsap.fromTo(".footer-word", { yPercent: 40 }, {
      yPercent: 0,
      ease: "none",
      scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true }
    });

    ScrollTrigger.refresh();
  });

  /* ---------- Pointer effects (desktop) ---------- */
  if (!finePointer) return;

  const poster = $("#poster");
  const visual = $(".hero-visual");
  const chips = $$(".float-chip");
  const rx = gsap.quickTo(poster, "rotationY", { duration: 0.8, ease: "power3.out" });
  const ry = gsap.quickTo(poster, "rotationX", { duration: 0.8, ease: "power3.out" });
  const chipMovers = chips.map(c => ({
    x: gsap.quickTo(c, "x", { duration: 1, ease: "power3.out" }),
    y: gsap.quickTo(c, "y", { duration: 1, ease: "power3.out" }),
    d: +c.dataset.depth
  }));

  $(".hero").addEventListener("mousemove", e => {
    const r = visual.getBoundingClientRect();
    const px = (e.clientX - (r.left + r.width / 2)) / innerWidth;
    const py = (e.clientY - (r.top + r.height / 2)) / innerHeight;
    rx(px * 22);
    ry(-py * 22);
    poster.style.setProperty("--mx", (50 + px * 100) + "%");
    poster.style.setProperty("--my", (30 + py * 100) + "%");
    chipMovers.forEach(m => { m.x(px * 40 * m.d); m.y(py * 40 * m.d); });
  });

  $(".hero").addEventListener("mouseleave", () => {
    rx(0);
    ry(0);
    chipMovers.forEach(m => { m.x(0); m.y(0); });
  });

  const cursor = $(".cursor");
  const cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
  const cy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });
  addEventListener("mousemove", e => {
    cursor.classList.add("is-active");
    cx(e.clientX);
    cy(e.clientY);
  });
  document.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
  document.addEventListener("mouseover", e => {
    cursor.classList.toggle("is-hover", !!e.target.closest("a, button"));
  });

  $$(".magnetic").forEach(btn => {
    const mx = gsap.quickTo(btn, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const my = gsap.quickTo(btn, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    btn.addEventListener("mousemove", e => {
      const r = btn.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * 0.3);
      my((e.clientY - r.top - r.height / 2) * 0.3);
    });
    btn.addEventListener("mouseleave", () => { mx(0); my(0); });
  });
})();
