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
from brochure_sections import enrich
from section_motion import section_motion

DIST = Path(__file__).parent / "dist"
VERSION = "20"           # alzare a ogni pubblicazione: sblocca la cache di CSS e JS

# ---------------------------------------------------------------- sezioni
# chiave, file, numero, nome nel menu, occhiello, immagine di copertina
SECTIONS = [
    ("coprispalla",  "coprispalla.html",  "01", "Coprispalla",        "ABBIGLIAMENTO",            "garments.webp"),
    ("bobine",       "bobine.html",       "02", "Bobine e film",      "CONFEZIONAMENTO",          "pallet-wrap.webp"),
    ("protezioni",   "protezioni.html",   "03", "Protezioni",         "PLURIBALL E FOAM",         "bubble.webp"),
    ("buste",        "buste.html",        "04", "Buste",              "CONFEZIONAMENTO",          "film-texture.webp"),
    ("macchine",     "macchine.html",     "05", "Macchine",           "CHIUSURA E MOVIMENTAZIONE","machines.webp"),
    ("sostenibilita","sostenibilita.html","06", "Sostenibilità",      "PLASTICA SECONDA VITA",    None),
    ("azienda",      "azienda.html",      "07", "L’azienda",          "RADICI SALENTINE",         "warehouse.webp"),
    ("contatti",     "contatti.html",     "08", "Contatti",           "PARLIAMONE",               None),
]
BY_KEY = {s[0]: s for s in SECTIONS}
ORDER = [s[0] for s in SECTIONS]


def menu_links(current):
    out = []
    for i, (key, href, num, label, _eyebrow, _img) in enumerate(SECTIONS):
        cls = ' class="is-current"' if key == current else ""
        out.append(
            f'      <a href="{href}"{cls} style="--i:{i}"><i>{num}</i>'
            f'<span>{label}</span><em aria-hidden="true">↗</em></a>'
        )
    return "\n".join(out)


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
    <span class="onward-label">Sezione successiva</span>
    <span class="onward-name"><i>{nxt[2]}</i>{nxt[3]}</span>
    <span class="onward-arrow" aria-hidden="true">→</span>
  </a>"""
    replay = '<button class="replay" type="button">Rivedi l’intro ↻</button>' if current is None else '<a href="index.html">Torna all’indice</a>'
    return f"""{onward}
<footer class="site-footer">
  <a href="index.html" class="footer-brand" aria-label="Imballaggi 2G, pagina iniziale"><img src="assets/logo-ink.webp" alt="Imballaggi 2G" width="240" height="69"></a>
  <p>&copy; <span id="year">2026</span> Imballaggi 2G S.r.l. &middot; Via dei Cavamonti, Z.I. &middot; 73017 Sannicola (LE)</p>
  <a href="https://www.instagram.com/imballaggi2g/" target="_blank" rel="noopener">Instagram ↗</a>
  {replay}
</footer>"""


def shell(current, title, description, body, body_class=""):
    intro = ""
    if current is None:
        intro = f"""
<div class="intro" aria-hidden="true">
  <div class="intro-sheet"></div>
  <div class="intro-stage">
    <div class="intro-lock">
      <img class="intro-word" src="assets/logo-ink.webp" width="520" height="149" alt="">
    </div>
  </div>
