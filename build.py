#!/usr/bin/env python3
"""
Generatore delle pagine di Imballaggi 2G.

Ogni sezione del sito e' una pagina a se'. Questo script tiene allineati
header, menu, piede e collegamenti fra le pagine: si modifica il contenuto
qui dentro e si rigenera tutto con `python3 build.py`.

I file prodotti finiscono in dist/ e sono HTML statico normale: si possono
anche modificare a mano, ma poi la parte comune va risincronizzata.
"""

from pathlib import Path
from html import escape
from seo import metadata, write_crawl_files
from server_redirects import apache_rules
from brochure_sections import enrich
from section_motion import section_motion
from logo_evolution import EVOLUTION_DISC, EVOLUTION_G, EVOLUTION_TAIL, EVOLUTION_TWO
from photo_blocks import with_photos, HOME_BAND

DIST = Path(__file__).parent / "dist"
VERSION = "108"           # alzare a ogni pubblicazione: sblocca la cache di CSS e JS

# ---------------------------------------------------------------- sezioni
# chiave, file, numero, nome nel menu, occhiello, immagine di copertina
SECTIONS = [
    ("coprispalla",  "coprispalla.html",  "01", "Coprispalla",        "ABBIGLIAMENTO",            "azienda/coprispalla-barre.webp"),
    ("bobine",       "bobine.html",       "02", "Bobine e film",      "CONFEZIONAMENTO",          "azienda/bobine-magazzino.webp"),
    ("protezioni",   "protezioni.html",   "03", "Protezioni",         "PLURIBALL E FOAM",         "azienda/magazzino-pluriball.webp"),
    ("buste",        "buste.html",        "04", "Buste",              "CONFEZIONAMENTO",          "azienda/macchina-bobine.webp"),
    ("macchine",     "macchine.html",     "05", "Macchine",           "PARTNER NOXON","azienda/macchina-rulli.webp"),
    ("sostenibilita","sostenibilita.html","06", "Sostenibilità",      "PLASTICA SECONDA VITA",    None),
    ("azienda",      "azienda.html",      "07", "L’azienda",          "RADICI SALENTINE",         "azienda/sede-sera-frontale.webp"),
    ("contatti",     "contatti.html",     "08", "Contatti",           "PARLIAMONE",               None),
]
BY_KEY = {s[0]: s for s in SECTIONS}
ORDER = [s[0] for s in SECTIONS]


# fotografia mostrata nell'anteprima del menu, una per sezione
MENU_IMG = {
    "coprispalla": "azienda/coprispalla-linea.webp",
    "bobine": "azienda/bobina-macchina.webp",
    "protezioni": "azienda/bobine-pluriball.webp",
    "buste": "azienda/fogli-uscita.webp",
    "macchine": "noxon/gamma-noxon-v107.jpg",
    "sostenibilita": "azienda/nastro-psv.webp",
    "azienda": "azienda/sede-sera-prospettiva.webp",
    "contatti": "logo-light.webp",
    "home": "azienda/reparto-produzione.webp",
}


# voci del menu: la pagina iniziale in testa, poi le sezioni nell'ordine del sito
HOME_ITEM = ("home", "index.html", "00", "Home", "PAGINA INIZIALE", None)
MENU_ITEMS = [HOME_ITEM] + SECTIONS


def menu_links(current):
    out = []
    for i, (key, href, num, label, eyebrow, _img) in enumerate(MENU_ITEMS):
        here = key == (current or "home")
        cls = "is-current" if here else ""
        cur = ' aria-current="page"' if here else ""
        out.append(
            f'      <a href="{href}" class="{cls}"{cur} style="--i:{i}" data-key="{i}" data-label="{label}">'
            f'<span>{label}</span><small>{eyebrow.title()}</small></a>'
        )
    return "\n".join(out)


def header_where(current):
    """Segnaposto editoriale al centro della testata: numero e nome della sezione."""
    if current not in BY_KEY:
        return '<span class="header-where" aria-hidden="true"></span>'
    _k, _href, num, label, _e, _i = BY_KEY[current]
    return f'<span class="header-where" aria-hidden="true"><b>{num}</b><i></i>{label}</span>'


def menu_preview():
    imgs = "\n".join(
        f'      <img data-src="assets/{MENU_IMG[s[0]]}" alt="" width="1500" height="1000" data-cap="{s[3]}">'
        for s in MENU_ITEMS
    )
    return f"""<figure class="menu-preview" aria-hidden="true">
{imgs}
      <figcaption><span id="menu-cap"></span></figcaption>
    </figure>"""


def next_section(current):
    if current is None or current not in ORDER:
        return BY_KEY["coprispalla"]
    i = ORDER.index(current)
    return BY_KEY[ORDER[(i + 1) % len(ORDER)]]


