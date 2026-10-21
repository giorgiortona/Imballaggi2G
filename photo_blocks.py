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
  <figure class="shoulder-visual" aria-label="La giacca sulla gruccia entra dal fondo aperto del coprispalla; inquadrature ravvicinate che cambiano al passaggio tra i testi; dettaglio illustrativo del taglio per bar-code. Ricostruzione illustrativa.">
   <div class="shoulder-word" aria-hidden="true">2G</div>
   <div class="shoulder-object"><img src="assets/realistic/coprispalla-studio.webp" width="1024" height="1536" loading="lazy" alt="Coprispalla in film bianco traslucido sulla gruccia, con profilo sagomato."></div>
   <canvas class="shoulder-canvas" aria-hidden="true"></canvas>
  </figure>
  <div class="shoulder-copy">
   <article class="shoulder-chapter" id="shoulder-detail-0">
    <h2 class="display small" id="shoulder-title">La cura prende<br><em>forma.</em></h2>
    <p>Il taglio sagomato segue la linea della spalla. Il gancio passa attraverso l’apertura superiore, mentre il film si dispone intorno alla gruccia e al capo.</p>
    <p>Una protezione dedicata all’abbigliamento: il capo rimane pronto da appendere e da movimentare.</p>
    <div class="shoulder-fact"><span>Profilo</span><strong>Sagomato o retto</strong></div>
   </article>
   <article class="shoulder-chapter" id="shoulder-detail-3">
    <h3>La cura continua.<br><em>Anche nel materiale.</em></h3>
    <p>Il certificato PSV n. 3433/2026 comprende la produzione di coprispalla mediante taglio e saldatura, con MPS da sottoprodotto esterno.</p>
    <p>La certificazione si riferisce ai prodotti e alle lavorazioni indicati nel documento. Ti aiutiamo a individuare il formato e la linea adatti alla tua esigenza.</p>
    <a class="text-link" href="assets/certificato-coprispalla-3433-2026.pdf" target="_blank" rel="noopener">Leggi il certificato PSV ↗</a>
   </article>
   <article class="shoulder-chapter shoulder-cut-chapter" id="shoulder-detail-4">
    <h3>Un piccolo taglio.<br><em>Una funzione precisa.</em></h3>
    <p>Il taglio verticale permette il passaggio dell’etichetta con bar-code: il codice resta accessibile senza dover sfilare la protezione dal capo.</p>
    <p>È un dettaglio a cui dedichiamo attenzione nella lavorazione dei nostri coprispalla. Sulle varianti indicate in scheda, l’apertura misura 13,5 cm.</p>
    <figure class="cut-diagram">
     <svg viewBox="0 0 460 180" role="img" aria-label="Schema illustrativo: un’etichetta con codice a barre passa attraverso il taglio verticale del film">
      <defs><linearGradient id="cut-film" x2="1" y2=".4"><stop stop-color="#fff"/><stop offset=".5" stop-color="#e2e5df"/><stop offset="1" stop-color="#fafbf8"/></linearGradient></defs>
      <path d="M28 24 Q105 9 198 24 L206 156 Q111 171 28 155Z" fill="url(#cut-film)" stroke="#b3bdb4"/>
      <path d="M142 42 Q134 85 142 136" fill="none" stroke="#2f5745" stroke-width="3"/>
      <path d="M149 42 Q143 85 149 136" fill="none" stroke="#fff" stroke-width="3"/>
      <g transform="translate(144 67) rotate(-7)">
       <path d="M0 5 L106 0 L106 62 L0 57Z" fill="#fff" stroke="#657d6e"/>
       <path d="M18 14v32m5-32v32m7-32v32m4-32v32m8-32v32m6-32v32m4-32v32m8-32v32m7-32v32m4-32v32m9-32v32" stroke="#193f2e" stroke-width="2"/>
      </g>
      <path d="M271 88 H304m-8-6 8 6-8 6" fill="none" stroke="#50987b" stroke-width="2"/>
      <text x="322" y="82" fill="#193f2e" font-size="19" font-family="sans-serif">Etichetta</text>
      <text x="322" y="108" fill="#193f2e" font-size="19" font-family="sans-serif">accessibile.</text>
     </svg>
     <figcaption>Schema illustrativo. Posizione e finiture dipendono dal modello.</figcaption>
    </figure>
    <a class="text-link" href="assets/schede-coprispalla.pdf" target="_blank" rel="noopener">Il dettaglio nella scheda tecnica ↗</a>
   </article>
  </div>
 </div>