</div>"""

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
<title>{title}</title>
<meta name="description" content="{description}">
<meta name="theme-color" content="#121615">
<link rel="icon" href="assets/mark-ink.webp">
<link rel="preload" href="assets/manrope-regular.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="style.css?v={VERSION}">
<script src="app.js?v={VERSION}" defer></script>
</head>
<body{cls}>
<a class="skip" href="#main">Vai ai contenuti</a>
<div class="grain" aria-hidden="true"></div>
<div class="scroll-progress" aria-hidden="true"><span></span></div>
{entry}
{intro}
<header class="header" id="header">
  <a class="brand" href="index.html" aria-label="Imballaggi 2G, pagina iniziale">
    <img class="brand-dark" src="assets/logo-ink.webp" width="260" height="75" alt="Imballaggi 2G — Keep it safe">
    <img class="brand-light" src="assets/logo-light.webp" width="260" height="75" alt="" aria-hidden="true">
  </a>
  <div class="header-actions">
    <a class="pill" href="contatti.html">Parliamone <span aria-hidden="true">↗</span></a>
    <button class="burger" type="button" aria-label="Apri il menu" aria-expanded="false" aria-controls="menu">
      <span class="burger-box" aria-hidden="true"><span></span><span></span><span></span></span>
      <span class="burger-label" aria-hidden="true">Menu</span>
    </button>
  </div>
</header>

<div class="menu" id="menu" aria-label="Menu principale" aria-hidden="true">
  <div class="menu-bg" aria-hidden="true"></div>
  <div class="menu-inner">
    <nav class="menu-nav" aria-label="Sezioni del sito">
{menu_links(current)}
    </nav>
    <div class="menu-side">
      <div class="menu-block" style="--i:0"><span>Scrivici</span><a href="mailto:info@imballaggi2g.it">info@imballaggi2g.it</a></div>
      <div class="menu-block" style="--i:1"><span>Chiamaci</span><a href="tel:+390833861000">0833 861000</a></div>
      <div class="menu-block" style="--i:2"><span>Dove siamo</span><a href="https://www.google.com/maps/place/IMBALLAGGI+2G+s.r.l./@40.0911849,18.0653234,17z/data=!3m1!4b1!4m6!3m5!1s0x13441f7b57c7b16f:0xfc850e22ba05aec7!8m2!3d40.0911849!4d18.0678983!16s%2Fg%2F11jyjc4qhs" target="_blank" rel="noopener">Via dei Cavamonti, Z.I.<br>73017 Sannicola (LE) ↗</a></div>
      <div class="menu-block" style="--i:3"><span>Seguici</span><a href="https://www.instagram.com/imballaggi2g/" target="_blank" rel="noopener">Instagram ↗</a></div>
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


def page_hero(key, title_html, lead, image, tone="light"):
    """Testata della pagina: numero, occhiello, titolo e foto di copertina."""
    _k, _href, num, label, eyebrow, img = BY_KEY[key]
    media = ""
    if image:
        media = f'<div class="ph-media" data-parallax="0.04"><img src="assets/{image}" alt="" loading="eager" width="1500" height="1000"></div>'
    return f"""<section class="page-hero tone-{tone}" aria-labelledby="ph-title">
  {media}
  <div class="ph-shade" aria-hidden="true"></div>
  <div class="ph-body">
    <p class="eyebrow"><i class="tag">{num}</i> {eyebrow}</p>
    <h1 id="ph-title" class="display" data-lines>{title_html}</h1>
    <p class="ph-lead">{lead}</p>
  </div>
  <div class="ph-foot"><span>{label}</span><span class="cue" aria-hidden="true">↓</span></div>