def page_footer(current):
    nxt = next_section(current)
    onward = ""
    if current is not None:
        onward = f"""
  <a class="onward" href="{nxt[1]}">
    <span class="onward-name">{nxt[3]}</span>
    <span class="onward-arrow" aria-hidden="true">→</span>
  </a>"""
    replay = '<button class="replay" type="button">Rivedi l’intro ↻</button>' if current is None else '<a href="index.html">Torna all’indice</a>'
    return f"""{onward}
<footer class="site-footer" id="site-footer">
  <a href="index.html" class="footer-brand" aria-label="Imballaggi 2G, pagina iniziale"><img src="assets/logo-light.webp" alt="Imballaggi 2G" width="240" height="69"></a>
  <p>&copy; <span id="year">2026</span> Imballaggi 2G S.r.l. &middot; Via dei Cavamonti, Z.I. &middot; 73017 Sannicola (LE)</p>
  <a href="https://www.instagram.com/imballaggi2g/" target="_blank" rel="noopener">Instagram</a>
  <div class="footer-credit">
    <a class="footer-credit-label" href="https://www.instagram.com/dimana.digitalcreations/" target="_blank" rel="noopener">Sito creato da Dimana</a>
    <a class="dm-chip" href="https://www.instagram.com/dimana.digitalcreations/" target="_blank" rel="noopener" aria-label="Dimana · Digital Creations (Instagram)" data-dm-chip>
      <span class="dm-chip__tilt">
        <span class="dm-chip__face">
          <span class="dm-chip__die" aria-hidden="true"></span>
          <span class="dm-chip__mark"><img class="dm-chip__logo" src="assets/dimana-logo-v106.svg" width="524" height="266" alt="Dimana, digital creations" loading="lazy"></span>
        </span>
        <span class="dm-chip__spark" aria-hidden="true"></span>
        <span class="dm-chip__spark" aria-hidden="true"></span>
      </span>
      <span class="dm-chip__zones" aria-hidden="true">{"<i class='dm-chip__zone'></i>" * 25}</span>
    </a>
    <a class="footer-credit-cta" href="https://www.instagram.com/dimana.digitalcreations/" target="_blank" rel="noopener">Clicca qui per conoscerci meglio</a>
  </div>
  {replay}
</footer>"""


def shell(current, title, description, body, body_class=""):
    entry = ""
    if current:
        section = BY_KEY[current]
        entry = f'''<div class="section-entry entry-minimal entry-{current}" data-scene="{current}" aria-hidden="true">
          <div class="section-signature">
            <img class="section-logo" src="assets/logo-ink.webp" width="1200" height="344" alt="">
            <div class="section-object">{section_motion(current)}</div>
          </div>
        </div>'''
    cls = f' class="{body_class}" data-page="{current or "home"}"'

    return f"""<!doctype html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>{escape(title)}</title>
<meta name="description" content="{escape(description, quote=True)}">
{metadata(current, title, description)}
<meta name="theme-color" content="#121615">
<link rel="icon" href="assets/mark-ink.webp">
<link rel="preload" href="assets/manrope-regular.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="style.css?v={VERSION}">
<script src="app.js?v={VERSION}" defer></script>
{'<script type="module" src="reel-opening.js?v='+VERSION+'"></script>' if current == 'bobine' else ''}
{'<script type="module" src="bag-3d.js?v='+VERSION+'"></script>' if current == 'buste' else ''}
{'<script type="module" src="bubble-3d.js?v='+VERSION+'"></script>' if current == 'protezioni' else ''}
{'<script type="module" src="shoulder-3d.js?v='+VERSION+'"></script><script src="shoulder-variants.js?v='+VERSION+'" defer></script><script src="shoulder-mobile.js?v='+VERSION+'" defer></script>' if current == 'coprispalla' else ''}
</head>
<body{cls}>
<a class="skip" href="#main">Vai ai contenuti</a>
<div class="grain" aria-hidden="true"></div>
<div class="scroll-progress" aria-hidden="true"><span></span></div>
{entry}
<header class="header" id="header">
  <a class="brand" href="index.html" aria-label="Imballaggi 2G, pagina iniziale">
    <img class="brand-dark" src="assets/logo-ink.webp" width="260" height="75" alt="Imballaggi 2G — Keep it safe">
    <img class="brand-light" src="assets/logo-light.webp" width="260" height="75" alt="" aria-hidden="true">
  </a>
  {header_where(current)}
  <div class="header-actions">
    <a class="pill" href="contatti.html">Parliamone <span aria-hidden="true">→</span></a>
    <button class="burger" type="button" aria-label="Apri il menu" aria-expanded="false" aria-controls="menu">
      <span class="burger-box" aria-hidden="true"><span></span><span></span><span></span></span>
      <span class="burger-label" aria-hidden="true">Menu</span>
    </button>
  </div>
</header>

<div class="menu" id="menu" aria-label="Menu principale" aria-hidden="true">
  <div class="menu-bg" aria-hidden="true">{"".join(f'<b style="--c:{n}"></b>' for n in range(8))}<i class="menu-glow"></i></div>
  <div class="menu-inner">
    <nav class="menu-nav" aria-label="Sezioni del sito">
{menu_links(current)}
    </nav>
    <div class="menu-side">
      {menu_preview()}
      <div class="menu-contacts">
      <div class="menu-block" style="--i:0"><span>Scrivici</span><a href="mailto:info@imballaggi2g.it">info@imballaggi2g.it</a></div>
      <div class="menu-block" style="--i:1"><span>Chiamaci</span><a href="tel:+390833861000">0833 861000</a></div>
      <div class="menu-block" style="--i:2"><span>Dove siamo</span><a href="https://www.google.com/maps/place/IMBALLAGGI+2G+s.r.l./@40.0911849,18.0653234,17z/data=!3m1!4b1!4m6!3m5!1s0x13441f7b57c7b16f:0xfc850e22ba05aec7!8m2!3d40.0911849!4d18.0678983!16s%2Fg%2F11jyjc4qhs" target="_blank" rel="noopener">Via dei Cavamonti, Z.I.<br>73017 Sannicola (LE)</a></div>
      <div class="menu-block" style="--i:3"><span>Seguici</span><a href="https://www.instagram.com/imballaggi2g/" target="_blank" rel="noopener">Instagram</a></div>
      </div>
    </div>
  </div>
</div>

<main id="main">
{body}
</main>
{page_footer(current)}
<button class="to-top" type="button" aria-label="Torna all’inizio"><span aria-hidden="true">↑</span></button>
</body>
</html>
"""


