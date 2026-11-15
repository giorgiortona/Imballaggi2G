"""Redirect permanenti Aruba dopo il reset WordPress del 12 novembre 2026.

Solo corrispondenze esplicite: gli indirizzi senza equivalente restano 404.
Il file è una configurazione del sito statico, non un ripristino di WordPress.
"""
import re

REDIRECTS = {'/azienda/': 'https://www.imballaggi2g.it/azienda.html',
 '/bobine/': 'https://www.imballaggi2g.it/bobine.html',
 '/buste/': 'https://www.imballaggi2g.it/buste.html',
 '/categoria/angolari-in-espanso/': 'https://www.imballaggi2g.it/protezioni.html',
 '/categoria/bags/': 'https://www.imballaggi2g.it/buste.html',
 '/categoria/bobine-foam/': 'https://www.imballaggi2g.it/protezioni.html',
 '/categoria/bobine/': 'https://www.imballaggi2g.it/bobine.html',
 '/categoria/buste/': 'https://www.imballaggi2g.it/buste.html',
 '/categoria/cappucci-termoretraibili/': 'https://www.imballaggi2g.it/buste.html',
 '/categoria/corde/': 'https://www.imballaggi2g.it/macchine.html',
 '/categoria/film-estensibile/': 'https://www.imballaggi2g.it/bobine.html',
 '/categoria/macchine-per-imballaggio/': 'https://www.imballaggi2g.it/macchine.html',
 '/categoria/nastri-adesivi/': 'https://www.imballaggi2g.it/macchine.html',
 '/categoria/pluriball/': 'https://www.imballaggi2g.it/protezioni.html',
 '/categoria/polietilene-termoretraibile/': 'https://www.imballaggi2g.it/buste.html',
 '/categoria/reggetta/': 'https://www.imballaggi2g.it/macchine.html',
 '/categoria/reggiatrici/': 'https://www.imballaggi2g.it/macchine.html',
 '/categoria/sistemi-di-fissaggio/': 'https://www.imballaggi2g.it/macchine.html',
 '/chi-siamo/': 'https://www.imballaggi2g.it/azienda.html',
 '/contatti/': 'https://www.imballaggi2g.it/contatti.html',
 '/coprispalla/': 'https://www.imballaggi2g.it/coprispalla.html',
 '/macchine/': 'https://www.imballaggi2g.it/macchine.html',
 '/media/': 'https://www.imballaggi2g.it/azienda.html#azienda-immagini',
 '/negozio/': 'https://www.imballaggi2g.it/#navigatore',
 '/prodotto/accessori-per-imballaggio/': 'https://www.imballaggi2g.it/macchine.html',
 '/prodotto/angolari-in-espanso/': 'https://www.imballaggi2g.it/protezioni.html',
 '/prodotto/bobine-per-confezionamento/': 'https://www.imballaggi2g.it/bobine.html',
 '/prodotto/bobine-termoretraibili/': 'https://www.imballaggi2g.it/buste.html',
 '/prodotto/buste-apri-chiudi-con-strip-adesiva/': 'https://www.imballaggi2g.it/buste.html',
 '/prodotto/buste-con-chiusura-minigrip/': 'https://www.imballaggi2g.it/buste.html',
 '/prodotto/buste-fondo-quadro-e-laccate/': 'https://www.imballaggi2g.it/buste.html',
 '/prodotto/buste-per-materassi/': 'https://www.imballaggi2g.it/buste.html',
 '/prodotto/cappucci-termoretraibili/': 'https://www.imballaggi2g.it/buste.html',
 '/prodotto/corde-e-cinghie-per-trasporti-speciali/': 'https://www.imballaggi2g.it/macchine.html',
 '/prodotto/cuscini-daria/': 'https://www.imballaggi2g.it/protezioni.html',
 '/prodotto/film-estensibile/': 'https://www.imballaggi2g.it/bobine.html',
 '/prodotto/lavorazioni-foam/': 'https://www.imballaggi2g.it/protezioni.html',
 '/prodotto/macchine-per-imballaggio/': 'https://www.imballaggi2g.it/macchine.html',
 '/prodotto/nastri-segnaletici/': 'https://www.imballaggi2g.it/macchine.html',
 '/prodotto/nastro-adesivo-neutro/': 'https://www.imballaggi2g.it/macchine.html',
 '/prodotto/nastro-adesivo-personalizzato/': 'https://www.imballaggi2g.it/macchine.html',
 '/prodotto/nastro-in-carta/': 'https://www.imballaggi2g.it/macchine.html',
 '/prodotto/pluriball/': 'https://www.imballaggi2g.it/protezioni.html',
 '/prodotto/produzione-buste-e-shopping-bags/': 'https://www.imballaggi2g.it/buste.html',
 '/prodotto/regetta-in-pp-pet/': 'https://www.imballaggi2g.it/macchine.html',
 '/prodotto/reggetta-in-acciaio/': 'https://www.imballaggi2g.it/macchine.html',
 '/protezioni/': 'https://www.imballaggi2g.it/protezioni.html',
 '/richiesta-preventivo/': 'https://www.imballaggi2g.it/contatti.html',
 '/sostenibilita/': 'https://www.imballaggi2g.it/sostenibilita.html'}


def apache_rules():
    lines = [
        "# BEGIN IMBALLAGGI2G STATIC REDIRECTS",
        "# Generato da server_redirects.py. Nessuna regola WordPress.",
        "RewriteEngine On",
    ]
    for source, target in REDIRECTS.items():
        pattern = "^" + re.escape(source.strip("/")) + "/?$"
        lines.append(f"RewriteRule {pattern} {target} [R=301,L,NE]")
    lines.append("# END IMBALLAGGI2G STATIC REDIRECTS")
    return "\n".join(lines) + "\n"