</section>"""

# ============================================================ HOME
NAV_ITEMS = [
    ("coprispalla",  "Il dettaglio che veste la cura.",                 "garments.webp"),
    ("bobine",       "Avvolgere, proteggere, ripensare.",               "pallet-wrap.webp"),
    ("protezioni",   "Un cuscino d’aria fra il prodotto e il viaggio.", "bubble.webp"),
    ("buste",        "Chiudere bene, alla prima.",                      "film-texture.webp"),
    ("macchine",     "Nastri, reggette, movimentazione.",               "machines.webp"),
    ("sostenibilita","La materia non finisce al primo utilizzo.",       "turtle-ocean-v17.png"),
    ("azienda",      "Una storia di famiglia, dal Salento.",            "warehouse.webp"),
]


def navigator():
    slats = []
    for i, (key, claim, img) in enumerate(NAV_ITEMS):
        _k, href, num, label, eyebrow, _ = BY_KEY[key]
        media = (f'<span class="slat-media"><img src="assets/{img}" alt="" loading="lazy" width="1500" height="1000"></span>'
                 if img else
                 '<span class="slat-media slat-green"><img src="assets/turtle-mark-light.webp" alt="" loading="lazy" width="301" height="366"></span>')
        slats.append(f"""      <a class="slat" href="{href}" style="--i:{i}" data-claim="{claim}">
        {media}
        <span class="slat-veil" aria-hidden="true"></span>
        <span class="slat-num">{num}</span>
        <span class="slat-name-v" aria-hidden="true">{label}</span>
        <span class="slat-open">
          <span class="slat-name">{label}</span>
          <span class="slat-claim">{claim}</span>
          <span class="slat-go">Entra <i aria-hidden="true">↗</i></span>
        </span>
      </a>""")
    return "\n".join(slats)


HOME = f"""
<section class="home-hero" aria-labelledby="home-title">
  <div class="hero-media" aria-hidden="true"></div>
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="hero-content">
    <p class="eyebrow hero-eyebrow"><i class="dot" aria-hidden="true"></i>IMBALLAGGI 2G &middot; SANNICOLA, SALENTO</p>
    <h1 id="home-title" data-lines>La cura,<br>in ogni <em>forma.</em></h1>
    <p class="hero-description">Proteggiamo ciò che crei.<br>Valorizziamo ciò che sei.</p>
    <a class="button light magnetic" href="#navigatore">Entra nelle sezioni <span aria-hidden="true">↓</span></a>
  </div>
  <div class="hero-bottom">
    <span>Packaging. Protezione. Possibilità.</span>
    <a href="#manifesto" aria-label="Scopri Imballaggi 2G">Scorri per scoprire <span class="cue" aria-hidden="true">↓</span></a>
  </div>
</section>

<section class="manifesto" id="manifesto" aria-labelledby="manifesto-title">
  <div class="wrap">
    <p class="eyebrow"><i class="tag">00</i> IL VALORE DI CIÒ CHE PROTEGGIAMO</p>
    <h2 id="manifesto-title" class="display" data-lines>Un buon imballaggio<br>si prende cura <span>di tutto.</span></h2>
    <div class="manifesto-grid">
      <p class="reveal">Del prodotto. Della sua presentazione. Del viaggio che lo aspetta. Realizziamo e selezioniamo soluzioni di packaging che mettono al centro le esigenze di chi le usa.</p>
      <div class="manifesto-facts" data-stagger>
        <div><strong>1980</strong><span>La tradizione familiare</span></div>
        <div><strong>2017</strong><span>Nasce Imballaggi 2G</span></div>
        <div><strong>2</strong><span>Certificazioni Plastica Seconda Vita</span></div>
      </div>
    </div>
  </div>
</section>

<section class="navigator" id="navigatore" aria-labelledby="nav-title">
  <div class="nav-head">
    <p class="eyebrow"><i class="tag">↘</i> SETTE SEZIONI, UNA PER ARGOMENTO</p>
    <h2 id="nav-title" class="nav-claim"><span class="nav-claim-default">Da dove vuoi cominciare?</span></h2>
  </div>
  <div class="slats" data-nav-slats>
{navigator()}
  </div>
  <p class="nav-hint" aria-hidden="true">Passa sopra una fascia per aprirla &middot; tocca per entrare</p>
</section>

<section class="home-cta" aria-labelledby="cta-title">
  <div class="wrap">
    <p class="eyebrow"><i class="tag">08</i> IL PROSSIMO PROGETTO INIZIA QUI</p>
    <a class="contact-headline" id="cta-title" href="contatti.html">Diamo forma<br>alla tua <em>soluzione.</em><span aria-hidden="true">↗</span></a>
    <div class="contact-grid" data-stagger>
      <div><span>Scrivici</span><a href="mailto:info@imballaggi2g.it">info@imballaggi2g.it</a></div>
      <div><span>Chiamaci</span><a href="tel:+390833861000">0833 861000</a></div>
      <div><span>Vieni a trovarci</span><a href="https://www.google.com/maps/place/IMBALLAGGI+2G+s.r.l./@40.0911849,18.0653234,17z/data=!3m1!4b1!4m6!3m5!1s0x13441f7b57c7b16f:0xfc850e22ba05aec7!8m2!3d40.0911849!4d18.0678983!16s%2Fg%2F11jyjc4qhs" target="_blank" rel="noopener">Via dei Cavamonti, Z.I.<br>73017 Sannicola (LE) ↗</a></div>
    </div>
  </div>