def page_hero(key, title_html, lead, image="", tone="light"):
    """Testata della pagina: numero, occhiello, titolo e foto di copertina.

    Se `image` non viene passata si usa la copertina indicata in SECTIONS,
    cosi' le foto di sezione si cambiano in un posto solo."""
    _k, _href, num, label, eyebrow, img = BY_KEY[key]
    image = image or img
    media = ""
    if image:
        media = f'<div class="ph-media" data-parallax="0.04"><img src="assets/{image}" alt="" loading="eager" fetchpriority="high" width="1500" height="1000"></div>'
    return f"""<section class="page-hero tone-{tone}" aria-labelledby="ph-title">
{media}
  <div class="ph-shade" aria-hidden="true"></div>
  <div class="ph-body">
    <h1 id="ph-title" class="display" data-lines>{title_html}</h1>
    <p class="ph-lead">{lead}</p>
  </div>
</section>"""

# ============================================================ HOME
NAV_ITEMS = [
    ("coprispalla",  "La cura del dettaglio che veste la moda",                 "azienda/coprispalla-linea.webp"),
    ("bobine",       "Avvolgere, proteggere, ripensare.",               "azienda/bobina-macchina.webp"),
    ("protezioni",   "Un cuscino d’aria fra il prodotto e il viaggio.", "azienda/bobine-pluriball.webp"),
    ("buste",        "Chiudere bene, alla prima.",                      "azienda/fogli-uscita.webp"),
    ("macchine",     "Partner Noxon",                                   "noxon/gamma-noxon-v107.jpg"),
    ("sostenibilita","La materia non finisce al primo utilizzo.",       "azienda/nastro-psv.webp"),
    ("azienda",      "Una storia di famiglia, dal Salento.",            "azienda/sede-sera-prospettiva.webp"),
]


def navigator():
    slats = []
    for i, (key, claim, img) in enumerate(NAV_ITEMS):
        _k, href, num, label, eyebrow, _ = BY_KEY[key]
        is_noxon = key == "macchine"
        dimensions = 'width="1536" height="1024"' if is_noxon else 'width="1500" height="1000"'
        alt = 'Gamma Noxon: robot semoventi, avvolgitrice orizzontale e macchina a tavola rotante' if is_noxon else ''
        partner = '<span class="slat-partner">Partner Noxon</span>' if is_noxon else ''
        slat_class = 'slat slat-noxon' if is_noxon else 'slat'
        accessible_label = f'{label} — Partner Noxon' if is_noxon else label
        media = (f'<span class="slat-media"><img src="assets/{img}" alt="{alt}" loading="lazy" {dimensions}></span>'
                 if img else
                 '<span class="slat-media slat-green"><img src="assets/turtle-mark-light.webp" alt="" loading="lazy" width="301" height="366"></span>')
        slats.append(f"""      <a class="{slat_class}" href="{href}" aria-label="{accessible_label}" style="--i:{i}" data-claim="{claim}">
        {media}
        <span class="slat-veil" aria-hidden="true"></span>
        <span class="slat-name-v" aria-hidden="true">{label}</span>
        <span class="slat-open">
          <span class="slat-name">{label}</span>{partner}
        </span>
      </a>""")
    return "\n".join(slats)


HOME = f"""
<section class="home-hero evolution-hero" id="home-title" tabindex="-1" aria-labelledby="home-claim">
  <div class="evolution-lockup">
  <div class="brand-evolution" role="img" aria-label="Il cerchio si trasforma in G, si unisce al 2 e diventa il logo Imballaggi 2G">
    <svg class="evolution-symbols" viewBox="0 0 360 200" aria-hidden="true" focusable="false">
      <path class="evolution-two" d="{EVOLUTION_TWO}"/>
      <g class="evolution-morph">
        <path class="evolution-g" d="{EVOLUTION_DISC}">
          <animate id="evolution-contour" attributeName="d" values="{EVOLUTION_DISC};{EVOLUTION_DISC};{EVOLUTION_G}"
                   begin="indefinite" dur="2.5s" fill="freeze" calcMode="spline"
                   keyTimes="0;.38;1" keySplines="0 0 1 1;.35 0 .25 1"/>
        </path>
        <path class="evolution-tail" d="{EVOLUTION_TAIL}"/>
      </g>
    </svg>
    <img class="evolution-logo" src="assets/logo-ink.webp" width="1200" height="344" alt="">
  </div>
    <h1 id="home-claim"><span>Il Packaging <span class="claim-phrase">in ogni sua</span></span> <em>evoluzione.</em></h1>
  </div>
  <a class="hero-down" href="#manifesto" aria-label="Scendi alla sezione successiva">
    <svg viewBox="0 0 24 36" width="24" height="36" fill="none" aria-hidden="true"><path d="M12 2v29m-7-7 7 7 7-7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </a>
</section>

<section class="manifesto" id="manifesto" aria-labelledby="manifesto-title">
  <div class="wrap">
    <h2 id="manifesto-title" class="display" data-lines>Un buon imballaggio<br>si prende cura <span>di tutto.</span></h2>
    <div class="manifesto-grid">
      <p class="reveal">Imballaggi a Sannicola, nel Salento: <a class="inline-link" href="coprispalla.html">coprispalla</a>, <a class="inline-link" href="bobine.html">film estensibile</a>, <a class="inline-link" href="buste.html">buste</a> e <a class="inline-link" href="protezioni.html">protezioni</a> per le imprese di Lecce, Brindisi e Taranto.</p>
      <div class="manifesto-facts" data-stagger>
        <div><strong>1980</strong><span>La tradizione familiare</span></div>
        <div><strong>2017</strong><span>Nasce Imballaggi 2G</span></div>
        <div><strong>2</strong><span>Certificazioni Plastica Seconda Vita</span></div>
      </div>
    </div>
  </div>
</section>

{HOME_BAND}

<section class="navigator" id="navigatore" aria-labelledby="nav-title">
  <div class="nav-head">
    <h2 id="nav-title" class="nav-claim"><span class="nav-claim-default">Da dove vuoi cominciare?</span></h2>
  </div>
  <div class="slats" data-nav-slats>
{navigator()}
  </div>
</section>

<section class="home-cta" aria-labelledby="cta-title">
  <div class="wrap">
    <a class="contact-headline" id="cta-title" href="contatti.html">Diamo forma<br>alla tua <em>soluzione.</em></a>
    <div class="contact-grid" data-stagger>
      <div><span>Scrivici</span><a href="mailto:info@imballaggi2g.it">info@imballaggi2g.it</a></div>
      <div><span>Chiamaci</span><a href="tel:+390833861000">0833 861000</a></div>
      <div><span>Vieni a trovarci</span><a href="https://www.google.com/maps/place/IMBALLAGGI+2G+s.r.l./@40.0911849,18.0653234,17z/data=!3m1!4b1!4m6!3m5!1s0x13441f7b57c7b16f:0xfc850e22ba05aec7!8m2!3d40.0911849!4d18.0678983!16s%2Fg%2F11jyjc4qhs" target="_blank" rel="noopener">Via dei Cavamonti, Z.I.<br>73017 Sannicola (LE)</a></div>
    </div>
  </div>
</section>
"""

