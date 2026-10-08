#!/usr/bin/env python3
"""
Blocchi fotografici del sito.

Tutte le immagini qui sotto sono fotografie dell'azienda (cartella
`foto_andrea`, scatti di ottobre 2026): prodotto, linea di produzione,
magazzino e sede. Vivono in `dist/assets/azienda/`, i video in
`dist/assets/video/`.

Ogni figura entra con una rivelazione a maschera (`photo-mask`): il
ritaglio si apre dal basso mentre l'immagine rientra da una leggera scala.
I video partono solo quando entrano nello schermo e si fermano quando escono.
"""

A = "assets/azienda/"
V = "assets/video/"


def shot(img, alt, caption=None, ratio="4/3", parallax=None, cls=""):
    """Una fotografia con rivelazione a maschera."""
    par = f' data-parallax="{parallax}"' if parallax else ""
    cap = f'<figcaption>{caption}</figcaption>' if caption else ""
    return (f'<figure class="shot photo-mask {cls}" style="--ratio:{ratio}">'
            f'<span class="shot-frame"{par}><img src="{A}{img}" alt="{alt}" loading="lazy"></span>'
            f'{cap}</figure>')


def clip(name, alt, caption=None, ratio="16/9", cls=""):
    """Un video muto in loop, che parte quando entra nello schermo."""
    cap = f'<figcaption>{caption}</figcaption>' if caption else ""
    return (f'<figure class="shot video-shot photo-mask {cls}" style="--ratio:{ratio}">'
            f'<span class="shot-frame"><video src="{V}{name}.mp4" poster="{V}{name}-poster.webp" '
            f'muted loop playsinline preload="none" aria-label="{alt}"></video>'
            f'<span class="shot-play" aria-hidden="true"></span></span>{cap}</figure>')


def row(eyebrow, title, text, figures, tint=False, extra=""):
    """Blocco con titolo a sinistra e una fila di figure."""
    cls = "block tinted" if tint else "block"
    body = "\n      ".join(figures)
    lead = f'<p class="lead">{text}</p>' if text else ""
    return f"""
<section class="{cls}">
  <div class="wrap">
    <div class="shot-head">
      <div>
        <p class="eyebrow">{eyebrow}</p>
        <h2 class="display small" data-lines>{title}</h2>
      </div>
      {lead}
    </div>
    <div class="shot-row" data-stagger>
      {body}
    </div>{extra}
  </div>
</section>"""


def split(img, alt, eyebrow, title, text, link=None, flip=False, caption=None):
    """Una fotografia grande accanto a un testo."""
    cta = ""
    if link:
        href, label = link
        cta = f'<a class="text-link" href="{href}">{label} <span aria-hidden="true">↗</span></a>'
    side = "shot-split flip" if flip else "shot-split"
    return f"""
<section class="block">
  <div class="wrap {side}">
    {shot(img, alt, caption, ratio="3/4", parallax="0.05")}
    <div class="shot-copy">
      <p class="eyebrow">{eyebrow}</p>
      <h2 class="display small" data-lines>{title}</h2>
      <p class="lead">{text}</p>
      {cta}
    </div>
  </div>
</section>"""


def band(items, label=None):
    """Fascia a tutta larghezza che scorre lentamente."""
    cells = "".join(
        f'<span class="band-cell"><img src="{A}{img}" alt="{alt}" loading="lazy"></span>'
        for img, alt in items)
    cap = f'<p class="band-label">{label}</p>' if label else ""
    return f"""
<section class="photo-band" aria-label="Immagini dall'azienda">
  {cap}
  <div class="band-track">{cells}{cells}</div>
</section>"""


def duo(a, b, eyebrow, title, text, tint=False):
    """Due figure sfalsate in verticale, con il testo in mezzo."""
    cls = "block tinted" if tint else "block"
    return f"""
<section class="{cls}">
  <div class="wrap shot-duo">
    {a}
    <div class="shot-copy">
      <p class="eyebrow">{eyebrow}</p>
      <h2 class="display small" data-lines>{title}</h2>
      <p class="lead">{text}</p>
    </div>
    {b}
  </div>
</section>"""


# ============================================================ i blocchi, sezione per sezione
# "dopo" = inserito subito sotto la testata della pagina
# "fine" = aggiunto in coda, prima del rimando alla sezione successiva

AFTER = {}
END = {}