</section>
"""

# ============================================================ COPRISPALLA
COPRISPALLA = page_hero(
    "coprispalla",
    "Il dettaglio<br>che veste <em>la cura.</em>",
    "Una protezione discreta, studiata per accompagnare ogni capo. Tagli sagomati e retti, con dettagli funzionali per la gestione dell’abbigliamento.",
    "garments.webp",
) + """
<section class="block" aria-labelledby="draw-title">
  <div class="wrap split">
    <div>
      <p class="eyebrow">LO STUDIO DEL PRODOTTO</p>
      <h2 id="draw-title" class="display small" data-lines>Larghezza 46 cm.<br>Il resto lo decidi <em>tu.</em></h2>
      <p class="lead">Una larghezza comune, finiture diverse. Il taglio sagomato segue la spalla, quello retto accompagna altri formati: ogni dettaglio risponde al capo da proteggere.</p>
      <a class="text-link" href="assets/schede-coprispalla.pdf" target="_blank" rel="noopener">Apri le schede tecniche <span aria-hidden="true">↗</span></a>
    </div>
    <div class="technical-preview">
      <span class="drawing-label">STUDIO DEL PRODOTTO / COPRISPALLA</span>
      <svg class="garment-drawing" viewBox="0 0 600 650" role="img" aria-label="Schema tecnico del coprispalla sagomato, larghezza 46 centimetri">
        <defs><linearGradient id="film" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff" stop-opacity=".85"/><stop offset=".45" stop-color="#ffffff" stop-opacity=".2"/><stop offset="1" stop-color="#9aaca4" stop-opacity=".25"/></linearGradient></defs>
        <g class="drawing-lines">
          <path class="garment-body" pathLength="1" d="M264 88 H336 V107 L451 172 V537 H149 V172 L264 107Z" fill="url(#film)" stroke="#588371" stroke-width="1.5"/>
          <path class="draw-2" pathLength="1" d="M264 97 H336 M157 181 V529 H443 V181 M270 112 L163 176 M330 112 L437 176 M300 107 V177" fill="none" stroke="#8a9e94"/>
          <path class="draw-3" pathLength="1" d="M149 564 V592 M451 564 V592 M149 579 H451 M137 172 H102 M137 537 H102 M115 172 V537" fill="none" stroke="#749082" stroke-width="1"/>
          <path class="draw-tip" d="M149 579 l9 -4 v8 Z M451 579 l-9 -4 v8 Z M115 172 l-4 9 h8 Z M115 537 l-4 -9 h8 Z" fill="#749082"/>
          <text class="draw-tip" x="300" y="610" text-anchor="middle">46 cm</text>
          <circle class="draw-pin" cx="302" cy="156" r="6" fill="#2e9878"/>
          <path class="draw-4" pathLength="1" d="M315 155 H393 L465 108 H537" fill="none" stroke="#2e9878"/>
          <text class="draw-tip" x="454" y="93">Taglio sagomato</text>
        </g>
      </svg>
      <div class="drawing-bottom"><span>Protezione che segue il capo.</span><span class="drawing-symbol" aria-hidden="true">＋</span></div>
    </div>
  </div>
</section>

