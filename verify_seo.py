"""Controlli sul sito generato, da eseguire prima di preparare lo ZIP Aruba."""
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import urlsplit, unquote
from xml.etree import ElementTree as ET
from seo import SITE
from build import PAGES

DIST = Path(__file__).resolve().parent / "dist"


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags, self.ids, self.jsonld = [], set(), []
        self.in_json, self.buffer = False, ""
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags.append((tag, a))
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "script" and a.get("type") == "application/ld+json":
            self.in_json, self.buffer = True, ""

    def handle_data(self, data):
        if self.in_json:
            self.buffer += data

    def handle_endtag(self, tag):
        if tag == "script" and self.in_json:
            self.jsonld.append(json.loads(self.buffer))
            self.in_json = False


def verify():
    # I futuri file HTML di verifica Google non sono pagine editoriali.
    pages = {name: Page((DIST / name).read_text()) for _, name, *_ in PAGES}
    errors, descriptions, canonicals = [], [], []
    for name, page in pages.items():
        def check(condition, message):
            if not condition:
                errors.append(f"{name}: {message}")
        check(sum(t == "h1" for t, _ in page.tags) == 1, "deve esserci un solo H1")
        check(any(t == "html" and a.get("lang") == "it" for t, a in page.tags), "lingua italiana assente")
        expected = SITE + ("/" if name == "index.html" else "/" + name)
        canonical = [a.get("href") for t, a in page.tags if t == "link" and a.get("rel") == "canonical"]
        check(canonical == [expected], "canonical errato o duplicato")
        canonicals.extend(canonical)
        metas = {a.get("name", a.get("property")): a.get("content", "") for t, a in page.tags if t == "meta"}
        descriptions.append(metas.get("description"))
        check(bool(metas.get("description")), "descrizione assente")
        check(metas.get("og:url") == expected, "Open Graph non coerente con canonical")
        check("noindex" not in metas.get("robots", ""), "noindex nel pacchetto ufficiale")
        check(bool(page.jsonld), "dati strutturati assenti")
        for data in page.jsonld:
            check(data.get("@context") == "https://schema.org", "contesto JSON-LD errato")
            graph = data.get("@graph", [])
            business = next((n for n in graph if n.get("@type") == "LocalBusiness"), {})
            check(business.get("telephone") == "+390833861000", "telefono non coerente")
            check(business.get("address", {}).get("addressLocality") == "Sannicola", "sede non coerente")
            check(not any(k in json.dumps(graph) for k in ["aggregateRating", "priceRange", "openingHours"]), "dati non confermati nel JSON-LD")
        for tag, attrs in page.tags:
            for attr in (["href"] if tag in ("a", "link") else ["src"] if tag in ("img", "script", "video", "source") else []):
                value = attrs.get(attr)
                if not value:
                    continue
                url = urlsplit(value)
                if url.scheme or url.netloc:
                    continue
                path = unquote(url.path)
                target = DIST / (path.lstrip("/") if path else name)
                if target.is_dir():
                    target /= "index.html"
                check(target.is_file(), f"file locale mancante: {value}")
                if url.fragment and target.name in pages:
                    check(unquote(url.fragment) in pages[target.name].ids, f"ancora mancante: {value}")
            if tag == "img":
                check("alt" in attrs, "immagine priva di attributo alt")
    assert len(set(descriptions)) == len(pages), "Descrizioni duplicate"
    locations = [x.text for x in ET.parse(DIST / "sitemap.xml").findall(".//{*}loc")]
    assert sorted(locations) == sorted(canonicals), "Sitemap non coerente con le pagine canoniche"
    robots = (DIST / "robots.txt").read_text()
    assert "Disallow: /\n" not in robots and SITE + "/sitemap.xml" in robots, "robots.txt non valido"
    for p in DIST.iterdir():
        assert not (p.name.startswith("wp-") or p.name in {"index.php", ".user.ini", "readme.html", "license.txt", "vecchio_sito"}), f"Nome riservato Aruba: {p.name}"
    # Dopo il reset, .htaccess contiene esclusivamente i redirect del sito statico.
    from server_redirects import apache_rules, REDIRECTS
    assert (DIST / ".htaccess").read_text() == apache_rules(), "Configurazione redirect non coerente"
    for source, target in REDIRECTS.items():
        url = urlsplit(target)
        assert url.netloc == "www.imballaggi2g.it", f"Dominio inatteso: {source}"
        name = url.path.lstrip("/") or "index.html"
        assert name in pages, f"Destinazione inesistente: {source}"
        assert not url.fragment or url.fragment in pages[name].ids, f"Ancora inesistente: {source}"
    if errors:
        raise AssertionError("\n".join(errors))
    print(f"OK: {len(pages)} pagine; H1, canonical, JSON-LD, sitemap, robots, risorse e ancore locali verificati.")


if __name__ == "__main__":
    verify()
