"""Builds every page in sito/ from the bodies in .impeccable/build/pages/ plus a shared shell.

Body files start with `title:` / `desc:` lines, then `---`, then the <main> content.
Placeholders: {{HEADER_DARK}} (header inside the home hero), {{WA}} (WhatsApp link).
Pages other than index get the light header automatically.
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[2]
SITE = ROOT / "sito"
PAGES = ROOT / ".impeccable/build/pages"

WA = "https://wa.me/393518279049?text=Ciao%20Gaia!%20Ho%20visto%20il%20sito%20di%20Mi%20Alma%20e%20vorrei%20parlarti%20della%20mia%20attivit%C3%A0."
NAV = [("index.html", "Home"), ("servizi.html", "Servizi"), ("chi-siamo.html", "Chi siamo"), ("contatti.html", "Contatti")]

ICONS = """<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-wa" viewBox="0 0 24 24"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.17-1.24-6.16-3.48-8.41"/></symbol>
  <symbol id="i-ig" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></g></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M7 17 17 7M8 7h9v9"/></symbol>
  <symbol id="i-right" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M4 12h16m-6-6 6 6-6 6"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m5 12.5 4.5 4.5L19 7.5"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M4 8h16M4 16h16"/></symbol>
</svg>"""


# Collaborazioni attive (marquee in home). Modifica qui follower e date.
# NB: le date "attiva da" sono segnaposto da sostituire con quelle reali.
CLIENTS = [
    ("La Camerona", "camerona", "osterialacamerona", "822", "gennaio 2025"),
    ("Totauto", "totauto", "totauto_novara", "629", "settembre 2024"),
    ("Cascina Cattabreghetta", "cattabreghetta", "cascinacattabreghetta", "7.652", "luglio 2025"),
    ("Sara Villa", "saravilla", "sara_villa_event", "414", "marzo 2025"),
    ("Monrepos Viaggi", "monrepos", "monreposviaggi", "2.791", "ottobre 2024"),
    ("Vecchia Dogana", "vecchiadogana", "vecchia_dogana", "1.699", "aprile 2025"),
    ("Euroedil Group", "euroedil", "euroedilgroup_novara", "250", "maggio 2025"),
    ("Cittadella Auto", "cittadella", "cittadella_auto", "667", "giugno 2025"),
    ("Immotechedile", "immotechedile", "immotechedile_novara", "359", "febbraio 2025"),
]


def marquee():
    def items(hidden):
        out = []
        for name, logo, handle, followers, since in CLIENTS:
            tab = ' tabindex="-1"' if hidden else ""
            out.append(f"""      <li class="collab-item">
        <img src="img/loghi/{logo}.png" alt="" width="56" height="56" loading="lazy">
        <div>
          <strong>{name}</strong>
          <a href="https://www.instagram.com/{handle}/" target="_blank" rel="noopener"{tab}>@{handle}</a>
          <span>{followers} follower</span>
          <span class="collab-since">Attiva da {since}</span>
        </div>
      </li>""")
        return "\n".join(out)
    return f"""<div class="marquee" aria-label="Clienti attivi">
    <ul class="marquee__track">
{items(False)}
    </ul>
    <ul class="marquee__track" aria-hidden="true">
{items(True)}
    </ul>
  </div>"""


def header(current, light):
    links = "\n".join(
        f'      <a href="{h}"{" aria-current=\"page\"" if h == current else ""}>{t}</a>' for h, t in NAV)
    cls = "site-head site-head--light" if light else "site-head"
    logo = "img/logo-mi-alma.png" if light else "img/logo-mi-alma-bianco.png"
    return f"""<header class="{cls}" id="site-head">
  <div class="wrap site-head__in">
    <a class="brand" href="index.html" aria-label="Mi Alma Communication, home"><img src="{logo}" alt="" width="246" height="76"></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav"><svg aria-hidden="true"><use href="#i-menu"/></svg>Menu</button>
    <nav class="nav" id="nav" aria-label="Principale">
{links}
    </nav>
    <a class="btn {'btn--dark' if light else 'btn--light'}" href="{WA}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-wa"/></svg>Scrivici</a>
  </div>
</header>"""


def shell(fname, title, desc, body):
    light = fname != "index.html"
    body = body.replace("{{HEADER_DARK}}", header(fname, False)).replace("{{WA}}", WA).replace("{{MARQUEE}}", marquee())
    top = "" if not light else header(fname, True) + "\n"
    year_links = "\n".join(f'          <li><a href="{h}">{t}</a></li>' for h, t in NAV)
    return f"""<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="theme-color" content="#0e0e0f">
  <link rel="icon" href="img/favicon.png">
  <link rel="preload" href="fonts/GeneralSans-500.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="style.css">
</head>
<body>
{ICONS}
<a class="skip" href="#contenuto">Vai al contenuto</a>
{top}<main id="contenuto">
{body.strip()}
</main>

<footer class="foot dark">
  <div class="wrap">
    <div class="foot__grid">
      <div class="foot__brand">
        <img src="img/logo-mi-alma.png" alt="Mi Alma Communication" width="246" height="76">
        <p>Agenzia di comunicazione digitale. Social media e contenuti per le attività di Novara e provincia.</p>
      </div>
      <div>
        <h2>Pagine</h2>
        <ul>
{year_links}
        </ul>
      </div>
      <div>
        <h2>Contatti</h2>
        <ul>
          <li><a href="https://wa.me/393518279049" target="_blank" rel="noopener">WhatsApp 351 827 9049</a></li>
          <li><a href="https://www.instagram.com/mialma.cmc/" target="_blank" rel="noopener">Instagram @mialma.cmc</a></li>
        </ul>
      </div>
    </div>
    <div class="foot__base">
      <p>© 2026 Mi Alma Communication</p>
      <p>Novara e provincia</p>
    </div>
  </div>
</footer>

<a class="wa-float" href="{WA}" target="_blank" rel="noopener" aria-label="Scrivici su WhatsApp">
  <svg aria-hidden="true"><use href="#i-wa"/></svg><span>Scrivici</span>
</a>

<script src="app.js" defer></script>
</body>
</html>
"""


for f in sorted(PAGES.glob("*.html")):
    meta, body = f.read_text(encoding="utf-8").split("\n---\n", 1)
    m = dict(line.split(": ", 1) for line in meta.strip().splitlines())
    (SITE / f.name).write_text(shell(f.name, m["title"], m["desc"], body), encoding="utf-8")
    print("wrote", f.name)