<section class="block tinted" aria-labelledby="cs-det">
  <div class="wrap split">
    <div>
      <p class="eyebrow">I DETTAGLI</p>
      <h2 id="cs-det" class="display small" data-lines>Ogni scelta<br>ha una <em>funzione.</em></h2>
    </div>
    <div class="details-list" data-stagger>
      <details open>
        <summary>Forme e formati <span aria-hidden="true">+</span></summary>
        <div class="details-body"><p>Taglio sagomato e taglio retto, con larghezza di 46 cm. La scheda tecnica raccoglie le varianti per diverse lunghezze dei capi: richiedici il formato adatto alla tua produzione.</p></div>
      </details>
      <details>
        <summary>Passaggio per il bar-code <span aria-hidden="true">+</span></summary>
        <div class="details-body"><p>Le schede di alcune varianti prevedono un taglio laterale di 13,5 cm per il passaggio del bar-code. Verifichiamo insieme il dettaglio richiesto sul formato scelto.</p></div>
      </details>
      <details>
        <summary>La linea certificata PSV <span aria-hidden="true">+</span></summary>
        <div class="details-body">
          <p>Il certificato n. 3433/2026 riguarda la produzione di coprispalla, coprisedia, buste e fogli protettivi con MPS da sottoprodotto esterno. Il campo di applicazione è specificato nel documento.</p>
          <a href="assets/certificato-coprispalla-3433-2026.pdf" target="_blank" rel="noopener">Leggi il certificato ↗</a>
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
    "Film per il confezionamento e la movimentazione. Con Tiger Film, le linee Eco Converting, Eco Manuale ed Eco Automatico danno spazio a materiale proveniente da processi di riciclo.",
    "pallet-wrap.webp",
) + """
<section class="material-experience film-study block" id="bobina" data-material-study aria-labelledby="reel-title">
  <div class="wrap">
    <div class="study-heading"><div><p class="eyebrow">LA MATERIA, DA VICINO</p><h2 class="display small" id="reel-title" data-lines>Dal rotolo.<br><em>Alla protezione.</em></h2></div><p>Compatto all’origine.<br>Flessibile quando serve.</p></div>
    <div class="study-window">
      <div class="study-panel is-active"><img src="assets/bobine.webp" width="480" height="361" alt="Bobine di film, dalla presentazione Imballaggi 2G"><span>01 / La bobina</span></div>
      <div class="study-panel film-detail"><img src="assets/film-texture.webp" width="1500" height="1000" alt="Dettaglio fotografico della trama di una pellicola trasparente"><span>02 / La materia si distende</span></div>
      <div class="study-panel film-application"><img src="assets/pallet-wrap.webp" width="1500" height="1000" alt="Immagine di contesto: film avvolto intorno a un carico"><span>03 / Il carico prende forma</span></div>
      <div class="study-scan" aria-hidden="true"></div>
    </div>
    <div class="study-controls" aria-label="Esplora il film"><button data-step="0" aria-pressed="true">01 <span>La bobina</span></button><button data-step="1" aria-pressed="false">02 <span>La pellicola</span></button><button data-step="2" aria-pressed="false">03 <span>La protezione</span></button></div>
  </div>
</section>

<section class="block" aria-labelledby="tiger-title">
  <div class="wrap">
    <div class="block-top">
      <p class="eyebrow">TIGER FILM</p>
      <span>Contenuto totale di riciclato</span>
    </div>
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
      <span>N. 3040/2024</span><span class="round-arrow" aria-label="Apri PDF">↗</span>
    </a>
  </div>
</section>

<section class="block tinted" aria-labelledby="reels-photo">
  <div class="wrap split">
    <div class="reel-visual">
      <img src="assets/bobine.webp" alt="Bobine di film dalla presentazione Imballaggi 2G" loading="lazy" width="480" height="361">
      <span>LA LINEA TIGER FILM</span>
    </div>
    <div>
      <p class="eyebrow">IN MAGAZZINO</p>
      <h2 id="reels-photo" class="display small" data-lines>Le nostre bobine.</h2>
      <p class="lead">Formati e spessori diversi per il confezionamento manuale e per le macchine avvolgitrici. Raccontaci il carico da fasciare: troviamo la bobina giusta.</p>
      <a class="text-link" href="contatti.html">Chiedi un formato <span aria-hidden="true">↗</span></a>
    </div>
  </div>
</section>
"""