# ============================================================ COPRISPALLA
COPRISPALLA = page_hero(
    "coprispalla",
    "La cura del dettaglio<br>che veste <em>la moda</em>",
    'Coprispalla protettivi per abbigliamento, in <a class="inline-link" href="protezioni.html">foam e pluriball</a>. Tagli sagomati e retti, in diverse larghezze e lunghezze, per accompagnare ogni capo.',
) + """
<section class="block" aria-labelledby="draw-title">
  <div class="wrap split">
    <div>
      <h2 id="draw-title" class="display small" data-lines>Diverse larghezze.<br>La misura giusta per <em>ogni capo.</em></h2>

      <a class="text-link" href="assets/schede-coprispalla.pdf" target="_blank" rel="noopener">Apri le schede tecniche </a>
    </div>
    <div class="technical-preview">
      <svg class="garment-drawing" viewBox="0 0 600 650" role="img" aria-label="Schema illustrativo del coprispalla sagomato, disponibile in diverse larghezze">
        <defs><linearGradient id="film" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff" stop-opacity=".85"/><stop offset=".45" stop-color="#ffffff" stop-opacity=".2"/><stop offset="1" stop-color="#9aaca4" stop-opacity=".25"/></linearGradient></defs>
        <g class="drawing-lines">
          <path class="garment-body" pathLength="1" d="M264 88 H336 V107 L451 172 V537 H149 V172 L264 107Z" fill="url(#film)" stroke="#588371" stroke-width="1.5"/>
          <path class="draw-2" pathLength="1" d="M264 97 H336 M157 181 V529 H443 V181 M270 112 L163 176 M330 112 L437 176 M300 107 V177" fill="none" stroke="#8a9e94"/>
          <path class="draw-3" pathLength="1" d="M149 564 V592 M451 564 V592 M149 579 H451 M137 172 H102 M137 537 H102 M115 172 V537" fill="none" stroke="#749082" stroke-width="1"/>
          <path class="draw-tip" d="M149 579 l9 -4 v8 Z M451 579 l-9 -4 v8 Z M115 172 l-4 9 h8 Z M115 537 l-4 -9 h8 Z" fill="#749082"/>
          <text class="draw-tip" x="300" y="610" text-anchor="middle">Larghezza variabile</text>
          <circle class="draw-pin" cx="302" cy="156" r="6" fill="#2e9878"/>
          <path class="draw-4" pathLength="1" d="M315 155 H393 L465 108 H537" fill="none" stroke="#2e9878"/>
          <text class="draw-tip" x="454" y="93">Taglio sagomato</text>
        </g>
      </svg>
    </div>
  </div>
</section>

<section class="block tinted" aria-labelledby="cs-det">
  <div class="wrap split">
    <div>
      <h2 id="cs-det" class="display small" data-lines>Ogni scelta<br>ha una <em>funzione.</em></h2>
    </div>
    <div class="details-list" data-stagger>
      <details open>
        <summary>Forme e formati <span aria-hidden="true">+</span></summary>
        <div class="details-body"><p>Diverse larghezze, taglio sagomato o retto. Scegli il formato adatto al tuo capo.</p></div>
      </details>
      <details>
        <summary>Passaggio per il bar-code <span aria-hidden="true">+</span></summary>
        <div class="details-body"><p>Su alcune varianti: apertura di 13,5 cm per il bar-code. Dettagli nelle schede tecniche.</p></div>
      </details>
      <details>
        <summary>La linea certificata PSV <span aria-hidden="true">+</span></summary>
        <div class="details-body">
          <p>Coprispalla, coprisedia, buste e fogli con MPS da sottoprodotto esterno: ambito del certificato PSV n. 3433/2026.</p>
          <a href="assets/certificato-coprispalla-3433-2026.pdf" target="_blank" rel="noopener">Leggi il certificato</a>
        </div>
      </details>
    </div>
  </div>
</section>
"""