# ---------------------------------------------------------------- coprispalla
AFTER["coprispalla"] = row(
    "IL PRODOTTO, DAL VERO",
    "Non si vede.<br>Ed è <em>il punto.</em>",
    "Un velo che prende la forma della spalla, lascia passare il gancio e non pesa sul capo. "
    "Queste sono riprese del prodotto, non rendering.",
    [
        clip("coprispalla-volume", "Un coprispalla appeso che si apre e mostra il volume della spalla",
             "Il volume sulla spalla", ratio="4/5"),
        clip("coprispalla-gruccia", "Il coprispalla infilato sulla gruccia, visto da vicino",
             "Il passaggio del gancio", ratio="4/5"),
        clip("coprispalla-foro", "Il profilo sagomato del coprispalla in controluce",
             "Il taglio sagomato", ratio="4/5"),
    ])

END["coprispalla"] = row(
    "COME NASCE",
    "Dalla bobina<br>al <em>capo finito.</em>",
    "Il film arriva in bobina, passa sotto la saldatrice e ne esce sagomato. "
    "Tutto in casa, su macchine nostre.",
    [
        shot("coprispalla-linea.webp", "Il film del coprispalla che scorre sulla macchina da taglio",
             "La linea di taglio", ratio="3/4"),
        shot("coprispalla-barre.webp", "Fogli di film protettivo stesi sulle barre della linea",
             "I fogli in uscita", ratio="3/4"),
        shot("macchina-saldatura.webp", "Dettaglio del gruppo di saldatura sopra il film",
             "Il gruppo di saldatura", ratio="3/4"),
    ], tint=True)

# ---------------------------------------------------------------- bobine
AFTER["bobine"] = split(
    "bobina-macchina.webp",
    "Una bobina di film montata sulla macchina, pronta a srotolarsi",
    "LA BOBINA VERA",
    "Larga quanto serve.<br>Lunga <em>quanto basta.</em>",
    "Montiamo la bobina sulla macchina e la lavoriamo nel formato richiesto. "
    "Quella qui accanto è una delle nostre, fotografata in produzione.",
    link=("#bobina", "Guarda come si srotola"),
    caption="Bobina in macchina")

END["bobine"] = row(
    "IN MAGAZZINO",
    "Pronte <em>a partire.</em>",
    "Il magazzino tiene i formati di uso corrente, così una richiesta urgente non diventa un'attesa.",
    [
        shot("bobine-cataste.webp", "Cataste di bobine di pluriball imballate nel magazzino", ratio="4/3"),
        shot("magazzino-vista.webp", "Il magazzino visto d'insieme, con il muletto fra le colonne di bobine", ratio="4/3"),
        shot("magazzino-muletto.webp", "Il muletto fra le colonne di bobine in magazzino", ratio="4/3"),
    ], tint=True)

# ---------------------------------------------------------------- protezioni
AFTER["protezioni"] = row(
    "ARIA, IMPRIGIONATA",
    "Il materiale<br>in <em>movimento.</em>",
    "Il pluriball è quasi tutto aria: è per questo che assorbe. Qui si vede come si comporta in mano.",
    [
        clip("pluriball-foglio", "Un foglio di pluriball sagomato appeso a una gruccia, in controluce",
             "Un foglio in controluce", ratio="4/5"),
        clip("pluriball-macro", "Dettaglio ravvicinato delle bolle d'aria del pluriball",
             "Le bolle, da vicino", ratio="4/5"),
        shot("pluriball-fogli.webp", "Fogli di pluriball accatastati pronti all'uso",
             "I fogli pronti", ratio="4/5"),
    ])

END["protezioni"] = row(
    "POLIETILENE ESPANSO",
    "Morbido fuori,<br>fermo <em>dentro.</em>",
    "L'espanso lavora dove il pluriball non arriva: superfici lucide, spigoli, pezzi che non devono rigarsi.",
    [
        shot("espanso-macro.webp", "Macro della superficie di un foglio di polietilene espanso",
             "La grana dell'espanso", ratio="4/3"),
        shot("espanso-fogli.webp", "Fogli di polietilene espanso sovrapposti, visti di taglio",
             "Spessori a confronto", ratio="4/3"),
        shot("magazzino-pluriball.webp", "Bobine di pluriball e cartone accatastati nel magazzino",
             "Pluriball e cartone", ratio="4/3"),
    ], tint=True)

# ---------------------------------------------------------------- buste
END["buste"] = row(
    "DOVE NASCONO",
    "Un foglio,<br>due <em>saldature.</em>",
    "Buste e fogli protettivi escono dalle stesse linee: si cambia formato, non fornitore.",
    [
        shot("fogli-uscita.webp", "Fogli bianchi che escono dai rulli della macchina", "In uscita dai rulli", ratio="4/3"),
        shot("macchina-bobine.webp", "La macchina che svolge il film dalle bobine", "Lo svolgimento", ratio="4/3"),
        shot("reparto-produzione.webp", "Il reparto di produzione con le cataste di fogli", "Il reparto", ratio="4/3"),
    ], tint=True)