# ============================================================ PROTEZIONI
PROTEZIONI = page_hero(
    "protezioni",
    "Un cuscino d’aria<br>fra il prodotto<br>e <em>il viaggio.</em>",
    "Pluriball, polietilene espanso, angolari e cuscini d’aria: tutto ciò che assorbe gli urti e protegge le superfici delicate.",
    "bubble.webp",
) + """
<section class="block" aria-labelledby="pr-title">
  <div class="wrap split">
    <div>
      <p class="eyebrow">LA GAMMA</p>
      <h2 id="pr-title" class="display small" data-lines>Materiali diversi,<br>lo stesso <em>compito.</em></h2>
      <p class="lead">Ogni prodotto ha un punto debole: uno spigolo, una superficie lucida, un peso mal distribuito. Scegliamo insieme il materiale che lo copre.</p>
      <a class="text-link" href="assets/brochure-foam.pdf" target="_blank" rel="noopener">Sfoglia la brochure Foam <span aria-hidden="true">↗</span></a>
    </div>
    <div class="details-list" data-stagger>
      <details open>
        <summary>Pluriball <span aria-hidden="true">+</span></summary>
        <div class="details-body"><p>Il film a bolle d’aria che assorbe gli urti durante la movimentazione. Completa la gamma insieme agli angolari e ai cuscini d’aria.</p></div>
      </details>
      <details>
        <summary>Polietilene espanso <span aria-hidden="true">+</span></summary>
        <div class="details-body"><p>Protezioni in polietilene espanso per superfici e prodotti delicati. Lavorazioni, formati e accoppiamenti per esigenze di imballaggio differenti.</p></div>
      </details>
      <details>
        <summary>Angolari e cuscini d’aria <span aria-hidden="true">+</span></summary>
        <div class="details-body"><p>Angolari per proteggere gli spigoli e cuscini d’aria per riempire i vuoti dentro il collo, così il contenuto non si muove.</p></div>
      </details>
    </div>
  </div>
</section>

<section class="block tinted" aria-labelledby="pr-psv">
  <div class="wrap narrow center">
    <p class="eyebrow">DALLA STESSA PARTE</p>
    <h2 id="pr-psv" class="display small" data-lines>Proteggere non deve<br>voler dire <em>sprecare.</em></h2>
    <p class="lead">Le nostre linee certificate Plastica Seconda Vita portano il riciclo dentro il mondo dell’imballaggio.</p>
    <a class="button magnetic" href="sostenibilita.html">Vai alla sostenibilità <span aria-hidden="true">↗</span></a>
  </div>
</section>
"""

# ============================================================ BUSTE
BUSTE = page_hero(
    "buste",
    "Chiudere bene,<br><em>alla prima.</em>",
    "Buste e confezionamento per il negozio, il magazzino e la spedizione.",
    "film-texture.webp",
) + """
<section class="block" aria-labelledby="bu-title">
  <div class="wrap">
    <div class="block-top">
      <p class="eyebrow">LA GAMMA</p>
      <span>Buste e confezionamento</span>
    </div>
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
    <p class="eyebrow">CERTIFICAZIONE</p>
    <h2 id="bu-psv" class="display small" data-lines>Buste e fogli protettivi<br>nel campo del <em>certificato PSV.</em></h2>
    <p class="lead">Il certificato n. 3433/2026 riguarda la produzione di coprispalla, coprisedia, buste e fogli protettivi con MPS da sottoprodotto esterno. Il campo di applicazione è specificato nel documento.</p>
    <a class="button magnetic" href="assets/certificato-coprispalla-3433-2026.pdf" target="_blank" rel="noopener">Leggi il certificato <span aria-hidden="true">↗</span></a>
  </div>
</section>
"""

