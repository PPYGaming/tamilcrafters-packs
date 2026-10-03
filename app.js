(function () {
  "use strict";
  var packs = [], state = {q: "", type: "All", edition: "All", sort: "popular"};
  var $ = function (id) { return document.getElementById(id); };
  var TYPES = ["All", "Addons", "Scripts", "Texture Packs", "Resource Packs"];
  var EDS = ["All", "Bedrock", "Java"];
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, {rootMargin: "0px 0px -30px 0px"}) : null;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function link(cls, text, href) {
    var a = el("a", cls, text);
    a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer";
    return a;
  }
  function initials(t) {
    return t.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("");
  }
  function image(p, w, h) {
    if (!p.image) return el("div", "ph", initials(p.title));
    var img = new Image();
    img.alt = p.title; img.loading = "lazy"; img.width = w; img.height = h;
    img.referrerPolicy = "no-referrer";
    img.onerror = function () { img.replaceWith(el("div", "ph", initials(p.title))); };
    img.src = p.image;
    return img;
  }
  function tags(p) { return (p.edition + " / " + p.type).toUpperCase(); }
  function acts(p) {
    var a = el("div", "acts");
    a.appendChild(link("btn solid", "Download", p.download));
    a.appendChild(link("btn ghost", "Details", p.page));
    return a;
  }
  function tile(p, i) {
    var t = el("article", "tile");
    t.style.transitionDelay = Math.min(i % 6, 5) * 60 + "ms";
    var pic = el("button", "pic"); pic.type = "button";
    pic.setAttribute("aria-label", "Open " + p.title);
    pic.appendChild(image(p, 300, 375));
    var cap = el("div", "cap");
    cap.appendChild(el("div", "tags", tags(p)));
    cap.appendChild(el("h3", "name", p.title));
    pic.appendChild(cap);
    pic.addEventListener("click", function () { openDialog(p); });
    var more = el("div", "more");
    more.appendChild(el("p", "sum", p.summary));
    more.appendChild(acts(p));
    t.appendChild(pic); t.appendChild(more);
    if (io && !reduce) io.observe(t); else t.classList.add("in");
    return t;
  }
  function openDialog(p) {
    var d = $("dlg"), b = $("dlgBody");
    b.textContent = "";
    b.appendChild(image(p, 720, 405));
    var x = el("div", "dbody");
    x.appendChild(el("div", "tags", tags(p)));
    var h = el("h2", "", p.title); h.id = "dlgTitle";
    x.appendChild(h);
    x.appendChild(el("p", "", p.summary));
    x.appendChild(acts(p));
    x.appendChild(el("p", "note", "Downloads are served by CurseForge so your support counts there too."));
    b.appendChild(x);
    if (d.showModal) d.showModal(); else d.setAttribute("open", "");
  }
  function chips(box, list, key) {
    box.textContent = "";
    list.forEach(function (v) {
      var b = el("button", "chip", v); b.type = "button";
      b.setAttribute("aria-pressed", String(state[key] === v));
      b.addEventListener("click", function () { state[key] = v; sync(); render(); });
      box.appendChild(b);
    });
  }
  function filtered() {
    var q = state.q.trim().toLowerCase();
    var l = packs.filter(function (p) {
      if (state.type !== "All" && p.type !== state.type) return false;
      if (state.edition !== "All" && p.edition !== state.edition) return false;
      return !q || (p.title + " " + p.summary).toLowerCase().indexOf(q) > -1;
    });
    if (state.sort === "az") l.sort(function (a, b) { return a.title.localeCompare(b.title); });
    else if (state.sort === "new") l.sort(function (a, b) { return b.id - a.id; });
    return l;
  }
  function sync() {
    var u = new URLSearchParams();
    if (state.q) u.set("q", state.q);
    if (state.type !== "All") u.set("type", state.type);
    if (state.edition !== "All") u.set("edition", state.edition);
    if (state.sort !== "popular") u.set("sort", state.sort);
    var s = u.toString();
    history.replaceState(null, "", location.pathname + (s ? "?" + s : ""));
  }
  function render() {
    chips($("typeChips"), TYPES, "type");
    chips($("editionChips"), EDS, "edition");
    var l = filtered(), g = $("grid"), f = document.createDocumentFragment();
    l.forEach(function (p, i) { f.appendChild(tile(p, i)); });
    g.textContent = ""; g.appendChild(f);
    $("empty").hidden = l.length > 0;
  }
  function jsonld() {
    var data = {"@context": "https://schema.org", "@type": "ItemList", itemListElement: packs.slice(0, 12).map(function (p, i) {
      return {"@type": "ListItem", position: i + 1, name: p.title, url: p.page};
    })};
    var s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }
  function load() {
    $("error").hidden = true;
    fetch("packs.json").then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (d) { packs = d; jsonld(); render(); })
      .catch(function () { $("error").hidden = false; });
  }
  (function init() {
    var u = new URLSearchParams(location.search);
    state.q = u.get("q") || "";
    if (TYPES.indexOf(u.get("type")) > -1) state.type = u.get("type");
    if (EDS.indexOf(u.get("edition")) > -1) state.edition = u.get("edition");
    var so = u.get("sort");
    if (["popular", "az", "new"].indexOf(so) > -1) state.sort = so;
    $("q").value = state.q; $("sort").value = state.sort;
    var t;
    $("q").addEventListener("input", function (e) {
      clearTimeout(t);
      t = setTimeout(function () { state.q = e.target.value; sync(); render(); }, 150);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); $("q").focus(); }
    });
    $("sort").addEventListener("change", function (e) { state.sort = e.target.value; sync(); render(); });
    $("retry").addEventListener("click", load);
    $("dlgClose").addEventListener("click", function () { $("dlg").close(); });
    $("dlg").addEventListener("click", function (e) { if (e.target === $("dlg")) $("dlg").close(); });
    load();
  })();
})();
