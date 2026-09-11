/**
 * IL LISTINO PREZZI, SERVITO DAL SITO.
 *
 * ⚠️ QUESTO FILE VA IN `Ilmagodifut/Sito-ilmagodifut`, non in questo
 *    repository: la sua destinazione e' `netlify/functions/listino.mts`.
 *    Qui c'e' la copia buona, quella che si modifica.
 *
 * ── PERCHE' ESISTE ──────────────────────────────────────────────────────────
 *
 * Perche' chiedere a EA una ricerca per ogni carta ha chiuso il mercato
 * all'utente due volte in due giorni. Un prodotto che si vende non puo'
 * funzionare cosi'.
 *
 * Il file dei prezzi di fut.gg e' pubblico — 28.620 carte — ma non si puo'
 * prendere da dove servirebbe. Misurato l'11/09/2026:
 *
 *   dalla pagina di EA       fallisce, non autorizzano i browser di altri siti
 *   dal nostro Worker        403, bloccano le richieste dai server Cloudflare
 *   da una macchina qualunque 200, si scarica senza problemi
 *
 * Netlify non e' un browser e non e' Cloudflare. Scarica lui, e serve il
 * documento dal nostro dominio: da li' FUTMAGO lo legge identico su
 * estensione, segnalibro e userscript — quindi su PC, iPhone e Android.
 *
 * ── PERCHE' UNA FUNZIONE E NON UN LAVORO PROGRAMMATO ────────────────────────
 *
 * La prima versione era un lavoro che ogni due ore scaricava il file e lo
 * committava nel sito. CHIESTO: «e' troppo che si rigenera ogni due ore, non
 * puo' essere tipo ogni 1-5 minuti?».
 *
 * Con un lavoro programmato no: ogni aggiornamento sarebbe un commit da
 * duecento chilobyte, e a cinque minuti fanno trecento commit al giorno.
 *
 * Una funzione non ha quel problema perche' non scrive niente: scarica quando
 * qualcuno chiede, e la cache del sito fa il resto. La freschezza la decide
 * una riga — quella qui sotto — invece che la frequenza di un cron.
 *
 * ── OGNI QUANTO PUBBLICA LA FONTE ───────────────────────────────────────────
 *
 * Ogni sei minuti: misurato, e il numero sta sotto accanto alla cache.
 *
 * ── E QUANDO I PREZZI SARANNO NOSTRI ────────────────────────────────────────
 *
 * Cambia solo cosa c'e' dentro questa funzione. Il client continua a chiedere
 * lo stesso indirizzo e a decodificarlo allo stesso modo.
 */

const RADICE = 'https://r2.fut.gg';
const ANNO = '26';

/** Le due sole chiavi ammesse: niente indirizzi costruiti con cio' che arriva. */
const LISTINI: Record<string, string> = {
  console: 'player-prices-ps5',
  pc: 'player-prices-pc',
};

/**
 * Quanto a lungo la risposta resta buona.
 *
 * Un minuto. MISURATO l'11/09/2026 guardando `_published_at` nel manifesto:
 *
 *     10:06:25   pubblicato
 *     10:12:26   pubblicato        361 secondi dopo
 *
 * La fonte pubblica ogni **sei minuti**. Con un minuto di cache un prezzo
 * nuovo arriva al client entro sette minuti dalla sua pubblicazione — e quei
 * sei minuti li decide fut.gg, non noi.
 *
 * Piu' corto non porterebbe numeri nuovi: porterebbe solo richieste a una
 * fonte che nel frattempo non ha pubblicato niente. Piu' lungo aggiungerebbe
 * ritardo nostro a ritardo loro.
 *
 * Il conto del traffico non dipende da quanti utenti abbiamo: al massimo una
 * richiesta al minuto verso fut.gg, comunque vada.
 */
const CACHE_S = 60;

function errore(cosa: string, stato = 502): Response {
  return new Response(JSON.stringify({ errore: cosa }), {
    status: stato,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'cache-control': 'no-store',
    },
  });
}

export default async (richiesta: Request): Promise<Response> => {
  const piattaforma = new URL(richiesta.url).pathname.includes('-pc') ? 'pc' : 'console';
  const chiave = LISTINI[piattaforma];
  if (chiave === undefined) return errore('piattaforma-sconosciuta', 400);

  try {
    /*
     * Il manifesto dice l'impronta della versione corrente, e l'impronta entra
     * nell'indirizzo del documento: e' cosi' che nessuna cache puo' restituire
     * il listino di ieri.
     */
    const manifesto = await fetch(`${RADICE}/${ANNO}/manifest.json`, {
      headers: { accept: 'application/json' },
    });
    if (!manifesto.ok) return errore('manifesto-non-disponibile');

    const letto = (await manifesto.json()) as Record<string, unknown>;
    const impronta = letto[chiave];
    if (typeof impronta !== 'string' || impronta === '') return errore('listino-assente');
    const versione = typeof letto['_version'] === 'number' ? String(letto['_version']) : '1';

    const documento = await fetch(
      `${RADICE}/${ANNO}/${chiave}.v${versione}.${impronta}.json`,
      { headers: { accept: 'application/json' } },
    );
    if (!documento.ok) return errore('listino-non-disponibile');

    /*
     * Il corpo si ripassa cosi' com'e', senza leggerlo: sono duecento
     * chilobyte, e trasformarli qui costerebbe tempo per non aggiungere nulla.
     * A decodificarli e' il client, che ha gia' la sua prova.
     */
    return new Response(documento.body, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        /* FUTMAGO gira dentro la pagina di EA: senza questa riga non legge. */
        'access-control-allow-origin': '*',
        'cache-control': `public, max-age=${CACHE_S}, s-maxage=${CACHE_S}`,
        'netlify-cdn-cache-control': `public, durable, s-maxage=${CACHE_S}`,
        'x-futmago-impronta': impronta,
      },
    });
  } catch {
    /*
     * Fonte irraggiungibile: si dice, e FUTMAGO prosegue come prima. Questo
     * listino e' un acceleratore, non un pezzo senza il quale non funziona.
     */
    return errore('fonte-irraggiungibile');
  }
};

/*
 * Gli indirizzi pubblici. Sono gli stessi che FUTMAGO chiede da quando il
 * listino era un file statico: se un giorno tornasse a esserlo, o diventasse
 * nostro, il client non se ne accorgerebbe.
 */
export const config = {
  path: ['/futmago-listino-console.json', '/futmago-listino-pc.json'],
};