# ============================================================ MACCHINE
MACCHINE = page_hero(
    "macchine",
    "Chiudere.<br>Reggiare.<br><em>Muovere.</em>",
    "Nastri, reggette, corde e cinghie, accessori e macchine per l’imballaggio: la parte che tiene insieme il carico.",
    "machines.webp",
) + """
<section class="block" aria-labelledby="ma-title">
  <div class="wrap">
    <div class="block-top">
      <p class="eyebrow">LA GAMMA</p>
      <span>Chiusura e movimentazione</span>
    </div>
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
    <p class="eyebrow">ASSISTENZA</p>
    <h2 id="ma-cta" class="display small" data-lines>Non solo forniture.<br><em>Affiancamento.</em></h2>
    <p class="lead">Affianchiamo le imprese con attenzione, competenza e flessibilità: dal formato giusto alla macchina adatta al ritmo del tuo magazzino.</p>
    <a class="button magnetic" href="contatti.html">Parliamone <span aria-hidden="true">↗</span></a>
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
      <p class="eyebrow">IL NOSTRO SIMBOLO</p>
      <h2 id="so-turtle" class="display small" data-lines>Lenta,<br>ma <em>va lontano.</em></h2>
      <p class="lead">La tartaruga è il simbolo del progetto Puglia Plastic Second Life presentato dall’azienda: un invito a dare continuità al valore della materia.</p>
      <div class="circular-words" data-stagger>
        <span>Materia</span><i aria-hidden="true">↗</i><span>Protezione</span><i aria-hidden="true">↗</i><span>Nuova vita</span>
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
    <div class="block-top">
      <p class="eyebrow">IMPEGNI DOCUMENTATI</p>
      <span>Documenti da consultare</span>
    </div>
    <div class="split">
      <h2 id="so-cert" class="display small" data-lines>La fiducia.<br>Nero su <em>bianco.</em></h2>
      <div>
        <p class="lead">Certificazioni da leggere, materiali da conoscere. Qui trovi i documenti che accompagnano le nostre linee di prodotto.</p>
        <div class="cert-marks">
          <img src="assets/psv.webp" alt="Marchio Plastica Seconda Vita" width="300" height="200" loading="lazy">
          <img src="assets/ippr.webp" alt="Istituto per la Promozione delle Plastiche da Riciclo" width="250" height="250" loading="lazy">
        </div>
      </div>
    </div>
    <div data-stagger class="cert-list">
      <a class="doc-row" href="assets/certificato-coprispalla-3433-2026.pdf" target="_blank" rel="noopener">
        <span>PSV · Sottoprodotto</span><span>Coprispalla, coprisedia, buste e fogli protettivi</span>
        <span>N. 3433/2026</span><span class="round-arrow" aria-label="Apri PDF">↗</span>
      </a>
      <a class="doc-row" href="assets/certificato-film-3040-2024.pdf" target="_blank" rel="noopener">
        <span>PSV · MixEco</span><span>Commercializzazione di film in polietilene certificato</span>
        <span>N. 3040/2024</span><span class="round-arrow" aria-label="Apri PDF">↗</span>
      </a>
      <a class="doc-row" href="assets/presentazione-plastica-seconda-vita.pdf" target="_blank" rel="noopener">
        <span>Presentazione</span><span>Plastica Seconda Vita e allegato prodotti</span>
        <span>PDF</span><span class="round-arrow" aria-label="Apri PDF">↗</span>
      </a>
    </div>
  </div>
</section>
"""

# ============================================================ AZIENDA
AZIENDA = page_hero(
    "azienda",
    "Una storia<br>di famiglia.<br><em>Una visione<br>che cresce.</em>",
    "La nostra esperienza nasce dal lavoro di Aldo Giuri e da una passione per l’imballaggio trasmessa alla generazione successiva.",
    "warehouse.webp",
) + """
<section class="block" aria-labelledby="az-title">
  <div class="wrap split">
    <div>
      <div class="story-place">Sannicola<br><span>Salento, Puglia</span></div>
      <h2 id="az-title" class="display small" data-lines>Radici salentine.<br>Sguardo <em>aperto.</em></h2>
    </div>
    <div>
      <p class="lead">Con Imballaggi 2G questa storia si apre a nuove esigenze: dalla protezione dei capi alla movimentazione delle merci, affianchiamo le imprese con attenzione, competenza e flessibilità.</p>
      <div class="story-locations" data-stagger>
        <span class="locations-label">Dove operiamo</span><span>Lecce</span><span>Brindisi</span><span>Taranto</span>
      </div>
    </div>
  </div>
</section>

<section class="block tinted" aria-labelledby="az-time">
  <div class="wrap">
    <p class="eyebrow">LA LINEA DEL TEMPO</p>
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
    <p class="eyebrow"><i class="tag">08</i> IL PROSSIMO PROGETTO INIZIA QUI</p>
    <a class="contact-headline" id="co-title" href="mailto:info@imballaggi2g.it">Diamo forma<br>alla tua <em>soluzione.</em><span aria-hidden="true">↗</span></a>
    <div class="contact-grid" data-stagger>
      <div><span>Scrivici</span><a href="mailto:info@imballaggi2g.it">info@imballaggi2g.it</a></div>
      <div><span>Chiamaci</span><a href="tel:+390833861000">0833 861000</a></div>
      <div><span>Vieni a trovarci</span><a href="https://www.google.com/maps/place/IMBALLAGGI+2G+s.r.l./@40.0911849,18.0653234,17z/data=!3m1!4b1!4m6!3m5!1s0x13441f7b57c7b16f:0xfc850e22ba05aec7!8m2!3d40.0911849!4d18.0678983!16s%2Fg%2F11jyjc4qhs" target="_blank" rel="noopener">Via dei Cavamonti, Z.I.<br>73017 Sannicola (LE) ↗</a></div>
      <div><span>Seguici</span><a href="https://www.instagram.com/imballaggi2g/" target="_blank" rel="noopener">Instagram ↗</a></div>
    </div>
    <p class="contact-note">Nessun modulo da compilare: scrivici o chiamaci, ti risponde una persona.</p>
  </div>
</section>
"""