# ============================================================ BOBINE
BOBINE = page_hero(
    "bobine",
    "Avvolgere.<br>Proteggere.<br><em>Ripensare.</em>",
    'Bobine per confezionamento e film estensibile per avvolgere i carichi. Tiger Film propone le linee Eco Converting, Eco Manuale ed Eco Automatico con contenuto riciclato <a class="inline-link" href="sostenibilita.html#cert-scope">certificato PSV MixEco</a>.',
) + """


<section class="block" aria-labelledby="tiger-title">
  <div class="wrap">
    <div class="tiger-intro">
      <h2 id="tiger-title" class="display small" data-lines>Una linea.<br>Tre modi di <em>proteggere.</em></h2>
      <p>Valori riportati nell’allegato al certificato PSV MixEco n. 3040/2024.</p>
    </div>
    <div class="tiger-grid" data-stagger>
      <div><span>Eco Converting</span><strong data-count="50">50<span>%</span></strong><p>Film in PE-LD<br>Spessore minimo 40 μm</p></div>
      <div><span>Eco Manuale</span><strong data-count="60">60<span>%</span></strong><p>Film estensibile in PE-LLD<br>Spessore minimo 12 μm</p></div>
      <div><span>Eco Automatico</span><strong data-count="30">30<span>%</span></strong><p>Film estensibile in PE-LLD<br>Spessore minimo 12 μm</p></div>
    </div>
    <a class="doc-row" href="assets/certificato-film-3040-2024.pdf" target="_blank" rel="noopener">
      <span>PSV · MixEco</span><span>Commercializzazione di film in polietilene certificato</span>
      <span>N. 3040/2024</span>
    </a>
  </div>
</section>

<section class="block tinted" aria-labelledby="reels-photo">
  <div class="wrap split">
    <div class="reel-visual">
      <img src="assets/azienda/bobine-cataste.webp" alt="Cataste di bobine nel magazzino Imballaggi 2G" loading="lazy" width="1300" height="867">
      <span>LA LINEA TIGER FILM</span>
    </div>
    <div>
      <h2 id="reels-photo" class="display small" data-lines>Le nostre bobine.</h2>
      <p class="lead">Formati e spessori per confezionamento manuale e macchine avvolgitrici.</p>
      <a class="text-link" href="contatti.html">Chiedi un formato </a>
    </div>
  </div>
</section>
"""

# ============================================================ PROTEZIONI
PROTEZIONI = page_hero(
    "protezioni",
    "Un cuscino d’aria<br>fra il prodotto<br>e <em>il viaggio.</em>",
    "Pluriball, polietilene espanso Xtracell, angolari e cuscini d’aria per proteggere prodotti e superfici delicate.",
) + """
<section class="block" aria-labelledby="pr-title">
  <div class="wrap split">
    <div>
      <h2 id="pr-title" class="display small" data-lines>Materiali diversi,<br>lo stesso <em>compito.</em></h2>

      <a class="text-link" href="assets/brochure-foam.pdf" target="_blank" rel="noopener">Sfoglia la brochure Foam </a>
    </div>
    <div class="details-list" data-stagger>
      <details open>
        <summary>Pluriball <span aria-hidden="true">+</span></summary>
        <div class="details-body"><p>Film a bolle d’aria per attutire gli urti.</p></div>
      </details>
      <details>
        <summary>Xtracell · Polietilene espanso <span aria-hidden="true">+</span></summary>
        <div class="details-body"><p>Xtracell: polietilene espanso ad alto spessore per protezione e riempimento.</p></div>
      </details>
      <details>
        <summary>Angolari e cuscini d’aria <span aria-hidden="true">+</span></summary>
        <div class="details-body"><p>Angolari per gli spigoli, cuscini d’aria per stabilizzare il contenuto.</p></div>
      </details>
    </div>
  </div>
</section>

<section class="block tinted" aria-labelledby="pr-psv">
  <div class="wrap narrow center">
    <h2 id="pr-psv" class="display small" data-lines>Proteggere non deve<br>voler dire <em>sprecare.</em></h2>

    <a class="button magnetic" href="sostenibilita.html">Vai alla sostenibilità </a>
  </div>
</section>
"""

