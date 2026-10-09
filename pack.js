(function () {
  "use strict";
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
  var $ = function (id) { return document.getElementById(id); };
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  var id = new URLSearchParams(location.search).get("id");
  var root = $("pack");
  function fail() {
    root.textContent = "";
    root.appendChild(el("p", "pk-miss", "Pack not found."));
    var a = el("a", "btn ghost", "Back to all packs"); a.href = "./"; root.appendChild(a);
  }
  Promise.all([
    fetch("packs.json").then(function (r) { return r.json(); }),
    fetch("descriptions.json").then(function (r) { return r.json(); })
  ]).then(function (res) {
    var p = res[0].filter(function (x) { return String(x.id) === String(id); })[0];
    if (!p) return fail();
    document.title = p.title + " - TamilCrafters Packs";
    var k = String(p.id);
    var dl = (p.edition === "Bedrock" && BEDROCK_DOWNLOADS[k]) || p.download;
    root.textContent = "";
    var a = el("a", "pk-back", "\u2190 All packs"); a.href = "./"; root.appendChild(a);
    var head = el("div", "pk-head");
    if (p.image) {
      var img = new Image(); img.alt = p.title; img.width = 300; img.height = 375;
      img.referrerPolicy = "no-referrer"; img.src = p.image; img.className = "pk-img";
      img.onerror = function () { img.remove(); };
      head.appendChild(img);
    }
    var side = el("div", "pk-meta");
    side.appendChild(el("div", "tags", (p.edition + " / " + p.type).toUpperCase()));
    side.appendChild(el("h1", "pk-title", p.title));
    side.appendChild(el("p", "pk-sum", p.summary));
    var acts = el("div", "acts");
    var d = el("a", "btn solid", "Download"); d.href = dl; d.target = "_blank"; d.rel = "noopener noreferrer";
    acts.appendChild(d); side.appendChild(acts);
    head.appendChild(side); root.appendChild(head);
    var body = el("div", "pk-desc");
    body.innerHTML = res[1][k] || "";
    if (!body.textContent.trim() && !body.querySelector("img")) body.appendChild(el("p", "", p.summary));
    root.appendChild(body);
  }).catch(fail);
})();
