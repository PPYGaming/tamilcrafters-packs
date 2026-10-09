(function () {
  "use strict";
  var packs = [], state = {q: "", type: "All", edition: "All", sort: "popular"};
  var $ = function (id) { return document.getElementById(id); };
  var TYPES = ["All", "Addons", "Scripts", "Texture Packs", "Resource Packs"];
  var EDS = ["All", "Bedrock", "Java"];
  var BEDROCK_DOWNLOADS = {
    "1722499": "https://link-center.net/1306936/liroGv8zP6wO",
    "1605369": "https://direct-link.net/1306936/pcH1qZpfC5DV",
    "1327955": "https://link-hub.net/1306936/V8tFLG7XS57t",
    "1590752": "https://direct-link.net/1306936/DKJuWFgM61Mh",
    "1417320": "https://direct-link.net/1306936/WEeR3Uo0Gjm1",
    "1409467": "https://direct-link.net/1306936/LeYhYODWQXx4",
    "1549363": "https://link-target.net/1306936/jW2wB6LruhAv",
    "1544783": "https://link-target.net/1306936/OLXMiOtH5CGs",
    "1538496": "https://link-center.net/1306936/78NvfBVDBe3j",
    "1557282": "https://direct-link.net/1306936/1FtOeG5pfnpl",
    "1619355": "https://direct-link.net/1306936/fuKQGapnj9TK",
    "1599255": "https://direct-link.net/1306936/3Y3KocPcSnNK",
    "1559380": "https://link-target.net/1306936/SvItuUAobo2P",
    "1563915": "https://link-target.net/1306936/XTNbIXJRwfuF",
    "1618793": "https://direct-link.net/1306936/iUn2CNfPGjfL",
    "1611119": "https://link-center.net/1306936/lwckAkovWBLJ",
    "1569855": "https://link-hub.net/1306936/PalkicSyypg7",
    "1623433": "https://link-center.net/1306936/bip54K0ZqtVY",
    "1560730": "https://link-center.net/1306936/n7s9wFGZcimy",
    "1608444": "https://direct-link.net/1306936/pV9Kdx302rQH",
    "1573996": "https://link-center.net/1306936/vj1AYoJ7QZ63",
    "1631316": "https://link-hub.net/1306936/LAzw2GAaB19l",
    "1707305": "https://link-center.net/1306936/AXnzjHA73lPy",
    "1622963": "https://link-hub.net/1306936/fJgue5Z7UrrU",
    "1616338": "https://direct-link.net/1306936/BNY9D3ko5Zb4",
    "1615318": "https://direct-link.net/1306936/TR9OGN5wd4bu",

    "1634524": "https://link-center.net/1306936/anvzg63RSe6h",
    "1538973": "https://direct-link.net/1306936/YRBEKwmmZVvW",
    "1620188": "https://link-hub.net/1306936/rF9VSLCeKt0z",
    "1594024": "https://link-target.net/1306936/KRSiRiMfMh0I",
    "1563374": "https://direct-link.net/1306936/pzqCWKfQqzTd",
    "1610105": "https://link-center.net/1306936/CTasDvbrbDUR",
    "1663846": "https://link-hub.net/1306936/1pUIk1Ps8mQc",
    "1587552": "https://link-hub.net/1306936/pHci2itJ6oJd",
    "1574492": "https://direct-link.net/1306936/SzEbxkttzZ24",
    "1555720": "https://link-target.net/1306936/iBzH4nNQjGpJ",
    "1683251": "https://link-target.net/1306936/ehfBO0JQG3cx",
    "1679379": "https://link-target.net/1306936/8rw1qMxa04Ku",
    "1655024": "https://link-hub.net/1306936/1BZrHcqClUIT",
    "1721937": "https://link-hub.net/1306936/KNS0Ef5XdaZP",
    "1613999": "https://link-hub.net/1306936/cIDGv1IOzHdX",
    "1730717": "https://link-target.net/1306936/NTjlTAVi2qds"
  };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, {rootMargin: "0px 0px -30px 0px"}) : null;

  /* Sidebar state: railOpen = desktop expanded, drawerOpen = mobile drawer */
  var side = $("sidebar"), scrim = $("scrim"), toggle = $("sideToggle"), menuBtn = $("menuOpen");
  var mq = window.matchMedia ? matchMedia("(max-width: 900px)") : null;
  var railOpen = false, drawerOpen = false, opener = null;

  function mobile() { return !!mq && mq.matches; }
  function applySide() {
    var m = mobile(), ex = m ? drawerOpen : railOpen;
    side.classList.toggle("open", ex);
    scrim.classList.toggle("show", m && drawerOpen);
    toggle.setAttribute("aria-expanded", String(railOpen));

    toggle.setAttribute("data-tip", railOpen ? "Collapse" : "Expand");
    menuBtn.setAttribute("aria-expanded", String(drawerOpen));
    if (m && !drawerOpen) side.setAttribute("inert", ""); else side.removeAttribute("inert");
    [].forEach.call(side.querySelectorAll(".rb"), function (b) {
      b.disabled = ex;
      if (ex) b.setAttribute("aria-hidden", "true"); else b.removeAttribute("aria-hidden");
    });
  }
  function openSide(target) {
    if (mobile()) {
      if (!drawerOpen) {
        var a = document.activeElement;
        opener = a && a !== document.body ? a : menuBtn;
        drawerOpen = true;
      }
    } else railOpen = true;
    applySide();
    if (target) target.focus({preventScroll: true});
  }
  function closeDrawer() {
    if (!drawerOpen) return;
    drawerOpen = false;
    applySide();
    var o = opener && document.body.contains(opener) ? opener : menuBtn;
    opener = null;
    o.focus({preventScroll: true});
  }
  function focusTarget(k) {
    var t;
    if (k === "q") t = $("q");
    else if (k === "sort") t = $("sort");
    else {

      var b = $(k === "type" ? "typeChips" : "editionChips");
      t = b.querySelector("[aria-pressed=true]") || b.querySelector("button");
    }
    if (t) t.focus({preventScroll: true});
  }
  /* Gold dot on rail icons whose filter is active */
  function marks() {
    var on = {q: !!state.q, type: state.type !== "All", edition: state.edition !== "All", sort: state.sort !== "popular"};
    [].forEach.call(document.querySelectorAll(".rb"), function (b) {
      var a = on[b.getAttribute("data-for")];
      b.classList.toggle("on", a);
      b.setAttribute("aria-label", b.getAttribute("data-label") + (a ? " (active)" : ""));
    });
  }

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
  function downloadUrl(p) {
    var k = String(p.id);
    if (p.edition === "Bedrock" && Object.prototype.hasOwnProperty.call(BEDROCK_DOWNLOADS, k)) {
      return BEDROCK_DOWNLOADS[k];
    }
    return p.download;
  }
  function acts(p) {
    var a = el("div", "acts");
    a.appendChild(link("btn solid", "Download", downloadUrl(p)));
    var det = el("a", "btn ghost", "Details");
    det.href = "pack.html?id=" + encodeURIComponent(p.id);
    a.appendChild(det);
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
    x.appendChild(el("p", "note", "Bedrock Download opens Linkvertise before CurseForge. Java Download goes directly to CurseForge."));
    b.appendChild(x);
    if (d.showModal) d.showModal(); else d.setAttribute("open", "");
  }
  function chips(box, list, key) {
    box.textContent = "";
    list.forEach(function (v) {
      var b = el("button", "chip", v); b.type = "button";
      b.setAttribute("aria-pressed", String(state[key] === v));
      b.addEventListener("click", function () {
        state[key] = v; sync(); render();
        var n = box.children[list.indexOf(v)];
        if (n) n.focus({preventScroll: true});
      });
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
    marks();
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
    chips($("typeChips"), TYPES, "type");
    chips($("editionChips"), EDS, "edition");
    marks();
    applySide();

    var t;
    $("q").addEventListener("input", function (e) {
      clearTimeout(t);
      t = setTimeout(function () { state.q = e.target.value; sync(); render(); }, 150);
    });
    document.addEventListener("keydown", function (e) {

      var a = document.activeElement, tn = a ? a.tagName : "";
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey &&
          !/INPUT|TEXTAREA|SELECT/.test(tn) && !(a && a.isContentEditable) && !$("dlg").open) {
        e.preventDefault(); openSide($("q"));
      } else if (e.key === "Escape" && drawerOpen && !$("dlg").open) {
        closeDrawer();
      }
    });
    $("sort").addEventListener("change", function (e) { state.sort = e.target.value; sync(); render(); });

    toggle.addEventListener("click", function () { railOpen = !railOpen; applySide(); });
    menuBtn.addEventListener("click", function () { if (drawerOpen) closeDrawer(); else openSide($("sideClose")); });
    $("sideClose").addEventListener("click", closeDrawer);
    scrim.addEventListener("click", closeDrawer);
    [].forEach.call(side.querySelectorAll(".rb"), function (b) {
      b.addEventListener("click", function () { openSide(); focusTarget(b.getAttribute("data-for")); });
    });
    var onMq = function () { if (!mobile()) drawerOpen = false; applySide(); };
    if (mq) { if (mq.addEventListener) mq.addEventListener("change", onMq); else if (mq.addListener) mq.addListener(onMq); }

    $("retry").addEventListener("click", load);
    $("dlgClose").addEventListener("click", function () { $("dlg").close(); });
    $("dlg").addEventListener("click", function (e) { if (e.target === $("dlg")) $("dlg").close(); });
    load();
  })();
})();
