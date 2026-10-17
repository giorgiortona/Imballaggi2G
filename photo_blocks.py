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


def shot(img, alt, ratio="4/3", parallax=None, cls=""):
    """Una fotografia con rivelazione a maschera. Nessuna didascalia a vista:
    il testo descrittivo resta nell'alt, per chi naviga senza vedere."""
    par = f' data-parallax="{parallax}"' if parallax else ""
    return (f'<figure class="shot photo-mask {cls}" style="--ratio:{ratio}">'
            f'<span class="shot-frame"{par}><img src="{A}{img}" alt="{alt}" loading="lazy"></span>'
            f'</figure>')


def clip(name, alt, ratio="16/9", cls=""):
    """Un video muto in loop, che parte quando entra nello schermo."""
    return (f'<figure class="shot video-shot photo-mask {cls}" style="--ratio:{ratio}">'
            f'<span class="shot-frame"><video src="{V}{name}.mp4" poster="{V}{name}-poster.webp" '
            f'muted loop playsinline preload="none" aria-label="{alt}"></video>'
            f'<span class="shot-play" aria-hidden="true"></span></span></figure>')


def row(title, text, figures, tint=False, extra=""):
    """Blocco con titolo a sinistra e una fila di figure."""
    cls = "block tinted" if tint else "block"
    body = "\n      ".join(figures)
    lead = f'<p class="lead">{text}</p>' if text else ""
    return f"""
<section class="{cls}">
  <div class="wrap">
    <div class="shot-head">
      <h2 class="display small" data-lines>{title}</h2>
      {lead}
    </div>
    <div class="shot-row" data-stagger>
      {body}
    </div>{extra}
  </div>
</section>"""


def split(img, alt, title, text, link=None, flip=False):
    """Una fotografia grande accanto a un testo."""
    cta = ""
    if link:
        href, label = link
        cta = f'<a class="text-link" href="{href}">{label} <span aria-hidden="true">↗</span></a>'
    side = "shot-split flip" if flip else "shot-split"
    return f"""
<section class="block">
  <div class="wrap {side}">
    {shot(img, alt, ratio="3/4", parallax="0.05")}
    <div class="shot-copy">
      <h2 class="display small" data-lines>{title}</h2>
      <p class="lead">{text}</p>
{cta}
    </div>
  </div>
</section>"""


def band(items):
    """Fascia a tutta larghezza che scorre lentamente."""
    cells = "".join(
        f'<span class="band-cell"><img src="{A}{img}" alt="{alt}" loading="lazy"></span>'
        for img, alt in items)
    return f"""
<section class="photo-band" aria-label="Immagini dall'azienda">
  <div class="band-track">{cells}{cells}</div>
</section>"""


def duo(a, b, title, text, tint=False):
    """Due figure sfalsate in verticale, con il testo in mezzo."""
    cls = "block tinted" if tint else "block"
    return f"""
<section class="{cls}">
  <div class="wrap shot-duo">
    {a}
    <div class="shot-copy">
      <h2 class="display small" data-lines>{title}</h2>
      <p class="lead">{text}</p>
    </div>
    {b}
  </div>
</section>"""


# ============================================================ i blocchi, sezione per sezione
# "dopo" = inserito subito sotto la testata della pagina
# "fine" = aggiunto in coda, prima del rimando alla sezione successiva
# Niente occhielli ne' didascalie: parlano le fotografie, il testo resta
# dove dice qualcosa che la foto non dice.

AFTER = {}
END = {}

