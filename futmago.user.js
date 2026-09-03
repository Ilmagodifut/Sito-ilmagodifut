// ==UserScript==
// @name         FUTMAGO
// @namespace    https://ilmagodifut.com
// @version      0.5.0
// @description  Risolve le SBC di EA FC direttamente nella Web App. Nessun account, nessun dato inviato: il club resta sul tuo dispositivo.
// @match        https://www.ea.com/*ultimate-team/web-app*
// @run-at       document-idle
// @inject-into  page
// ==/UserScript==

/*  ──────────────────────────────────────────────────────────────
    FUTMAGO — COME INSTALLARLO

    Vedi del testo invece di una pagina? E' normale, non e' un errore:
    questo file va dato al programma che lo fa girare, non letto.

    SU iPHONE (Userscripts)
      1. tocca il tasto a sinistra dell'indirizzo, qui sopra
      2. apri  Userscripts
      3. compare una striscia gialla: premila
      4. poi  Install

    SU ANDROID (Firefox + Violentmonkey)
      la schermata di installazione compare da sola: premi  Installa

    Poi apri la Web App di EA. FUTMAGO parte da solo, e non dovrai
    piu' rifare niente: gli aggiornamenti arrivano da soli.

    Non hai ancora l'app che serve? La guida completa e' qui:
    ilmagodifut.com/futmago
    ────────────────────────────────────────────────────────────── */

fetch('https://ilmagodifut.com/futmago.js?v=0.5.0-5247ee7a')
  .then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.text();
  })
  .then(eval)
  .catch(function (e) {
    console.error('[FUTMAGO] caricamento non riuscito:', e);
  });
