/* ============================================================
   DESKLY · RIPPLE
   Soft tap effect on elements with class "ripple".
   Loaded on every page.
   ============================================================ */

(function initRipple(){

  document.addEventListener('pointerdown', function(e){

    const target = e.target.closest('.ripple');
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    const span = document.createElement('span');
    span.className = 'rp';
    span.style.width  = size + 'px';
    span.style.height = size + 'px';
    span.style.left   = (e.clientX - rect.left - size / 2) + 'px';
    span.style.top    = (e.clientY - rect.top  - size / 2) + 'px';

    target.appendChild(span);
    setTimeout(() => span.remove(), 500);

  }, { passive: true });

})();