# ---------------------------------------------------------------- coprispalla
AFTER["coprispalla"] = """
<section class="shoulder-story" id="coprispalla-in-dettaglio" aria-labelledby="shoulder-title">
 <div class="shoulder-pin">
  <div class="shoulder-copy">
   <p class="shoulder-eyebrow">IL COPRISPALLA, DA VICINO</p>
   <h2 class="display small" id="shoulder-title">La cura prende<br><em>forma.</em></h2>
   <div class="shoulder-chapters">
    <article class="shoulder-chapter is-active" id="shoulder-detail-0"><span class="shoulder-index">01 / LA FORMA</span><h3>Segue la spalla.</h3><p>Il taglio sagomato accompagna il profilo della gruccia. Una protezione che prende volume, con la discrezione di un velo.</p></article>
    <article class="shoulder-chapter" id="shoulder-detail-1"><span class="shoulder-index">02 / IL PASSAGGIO</span><h3>Ogni dettaglio trova posto.</h3><p>Il gancio attraversa l’apertura superiore. Il coprispalla si dispone sulla gruccia e lascia il capo pronto da appendere.</p></article>
    <article class="shoulder-chapter" id="shoulder-detail-2"><span class="shoulder-index">03 / IL FORMATO</span><h3>46 cm. La tua lunghezza.</h3><p>Una larghezza comune, lunghezze diverse. Taglio sagomato o retto: scegliamo insieme la variante adatta al tuo capo.</p><a class="text-link" href="assets/schede-coprispalla.pdf" target="_blank" rel="noopener">Esplora i formati ↗</a></article>
   </div>
   <div class="shoulder-nav" aria-label="Dettagli del coprispalla"><button type="button" data-shoulder-step="0" aria-controls="shoulder-detail-0" aria-pressed="true">Forma</button><button type="button" data-shoulder-step="1" aria-controls="shoulder-detail-1" aria-pressed="false">Gruccia</button><button type="button" data-shoulder-step="2" aria-controls="shoulder-detail-2" aria-pressed="false">Formato</button></div>
  </div>
  <figure class="shoulder-visual">
   <div class="shoulder-object"><img src="assets/realistic/coprispalla-studio.webp" width="1024" height="1536" loading="lazy" alt="Ricostruzione fotografica del coprispalla dai video aziendali: film bianco traslucido, spalle sagomate e gruccia interna.">
    <span class="shoulder-marker is-active" style="--x:76%;--y:24%" aria-hidden="true"><i></i><b>Taglio sagomato</b></span>
    <span class="shoulder-marker" style="--x:50%;--y:12%" aria-hidden="true"><i></i><b>Passaggio gruccia</b></span>
    <span class="shoulder-marker" style="--x:77%;--y:78%" aria-hidden="true"><i></i><b>Formato su richiesta</b></span>
   </div>
  </figure>
 </div>
</section>
"""

END["coprispalla"] = row(
    "Dalla bobina<br>al <em>capo finito.</em>",
    "Il film arriva in bobina, passa sotto la saldatrice e ne esce sagomato.",
    [
        shot("coprispalla-linea.webp", "Il film del coprispalla che scorre sulla macchina da taglio", ratio="3/4"),
        shot("coprispalla-barre.webp", "Fogli di film protettivo stesi sulle barre della linea", ratio="3/4"),
        shot("macchina-saldatura.webp", "Dettaglio del gruppo di saldatura sopra il film", ratio="3/4"),
    ], tint=True)

# ---------------------------------------------------------------- bobine
AFTER["bobine"] = split(
    "bobina-macchina.webp",
    "Una bobina di film montata sulla macchina, pronta a srotolarsi",
    "Larga quanto serve.<br>Lunga <em>quanto basta.</em>",
    "Montiamo la bobina sulla macchina e la lavoriamo nel formato richiesto.")

END["bobine"] = row(
    "Pronte <em>a partire.</em>",
    "Il magazzino tiene i formati di uso corrente, così una richiesta urgente non diventa un'attesa.",
    [
        shot("bobine-cataste.webp", "Cataste di bobine di pluriball imballate nel magazzino", ratio="4/3"),
        shot("magazzino-vista.webp", "Il magazzino visto d'insieme, con il muletto fra le colonne di bobine", ratio="4/3"),
        shot("magazzino-muletto.webp", "Il muletto fra le colonne di bobine in magazzino", ratio="4/3"),
    ], tint=True)

# ---------------------------------------------------------------- protezioni
AFTER["protezioni"] = split(
    "pluriball-fogli.webp",
    "La struttura a bolle dei fogli di pluriball, vista da vicino",
    "L’aria diventa<br><em>protezione.</em>",
    "Una superficie di piccole camere d’aria accompagna il prodotto e attutisce gli urti. In fogli o in bobina, il pluriball si adatta alla forma di ciò che vuoi proteggere.")

