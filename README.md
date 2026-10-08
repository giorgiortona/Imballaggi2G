# Imballaggi 2G — sito vetrina

Sito statico autonomo, **una pagina per sezione**. Il contenuto pubblicabile è in `dist/`: HTML, CSS, JavaScript, font locali, immagini e documenti PDF. Nessuna dipendenza, nessun framework, nessun servizio terzo caricato dalla pagina.

Anteprima: `python3 -m http.server 5173 --directory dist`

## Le pagine

| file | sezione |
|---|---|
| `index.html` | pagina iniziale: introduzione + navigatore |
| `coprispalla.html` | 01 · Coprispalla protettivi |
| `bobine.html` | 02 · Bobine e film, con l'animazione della bobina |
| `protezioni.html` | 03 · Pluriball, foam, angolari, cuscini d'aria |
| `buste.html` | 04 · Buste e confezionamento |
| `macchine.html` | 05 · Nastri, reggette, corde, cinghie, macchine |
| `sostenibilita.html` | 06 · Plastica Seconda Vita e certificazioni |
| `azienda.html` | 07 · Storia, linea del tempo, territorio |
| `contatti.html` | 08 · Contatti |

In fondo a ogni pagina c'è il rimando alla sezione successiva, così si può percorrere tutto il sito senza tornare al menu.

## Come si modifica

Le pagine sono generate da **`build.py`**, che tiene allineati header, menu, piede e collegamenti fra le sezioni:

```
python3 build.py
```

Il testo di ogni sezione sta in `build.py`, in variabili con il nome della pagina (`COPRISPALLA`, `BOBINE`, …). Per aggiungere una sezione: una riga nell'elenco `SECTIONS`, una voce in `NAV_ITEMS` se deve comparire nel navigatore, il contenuto, e una riga in `PAGES`.

I file in `dist/` sono HTML normale e si possono anche correggere a mano, ma alla prossima esecuzione di `build.py` vengono riscritti: le modifiche vanno riportate nello script.

`VERSION`, in cima a `build.py`, è il numero che compare come `?v=` su CSS e JavaScript. **Va alzato a ogni pubblicazione**, altrimenti chi ha già visitato il sito continua a usare i file vecchi. Le immagini non hanno questo numero: se se ne sostituisce una mantenendo lo stesso nome, può servire un ricaricamento forzato (o meglio, un nome nuovo).

## La pagina iniziale

Introduce l'azienda e poi consegna il visitatore alle sezioni con un **navigatore a fasce**: sette bande verticali, una per sezione, con la fotografia in bianco e nero. Passando sopra una fascia questa si allarga, la foto torna a colori, compaiono nome e frase, e il titolo grande sopra il navigatore cambia con la frase di quella sezione. Su schermo piccolo le fasce diventano una pila orizzontale, sempre aperte.

## Animazioni e navigazione — revisione 16

Intro su fondo carta con rivelazione del logo, alone verde e tartaruga lungo una linea sottile. Una sola volta per sessione, ripetibile dal footer senza perdere la posizione. Ogni pagina ha un ingresso breve legato al materiale; sostenibilità usa la tartaruga e una superficie che si ripulisce. Le transizioni non bloccano la navigazione nativa.

La bobina usa tre fotografie animate: rotolo, pellicola, protezione. I tre controlli permettono anche la selezione manuale, senza una lunga sezione sticky. Il pluriball si apre con una maschera, un riflesso e un controllo per esplorarne la trama.

Menu con ripristino della posizione, focus da tastiera e chiusura su Escape; header con soglia antioscillazione; parallax misurato sul contenitore stabile. Indietro/avanti restano nativi. Le animazioni rispettano `prefers-reduced-motion`.

## Contenuti delle brochure

`brochure_sections.py` integra nel generatore i contenuti delle due brochure: PE espanso, lavorazioni, Xtracell, Zerovirgolacinque con tabella comparativa, dodici applicazioni, economia circolare, PSV/IPPR, CAM, impronta climatica e biodiversità. Include anche fotografie Tiger Film e documenti di certificazione. I PDF restano scaricabili.

Le 55 immagini originali ottimizzate sono in `dist/assets/brochure/`; `brochure-assets.json` ne conserva la provenienza. `COPERTURA-BROCHURE.md` mappa le pagine sorgente. I dati comparativi e le affermazioni ambientali sono contestualizzati, senza trasformarli in promesse generali.

