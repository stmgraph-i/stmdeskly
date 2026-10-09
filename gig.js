/* ============================================================
   DESKLY · SINGLE GIG
   ============================================================ */

(function initGig(){

  const root    = document.getElementById('gigRoot');
  const missing = document.getElementById('gigMissing');

  const params  = new URLSearchParams(location.search);
  const gigId   = params.get('id');

  function formatMoney(n){
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function timeAgo(iso){
    const t = new Date(iso).getTime();
    if (!t) return '';
    const sec = Math.floor((Date.now() - t) / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return min + ' minute' + (min === 1 ? '' : 's') + ' ago';
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + ' hour' + (hr === 1 ? '' : 's') + ' ago';
    const day = Math.floor(hr / 24);
    if (day < 30) return day + ' day' + (day === 1 ? '' : 's') + ' ago';
    const mo = Math.floor(day / 30);
    if (mo < 12) return mo + ' month' + (mo === 1 ? '' : 's') + ' ago';
    const yr = Math.floor(mo / 12);
    return yr + ' year' + (yr === 1 ? '' : 's') + ' ago';
  }

  if (!gigId) { missing.style.display = 'block'; return; }

  const backBtn = document.getElementById('gigBack');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (window.history.length > 1) window.history.back();
      else window.location.href = 'explore.html';
    });
  }

  (async function load(){
    if (!window.DB || !DB.ready) {
      missing.querySelector('h1').textContent = 'Not available';
      missing.querySelector('p').textContent  = 'Deskly is not connected.';
      missing.style.display = 'block';
      return;
    }

    let gig;
    try { gig = await DB.getGig(gigId); }
    catch(e) {
      console.error(e);
      missing.style.display = 'block';
      return;
    }

    if (!gig) { missing.style.display = 'block'; return; }

    const user = DB.currentUser();
    const isOwner = !!(user && user.id === gig.user_id);

    if (gig.status !== 'open' && !isOwner) {
      missing.querySelector('h1').textContent = 'This gig is closed';
      missing.querySelector('p').textContent  = 'The owner has marked it as filled or closed.';
      missing.style.display = 'block';
      return;
    }

    document.getElementById('gigTypeBadge').textContent =
      gig.type === 'need' ? 'Looking for' : 'Available';

    document.getElementById('gigTitleEl').textContent  = gig.title || 'Gig';
    document.getElementById('gigRoleEl').textContent   = gig.role || '';
    document.getElementById('gigPostedEl').textContent = 'Posted ' + timeAgo(gig.created_at);

    document.title = (gig.title || 'Gig') + ' | Deskly';

    if (gig.body && gig.body.trim()) {
      document.getElementById('gigBodyEl').textContent = gig.body.trim();
      document.getElementById('gigBodyBlock').hidden = false;
    }

    let anyInfo = false;

    if (gig.location) {
      document.getElementById('gigLocEl').textContent = gig.location;
      document.getElementById('gigLocBlock').hidden = false;
      anyInfo = true;
    }

    if (gig.days) {
      document.getElementById('gigDaysEl').textContent = gig.days;
      document.getElementById('gigDaysBlock').hidden = false;
      anyInfo = true;
    }

    if (gig.pay_min || gig.pay_max || gig.pay_unit) {
      const bits = [];
      if (gig.pay_unit === 'negotiable') {
        bits.push('Negotiable');
      } else {
        const min = gig.pay_min ? '₦' + formatMoney(gig.pay_min) : '';
        const max = gig.pay_max ? '₦' + formatMoney(gig.pay_max) : '';
        if (min && max) bits.push(min + ' to ' + max);
        else bits.push(min || max);
        if (gig.pay_unit) bits.push(gig.pay_unit.replace(/_/g,' '));
      }
      document.getElementById('gigPayEl').textContent = bits.join(' ');
      document.getElementById('gigPayBlock').hidden = false;
      anyInfo = true;
    }

    if (anyInfo) document.getElementById('gigInfoBlock').hidden = false;

    let ownerDesk = null;
    try {
      if (gig.desk_id) {
        ownerDesk = await DB.getDeskById(gig.desk_id);
      }
    } catch(e) { console.error(e); }

    const contactIntro = document.getElementById('gigContactIntro');
    if (ownerDesk && ownerDesk.whatsapp) {
      contactIntro.textContent = 'Reach ' + (ownerDesk.name || 'the poster') + ' on WhatsApp about this gig.';
      document.getElementById('gigWhatsApp').href =
        'https://wa.me/' + ownerDesk.whatsapp + '?text=' +
        encodeURIComponent('Hi ' + (ownerDesk.name || '') + ', I saw your gig on Deskly: ' + gig.title);
    } else {
      contactIntro.textContent = 'The poster has not added a WhatsApp number yet.';
      document.getElementById('gigWhatsApp').style.display = 'none';
    }

    if (ownerDesk && ownerDesk.username) {
      document.getElementById('gigDeskLink').href =
        'profile.html?u=' + encodeURIComponent(ownerDesk.username);
    } else {
      document.getElementById('gigDeskLink').style.display = 'none';
    }

    if (isOwner) {
      document.getElementById('gigOwnerBlock').hidden = false;
      document.getElementById('gigEditBtn').href = 'post-gig.html?edit=' + gig.id;

      document.getElementById('gigCloseBtn').addEventListener('click', async () => {
        if (!confirm('Mark this gig as filled? It will stop showing in Explore.')) return;
        try {
          await DB.updateGig(gig.id, { status: 'filled' });
          alert('Marked as filled.');
          window.location.reload();
        } catch(e) {
          console.error(e);
          alert(e.message || 'Could not update the gig.');
        }
      });

      document.getElementById('gigDeleteBtn').addEventListener('click', async () => {
        if (!confirm('Delete this gig permanently?')) return;
        try {
          await DB.deleteGig(gig.id);
          window.location.replace('explore.html');
        } catch(e) {
          console.error(e);
          alert(e.message || 'Could not delete the gig.');
        }
      });
    } else {
      document.getElementById('gigReportBlock').hidden = false;
      document.getElementById('gigReportBtn').addEventListener('click', async () => {
        const reason = prompt('Tell us what is wrong with this gig (optional):');
        if (reason === null) return;
        try {
          await DB.reportGig(gig.id, reason || 'No reason given');
          alert('Thank you. We will review this gig.');
        } catch(e) {
          console.error(e);
          alert('Could not submit the report.');
        }
      });
    }

    root.style.display = '';
  })();

})();