END["protezioni"] = row(
    "Morbido fuori,<br>fermo <em>dentro.</em>",
    "L'espanso lavora dove il pluriball non arriva: superfici lucide, spigoli, pezzi che non devono rigarsi.",
    [
        shot("espanso-macro.webp", "Macro della superficie di un foglio di polietilene espanso", ratio="4/3"),
        shot("espanso-fogli.webp", "Fogli di polietilene espanso sovrapposti, visti di taglio", ratio="4/3"),
        shot("magazzino-pluriball.webp", "Bobine di pluriball e cartone accatastati nel magazzino", ratio="4/3"),
    ], tint=True)

# ---------------------------------------------------------------- buste
END["buste"] = row(
    "Un foglio,<br>due <em>saldature.</em>",
    "Buste e fogli protettivi escono dalle stesse linee: si cambia formato, non fornitore.",
    [
        shot("fogli-uscita.webp", "Fogli bianchi che escono dai rulli della macchina", ratio="4/3"),
        shot("macchina-bobine.webp", "La macchina che svolge il film dalle bobine", ratio="4/3"),
        shot("reparto-produzione.webp", "Il reparto di produzione con le cataste di fogli", ratio="4/3"),
    ], tint=True)

# ---------------------------------------------------------------- macchine
AFTER["macchine"] = row(
    "Macchine che<br>conosciamo <em>a memoria.</em>",
    "Le usiamo tutti i giorni: per questo sappiamo consigliare quella giusta e non quella più grande.",
    [
        shot("macchina-2g.webp", "Una macchina confezionatrice con il marchio Imballaggi 2G", ratio="4/3"),
        shot("macchina-comandi.webp", "Il quadro comandi di una linea di confezionamento", ratio="4/3"),
        shot("macchina-linea.webp", "La linea di produzione vista di lato, con il film in tensione", ratio="4/3"),
    ])

END["macchine"] = split(
    "nastro-psv.webp",
    "Rotoli di nastro adesivo personalizzato con il marchio Imballaggi 2G e Plastica Seconda Vita",
    "La scatola parla<br>prima di <em>aprirsi.</em>",
    "Stampiamo il nastro con il tuo marchio. Il nostro porta la tartaruga Plastica Seconda Vita.",
    link=("sostenibilita.html", "La linea certificata"),
    flip=True)

# ---------------------------------------------------------------- sostenibilita
AFTER["sostenibilita"] = duo(
    shot("nastro-psv.webp", "Rotoli di nastro con il marchio Puglia Plastic Second Life",
         ratio="4/3", parallax="0.04"),
    shot("scatole-nastro.webp", "Scatole chiuse con il nastro che riporta il marchio Plastica Seconda Vita",
         ratio="4/3", parallax="0.06"),
    "Il marchio finisce<br>sul <em>prodotto.</em>",
    "Plastica Seconda Vita non resta un certificato in un cassetto: è stampato sul nastro "
    "che chiude i colli in partenza.")

# ---------------------------------------------------------------- azienda
AFTER["azienda"] = split(
    "sede-insegna.webp",
    "L'insegna Imballaggi 2G sopra l'ingresso della sede",
    "Un'insegna,<br>una <em>targa.</em>",
    "Il resto sta dentro: il reparto, il magazzino e le persone che li tengono in piedi.",
    link=("contatti.html", "Vieni a trovarci"))

END["azienda"] = band([
    ("reparto-produzione.webp", "Il reparto di produzione"),
    ("magazzino-bobine.webp", "Il magazzino delle bobine"),
    ("macchina-rulli.webp", "I rulli della linea di produzione"),
    ("sede-cancello.webp", "La sede vista dalla strada"),
    ("muletto.webp", "Il muletto in magazzino"),
    ("macchina-2g.webp", "Una macchina con il marchio Imballaggi 2G"),
])

# ---------------------------------------------------------------- contatti
END["contatti"] = band([
    ("sede-insegna.webp", "L'insegna sopra l'ingresso"),
    ("sede-edificio.webp", "La palazzina della sede"),
    ("sede-cancello.webp", "L'ingresso dalla strada"),
    ("magazzino-bobine.webp", "Il magazzino"),
])

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
])


def with_photos(key, body):
    """Innesta i blocchi fotografici nel corpo della pagina."""
    after = AFTER.get(key, "")
    if after:
        head, rest = body.split("</section>", 1)
        body = head + "</section>" + after + rest
    return body + END.get(key, "")
