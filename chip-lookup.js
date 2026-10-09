/* ============================================================
   DESKLY · CHIP LOOKUP
   Maps a chip label to an exact item in JOBS / BUSINESSES /
   ORGANISATIONS, by matching the title or local name.
   ============================================================ */

window.CHIP_LOOKUP = (function(){

  function norm(s){
    return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function findIn(label, list){
    if (!Array.isArray(list)) return null;
    const target = norm(label);

    for (const item of list) {
      if (norm(item.title) === target) return item;
      if (item.local && norm(item.local) === target) return item;
      if (Array.isArray(item.search)) {
        for (const s of item.search) {
          if (norm(s) === target) return item;
        }
      }
    }
    return null;
  }

  /* Returns the item, plus the first variant */
  function lookup(label, list){
    const item = findIn(label, list);
    if (!item || !item.variants || !item.variants.length) return null;
    return { item: item, variant: item.variants[0] };
  }

  return { lookup };
})();