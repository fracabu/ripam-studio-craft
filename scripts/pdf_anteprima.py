#!/usr/bin/env python
# ============================================================================
# Ricava l'ANTEPRIMA di un report: le prime N pagine + una pagina di chiusura
# che dice chiaramente che l'estratto finisce li'.
#
# Nasce il 25/08/2026. Gli estratti fatti finora (INPS 499) hanno un difetto
# noto: si presentano come report completi — copertina «REPORT COMPLETO DI
# STUDIO», indice integrale, footer col totale del report intero — e poi si
# interrompono a meta' frase. Chi li apre chiede «dove sono gli altri
# capitoli?», ed e' una domanda che nasce da noi, non da lui.
# Qui la pagina finale chiude il discorso: quante pagine hai letto, quante ne
# ha il report, e cosa c'e' nel resto.
#
#   python scripts/pdf_anteprima.py --file report.pdf
#   python scripts/pdf_anteprima.py --file report.pdf --pagine 4 --out cartella/
#   python scripts/pdf_anteprima.py --cartella report-rsc/MIC-1800-VIGILANZA --solo SICUREZZA,MARKETING
#
# Flag:
#   --file      un singolo PDF
#   --cartella  tutti i PDF della cartella (esclude quelli gia' -ANTEPRIMA)
#   --solo      sottostringhe separate da virgola: prende solo i file che le contengono
#   --pagine    quante pagine tenere (default 5)
#   --out       cartella di destinazione (default: <sorgente>/anteprime)
# ============================================================================
import argparse
import os
import sys

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit('[FAIL] serve PyMuPDF: python -m pip install pymupdf')

ACID = (0.776, 0.957, 0.196)   # #c6f432
INK = (0.039, 0.039, 0.039)    # #0a0a0a
BG = (0.961, 0.941, 0.910)     # #f5f0e8
MUTED = (0.420, 0.395, 0.345)  # #6b6458


def pagina_di_chiusura(doc, tenute, totali, titolo):
    """Appende la pagina che dichiara dove finisce l'anteprima."""
    pag = doc.new_page(-1, width=595, height=842)  # A4
    pag.draw_rect(fitz.Rect(0, 0, 595, 842), color=None, fill=BG)
    pag.draw_rect(fitz.Rect(0, 0, 595, 14), color=None, fill=ACID)

    pag.insert_textbox(
        fitz.Rect(60, 90, 535, 150), 'FINE DELL\'ANTEPRIMA',
        fontname='hebo', fontsize=26, color=INK, align=0)

    resto = totali - tenute
    corpo = (
        'Hai letto le prime %d pagine di "%s", che nella versione completa '
        'è di %d pagine.\n\n'
        'Nelle %d pagine che restano trovi il resto della materia: gli schemi '
        'di sintesi, i numeri e le date da memorizzare, i trabocchetti più '
        'frequenti nei quesiti e la simulazione finale con le soluzioni '
        'commentate.\n\n'
        'Questa anteprima serve a farti vedere com\'è fatto il materiale '
        'prima di qualsiasi discorso sui prezzi. Se ti convince, rispondi '
        'alla mail con cui l\'hai ricevuta: ti dico come avere il report '
        'completo.'
    ) % (tenute, titolo, totali, resto)

    pag.insert_textbox(
        fitz.Rect(60, 170, 535, 560), corpo,
        fontname='helv', fontsize=11.5, color=INK, align=0, lineheight=1.6)

    pag.draw_line(fitz.Point(60, 700), fitz.Point(535, 700), color=MUTED, width=0.8)
    pag.insert_textbox(
        fitz.Rect(60, 715, 535, 800),
        'Ripam Studio Craft · ripamstudiocraft@gmail.com\n'
        'Materiale prodotto con l\'ausilio di strumenti di intelligenza artificiale: '
        'può contenere errori o imprecisioni e non garantisce il superamento della '
        'prova. Verifica sempre le fonti normative ufficiali. Segnalazioni di errori '
        'entro 60 giorni: ti mando la versione corretta.',
        fontname='helv', fontsize=7.5, color=MUTED, align=0, lineheight=1.5)
    return pag