# ============================================================ BUSTE
BUSTE = page_hero(
    "buste",
    "Chiudere bene,<br><em>alla prima.</em>",
    'Buste per imballaggio, buste protettive in <a class="inline-link" href="protezioni.html#pluriball">pluriball</a> e chiusure minigrip o strip adesiva. Per il negozio, il magazzino e la spedizione.',
) + """
<section class="bag-experience" id="busta-in-movimento" data-bag-scene aria-labelledby="bag-title">
 <div class="bag-pin">
  <div class="wrap bag-heading"><h2 class="display small" id="bag-title">Il dettaglio.<br><em>Al sicuro.</em></h2><p>Entra. Si adatta. Protegge.<br>Segui il gesto con lo scroll.</p></div>
  <div class="bag-stage" role="img" aria-label="Un occhiale da sole entra in una busta a bolle d’aria; l’aletta si ripiega sopra l’apertura. Ricostruzione illustrativa."><canvas aria-hidden="true"></canvas><img class="bag-fallback" src="assets/video/busta-occhiali.webp" alt="La busta in pluriball con l’occhiale all’interno" width="720" height="1280"></div>
  <div class="wrap bag-footer"><div aria-hidden="true"><span data-bag-step class="is-current">Un oggetto da custodire</span><span data-bag-step>Dentro la protezione</span><span data-bag-step>Il gesto si completa</span></div><a class="text-link" href="#bag-real">La busta da vicino <span>↓</span></a></div>
 </div>
</section>
<section class="block bag-real" id="bag-real" aria-labelledby="bag-real-title"><div class="wrap bag-real-grid">
 <figure class="bag-product-photo"><img src="assets/realistic/busta-studio-v60.png" width="1024" height="1536" loading="lazy" decoding="async" alt="Ricostruzione fotografica di una busta in pluriball: celle d’aria, saldature laterali e aletta di chiusura"></figure>
 <div><h2 id="bag-real-title" class="display small" data-lines>La protezione,<br><em>da vicino.</em></h2><p class="lead">Bolle d’aria, saldature laterali e aletta di chiusura. Il contenuto resta visibile.</p>
 <div class="bag-detail"><svg viewBox="0 0 240 95" aria-hidden="true"><g fill="#d9e9e0" stroke="#6a9f85" stroke-width="1.2"><ellipse cx="30" cy="25" rx="18" ry="17"/><ellipse cx="74" cy="25" rx="18" ry="17"/><ellipse cx="118" cy="25" rx="18" ry="17"/><ellipse cx="162" cy="25" rx="18" ry="17"/><ellipse cx="206" cy="25" rx="18" ry="17"/><ellipse cx="30" cy="68" rx="18" ry="17"/><ellipse cx="74" cy="68" rx="18" ry="17"/><ellipse cx="118" cy="68" rx="18" ry="17"/><ellipse cx="162" cy="68" rx="18" ry="17"/><ellipse cx="206" cy="68" rx="18" ry="17"/></g><path d="M20 22Q22 13 31 13M64 22Q66 13 75 13M108 22Q110 13 119 13" fill="none" stroke="white" stroke-width="3"/></svg><div><h3>La trama a bolle</h3><p>Il materiale avvolge il contenuto lasciandolo visibile.</p></div></div>
 <div class="bag-detail"><svg viewBox="0 0 240 95" fill="none" aria-hidden="true"><path d="M30 25L208 25L208 83L30 83Z M30 25L51 8L191 8L208 25" stroke="#6a9f85" stroke-width="1.4" fill="#edf3ef"/><path d="M43 34H195" stroke="#2f8661" stroke-width="3"/><path d="M110 3Q155 5 151 43M144 37L151 44L158 36" stroke="#233e31" stroke-width="2"/></svg><div><h3>L’aletta di chiusura</h3><p>Il dettaglio del campione che completa il confezionamento.</p></div></div>
 <a class="text-link" href="contatti.html">Parliamo del tuo formato </a></div>
</div></section>
<section class="block" aria-labelledby="bu-title">
  <div class="wrap">
    <h2 id="bu-title" class="display small" data-lines>Ogni contenuto<br>ha la sua <em>busta.</em></h2>
    <div class="card-grid" data-stagger>
      <div class="mini-card"><span>01</span><h3>Buste e shopping bag</h3><p>Per il banco, il negozio e la consegna.</p></div>
      <div class="mini-card"><span>02</span><h3>Chiusura minigrip</h3><p>Richiudibile, per parti e minuterie.</p></div>
      <div class="mini-card"><span>03</span><h3>Strip adesiva</h3><p>Chiusura immediata, senza nastro.</p></div>
      <div class="mini-card"><span>04</span><h3>Buste per materassi</h3><p>Formati grandi per l’imbottito.</p></div>
      <div class="mini-card"><span>05</span><h3>Film termoretraibile</h3><p>Aderisce al prodotto con il calore.</p></div>
      <div class="mini-card"><span>06</span><h3>Cappucci termoretraibili</h3><p>Per chiudere e stabilizzare il pallet.</p></div>
    </div>
  </div>
</section>

<section class="block tinted" aria-labelledby="bu-psv">
  <div class="wrap narrow center">
    <h2 id="bu-psv" class="display small" data-lines>Buste e fogli protettivi<br>nel campo del <em>certificato PSV.</em></h2>
    <p class="lead">Buste e fogli con MPS da sottoprodotto esterno, nel campo del certificato PSV n. 3433/2026.</p>
    <a class="button magnetic" href="assets/certificato-coprispalla-3433-2026.pdf" target="_blank" rel="noopener">Leggi il certificato </a>
  </div>
</section>
"""

# ============================================================ MACCHINE
MACCHINE = page_hero(
    "macchine",
    "Chiudere.<br>Reggiare.<br><em>Muovere.</em>",
    "Macchine avvolgitrici NOXON, nastri adesivi, reggette e accessori per stabilizzare i carichi. Imballaggi 2G è partner ufficiale NOXON.",
) + """
<section class="block" aria-labelledby="ma-title">
  <div class="wrap">
    <h2 id="ma-title" class="display small" data-lines>Il carico regge<br>quanto regge <em>la chiusura.</em></h2>
    <div class="card-grid" data-stagger>
      <div class="mini-card"><span>01</span><h3>Nastri adesivi</h3><p>Neutri o personalizzati con il tuo marchio.</p></div>
      <div class="mini-card"><span>02</span><h3>Nastri in carta</h3><p>Per chiusure che restano nel ciclo della carta.</p></div>
      <div class="mini-card"><span>03</span><h3>Reggette</h3><p>In polipropilene, PET e acciaio.</p></div>
      <div class="mini-card"><span>04</span><h3>Corde e cinghie</h3><p>Anche per trasporti speciali.</p></div>
      <div class="mini-card"><span>05</span><h3>Accessori</h3><p>Tutto ciò che serve al banco d’imballo.</p></div>
      <div class="mini-card"><span>06</span><h3>Macchine per imballaggio</h3><p>Per chi confeziona ogni giorno, in quantità.</p></div>
    </div>
  </div>
</section>

<section class="block tinted" aria-labelledby="ma-cta">
  <div class="wrap narrow center">
    <h2 id="ma-cta" class="display small" data-lines>Non solo forniture.<br><em>Affiancamento.</em></h2>
    <p class="lead">Dal materiale alla macchina: scegliamo insieme la soluzione adatta.</p>
    <a class="button magnetic" href="contatti.html">Parliamone </a>
  </div>
</section>
"""

