/* ============================================================
   STMDESKLY · TOASTS
   Lightweight slide-up notifications.
   Usage: TOAST.show('Saved.')
          TOAST.show('Could not save.', { kind: 'error' })
   ============================================================ */

window.TOAST = (function(){

  let container = null;
  const DEFAULT_DURATION = 3200;

  function ensureContainer(){
    if (container && document.body.contains(container)) return container;
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
    return container;
  }

  function show(message, opts){
    if (!message) return;
    opts = opts || {};
    const kind = opts.kind || 'info';
    const duration = opts.duration || DEFAULT_DURATION;

    const c = ensureContainer();
    const el = document.createElement('div');
    el.className = 'toast toast-' + kind;

    const text = document.createElement('div');
    text.className = 'toast-text';
    text.textContent = String(message);
    el.appendChild(text);

    let actionBtn = null;
    if (opts.action && opts.action.label && typeof opts.action.onClick === 'function') {
      actionBtn = document.createElement('button');
      actionBtn.type = 'button';
      actionBtn.className = 'toast-action';
      actionBtn.textContent = opts.action.label;
      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        try { opts.action.onClick(); } catch(err) {}
        dismiss(el);
      });
      el.appendChild(actionBtn);
    }

    c.appendChild(el);
    requestAnimationFrame(() => el.classList.add('visible'));

    const timer = setTimeout(() => dismiss(el), duration);

    el.addEventListener('click', (e) => {
      if (actionBtn && e.target === actionBtn) return;
      clearTimeout(timer);
      dismiss(el);
    });
  }

  function dismiss(el){
    if (!el || !el.parentNode) return;
    clearTimeout();
    el.classList.remove('visible');
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 260);
  }

  return { show };

})();
