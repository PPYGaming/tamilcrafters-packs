#!/usr/bin/env python3
"""Build static pack pages, thumbnails and sitemap from packs.json + descriptions.json."""
import json, re, os, io, html, urllib.request
from PIL import Image, ImageSequence

BASE = "https://addons.tamilcraftersstudio.in"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

packs = json.load(open(P("packs.json"), encoding="utf-8"))
descs = json.load(open(P("descriptions.json"), encoding="utf-8"))
packjs = open(P("pack.js"), encoding="utf-8").read()
bedrock = dict(re.findall(r'"(\d+)":\s*"(https://[^"]+)"', packjs))
indexhtml = open(P("index.html"), encoding="utf-8").read()

# header (logo) and footer reused from the existing pages
pk = open(P("pack.html"), encoding="utf-8").read()
m = re.search(r'<header class="top">.*?</header>', pk, re.S)
header = m.group(0).replace('href="./"', 'href="/"')
m = re.search(r'<footer class="foot">.*?</footer>', indexhtml, re.S)
footer = m.group(0)
fonts = re.search(r'<link rel="preconnect" href="https://fonts.googleapis.com">.*?rel="stylesheet">', pk, re.S).group(0)

def slugify(t):
    s = re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")
    return s or "pack"

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=40).read()

def thumb(p):
    out = "img/%s.webp" % p["id"]
    if os.path.exists(P(out)):
        return out
    if not p.get("image"):
        return None
    try:
        im = Image.open(io.BytesIO(fetch(p["image"])))
        os.makedirs(P("img"), exist_ok=True)
        w = 400 if getattr(im, "is_animated", False) else 600
        def fit(f):
            f = f.convert("RGBA")
            r = min(1.0, w / f.width)
            return f.resize((max(1, int(f.width * r)), max(1, int(f.height * r))), Image.LANCZOS)
        if getattr(im, "is_animated", False):
            frames, durs = [], []
            for f in ImageSequence.Iterator(im):
                durs.append(f.info.get("duration", 80)); frames.append(fit(f))
            frames, durs = frames[::2] or frames, [d * 2 for d in durs[::2]] or durs
            frames[0].save(P(out), "WEBP", save_all=True, append_images=frames[1:], duration=durs, loop=0, quality=55, method=4)
            if os.path.getsize(P(out)) > 600000:
                fit(next(ImageSequence.Iterator(im))).save(P(out), "WEBP", quality=78, method=6)
        else:
            fit(im).save(P(out), "WEBP", quality=78, method=6)
        return out
    except Exception as e:
        print("thumb failed", p["id"], e)
        return None

seen = set()
for p in packs:
    s = slugify(p["title"])
    if s in seen:
        s = "%s-%s" % (s, p["id"])
    seen.add(s); p["slug"] = s
    t = thumb(p)
    if t: p["thumb"] = t
    else: p.pop("thumb", None)