# ---------------------------------------------------------------- macchine
AFTER["macchine"] = row(
    "IL NOSTRO REPARTO",
    "Macchine che<br>conosciamo <em>a memoria.</em>",
    "Le usiamo tutti i giorni: per questo sappiamo consigliare quella giusta e non quella più grande.",
    [
        shot("macchina-2g.webp", "Una macchina confezionatrice con il marchio Imballaggi 2G",
             "Confezionatrice", ratio="4/3"),
        shot("macchina-comandi.webp", "Il quadro comandi di una linea di confezionamento",
             "Il quadro comandi", ratio="4/3"),
        shot("macchina-linea.webp", "La linea di produzione vista di lato, con il film in tensione",
             "La linea", ratio="4/3"),
    ])

END["macchine"] = split(
    "nastro-psv.webp",
    "Rotoli di nastro adesivo personalizzato con il marchio Imballaggi 2G e Plastica Seconda Vita",
    "NASTRI PERSONALIZZATI",
    "La scatola parla<br>prima di <em>aprirsi.</em>",
    "Stampiamo il nastro con il tuo marchio. Il nostro porta la tartaruga Plastica Seconda Vita: "
    "chi riceve il collo sa da dove arriva e di cosa è fatto.",
    link=("sostenibilita.html", "La linea certificata"),
    flip=True,
    caption="Nastro personalizzato")

# ---------------------------------------------------------------- sostenibilita
AFTER["sostenibilita"] = duo(
    shot("nastro-psv.webp", "Rotoli di nastro con il marchio Puglia Plastic Second Life",
         "Il marchio sul nastro", ratio="4/3", parallax="0.04"),
    shot("scatole-nastro.webp", "Scatole chiuse con il nastro che riporta il marchio Plastica Seconda Vita",
         "Sui colli in partenza", ratio="4/3", parallax="0.06"),
    "NON SOLO SULLA CARTA",
    "Il marchio finisce<br>sul <em>prodotto.</em>",
    "Plastica Seconda Vita non resta un certificato in un cassetto: è stampato sul nastro "
    "che chiude i colli in partenza.")

# ---------------------------------------------------------------- azienda
AFTER["azienda"] = split(
    "sede-insegna.webp",
    "L'insegna Imballaggi 2G sopra l'ingresso della sede",
    "LA SEDE",
    "Un'insegna,<br>una <em>targa.</em>",
    "Niente di più. Il resto sta dentro: il reparto, il magazzino e le persone che li tengono in piedi.",
    link=("contatti.html", "Vieni a trovarci"),
    caption="L'ingresso")

END["azienda"] = band([
    ("reparto-produzione.webp", "Il reparto di produzione"),
    ("magazzino-bobine.webp", "Il magazzino delle bobine"),
    ("macchina-rulli.webp", "I rulli della linea di produzione"),
    ("sede-cancello.webp", "La sede vista dalla strada"),
    ("muletto.webp", "Il muletto in magazzino"),
    ("macchina-2g.webp", "Una macchina con il marchio Imballaggi 2G"),
], label="Dentro l'azienda")

# ---------------------------------------------------------------- contatti
END["contatti"] = band([
    ("sede-insegna.webp", "L'insegna sopra l'ingresso"),
    ("sede-edificio.webp", "La palazzina della sede"),
    ("sede-cancello.webp", "L'ingresso dalla strada"),
    ("magazzino-bobine.webp", "Il magazzino"),
], label="Dove ci trovi")

# ---------------------------------------------------------------- home
HOME_BAND = band([
    ("macchina-2g.webp", "Una macchina con il marchio Imballaggi 2G"),
    ("bobine-cataste.webp", "Cataste di bobine in magazzino"),
    ("coprispalla-linea.webp", "Il film del coprispalla sulla linea di taglio"),
    ("nastro-psv.webp", "Nastro personalizzato con il marchio Plastica Seconda Vita"),
    ("fogli-uscita.webp", "Fogli in uscita dai rulli"),
    ("magazzino-muletto.webp", "Il muletto fra le bobine"),
    ("espanso-macro.webp", "Macro del polietilene espanso"),
    ("sede-insegna.webp", "L'insegna della sede"),
], label="Dall'azienda")


def with_photos(key, body):
    """Innesta i blocchi fotografici nel corpo della pagina."""
    after = AFTER.get(key, "")
    if after:
        head, rest = body.split("</section>", 1)
        body = head + "</section>" + after + rest
    return body + END.get(key, "")