# ============================================================ scrittura
PAGES = [
    (None,           "index.html",        "Imballaggi 2G — La cura, in ogni forma.",
     "Imballaggi 2G, Sannicola (Salento): coprispalla, bobine e film, pluriball, buste, nastri e macchine per l’imballaggio. Linee certificate Plastica Seconda Vita.", HOME, "is-home"),
    ("coprispalla",  "coprispalla.html",  "Coprispalla protettivi — Imballaggi 2G",
     "Coprispalla protettivi per l’abbigliamento: taglio sagomato e retto, larghezza 46 cm, schede tecniche e certificato PSV n. 3433/2026.", COPRISPALLA, ""),
    ("bobine",       "bobine.html",       "Bobine e film — Imballaggi 2G",
     "Film per confezionamento e movimentazione e linea Tiger Film: Eco Converting, Eco Manuale ed Eco Automatico, con contenuto di riciclato certificato PSV MixEco.", BOBINE, ""),
    ("protezioni",   "protezioni.html",   "Protezioni: pluriball e foam — Imballaggi 2G",
     "Pluriball, polietilene espanso, angolari e cuscini d’aria per proteggere superfici e prodotti delicati durante la movimentazione.", PROTEZIONI, ""),
    ("buste",        "buste.html",        "Buste e confezionamento — Imballaggi 2G",
     "Buste, shopping bag, chiusura minigrip o strip adesiva, buste per materassi, film e cappucci termoretraibili.", BUSTE, ""),
    ("macchine",     "macchine.html",     "Macchine e movimentazione — Imballaggi 2G",
     "Nastri adesivi e in carta, reggette in PP, PET e acciaio, corde e cinghie, accessori e macchine per imballaggio.", MACCHINE, ""),
    ("sostenibilita","sostenibilita.html","Sostenibilità e certificazioni — Imballaggi 2G",
     "Plastica Seconda Vita: le certificazioni PSV n. 3433/2026 e n. 3040/2024 e il nostro impegno sul riciclo nell’imballaggio.", SOSTENIBILITA, ""),
    ("azienda",      "azienda.html",      "L’azienda — Imballaggi 2G",
     "Da Aldo Giuri a Imballaggi 2G: una storia di famiglia a Sannicola, nel Salento, fra Lecce, Brindisi e Taranto.", AZIENDA, ""),
    ("contatti",     "contatti.html",     "Contatti — Imballaggi 2G",
     "Scrivi a info@imballaggi2g.it, chiama lo 0833 861000 o vieni a trovarci in Via dei Cavamonti, Z.I., Sannicola (LE).", CONTATTI, "is-dark"),
]


def main():
    DIST.mkdir(exist_ok=True)
    for key, filename, title, description, body, body_class in PAGES:
        html = shell(key, title, description, enrich(key, body), body_class)
        (DIST / filename).write_text(html, encoding="utf-8")
        print(f"  {filename:22} {len(html):>7} byte")
    print(f"\n{len(PAGES)} pagine scritte in {DIST} (versione asset ?v={VERSION})")


if __name__ == "__main__":
    main()