e = html.escape
def page(p):
    k = str(p["id"])
    dl = (p["edition"] == "Bedrock" and bedrock.get(k)) or p["download"]
    url = "%s/packs/%s/" % (BASE, p["slug"])
    img = ("/" + p["thumb"]) if p.get("thumb") else p.get("image", "")
    ogimg = BASE + img if img.startswith("/") else img
    title = "%s - Free Minecraft %s %s | TamilCrafters" % (p["title"], p["edition"], p["type"].rstrip("s") if p["type"] != "Addons" else "Addon")
    summ = p["summary"]
    desc = re.sub(r"\s+", " ", summ)[:155]
    body = descs.get(k, "")
    body = re.sub(r"<img ", '<img loading="lazy" decoding="async" ', body)
    if not re.sub(r"<[^>]+>", "", body).strip() and "<img" not in body:
        body = "<p>%s</p>" % e(summ)
    ld = {"@context": "https://schema.org", "@type": "CreativeWork", "name": p["title"], "description": summ,
          "url": url, "image": ogimg, "author": {"@type": "Organization", "name": "TamilCrafters"},
          "isAccessibleForFree": True, "genre": "%s %s" % (p["edition"], p["type"])}
    imgtag = ('<img class="pk-img" src="%s" alt="%s" width="300" height="375" referrerpolicy="no-referrer" fetchpriority="high">' % (e(img), e(p["title"]))) if img else ""
    return """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%(title)s</title>
<meta name="description" content="%(desc)s">
<link rel="canonical" href="%(url)s">
<meta property="og:type" content="website">
<meta property="og:title" content="%(title)s">
<meta property="og:description" content="%(desc)s">
<meta property="og:image" content="%(ogimg)s">
<meta property="og:url" content="%(url)s">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="%(title)s">
<meta name="twitter:description" content="%(desc)s">
<meta name="twitter:image" content="%(ogimg)s">
<meta name="theme-color" content="#0a0e14">
%(fonts)s
<link rel="stylesheet" href="/style.css?v=9044f77">
<link rel="stylesheet" href="/pack.css?v=1">
<script type="application/ld+json">%(ld)s</script>
</head>
<body>
%(header)s
<main class="pk" id="pack">
<a class="pk-back" href="/">&larr; All packs</a>
<div class="pk-head">
%(imgtag)s
<div class="pk-meta">
<div class="tags">%(tags)s</div>
<h1 class="pk-title">%(h1)s</h1>
<p class="pk-sum">%(sum)s</p>
<div class="acts"><a class="btn solid" href="%(dl)s" target="_blank" rel="noopener noreferrer">Download</a></div>
</div>
</div>
<div class="pk-desc">%(body)s</div>
</main>
%(footer)s
</body>
</html>
""" % dict(title=e(title), desc=e(desc), url=url, ogimg=e(ogimg), fonts=fonts, ld=json.dumps(ld, ensure_ascii=False).replace("</", "<\\/"),
           header=header, imgtag=imgtag, tags=e((p["edition"] + " / " + p["type"]).upper()), h1=e(p["title"]),
           sum=e(summ), dl=e(dl), body=body, footer=footer)

for p in packs:
    d = P("packs", p["slug"]); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(page(p))

json.dump(packs, open(P("packs.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
urls = [BASE + "/"] + ["%s/packs/%s/" % (BASE, p["slug"]) for p in packs]
open(P("sitemap.xml"), "w", encoding="utf-8").write('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "".join("<url><loc>%s</loc></url>" % u for u in urls) + "</urlset>\n")

# --- patch app.js: use thumbnails and static detail pages (idempotent)
a = open(P("app.js"), encoding="utf-8").read()
a = a.replace("img.src = p.image;", "img.src = p.thumb || p.image; img.decoding = \"async\";") if "p.thumb" not in a else a
a = a.replace('det.href = "pack.html?id=" + encodeURIComponent(p.id);', 'det.href = p.slug ? "packs/" + p.slug + "/" : "pack.html?id=" + encodeURIComponent(p.id);')
open(P("app.js"), "w", encoding="utf-8").write(a)

# --- patch pack.html: old ?id= URLs redirect to the static page (idempotent)
if "data-legacy-redirect" not in pk:
    snip = ('<script data-legacy-redirect>(function(){var i=new URLSearchParams(location.search).get("id");if(!i)return;'
            'fetch("packs.json").then(function(r){return r.json()}).then(function(d){var p=d.filter(function(x){return String(x.id)===i})[0];'
            'if(p&&p.slug)location.replace("/packs/"+p.slug+"/")}).catch(function(){})})();</script>')
    pk = pk.replace("</head>", snip + "\n</head>", 1)
    pk = pk.replace('<meta name="description"', '<meta name="robots" content="noindex,follow">\n<meta name="description"', 1)
    open(P("pack.html"), "w", encoding="utf-8").write(pk)
print("ok", len(packs), "pages")
