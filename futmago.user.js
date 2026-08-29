// ==UserScript==
// @name         FUTMAGO
// @namespace    https://ilmagodifut.com
// @version      0.5.0
// @description  Risolve le SBC di EA FC direttamente nella Web App. Nessun account, nessun dato inviato: il club resta sul tuo dispositivo.
// @match        https://www.ea.com/*ultimate-team/web-app*
// @run-at       document-idle
// @inject-into  page
// ==/UserScript==

/*
 * IL VEICOLO iOS CHE NON COSTA NULLA.
 *
 * Su iPhone un'estensione Safari deve stare dentro un'app e l'app deve venire
 * dall'App Store: non esiste alcun modo di installarla da una pagina web.
 * Pubblicare la *nostra* app costa 99 $/anno e richiede un Mac.
 *
 * Questo file salta il problema passando da un'estensione che qualcun altro ha
 * gia' pubblicato — **Userscripts**, gratuita — e che esiste apposta per far
 * girare codice come questo. Per noi il costo e' zero, e per l'utente
 * l'attivazione avviene dal browser, senza installare niente di nostro.
 *
 * E' lo stesso file che serviamo al bookmarklet di Chrome Android: identico
 * meccanismo, involucro diverso.
 *
 * ## Le due righe dell'intestazione che decidono tutto
 *
 *   @inject-into page   Senza, Userscripts inietta nel mondo ISOLATO e
 *                       `window.repositories` non si vede: FUTMAGO partirebbe
 *                       e non troverebbe nulla.
 *
 *   nessun @grant       Se lo script dichiara un qualsiasi `@grant`,
 *                       Userscripts riporta `@inject-into` a `content` **in
 *                       silenzio**, annullando la riga sopra. Percio' qui non
 *                       si usa nessuna API GM_*.
 *
 * ## Perche' scarica invece di contenere il bundle
 *
 * Perche' cosi' un aggiornamento non chiede all'utente di reincollare mezzo
 * megabyte dal telefono. Il `?v=` evita che una cache vecchia blocchi il
 * rilascio nuovo.
 *
 * `.then(eval)` e non `eval(t)`: passato come funzione, `eval` viene invocato
 * in modo indiretto e valuta nell'ambito globale. Dentro la callback
 * valuterebbe nell'ambito della callback, e FUTMAGO sparirebbe appena la
 * promise si risolve.
 */

fetch('https://ilmagodifut.com/futmago.js?v=0.5.0-5233abe3')
  .then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.text();
  })
  .then(eval)
  .catch(function (e) {
    console.error('[FUTMAGO] caricamento non riuscito:', e);
  });
