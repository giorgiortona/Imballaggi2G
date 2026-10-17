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
  <figure class="shoulder-visual" aria-label="La giacca sulla gruccia entra dal fondo aperto del coprispalla; il prodotto ruota con lo scroll. Ricostruzione illustrativa.">
   <div class="shoulder-object"><img src="assets/realistic/coprispalla-studio.webp" width="1024" height="1536" loading="lazy" alt="Coprispalla in film bianco traslucido sulla gruccia, con profilo sagomato."></div>
   <canvas class="shoulder-canvas" aria-hidden="true"></canvas>
   <div class="shoulder-annotation" hidden>
    <svg aria-hidden="true"><line class="shoulder-leader"/><circle class="shoulder-dot" r="6"/></svg>
    <div class="shoulder-note"><strong></strong><p></p></div>
   </div>
   <div class="shoulder-caption" aria-hidden="true"><span data-shoulder-label>Il profilo della spalla</span><span>SCORRI PER ESPLORARE ↓</span></div>
  </figure>
  <div class="shoulder-copy">
   <article class="shoulder-chapter" id="shoulder-detail-0">
    <p class="shoulder-eyebrow">01 — IL COPRISPALLA, DA VICINO</p>
    <h2 class="display small" id="shoulder-title">La cura prende<br><em>forma.</em></h2>
    <p>Il taglio sagomato segue la linea della spalla e si dispone sulla gruccia. Il film prende volume intorno al supporto e lo lascia intravedere attraverso la superficie traslucida.</p>
    <p>Una protezione dedicata all’abbigliamento, con una forma studiata per accompagnare il capo quando viene appeso e movimentato.</p>
    <div class="shoulder-fact"><span>Profilo</span><strong>Sagomato o retto</strong></div>
   </article>
   <article class="shoulder-chapter" id="shoulder-detail-1">
    <p class="shoulder-eyebrow">02 — INTORNO ALLA GRUCCIA</p>
    <h3>Un gesto semplice.<br><em>Ogni volta.</em></h3>
    <p>Il gancio passa attraverso l’apertura superiore, mentre il coprispalla si appoggia sul profilo della gruccia. Il capo rimane pronto da appendere.</p>
    <p>L’apertura del gancio e il profilo della spalla lavorano insieme: il supporto trova il suo posto all’interno, mentre il film si dispone lungo il capo.</p>
    <div class="shoulder-fact"><span>Dettaglio</span><strong>Apertura superiore</strong></div>
   </article>
   <article class="shoulder-chapter" id="shoulder-detail-2">
    <p class="shoulder-eyebrow">03 — IL FORMATO GIUSTO</p>
    <h3>46 cm.<br><em>La tua lunghezza.</em></h3>
    <p>Le schede indicano una larghezza comune di 46 cm, con varianti di lunghezza e taglio. La scelta parte dal tipo di capo e dal formato necessario alla tua produzione.</p>
    <p>Alcune varianti prevedono un taglio laterale di 13,5 cm per il passaggio del bar-code. È un dettaglio da verificare sul modello scelto, insieme alle altre finiture.</p>
    <a class="text-link" href="assets/schede-coprispalla.pdf" target="_blank" rel="noopener">Confronta le schede tecniche ↗</a>
   </article>
   <article class="shoulder-chapter" id="shoulder-detail-3">
    <p class="shoulder-eyebrow">04 — LA LINEA CERTIFICATA</p>
    <h3>La cura continua.<br><em>Anche nel materiale.</em></h3>
    <p>Il certificato PSV n. 3433/2026 comprende la produzione di coprispalla mediante taglio e saldatura, con MPS da sottoprodotto esterno.</p>
    <p>La certificazione si riferisce ai prodotti e alle lavorazioni indicati nel documento. Ti aiutiamo a individuare il formato e la linea adatti alla tua esigenza.</p>
    <a class="text-link" href="assets/certificato-coprispalla-3433-2026.pdf" target="_blank" rel="noopener">Leggi il certificato PSV ↗</a>
   </article>
  </div>
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
