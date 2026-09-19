/*
 * FUTMAGO IN PAUSA — il file che sta al posto di futmago.js.
 *
 * ── PERCHE' ESISTE ──────────────────────────────────────────────────────────
 *
 * SEGNALATO DA IPHONE il 20/09/2026, sulla Web App di FC 27: «se attivo
 * futmago da iOS si attiva ancora». L'interruttore sul server blocca solo
 * «Compila slot» e «Completa tutte»; tutto il resto — la scheda Stili di gioco,
 * che applica modifiche PERMANENTI, i pacchetti, lo scarto dei doppioni — si
 * montava lo stesso, su una Web App che FUTMAGO non conosce ancora.
 *
 * Userscript e segnalibro non contengono FUTMAGO: scaricano
 * ilmagodifut.com/futmago.js a ogni apertura, senza cache. Mettere questo file
 * al suo posto li spegne tutti alla prossima apertura della Web App.
 *
 * ── COSA FA, E COSA NON FA ─────────────────────────────────────────────────
 *
 * Mostra un avviso, una volta per sessione, e basta. Non legge e non tocca
 * NIENTE della Web App di EA: nessun servizio, nessun menu, nessun pulsante.
 * E' scritto in JavaScript semplice perche' il segnalibro lo esegue con eval.
 *
 * ── PERCHE' DENTRO UNO SHADOW ROOT ─────────────────────────────────────────
 *
 * PRESO ALLA PROVA, prima di pubblicare: su una pagina qualunque la scheda
 * usciva grigia invece che nera. La pagina aveva `div { opacity: .8 }`, e la
 * scheda lo ereditava. La Web App di EA ha i suoi stili su div, p e button:
 * dentro uno shadow root non la raggiungono. L'ospite e' un elemento con un
 * nome nostro, cosi' nemmeno le regole generiche sui div lo toccano.
 *
 * Quando FUTMAGO riparte, futmago.js torna a essere il pacchetto costruito da
 * `npm run ext:build`. Vedi services/licenza/PAUSA-FC27.md.
 */