Verifiche: sintassi JavaScript, collegamenti locali delle nove pagine, assenza di immagini rotte nei percorsi provati; browser desktop 1440 px e mobile 360/422 px, selezione film, controllo pluriball, navigazione e ripristino scroll del menu.

## Immagini

### Fotografie dell'azienda
Il sito e' retto da fotografie proprie, in `dist/assets/azienda/` (28 file WebP) e
`dist/assets/video/` (5 clip senza audio con poster). Coprono hero, navigatore,
testate di pagina, blocchi di prodotto e fasce scorrevoli. L'elenco completo di cosa
sta dove e' in `CREDITI-FOTO.md`.

I blocchi fotografici sono definiti in **`photo_blocks.py`**: `shot()` per una figura,
`clip()` per un video, `row()` per una fila di tre, `split()` per foto grande piu' testo,
`duo()` per due scatti sfalsati, `band()` per la fascia a tutta larghezza che scorre.
I dizionari `AFTER` e `END` dicono quali blocchi entrano in quale sezione e dove:
`AFTER` subito sotto la testata, `END` in coda.

Ogni figura entra con una rivelazione a maschera: il ritaglio si apre dal basso mentre
l'immagine rientra da una leggera scala. I video partono quando entrano nello schermo
e si fermano quando escono; con `prefers-reduced-motion` restano fermi sul poster e
mostrano i comandi.

### Da sostituire
- Il coprispalla disegnato in SVG resta uno schema dimostrativo, non un disegno in scala.
- Restano di repertorio le immagini editoriali di biodiversita' e applicazione, che
  illustrano temi e non l'azienda (vedi `CREDITI-FOTO.md`).
- `hero.webp`, `garments.webp`, `machines.webp`, `warehouse.webp`, `pallet-wrap.webp`
  e `bubble.webp` non sono piu' usati da nessuna pagina: si possono rimuovere.

### Marchi
Ricavati dai file aziendali, senza modifiche al disegno, solo sottraendo il fondo bianco:
`logo-ink.webp` e `mark-ink.webp` (colori originali, fondo trasparente), `logo-light.webp`
e `turtle-light.webp` (versione bianca per i fondi scuri), `turtle-mark.webp` e
`turtle-mark-light.webp` (la sola tartaruga).

## Prima della messa online
Vedere `FONTI-E-REVISIONE.md` per le incongruenze dei documenti e le informazioni ancora da confermare. Mancano partita IVA e dati societari completi per il piede definitivo e un'informativa privacy approvata: non sono stati inventati. Nessun modulo di contatto, nessun analytics.

`.backup/v2/` e `.backup/v3/` conservano le versioni precedenti (pagina unica a scorrimento e pagina unica a pannelli); non fanno parte di `dist/` e non vengono pubblicate.


## Revisione 17 — tartaruga protagonista
Caricamento senza barra: logo ingrandito e tartaruga originale SVG articolata (`turtle_art.py`), con pinne indipendenti e arrivo curvo a fianco del logo. Copertina sostenibilità, fascia 06 e scena marina aggiornate con `turtle-ocean-v17.png`, immagine evocativa generata con AI, non fotografia aziendale o documentazione scientifica. Il marchio ufficiale resta invariato.


## Revisione 18 — intro minimale
Solo il logo grande, centrato su fondo carta uniforme. Rivelazione morbida da sinistra a destra e breve dissolvenza. Rimossi dall’intro tartaruga, testo aggiuntivo ed effetti ambientali.


## Revisione 20 — ingressi delle sezioni
Sfondo bianco, logo e illustrazione originale a tratto in `section_motion.py`: coprispalla, bobina, bolle, busta, confezionatrice, tartaruga, sede, messaggio. Nessuna patina o fotografia sovrapposta. Durata inferiore a due secondi, interruzione immediata con input e rispetto di movimento ridotto.


## Revisione 23 — fotografie nitide
Sostituite 27 immagini generiche: 12 animali, 12 settori applicativi e 3 immagini ambientali. Fonti, autori e risoluzioni in `CREDITI-FOTO.md` e `editorial-sources.json`. Immagini responsive WebP, senza upscaling, ritagli controllati. Gli originali dei prodotti e dei documenti aziendali restano invariati.