</section>
"""

# A mirrored continuation: photographic bubble wrap, followed by documented film sizes.
AFTER["coprispalla"] += """
<section class="shoulder-variants" id="coprispalla-pluriball" aria-labelledby="variants-title">
 <div class="variants-stage" aria-hidden="true">
  <div class="variant-word">Aria.</div>
  <div class="bubble-product"><img src="assets/realistic/coprispalla-pluriball.png" width="1536" height="1024" loading="lazy" alt=""></div>
  <div class="variant-pin"><span></span><p>Bolle d’aria.<br>Protezione, da vicino.</p></div>
  <div class="film-family">
   <figure class="film-format format-short"><div><img src="assets/realistic/coprispalla-formati.png" width="1280" height="1280" loading="lazy" alt=""></div><figcaption><strong>60</strong> cm</figcaption></figure>
   <figure class="film-format format-medium"><div><img src="assets/realistic/coprispalla-formati.png" width="1280" height="1280" loading="lazy" alt=""></div><figcaption><strong>95</strong> cm</figcaption></figure>
   <figure class="film-format format-long"><div><img src="assets/realistic/coprispalla-formati.png" width="1280" height="1280" loading="lazy" alt=""></div><figcaption><strong>145</strong> cm</figcaption></figure>
  </div>
  <p class="variant-visual-caption">Coprispalla in pluriball · ricostruzione illustrativa</p>
 </div>
 <div class="variants-copy">
  <article class="variant-chapter" id="pluriball-forma">
   <h2 id="variants-title">La stessa cura.<br><em>Un’altra<br>consistenza.</em></h2>
   <p>Il coprispalla esiste anche in pluriball. Il profilo accompagna la gruccia, mentre la superficie a bolle aggiunge uno strato di protezione intorno alle spalle.</p>
   <p>Una forma compatta, un materiale da guardare da vicino.</p>
   <div class="variant-material"><span>Pluriball</span><span>Protezione a bolle d’aria</span></div>
  </article>
  <article class="variant-chapter" id="pluriball-dettaglio">
   <h3>È l’aria<br>che fa<br><em>la differenza.</em></h3>
   <p>Le piccole celle d’aria separano il capo dal contatto diretto con l’esterno. Il materiale segue il profilo della spalla e lascia intravedere la gruccia attraverso la sua trama.</p>
   <p>Parliamoci del capo da proteggere: ti aiutiamo a scegliere il materiale e il formato adatti.</p>
   <a class="text-link" href="contatti.html">Troviamo la tua protezione ↗</a>
  </article>
  <article class="variant-chapter" id="coprispalla-formati">
   <h3>Una larghezza.<br><em>Più possibilità.</em></h3>
   <p>Per i coprispalla in film, le schede riportano una larghezza di <strong>46 cm</strong>. Il taglio sagomato è disponibile nei formati nominali da <strong>60, 95 e 145 cm</strong>; il taglio retto è indicato nel formato da <strong>120 cm</strong>.</p>
   <p>Materiale, lunghezza e finitura si scelgono insieme. Per il modello in pluriball, chiedici i formati disponibili.</p>
   <a class="text-link" href="assets/schede-coprispalla.pdf" target="_blank" rel="noopener">Esplora le schede dei formati ↗</a>
   <p class="variant-size-note">Le immagini illustrano le proporzioni dei formati in film. Misure e dettagli sono riportati nelle schede tecniche.</p>
  </article>
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