(function () {
  if (window.__futmagoPausa) return;
  window.__futmagoPausa = true;

  var CHIAVE = 'futmago.pausa.vista';
  try {
    if (sessionStorage.getItem(CHIAVE) === '1') return;
  } catch (e) {
    /* senza sessionStorage l'avviso compare a ogni apertura: va bene lo stesso */
  }

  var STILE =
    '.velo{position:fixed;top:0;right:0;bottom:0;left:0;display:flex;' +
    'align-items:center;justify-content:center;padding:20px;box-sizing:border-box;' +
    'background:rgba(0,0,0,.6);opacity:1;' +
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;' +
    'color:#F2F2F2;text-align:center;line-height:1.5;-webkit-text-size-adjust:100%}' +
    '.scheda{max-width:360px;width:100%;box-sizing:border-box;margin:0;' +
    'padding:22px 22px 18px;border-radius:16px;background:#0d0d0d;opacity:1;' +
    'border:1px solid #39FF14;box-shadow:0 0 32px rgba(57,255,20,.25)}' +
    '.marchio{font-weight:800;letter-spacing:.28em;font-size:13px;color:#39FF14;margin:0 0 12px}' +
    '.titolo{font-weight:800;font-size:20px;line-height:1.25;margin:0 0 10px;color:#F2F2F2}' +
    '.testo{margin:0 0 18px;font-size:15px;color:#d6d6d6}' +
    '.testo a{color:#39FF14;font-weight:700;text-decoration:none}' +
    '.ok{display:block;width:100%;box-sizing:border-box;margin:0;padding:13px 16px;' +
    'border:0;border-radius:10px;background:#39FF14;color:#000;opacity:1;' +
    'font:inherit;font-weight:800;font-size:16px;letter-spacing:.04em;cursor:pointer;' +
    '-webkit-appearance:none;appearance:none}';

  /*
   * Gli elementi si creano uno per uno, senza innerHTML. Il testo e' fisso e
   * nostro, quindi non c'era un rischio vero; ma il controllo ufficiale di
   * Mozilla lo segnala comunque, e un avviso in meno nel pacchetto e' una
   * domanda in meno quando l'estensione andra' sugli store.
   */
  function elemento(tag, classe, testo) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (testo) e.textContent = testo;
    return e;
  }

  function costruisciScheda() {
    var velo = elemento('div', 'velo');
    velo.setAttribute('role', 'dialog');
    velo.setAttribute('aria-labelledby', 'futmago-pausa-titolo');

    var scheda = elemento('div', 'scheda');
    scheda.appendChild(elemento('p', 'marchio', 'FUTMAGO'));

    var titolo = elemento('p', 'titolo', 'FUTMAGO è in pausa');
    titolo.id = 'futmago-pausa-titolo';
    scheda.appendChild(titolo);

    var testo = elemento('p', 'testo');
    testo.appendChild(
      document.createTextNode(
        'Stiamo adattando FUTMAGO alla nuova Web App di FC 27. Tornerà disponibile a breve: segui ',
      ),
    );
    var profilo = elemento('a', '', '@ilmagodifut');
    profilo.href = 'https://www.instagram.com/ilmagodifut/';
    profilo.target = '_blank';
    profilo.rel = 'noopener';
    testo.appendChild(profilo);
    testo.appendChild(document.createTextNode(' per sapere quando.'));
    scheda.appendChild(testo);

    var ok = elemento('button', 'ok', 'Ho capito');
    ok.type = 'button';
    scheda.appendChild(ok);

    velo.appendChild(scheda);
    return velo;
  }

  function mostra() {
    if (document.getElementById('futmago-pausa')) return;

    var ospite = document.createElement('futmago-pausa');
    ospite.id = 'futmago-pausa';
    var fisso = {
      position: 'fixed', top: '0', left: '0', width: '0', height: '0',
      margin: '0', padding: '0', border: '0', opacity: '1',
      display: 'block', 'z-index': '2147483647', background: 'transparent',
    };
    for (var k in fisso) ospite.style.setProperty(k, fisso[k], 'important');

    var radice = ospite.attachShadow ? ospite.attachShadow({ mode: 'open' }) : ospite;
    var foglio = document.createElement('style');
    foglio.textContent = STILE;
    radice.appendChild(foglio);
    var velo = costruisciScheda();
    radice.appendChild(velo);
    var ok = velo.querySelector('.ok');

    /*
     * ── SEMPRE SOPRA A CIO' CHE SI VEDE ──────────────────────────────────
     *
     * PRESO ALLA PROVA: su una pagina piu' larga dello schermo, o con lo zoom
     * a due dita dell'iPhone, «fisso a tutto schermo» vuol dire fisso sulla
     * pagina intera, e la scheda finiva centrata fuori dalla parte visibile.
     * Si allinea quindi all'area che si vede davvero, e la si segue.
     */
    var vista = window.visualViewport;
    function adatta() {
      if (!vista) return;
      velo.style.left = vista.offsetLeft + 'px';
      velo.style.top = vista.offsetTop + 'px';
      velo.style.width = vista.width + 'px';
      velo.style.height = vista.height + 'px';
      velo.style.right = 'auto';
      velo.style.bottom = 'auto';
    }
    if (vista) {
      vista.addEventListener('resize', adatta);
      vista.addEventListener('scroll', adatta);
    }

    function chiudi() {
      try {
        sessionStorage.setItem(CHIAVE, '1');
      } catch (e) {
        /* niente: si chiude lo stesso */
      }
      if (vista) {
        vista.removeEventListener('resize', adatta);
        vista.removeEventListener('scroll', adatta);
      }
      if (ospite.parentNode) ospite.parentNode.removeChild(ospite);
    }
    ok.addEventListener('click', chiudi);
    velo.addEventListener('click', function (evento) {
      if (evento.target === velo) chiudi();
    });

    document.body.appendChild(ospite);
    adatta();
    try {
      ok.focus();
    } catch (e) {
      /* il fuoco non e' indispensabile */
    }
  }

  if (document.body) mostra();
  else document.addEventListener('DOMContentLoaded', mostra);
})();