# ============================================================ SOSTENIBILITÀ
SOSTENIBILITA = page_hero(
    "sostenibilita",
    "Proteggere oggi.<br><em>Pensare al domani.</em>",
    "Il valore della materia non finisce al primo utilizzo. Con le linee certificate Plastica Seconda Vita portiamo il riciclo dentro il mondo dell’imballaggio.",
    "turtle-ocean-v17.png",
    tone="green",
) + """
<section class="block dark-block" aria-labelledby="so-turtle">
  <div class="wrap split middle">
    <div>
      <h2 id="so-turtle" class="display small" data-lines>Lenta,<br>ma <em>va lontano.</em></h2>
      <p class="lead">La tartaruga identifica il progetto Puglia Plastic Second Life.</p>
      <div class="circular-words" data-stagger>
        <span>Materia</span><span>Protezione</span><span>Nuova vita</span>
      </div>
    </div>
    <div class="turtle-stage">
      <div class="orbit orbit-one" aria-hidden="true"></div>
      <div class="orbit orbit-two" aria-hidden="true"></div>
      <div class="orbit orbit-three" aria-hidden="true"></div>
      <img class="turtle-symbol" src="assets/turtle-light.webp" width="1107" height="491" alt="Il marchio Plastica Seconda Vita Puglia, con la tartaruga" loading="lazy">
    </div>
  </div>
</section>

<section class="block" aria-labelledby="so-cert">
  <div class="wrap">
    <div class="split">
      <h2 id="so-cert" class="display small" data-lines>La fiducia.<br>Nero su <em>bianco.</em></h2>
      <div>

        <div class="cert-marks">
          <img src="assets/psv.webp" alt="Marchio Plastica Seconda Vita" width="300" height="200" loading="lazy">
          <img src="assets/ippr.webp" alt="Istituto per la Promozione delle Plastiche da Riciclo" width="250" height="250" loading="lazy">
        </div>
      </div>
    </div>
    <div data-stagger class="cert-list">
      <a class="doc-row" href="assets/certificato-coprispalla-3433-2026.pdf" target="_blank" rel="noopener">
        <span>PSV · Sottoprodotto</span><span>Coprispalla, coprisedia, buste e fogli protettivi</span>
        <span>N. 3433/2026</span>
      </a>
      <a class="doc-row" href="assets/certificato-film-3040-2024.pdf" target="_blank" rel="noopener">
        <span>PSV · MixEco</span><span>Commercializzazione di film in polietilene certificato</span>
        <span>N. 3040/2024</span>
      </a>
      <a class="doc-row" href="assets/presentazione-plastica-seconda-vita.pdf" target="_blank" rel="noopener">
        <span>Presentazione</span><span>Plastica Seconda Vita e allegato prodotti</span>
        <span>PDF</span>
      </a>
    </div>
  </div>
</section>
"""

# ============================================================ AZIENDA
AZIENDA = page_hero(
    "azienda",
    "Una storia<br>di famiglia.<br><em>Una visione<br>che cresce.</em>",
    "Imballaggi 2G nasce a Sannicola, nel Salento, da una tradizione familiare nel packaging. Materiali protettivi e soluzioni per le imprese di Lecce, Brindisi e Taranto.",
) + """
<section class="block" aria-labelledby="az-title">
  <div class="wrap split">
    <div>
      <figure class="company-design-photo reveal"><img src="assets/azienda/progettazione-cliente.png" alt="Disegni tecnici e materiali di imballaggio sul tavolo di progettazione Imballaggi 2G" width="1200" height="1600" loading="lazy"></figure>
      <div class="story-place">Sannicola<br><span>Salento, Puglia</span></div>
      <h2 id="az-title" class="display small" data-lines>Radici salentine.<br>Sguardo <em>aperto.</em></h2>
    </div>
    <div>
      <p class="lead">Dalla protezione dei capi alla movimentazione delle merci: packaging al servizio delle imprese.</p>
      <div class="story-locations" data-stagger>
        <span class="locations-label">Dove operiamo</span><span>Lecce</span><span>Brindisi</span><span>Taranto</span>
      </div>
    </div>
  </div>
</section>

<section class="block tinted" aria-labelledby="az-time">
  <div class="wrap">
    <h2 id="az-time" class="display small" data-lines>Da una generazione<br>a <em>quella dopo.</em></h2>
    <div class="timeline" data-stagger>
      <div class="timeline-step"><span class="year">1980</span><p>La tradizione familiare nel mondo dell’imballaggio.</p></div>
      <div class="timeline-step"><span class="year">2017</span><p>Nasce Imballaggi 2G: packaging e assistenza alle imprese.</p></div>
      <div class="timeline-step"><span class="year">Oggi</span><p>Linee certificate Plastica Seconda Vita e una gamma che continua a crescere.</p></div>
    </div>
    <div class="place-grid" data-stagger>
      <div><span>Sede legale</span><p>Via Roma 52<br>Galatone (LE)</p></div>
      <div><span>Sito produttivo</span><p>Via dei Cavamonti, Z.I.<br>Sannicola (LE)</p></div>
      <div><span>Riferimenti</span><p>Dai certificati PSV n. 3433/2026<br>e n. 3040/2024</p></div>
    </div>
  </div>
</section>
"""