def estrai(sorgente, destinazione, pagine, titolo_scelto=None):
    src = fitz.open(sorgente)
    totali = src.page_count
    if totali <= pagine:
        print('[skip] %s ha solo %d pagine: non e\' un estratto, e\' il report intero'
              % (os.path.basename(sorgente), totali))
        src.close()
        return None

    # Il nome file porta con se' la sigla del bando (…_MIC_1800, …_DIFESA_AMM)
    # e, nei file gia' impaginati, il prefisso commerciale «Report Studio
    # Custom-»: nel titolo mostrato al candidato serve la materia, non la
    # nomenclatura interna. Con --titolo si passa direttamente quello giusto.
    grezzo = os.path.basename(sorgente).replace('REPORT_', '').replace('.pdf', '')
    grezzo = grezzo.replace('Report Studio Custom-', '')
    for coda in ('_MIC_1800', '_DIFESA_AMM', '_INPS_499', '_MIC1800',
                 'DIFESA-1100-AMM-', 'INPS-499-ASS-INF-', 'MIC-1800-'):
        grezzo = grezzo.replace(coda, '')
    titolo = titolo_scelto or grezzo.replace('_', ' ').replace('-', ' ').strip().capitalize()

    out = fitz.open()
    out.insert_pdf(src, from_page=0, to_page=pagine - 1)
    pagina_di_chiusura(out, pagine, totali, titolo)

    out.set_metadata({
        'title': 'ANTEPRIMA — %s' % titolo,
        'author': 'Ripam Studio Craft',
        'subject': 'Estratto di %d pagine da un report di %d pagine' % (pagine, totali),
    })
    out.save(destinazione, garbage=4, deflate=True)
    out.close()
    src.close()
    print('[OK] %-52s %2d pp su %2d  ->  %s'
          % (os.path.basename(sorgente), pagine, totali, os.path.basename(destinazione)))
    return destinazione


ap = argparse.ArgumentParser()
ap.add_argument('--file')
ap.add_argument('--cartella')
ap.add_argument('--solo')
ap.add_argument('--pagine', type=int, default=5)
ap.add_argument('--out')
ap.add_argument('--titolo', help='titolo mostrato al candidato (solo con --file)')
ap.add_argument('--nome', help='nome del file di output (solo con --file)')
a = ap.parse_args()

if not a.file and not a.cartella:
    sys.exit('Uso: python scripts/pdf_anteprima.py --file <pdf> | --cartella <dir> [--pagine 5]')

sorgenti = []
if a.file:
    sorgenti = [a.file]
    base = os.path.dirname(os.path.abspath(a.file))
else:
    base = os.path.abspath(a.cartella)
    filtri = [s.strip().upper() for s in (a.solo or '').split(',') if s.strip()]
    for nome in sorted(os.listdir(base)):
        if not nome.lower().endswith('.pdf') or 'ANTEPRIMA' in nome.upper():
            continue
        if filtri and not any(f in nome.upper() for f in filtri):
            continue
        sorgenti.append(os.path.join(base, nome))

destdir = os.path.abspath(a.out) if a.out else os.path.join(base, 'anteprime')
os.makedirs(destdir, exist_ok=True)

fatti = 0
for s in sorgenti:
    nome = a.nome if (a.nome and a.file) else os.path.basename(s).replace('.pdf', '') + '-ANTEPRIMA.pdf'
    if not nome.lower().endswith('.pdf'):
        nome += '.pdf'
    if estrai(s, os.path.join(destdir, nome), a.pagine, a.titolo if a.file else None):
        fatti += 1

print('\nFatte %d anteprime su %d file, in %s' % (fatti, len(sorgenti), destdir))
