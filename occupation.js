/* ============================================================
   DESKLY · OCCUPATION AND BUSINESS SUGGESTION
   Shared between signup and dashboard.
   Pass the list you want (JOBS or BUSINESSES) when attaching.
   ============================================================ */

window.OCCUPATION = (function(){

  const DEBOUNCE_MS = 600;

  function attach(inputEl, blockEl, onUse, onSkip, listProvider){
    if (!inputEl || !blockEl) return null;

    let timer = null;
    let current = null;
    let accepted = false;

    function getList(){
      if (typeof listProvider === 'function') return listProvider();
      return typeof JOBS !== 'undefined' ? JOBS : null;
    }

    function clear(){
      blockEl.innerHTML = '';
      blockEl.hidden = true;
      current = null;
    }

    function render(item, variant){
      blockEl.innerHTML = '';
      blockEl.hidden = false;

      const title = item.local
        ? item.title + ' (' + item.local + ')'
        : item.title;

      const box = document.createElement('div');
      box.className = 'occ-block';

      const head = document.createElement('div');
      head.className = 'occ-title';
      head.textContent = title;
      box.appendChild(head);

      const tag = document.createElement('div');
      tag.className = 'occ-tagline';
      tag.textContent = variant.tagline;
      box.appendChild(tag);

      const ab = document.createElement('div');
      ab.className = 'occ-about';
      ab.textContent = variant.about;
      box.appendChild(ab);

      if (variant.services && variant.services.length) {
        const lbl = document.createElement('div');
        lbl.className = 'occ-label';
        lbl.textContent = 'Services';
        box.appendChild(lbl);

        const ul = document.createElement('ul');
        ul.className = 'occ-services';
        variant.services.forEach(s => {
          const li = document.createElement('li');
          li.textContent = s;
          ul.appendChild(li);
        });
        box.appendChild(ul);
      }

      const actions = document.createElement('div');
      actions.className = 'occ-actions';

      const useBtn = document.createElement('button');
      useBtn.type = 'button';
      useBtn.className = 'occ-use ripple';
      useBtn.textContent = 'Use this';
      useBtn.addEventListener('click', () => {
        accepted = true;
        if (typeof onUse === 'function') onUse(variant, item);
        clear();
      });
      actions.appendChild(useBtn);

      const skipBtn = document.createElement('button');
      skipBtn.type = 'button';
      skipBtn.className = 'occ-skip ripple';
      skipBtn.textContent = 'Write my own';
      skipBtn.addEventListener('click', () => {
        accepted = true;
        if (typeof onSkip === 'function') onSkip();
        clear();
      });
      actions.appendChild(skipBtn);

      box.appendChild(actions);
      blockEl.appendChild(box);
    }

    function renderNoMatch(){
      blockEl.innerHTML = '';
      blockEl.hidden = false;
      const p = document.createElement('div');
      p.className = 'occ-none';
      p.textContent = 'No match found. You can write your own.';
      blockEl.appendChild(p);
    }

    function lookup(){
      const val = inputEl.value.trim();
      if (!val) { clear(); return; }
      if (accepted) return;
      if (typeof MATCH === 'undefined') return;

      const list = getList();
      if (!list) return;

      const hit = MATCH.findItem(val, list);
      if (!hit) { renderNoMatch(); return; }

      const variant = MATCH.pickVariant(hit.item, val);
      if (!variant) { renderNoMatch(); return; }

      current = { item: hit.item, variant: variant };
      render(hit.item, variant);
    }

    inputEl.addEventListener('input', () => {
      accepted = false;
      clearTimeout(timer);
      timer = setTimeout(lookup, DEBOUNCE_MS);
    });

    inputEl.addEventListener('blur', () => {
      clearTimeout(timer);
      lookup();
    });

    return {
      trigger(){
        accepted = false;
        clearTimeout(timer);
        lookup();
      }
    };
  }

  return { attach };

})();