/* ============================================================
   DESKLY · OCCUPATION AND BUSINESS MATCHER
   Conservative. Returns the single strongest match or null.
   Takes the list as a parameter.
   ============================================================ */

const MATCH = (function(){

  function norm(s){
    return String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function words(s){
    return norm(s).split(' ').filter(w => w.length > 2);
  }

  function scorePhrase(phrase, inputNorm, inputWords){
    const p = norm(phrase);
    if (!p) return 0;
    if (inputNorm.includes(p)) return 100 + p.length;

    const pWords = words(p);
    if (!pWords.length) return 0;

    let hits = 0;
    for (const pw of pWords) {
      for (const iw of inputWords) {
        if (iw === pw) { hits += 2; break; }
        if (iw.length > 4 && pw.length > 4 && (iw.includes(pw) || pw.includes(iw))) { hits += 1; break; }
      }
    }
    if (hits === 0) return 0;
    return hits + (pWords.length === 1 ? 1 : 0);
  }

  function scoreItem(item, inputNorm, inputWords){
    let best = 0;
    const fields = [item.title, item.local].concat(item.search || []);
    for (const f of fields) {
      const s = scorePhrase(f, inputNorm, inputWords);
      if (s > best) best = s;
    }
    return best;
  }

  /* findItem(input, list) */
  function findItem(input, list){
    const source = list || (typeof JOBS !== 'undefined' ? JOBS : null);
    if (!source || !input) return null;

    const inputNorm  = norm(input);
    const inputWords = words(input);
    if (!inputWords.length) return null;

    let bestItem = null;
    let bestScore = 0;
    let secondScore = 0;

    for (const item of source) {
      const s = scoreItem(item, inputNorm, inputWords);
      if (s > bestScore) {
        secondScore = bestScore;
        bestScore = s;
        bestItem = item;
      } else if (s > secondScore) {
        secondScore = s;
      }
    }

    const MIN_SCORE = 4;
    if (!bestItem || bestScore < MIN_SCORE) return null;
    if (secondScore > 0 && (bestScore - secondScore) < 2) return null;

    return { item: bestItem, score: bestScore };
  }

  function pickVariant(item, input){
    if (!item || !item.variants || !item.variants.length) return null;
    return item.variants[0];
  }

  /* Backwards-compatible shim so existing code using findJob() still works */
  function findJob(input){
    const hit = findItem(input, typeof JOBS !== 'undefined' ? JOBS : null);
    if (!hit) return null;
    return { job: hit.item, score: hit.score };
  }

  return { findItem, findJob, pickVariant, norm, words };

})();