# ============================================================ CONTATTI
CONTATTI = """
<section class="contact-page" aria-labelledby="co-title">
  <div class="wrap">
    <h1 id="co-title" class="contact-title"><a class="contact-headline" href="mailto:info@imballaggi2g.it">Diamo forma<br>alla tua <em>soluzione.</em></a></h1>
    <div class="contact-grid" data-stagger>
      <div><span>Scrivici</span><a href="mailto:info@imballaggi2g.it">info@imballaggi2g.it</a></div>
      <div><span>Chiamaci</span><a href="tel:+390833861000">0833 861000</a></div>
      <div><span>Vieni a trovarci</span><a href="https://www.google.com/maps/place/IMBALLAGGI+2G+s.r.l./@40.0911849,18.0653234,17z/data=!3m1!4b1!4m6!3m5!1s0x13441f7b57c7b16f:0xfc850e22ba05aec7!8m2!3d40.0911849!4d18.0678983!16s%2Fg%2F11jyjc4qhs" target="_blank" rel="noopener">Via dei Cavamonti, Z.I.<br>73017 Sannicola (LE)</a></div>
      <div><span>Seguici</span><a href="https://www.instagram.com/imballaggi2g/" target="_blank" rel="noopener">Instagram</a></div>
    </div>

  </div>
</section>
"""

# ============================================================ scrittura
PAGES = [
    (None,           "index.html",        "Imballaggi e packaging nel Salento, Lecce | Imballaggi 2G",
     "Imballaggi 2G, Sannicola (Salento): coprispalla, bobine e film, pluriball, buste, nastri e macchine per l’imballaggio. Linee certificate Plastica Seconda Vita.", HOME, "is-home"),
    ("coprispalla",  "coprispalla.html",  "Coprispalla in foam e pluriball per abiti | Imballaggi 2G",
     "Coprispalla protettivi per abbigliamento in foam e pluriball, con taglio sagomato o retto e diverse misure. Scopri i formati e richiedi informazioni.", COPRISPALLA, ""),
    ("bobine",       "bobine.html",       "Bobine e film estensibile per imballaggio | Imballaggi 2G",
     "Film per confezionamento e movimentazione e linea Tiger Film: Eco Converting, Eco Manuale ed Eco Automatico, con contenuto di riciclato certificato PSV MixEco.", BOBINE, ""),
    ("protezioni",   "protezioni.html",   "Pluriball, foam e Xtracell per imballaggio | Imballaggi 2G",
     "Pluriball, foam e polietilene espanso Xtracell: materiali per proteggere superfici e prodotti delicati. Imballaggi 2G a Sannicola, nel Salento.", PROTEZIONI, ""),
    ("buste",        "buste.html",        "Buste per imballaggio e buste protettive | Imballaggi 2G",
     "Buste, shopping bag, chiusura minigrip o strip adesiva, buste per materassi, film e cappucci termoretraibili.", BUSTE, ""),
    ("macchine",     "macchine.html",     "Macchine avvolgitrici NOXON e accessori | Imballaggi 2G",
     "Imballaggi 2G, partner ufficiale NOXON. Macchine avvolgitrici, nastri, reggette e accessori per l’imballaggio.", MACCHINE, ""),
    ("sostenibilita","sostenibilita.html","Packaging e certificazioni Plastica Seconda Vita | Imballaggi 2G",
     "Plastica Seconda Vita: le certificazioni PSV n. 3433/2026 e n. 3040/2024 e il nostro impegno sul riciclo nell’imballaggio.", SOSTENIBILITA, ""),
    ("azienda",      "azienda.html",      "Azienda di imballaggi a Sannicola, Lecce | Imballaggi 2G",
     "Da Aldo Giuri a Imballaggi 2G: una storia di famiglia a Sannicola, nel Salento, fra Lecce, Brindisi e Taranto.", AZIENDA, ""),
    ("contatti",     "contatti.html",     "Contatti e preventivi imballaggi a Sannicola | Imballaggi 2G",
     "Scrivi a info@imballaggi2g.it, chiama lo 0833 861000 o vieni a trovarci in Via dei Cavamonti, Z.I., Sannicola (LE).", CONTATTI, "is-dark"),
]


def main():
    DIST.mkdir(exist_ok=True)
    for key, filename, title, description, body, body_class in PAGES:
        content = with_photos(key, enrich(key, body))
        if key == "bobine":
            hero, rest = content.split("</section>", 1)
            content = ('<div class="reel-opening" id="bobina" data-reel-opening><div class="reel-opening-pin">'
                       '<div class="reel-opening-content">' + hero + '</section></div>'
                       '<div class="reel-opening-logo" aria-hidden="true"><img src="assets/logo-ink.webp" width="1200" height="344" alt=""></div><div class="reel-opening-art" aria-hidden="true"><canvas></canvas></div><div class="reel-scroll-hint"><span>Scorri per continuare</span><svg viewBox="0 0 24 32" fill="none" aria-hidden="true"><path d="M12 3v24m-6-6 6 6 6-6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
                       '</div></div>' + rest)
        html = shell(key, title, description, content, body_class)
        (DIST / filename).write_text(html, encoding="utf-8")
        print(f"  {filename:22} {len(html):>7} byte")
    write_crawl_files(DIST, PAGES)
    (DIST / ".htaccess").write_text(apache_rules(), encoding="utf-8")
    print(f"\n{len(PAGES)} pagine, robots.txt e sitemap.xml scritti in {DIST} (versione asset ?v={VERSION})")


if __name__ == "__main__":
    main()
