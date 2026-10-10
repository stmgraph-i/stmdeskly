/* ============================================================
   STMDESKLY · SIGNED-IN HEADER
   Deskly on left, menu button on right. Works on all screens.
   Menu contains things the tabbar doesn't already reach:
   View public Desk, Settings, My bot, How it works, Log out.
   ============================================================ */

(function initHeader(){

  if (!document.body.classList.contains('signed-in')) return;

  /* ---- Build the header ---- */
  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <a class="app-brand ripple" href="home.html">Deskly</a>
    <button class="app-menu-btn ripple" id="appMenuBtn" aria-label="Open menu" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
        <path d="M4 9h16M4 15h16"/>
      </svg>
    </button>
  `;
  document.body.prepend(header);

  /* ---- Menu sheet ---- */
  const sheet = document.createElement('div');
  sheet.className = 'menu-sheet';
  sheet.id = 'menuSheet';
  sheet.hidden = true;
  sheet.innerHTML = `
    <div class="menu-backdrop" id="menuBackdrop"></div>
    <div class="menu-panel" role="dialog" aria-label="Menu">

      <a class="menu-item ripple" id="menuViewDesk" href="#" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span>View public Desk</span>
      </a>

      <a class="menu-item ripple" href="settings.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span>Settings</span>
      </a>

      <a class="menu-item ripple" href="bot.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-5.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
        </svg>
        <span>My bot</span>
      </a>

      <a class="menu-item ripple" href="how.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M9.5 9.2a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1 1.1-1 1.9v.2"/>
          <circle cx="12" cy="17" r=".6" fill="currentColor" stroke="none"/>
        </svg>
        <span>How it works</span>
      </a>

      <button class="menu-item ripple menu-item-quiet" id="menuLogout" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/>
          <path d="M10 17l-5-5 5-5"/>
          <path d="M15 12H5"/>
        </svg>
        <span>Log out</span>
      </button>

    </div>
  `;
  document.body.appendChild(sheet);

  const btn       = document.getElementById('appMenuBtn');
  const backdrop  = document.getElementById('menuBackdrop');
  const viewDesk  = document.getElementById('menuViewDesk');
  const logoutBtn = document.getElementById('menuLogout');

  function openMenu(){
    sheet.hidden = false;
    requestAnimationFrame(() => sheet.classList.add('open'));
    btn.setAttribute('aria-expanded', 'true');
  }
  function closeMenu(){
    sheet.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    setTimeout(() => { sheet.hidden = true; }, 250);
  }

  btn.addEventListener('click', () => {
    sheet.classList.contains('open') ? closeMenu() : openMenu();
  });
  backdrop.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---- View public Desk ---- */
  (async function resolveDeskLink(){
    try {
      if (!window.DB || !DB.ready || !DB.currentUser()) return;
      const desk = await DB.getMyDesk();
      if (desk && desk.username) {
        viewDesk.href = 'desk.html?u=' + encodeURIComponent(desk.username);
      } else {
        viewDesk.style.display = 'none';
      }
    } catch(e) {
      viewDesk.style.display = 'none';
    }
  })();

  /* ---- Logout ---- */
  logoutBtn.addEventListener('click', async () => {
    const ok = confirm('Log out of Deskly?\n\nYou will need to log in again to access your Desk.');
    if (!ok) return;
    if (window.DB) await DB.logOut();
    window.location.replace('index.html');
  });

})();
