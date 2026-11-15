"""SEO del sito ufficiale. Nessun dato commerciale o recensione inventati."""
from html import escape
import json
from xml.etree import ElementTree as ET

SITE = "https://www.imballaggi2g.it"
MAP = "https://www.google.com/maps/place/IMBALLAGGI+2G+s.r.l./@40.0911849,18.0653234,17z/data=!3m1!4b1!4m6!3m5!1s0x13441f7b57c7b16f:0xfc850e22ba05aec7!8m2!3d40.0911849!4d18.0678983!16s%2Fg%2F11jyjc4qhs"
# Immagini aziendali reali, già presenti nelle rispettive pagine.
IMAGES = {
    None: ("azienda/sede-sera-frontale.webp", "La sede di Imballaggi 2G a Sannicola"),
    "azienda": ("azienda/sede-sera-frontale.webp", "La sede di Imballaggi 2G a Sannicola"),
    "contatti": ("azienda/sede-sera-frontale.webp", "La sede di Imballaggi 2G a Sannicola"),
    "coprispalla": ("azienda/coprispalla-linea.webp", "Produzione di coprispalla protettivi"),
    "bobine": ("azienda/bobine-magazzino.webp", "Bobine per imballaggio in magazzino"),
    "protezioni": ("azienda/bobine-pluriball.webp", "Bobine di pluriball per imballaggio"),
    "buste": ("azienda/fogli-uscita.webp", "Lavorazione dei materiali protettivi"),
    "macchine": ("azienda/macchina-2g.webp", "Macchina per imballaggio Imballaggi 2G"),
    "sostenibilita": ("azienda/nastro-psv.webp", "Marchio Plastica Seconda Vita sui materiali"),
}


def canonical(key):
    return SITE + (f"/{key}.html" if key else "/")


def metadata(key, title, description):
    url = canonical(key)
    image, image_alt = IMAGES[key]
    image = SITE + "/assets/" + image
    business = {
        "@type": "LocalBusiness", "@id": SITE + "/#azienda",
        "name": "Imballaggi 2G", "legalName": "Imballaggi 2G S.r.l.",
        "url": SITE + "/", "logo": SITE + "/assets/logo-ink.webp",
        "image": SITE + "/assets/azienda/sede-sera-frontale.webp",
        "telephone": "+390833861000", "email": "info@imballaggi2g.it",
        "address": {"@type": "PostalAddress", "streetAddress": "Via dei Cavamonti, Zona Industriale",
                    "addressLocality": "Sannicola", "addressRegion": "LE",
                    "postalCode": "73017", "addressCountry": "IT"},
        "geo": {"@type": "GeoCoordinates", "latitude": 40.0911849, "longitude": 18.0678983},
        "sameAs": ["https://www.instagram.com/imballaggi2g/"],
        "hasMap": MAP,
        "areaServed": [{"@type": "AdministrativeArea", "name": "Provincia di " + city}
                       for city in ("Lecce", "Brindisi", "Taranto")],
    }
    graph = [business, {
        "@type": "WebSite", "@id": SITE + "/#website", "url": SITE + "/",
        "name": "Imballaggi 2G", "inLanguage": "it-IT", "publisher": {"@id": business["@id"]},
    }, {
        "@type": "ContactPage" if key == "contatti" else "AboutPage" if key == "azienda" else "WebPage",
        "@id": url + "#webpage", "url": url, "name": title, "description": description,
        "inLanguage": "it-IT", "isPartOf": {"@id": SITE + "/#website"},
        "about": {"@id": business["@id"]}, "primaryImageOfPage": {"@type": "ImageObject", "url": image},
    }]
    data = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False).replace("<", "\\u003c")
    tags = [f'<link rel="canonical" href="{url}">',
            '<meta name="robots" content="index, follow, max-image-preview:large">',
            '<meta property="og:type" content="website">',
            '<meta property="og:locale" content="it_IT">',
            '<meta property="og:site_name" content="Imballaggi 2G">']
    for name, value in [("og:title", title), ("og:description", description), ("og:url", url),
                        ("og:image", image), ("og:image:alt", image_alt)]:
        tags.append(f'<meta property="{name}" content="{escape(value, quote=True)}">')
    for name, value in [("twitter:card", "summary_large_image"), ("twitter:title", title),
                        ("twitter:description", description), ("twitter:image", image), ("twitter:image:alt", image_alt)]:
        tags.append(f'<meta name="{name}" content="{escape(value, quote=True)}">')
    return "\n".join(tags) + f'\n<script type="application/ld+json">{data}</script>'


def write_crawl_files(dist, pages):
    # Non falsifichiamo lastmod a ogni build: omesso finché non esiste un registro editoriale.
    namespace = "http://www.sitemaps.org/schemas/sitemap/0.9"
    ET.register_namespace("", namespace)
    root = ET.Element(f"{{{namespace}}}urlset")
    for key, *_ in pages:
        item = ET.SubElement(root, f"{{{namespace}}}url")
        ET.SubElement(item, f"{{{namespace}}}loc").text = canonical(key)
    ET.indent(root)
    ET.ElementTree(root).write(dist / "sitemap.xml", encoding="utf-8", xml_declaration=True)
    (dist / "robots.txt").write_text(
        "User-agent: *\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\n"
        "Disallow: /vecchio_sito/\n\nSitemap: " + SITE + "/sitemap.xml\n", encoding="utf-8")
