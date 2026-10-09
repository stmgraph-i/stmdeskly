/* ============================================================
   DESKLY · PROFILE (in-app view)
   Same as desk, plus reviews and wall. Login required.
   ============================================================ */

(async function loadProfile(){

  const root    = document.getElementById('deskRoot');
  const missing = document.getElementById('deskMissing');
  const $ = (id) => document.getElementById(id);

  const params   = new URLSearchParams(location.search);
  let username   = (params.get('u') || '').toLowerCase().trim();

  if (!username) {
    const path = location.pathname.replace(/^\/+|\/+$/g, '');
    if (path && path !== 'profile.html') {
      username = path.split('/').pop().toLowerCase();
    }
  }

  if (!username) {
    missing.style.display = 'block';
    return;
  }

  if (!window.DB || !DB.ready) {
    missing.querySelector('h1').textContent = 'Not available';
    missing.querySelector('p').textContent  = 'Deskly is not connected yet.';
    missing.style.display = 'block';
    return;
  }

  if (!DB.currentUser()) {
    await new Promise(r => setTimeout(r, 400));
  }

  if (!DB.currentUser()) {
    window.location.replace('desk.html?u=' + encodeURIComponent(username));
    return;
  }

  let desk;
  try { desk = await DB.getDesk(username); }
  catch (err) {
    console.error(err);
    missing.querySelector('h1').textContent = 'Something went wrong';
    missing.querySelector('p').textContent  = 'We could not load this profile.';
    missing.style.display = 'block';
    return;
  }

  if (!desk) { missing.style.display = 'block'; return; }

  try { DB.recordVisit(desk.id); } catch(e) {}

  const type = desk.type || 'person';

  let knowledge = { prices: [], facts: [] };
  try {
    if (desk.bot_knowledge) {
      const k = JSON.parse(desk.bot_knowledge);
      knowledge.prices = Array.isArray(k.prices) ? k.prices : [];
      knowledge.facts  = Array.isArray(k.facts)  ? k.facts  : [];
    }
  } catch(e) { /* ignore */ }

  let photos = [];
  try {
    photos = desk.photos ? JSON.parse(desk.photos) : [];
    if (!Array.isArray(photos)) photos = [];
  } catch(e) { photos = []; }

  const initials = desk.initials || 'D';
  const markEl   = $('deskMark');

  if (desk.avatar_url) {
    markEl.textContent = '';
    markEl.style.backgroundImage = 'url("' + desk.avatar_url + '")';
    markEl.style.backgroundSize = 'cover';
    markEl.style.backgroundPosition = 'center';
    markEl.classList.add('has-image');
  } else {
    markEl.textContent = initials;
    markEl.style.backgroundImage = '';
    markEl.classList.remove('has-image');
  }

  /* Presence on avatar */
  markEl.classList.add('presence-avatar');
  let presenceDot = markEl.querySelector('.presence-dot');
  if (!presenceDot) {
    presenceDot = document.createElement('span');
    presenceDot.className = 'presence-dot';
    markEl.appendChild(presenceDot);
  }
  presenceDot.style.display = 'none';

  $('deskName').textContent    = desk.name || 'Desk';
  $('deskRole').textContent    = desk.role || '';
  $('deskTagline').textContent = desk.tagline || '';

  document.title = (desk.name || 'Profile') + ' | STMDeskly';

  /* Presence polling */
  let profilePresenceTimer = null;

  async function renderProfilePresence(){
    if (!window.PRESENCE || !desk.user_id) return;
    if (!$('deskRole')) return;

    try {
      const p = await PRESENCE.getPresence(desk.user_id);
      const roleEl = $('deskRole');

      if (!p.visible) {
        presenceDot.style.display = 'none';
        roleEl.textContent = desk.role || '';
        roleEl.classList.remove('presence-text', 'offline');
        return;
      }

      if (p.online) {
        presenceDot.style.display = '';
        roleEl.textContent = 'Online';
        roleEl.classList.add('presence-text');
        roleEl.classList.remove('offline');
      } else {
        presenceDot.style.display = 'none';
        roleEl.textContent = PRESENCE.formatLastSeen(p.lastSeen);
        roleEl.classList.add('presence-text', 'offline');
      }
    } catch(e) { /* silent */ }
  }

  renderProfilePresence();
  profilePresenceTimer = setInterval(renderProfilePresence, 20000);

  window.addEventListener('beforeunload', () => {
    if (profilePresenceTimer) clearInterval(profilePresenceTimer);
  });

  /* ----- Offer ----- */
  const offerSource = (type === 'business' && desk.products) ? desk.products : desk.services;
  const offerItems  = (offerSource || '').split('\n').map(s => s.trim()).filter(Boolean);

  if (offerItems.length) {
    $('offerTag').textContent = type === 'business' ? 'Products and services' : 'Services';
    const list = $('deskOffer');
    list.innerHTML = '';
    offerItems.forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      list.appendChild(li);
    });
    $('offerBlock').hidden = false;
  }

  if (desk.about && desk.about.trim()) {
    $('deskAbout').textContent = desk.about.trim();
    $('aboutBlock').hidden = false;
  }

  if (photos.length) {
    renderWork(photos, desk.photo_layout || 'grid');
    $('workBlock').hidden = false;
  }

  /* ----- Details ----- */
  let anyDetails = false;

  if (desk.location && desk.location.trim()) {
    $('areaLabel').textContent  = type === 'person' ? 'Service area' : 'Location';
    $('deskArea').textContent   = desk.location.trim();
    $('areaBlock').hidden = false;
    anyDetails = true;
  }

  if (type === 'business' && desk.opening_hours && desk.opening_hours.trim()) {
    $('deskHours').textContent = desk.opening_hours.trim();
    $('hoursBlock').hidden = false;
    anyDetails = true;
  }

  if (type === 'organisation') {
    if (desk.service_times && desk.service_times.trim()) {
      $('deskTimes').textContent = desk.service_times.trim();
      $('timesBlock').hidden = false;
      anyDetails = true;
    }
    const progs = (desk.programmes || '').split('\n').map(s => s.trim()).filter(Boolean);
    if (progs.length) {
      const list = $('deskProg');
      list.innerHTML = '';
      progs.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        list.appendChild(li);
      });
      $('progBlock').hidden = false;
      anyDetails = true;
    }
    const facs = (desk.facilities || '').split('\n').map(s => s.trim()).filter(Boolean);
    if (facs.length) {
      const list = $('deskFac');
      list.innerHTML = '';
      facs.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        list.appendChild(li);
      });
      $('facBlock').hidden = false;
      anyDetails = true;
    }
  }

  if (anyDetails) $('detailsBlock').hidden = false;

  /* ----- In-app Message button ----- */
  const chatBtn = $('deskChat');
  if (chatBtn) {
    const me = DB.currentUser();
    if (me && desk.user_id && me.id === desk.user_id) {
      chatBtn.style.display = 'none';
    } else {
      chatBtn.addEventListener('click', () => {
        window.location.href = 'chat.html?to=' + encodeURIComponent(desk.user_id);
      });
    }
  }

  /* ----- Contact (WhatsApp, email, etc.) ----- */
  const wa   = $('deskWhatsApp');
  const em   = $('deskEmail');
  const ph   = $('deskPhone');
  const web  = $('deskWebsite');
  let anyContact = false;

  if (desk.whatsapp) {
    wa.href = 'https://wa.me/' + desk.whatsapp + '?text=' +
              encodeURIComponent(desk.wamessage || '');
    wa.addEventListener('click', () => {
      try { DB.markWhatsAppTap(desk.id); } catch(e) {}
    });
    anyContact = true;
  } else if (wa) { wa.style.display = 'none'; }

  if (desk.email) {
    em.href = 'mailto:' + desk.email;
    anyContact = true;
  } else if (em) { em.style.display = 'none'; }

  if (desk.phone) {
    ph.href = 'tel:+' + desk.phone;
    anyContact = true;
  } else if (ph) { ph.style.display = 'none'; }

  if (desk.website) {
    web.href = desk.website;
    anyContact = true;
  } else if (web) { web.style.display = 'none'; }

  const chatBtnVisible = chatBtn && chatBtn.style.display !== 'none';
  if (anyContact || chatBtnVisible) $('contactBlock').hidden = false;

  /* ============================================================
     REVIEWS
     ============================================================ */

  await initReviews();

  async function initReviews(){

    const block        = $('reviewsBlock');
    const summary      = $('reviewsSummary');
    const avgEl        = $('reviewsAvg');
    const starsBigEl   = $('reviewsStarsBig');
    const countEl      = $('reviewsCount');
    const listEl       = $('reviewsList');
    const emptyEl      = $('reviewsEmpty');
    const yourReview   = $('yourReview');
    const yourBody     = $('yourReviewBody');
    const yourEditBtn  = $('yourReviewEdit');
    const yourDelBtn   = $('yourReviewDelete');
    const formTitle    = $('reviewFormTitle');
    const starsEl      = $('reviewStars');
    const nameInput    = $('reviewName');
    const textInput    = $('reviewText');
    const msgBox       = $('reviewMessage');
    const submitBtn    = $('reviewSubmit');
    const cancelBtn    = $('reviewCancel');

    if (!block) return;

    let myKey = '';
    try { myKey = DB.getRaterKey ? DB.getRaterKey() : ''; } catch(e) {}

    let myReview = null;
    let allReviews = [];
    let selectedStars = 0;

    function escapeHtml(s){
      return String(s || '').replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
      })[c]);
    }

    function starsRow(value){
      const v = Math.round(value || 0);
      let s = '';
      for (let i = 1; i <= 5; i++) s += i <= v ? '★' : '☆';
      return s;
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

    function showMessage(text, kind){
      if (!msgBox) return;
      msgBox.textContent = text;
      msgBox.className = 'form-message ' + (kind || 'error');
      msgBox.hidden = false;
    }
    function clearMessage(){
      if (msgBox) { msgBox.hidden = true; msgBox.textContent = ''; }
    }

    function renderStars(){
      starsEl.querySelectorAll('.review-star').forEach(btn => {
        const v = parseInt(btn.getAttribute('data-value'), 10);
        btn.classList.toggle('active', v <= selectedStars);
      });
    }

    starsEl.querySelectorAll('.review-star').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = parseInt(btn.getAttribute('data-value'), 10);
        selectedStars = v;
        renderStars();
        clearMessage();
      });
      btn.addEventListener('mouseenter', () => {
        const v = parseInt(btn.getAttribute('data-value'), 10);
        starsEl.querySelectorAll('.review-star').forEach(b => {
          const bv = parseInt(b.getAttribute('data-value'), 10);
          b.classList.toggle('hover', bv <= v);
        });
      });
      btn.addEventListener('mouseleave', () => {
        starsEl.querySelectorAll('.review-star').forEach(b => b.classList.remove('hover'));
      });
    });

    function render(){
      const rated = allReviews.filter(r => r.rating > 0);
      if (rated.length) {
        const sum = rated.reduce((acc, r) => acc + r.rating, 0);
        const avg = sum / rated.length;
        avgEl.textContent = avg.toFixed(1);
        starsBigEl.textContent = starsRow(avg);
        countEl.textContent = rated.length + (rated.length === 1 ? ' review' : ' reviews');
        summary.hidden = false;
      } else {
        summary.hidden = true;
      }

      const others = allReviews.filter(r => r.rater_key !== myKey);

      listEl.innerHTML = '';

      if (!others.length && !myReview) {
        emptyEl.hidden = false;
      } else {
        emptyEl.hidden = true;
      }

      others.forEach(r => {
        listEl.appendChild(buildReviewCard(r));
      });

      if (myReview) {
        yourReview.hidden = false;
        yourBody.innerHTML = '';

        const head = document.createElement('div');
        head.className = 'your-review-row';
        head.innerHTML =
          '<span class="review-stars-inline">' + starsRow(myReview.rating) + '</span>' +
          (myReview.reviewer_name ? '<span class="review-name-inline">' + escapeHtml(myReview.reviewer_name) + '</span>' : '') +
          (myReview.verified ? '<span class="review-verified">✓ Verified</span>' : '');

        yourBody.appendChild(head);

        if (myReview.review_text) {
          const text = document.createElement('div');
          text.className = 'your-review-text';
          text.textContent = myReview.review_text;
          yourBody.appendChild(text);
        }

        if (myReview.owner_reply) {
          const reply = document.createElement('div');
          reply.className = 'review-reply';
          reply.innerHTML =
            '<div class="review-reply-label">' + escapeHtml(desk.name || 'Owner') + ' replied</div>' +
            '<div class="review-reply-text">' + escapeHtml(myReview.owner_reply) + '</div>';
          yourBody.appendChild(reply);
        }

        formTitle.textContent = 'Edit your review';
        submitBtn.textContent = 'Save changes';
        nameInput.value = myReview.reviewer_name || '';
        textInput.value = myReview.review_text || '';
        selectedStars = myReview.rating || 0;
        renderStars();
        cancelBtn.hidden = false;
      } else {
        yourReview.hidden = true;
        formTitle.textContent = 'Leave a review';
        submitBtn.textContent = 'Post review';
        cancelBtn.hidden = true;
      }
    }

    function buildReviewCard(r){
      const card = document.createElement('div');
      card.className = 'review-card';

      const head = document.createElement('div');
      head.className = 'review-head';

      const name = document.createElement('span');
      name.className = 'review-name';
      name.textContent = (r.reviewer_name && r.reviewer_name.trim()) || 'Anonymous';
      head.appendChild(name);

      if (r.verified) {
        const badge = document.createElement('span');
        badge.className = 'review-verified';
        badge.textContent = '✓ Verified';
        head.appendChild(badge);
      }

      const time = document.createElement('span');
      time.className = 'review-time';
      time.textContent = timeAgo(r.rated_at);
      head.appendChild(time);

      card.appendChild(head);

      const stars = document.createElement('div');
      stars.className = 'review-stars-inline';
      stars.textContent = starsRow(r.rating);
      card.appendChild(stars);

      if (r.review_text) {
        const text = document.createElement('div');
        text.className = 'review-text';
        text.textContent = r.review_text;
        card.appendChild(text);
      }

      if (r.owner_reply) {
        const reply = document.createElement('div');
        reply.className = 'review-reply';
        reply.innerHTML =
          '<div class="review-reply-label">' + escapeHtml(desk.name || 'Owner') + ' replied</div>' +
          '<div class="review-reply-text">' + escapeHtml(r.owner_reply) + '</div>';
        card.appendChild(reply);
      }

      return card;
    }

    async function loadAll(){
      try {
        allReviews = await DB.getReviews(desk.id);
        allReviews = (allReviews || []).filter(r => r.rating && r.rating > 0);
        myReview = allReviews.find(r => r.rater_key === myKey) || null;
        if (myReview && DB.saveMyRating) DB.saveMyRating(desk.id, myReview.rating);
      } catch(e) {
        console.error('loadAll failed:', e);
        allReviews = [];
        myReview = null;
      }
      render();
    }

    submitBtn.addEventListener('click', async () => {
      clearMessage();

      if (!selectedStars) {
        return showMessage('Please pick a star rating.', 'error');
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      try {
        await DB.submitReview(desk.id, {
          rating: selectedStars,
          name:   nameInput.value.trim(),
          text:   textInput.value.trim()
        });
        await loadAll();
        showMessage('Saved.', 'success');
        setTimeout(clearMessage, 1800);
      } catch(e) {
        console.error(e);
        showMessage(e.message || 'Could not save your review.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = myReview ? 'Save changes' : 'Post review';
      }
    });

    yourDelBtn.addEventListener('click', async () => {
      if (!myReview) return;
      if (!confirm('Delete your review?')) return;
      yourDelBtn.disabled = true;
      try {
        await DB.deleteReview(desk.id);
        myReview = null;
        selectedStars = 0;
        nameInput.value = '';
        textInput.value = '';
        await loadAll();
      } catch(e) {
        console.error(e);
        showMessage(e.message || 'Could not delete.', 'error');
      } finally {
        yourDelBtn.disabled = false;
      }
    });

    yourEditBtn.addEventListener('click', () => {
      const formEl = $('reviewForm');
      if (formEl) formEl.scrollIntoView({ behavior:'smooth', block:'center' });
      textInput.focus();
    });

    block.hidden = false;
    await loadAll();
  }

  /* ============================================================
     WALL
     ============================================================ */

  await initWall();

  async function initWall(){

    const block      = $('wallBlock');
    if (!block) return;
    if (desk.wall_enabled !== true) return;

    const form       = $('wallForm');
    const list       = $('wallList');
    const empty      = $('wallEmpty');
    const nameEl     = $('wallName');
    const bodyEl     = $('wallBody');
    const msgBox     = $('wallMessage');
    const submitBtn  = $('wallSubmit');
    const photoInput = $('wallPhotoInput');
    const attachBtn  = $('wallAttachBtn');
    const photoPrev  = $('wallPhotoPreview');
    const photoImg   = $('wallPhotoPreviewImg');
    const photoRm    = $('wallPhotoRemove');

    let myKey = '';
    try { myKey = DB.getAuthorKey ? DB.getAuthorKey() : ''; } catch(e) {}

    const isOwner = !!(DB.currentUser && DB.currentUser() && desk.user_id && DB.currentUser().id === desk.user_id);

    let allPosts = [];
    let allReactions = [];
    let pendingPhotoBlob = null;
    let replyingTo = null;

    const ICON_HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    const ICON_THUMBS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>';
    const ICON_FIRE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
    const ICON_PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>';
    const ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    const ICON_REPLY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>';

    function escapeHtml(s){
      return String(s || '').replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
      })[c]);
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

    function showMessage(text, kind){
      if (!msgBox) return;
      msgBox.textContent = text;
      msgBox.className = 'form-message wall-message ' + (kind || 'error');
      msgBox.hidden = false;
    }
    function clearMessage(){
      if (msgBox) { msgBox.hidden = true; msgBox.textContent = ''; }
    }

    function buildReactionBar(postId){
      const bar = document.createElement('div');
      bar.className = 'wall-reactions';

      const groups = {};
      allReactions.forEach(r => {
        if (r.post_id !== postId) return;
        groups[r.emoji] = groups[r.emoji] || { count: 0, mine: false };
        groups[r.emoji].count++;
        if (r.reactor_key === myKey) groups[r.emoji].mine = true;
      });

      const emojis = [
        { key: 'heart',    icon: ICON_HEART,  label: 'Heart'  },
        { key: 'thumbsup', icon: ICON_THUMBS, label: 'Thumbs' },
        { key: 'fire',     icon: ICON_FIRE,   label: 'Fire'   }
      ];

      emojis.forEach(e => {
        const info = groups[e.key] || { count: 0, mine: false };
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wall-reaction' + (info.mine ? ' mine' : '');
        btn.setAttribute('aria-label', e.label);
        btn.innerHTML = e.icon + (info.count ? '<span class="wall-reaction-count">' + info.count + '</span>' : '');
        btn.addEventListener('click', async () => {
          if (btn.disabled) return;
          btn.disabled = true;
          try {
            await DB.toggleReaction(postId, e.key);
            await loadAll();
          } catch(err) {
            console.error(err);
          } finally {
            btn.disabled = false;
          }
        });
        bar.appendChild(btn);
      });

      return bar;
    }

    function buildPost(post, isReply){
      const card = document.createElement('div');
      card.className = 'wall-post' + (isReply ? ' wall-post-reply' : '') + (post.pinned ? ' wall-post-pinned' : '');

      const head = document.createElement('div');
      head.className = 'wall-post-head';

      const name = document.createElement('span');
      name.className = 'wall-post-name';
      name.textContent = (post.author_name && post.author_name.trim()) || 'Anonymous';
      head.appendChild(name);

      const dot = document.createElement('span');
      dot.className = 'wall-post-sep';
      dot.textContent = '·';
      head.appendChild(dot);

      const time = document.createElement('span');
      time.className = 'wall-post-time';
      time.textContent = timeAgo(post.posted_at);
      head.appendChild(time);

      if (post.pinned && !isReply) {
        const pin = document.createElement('span');
        pin.className = 'wall-post-pin';
        pin.innerHTML = ICON_PIN + '<span>Pinned</span>';
        head.appendChild(pin);
      }

      const canDelete = isOwner || (post.author_key && post.author_key === myKey);
      if (canDelete) {
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'wall-post-delete';
        del.setAttribute('aria-label', 'Delete');
        del.innerHTML = ICON_CLOSE;
        del.addEventListener('click', async () => {
          if (!confirm('Delete this message?')) return;
          try {
            await DB.deleteWallPost(post.id);
            await loadAll();
          } catch(e) {
            console.error(e);
            TOAST.show(e.message || 'Could not delete.', { kind: 'error' });
          }
        });
        head.appendChild(del);
      }

      card.appendChild(head);

      if (post.photo_url) {
        const photoWrap = document.createElement('div');
        photoWrap.className = 'wall-post-photo';
        const img = document.createElement('img');
        img.src = post.photo_url;
        img.alt = '';
        img.loading = 'lazy';
        img.addEventListener('click', () => openFull(post.photo_url));
        photoWrap.appendChild(img);
        card.appendChild(photoWrap);
      }

      if (post.body && post.body.trim()) {
        const body = document.createElement('div');
        body.className = 'wall-post-body';
        body.textContent = post.body;
        card.appendChild(body);
      }

      if (!isReply) {
        const actions = document.createElement('div');
        actions.className = 'wall-post-actions';
        actions.appendChild(buildReactionBar(post.id));

        const replyBtn = document.createElement('button');
        replyBtn.type = 'button';
        replyBtn.className = 'wall-reply-btn';
        replyBtn.innerHTML = ICON_REPLY + '<span>Reply</span>';
        replyBtn.addEventListener('click', () => {
          replyingTo = post.id;
          const nameVal = (post.author_name && post.author_name.trim()) || 'this post';
          bodyEl.placeholder = 'Reply to ' + nameVal + '...';
          bodyEl.focus();
          bodyEl.scrollIntoView({ behavior:'smooth', block:'center' });
          showReplyIndicator(nameVal);
        });
        actions.appendChild(replyBtn);

        card.appendChild(actions);
      }

      return card;
    }

    function showReplyIndicator(name){
      let chip = $('wallReplyChip');
      if (!chip) {
        chip = document.createElement('div');
        chip.id = 'wallReplyChip';
        chip.className = 'wall-reply-chip';

        const text = document.createElement('span');
        text.className = 'wall-reply-chip-text';

        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'wall-reply-chip-close';
        close.setAttribute('aria-label', 'Cancel reply');
        close.innerHTML = ICON_CLOSE;
        close.addEventListener('click', () => {
          replyingTo = null;
          bodyEl.placeholder = 'Say something...';
          chip.remove();
        });

        chip.appendChild(text);
        chip.appendChild(close);

        const formEl = $('wallForm');
        if (formEl) formEl.parentNode.insertBefore(chip, formEl);
      }

      chip.querySelector('.wall-reply-chip-text').textContent = 'Replying to ' + name;
    }

    function render(){
      list.innerHTML = '';

      const topLevel = allPosts.filter(p => !p.reply_to);
      const repliesByParent = {};
      allPosts.filter(p => p.reply_to).forEach(r => {
        repliesByParent[r.reply_to] = repliesByParent[r.reply_to] || [];
        repliesByParent[r.reply_to].push(r);
      });

      if (!topLevel.length) {
        empty.hidden = false;
        return;
      }
      empty.hidden = true;

      topLevel.forEach(post => {
        list.appendChild(buildPost(post, false));
        const replies = repliesByParent[post.id] || [];
        replies.forEach(rep => {
          list.appendChild(buildPost(rep, true));
        });
      });
    }

    async function loadAll(){
      try {
        const data = await DB.getWallPosts(desk.id);
        allPosts = data.posts || [];
        allReactions = data.reactions || [];
      } catch(e) {
        console.error('loadAll failed:', e);
        allPosts = [];
        allReactions = [];
      }
      render();
    }

    if (attachBtn && photoInput) {
      attachBtn.addEventListener('click', () => photoInput.click());
    }

    if (photoInput) {
      photoInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          let blob = file;
          if (window.PHOTOS && PHOTOS.compress) {
            blob = await PHOTOS.compress(file);
          }
          pendingPhotoBlob = blob;
          photoImg.src = URL.createObjectURL(blob);
          photoPrev.hidden = false;
        } catch(err) {
          console.error(err);
          showMessage('Could not read that photo.', 'error');
        } finally {
          photoInput.value = '';
        }
      });
    }

    if (photoRm) {
      photoRm.addEventListener('click', () => {
        pendingPhotoBlob = null;
        photoPrev.hidden = true;
        photoImg.src = '';
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();

        const body = bodyEl.value.trim();
        const name = nameEl.value.trim();

        if (!body && !pendingPhotoBlob) {
          return showMessage('Write something or attach a photo.', 'error');
        }

        if (submitBtn.disabled) return;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting...';

        try {
          await DB.postToWallV2(desk.id, {
            body: body,
            name: name,
            photoBlob: pendingPhotoBlob,
            replyTo: replyingTo
          });

          bodyEl.value = '';
          pendingPhotoBlob = null;
          photoPrev.hidden = true;
          photoImg.src = '';
          replyingTo = null;
          bodyEl.placeholder = 'Say something...';

          const chip = $('wallReplyChip');
          if (chip) chip.remove();

          await loadAll();
          showMessage('Posted.', 'success');
          setTimeout(clearMessage, 1600);
        } catch(err) {
          console.error(err);
          showMessage(err.message || 'Could not post.', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Post';
        }
      });
    }

    block.hidden = false;
    await loadAll();
  }

  /* ----- Appearance ----- */
  const r = document.documentElement;

  if (desk.accent)      r.style.setProperty('--accent',       desk.accent);
  if (desk.accenthover) r.style.setProperty('--accent-hover', desk.accenthover);
  if (desk.accentsoft)  r.style.setProperty('--accent-soft',  desk.accentsoft);
  if (desk.accentink)   r.style.setProperty('--accent-ink',   desk.accentink);

  if (desk.page_color) document.body.style.backgroundColor = desk.page_color;

  if (desk.accent) {
    r.style.setProperty('--band-tint', hexToRgba(desk.accent, 0.06));
    r.style.setProperty('--band-edge', hexToRgba(desk.accent, 0.12));
  }

  ['dots','grid','diagonal','waves','plus','rings'].forEach(p => {
    document.body.classList.remove('pattern-' + p);
  });
  if (desk.pattern && desk.pattern !== 'none') {
    document.body.classList.add('pattern-' + desk.pattern);
  }

  if (desk.corner_style === 'sharp')  document.body.classList.add('sharp');
  if (desk.layout_style === 'compact') document.body.classList.add('compact');

  const FONTS = {
    modern:  { display:"'Inter', -apple-system, system-ui, sans-serif", body:"'Inter', -apple-system, system-ui, sans-serif" },
    classic: { display:"Georgia, 'Times New Roman', serif",             body:"'Inter', -apple-system, system-ui, sans-serif" },
    clean:   { display:"'Inter', -apple-system, system-ui, sans-serif", body:"'Inter', -apple-system, system-ui, sans-serif" },
    bold:    { display:"'Inter', -apple-system, system-ui, sans-serif", body:"Georgia, serif" }
  };
  const font = FONTS[desk.font_pair] || FONTS.modern;
  r.style.setProperty('--display', font.display);
  r.style.setProperty('--sans',    font.body);

  root.style.display = '';

  function hexToRgba(hex, alpha){
    const h = String(hex).replace('#','');
    let r, g, b;
    if (h.length === 3) {
      r = parseInt(h[0]+h[0], 16);
      g = parseInt(h[1]+h[1], 16);
      b = parseInt(h[2]+h[2], 16);
    } else {
      r = parseInt(h.slice(0,2), 16);
      g = parseInt(h.slice(2,4), 16);
      b = parseInt(h.slice(4,6), 16);
    }
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function escapeHtml(s){
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }

  function textLines(str){
    return (str || '').split('\n').map(s => s.trim()).filter(Boolean);
  }

  function bulletList(str){
    const items = textLines(str);
    if (!items.length) return '';
    return '<ul>' + items.map(s => '<li>' + escapeHtml(s) + '</li>').join('') + '</ul>';
  }

  function norm(s){
    return String(s || '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function findPriceFor(text){
    if (!knowledge.prices.length) return null;
    const q = norm(text);
    if (!q) return null;
    for (const p of knowledge.prices) {
      const name = norm(p.service);
      if (name && q.includes(name)) return p;
      const nameWords = name.split(' ').filter(w => w.length > 3);
      for (const w of nameWords) {
        if (q.includes(w)) return p;
      }
    }
    return null;
  }

  function renderWork(urls, layout){
    const wrap = $('deskWork');
    wrap.innerHTML = '';
    wrap.className = 'desk-work work-' + layout;

    urls.forEach((url, i) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'work-cell';
      cell.setAttribute('aria-label', 'View photo ' + (i + 1));

      const img = document.createElement('img');
      img.src = url;
      img.alt = '';
      img.loading = 'lazy';
      cell.appendChild(img);

      cell.addEventListener('click', () => openFull(url));
      wrap.appendChild(cell);
    });
  }

  function openFull(url){
    const overlay = document.createElement('div');
    overlay.className = 'photo-full';

    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    overlay.appendChild(img);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'photo-full-close';
    close.setAttribute('aria-label', 'Close');
    close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    close.addEventListener('click', () => overlay.remove());
    overlay.appendChild(close);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.addEventListener('keydown', function esc(e){
      if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); }
    });

    document.body.appendChild(overlay);
  }

  /* ============================================================
     DESK BOT
     ============================================================ */

  (function initBot(){

    const botBtn = document.getElementById('deskBotBtn');
    const panel  = document.getElementById('deskBotPanel');
    const log    = document.getElementById('deskBotLog');
    const chips  = document.getElementById('deskBotChips');
    const form   = document.getElementById('deskBotForm');
    const input  = document.getElementById('deskBotInput');
    const avatar = document.getElementById('deskBotAvatar');
    const nameEl = document.getElementById('deskBotName');

    if (!botBtn || !panel) return;

    let isOpen = false;

    const FACT_THEMES = {
      delivery:  ['deliver','delivery','deliveries','ship','shipping','send','post','courier','dispatch','bring'],
      payment:   ['pay','payment','payments','cash','transfer','card','money','price','cost','charge'],
      weekend:   ['saturday','sunday','saturdays','sundays','weekend','weekends','sat','sun'],
      hours:     ['hour','hours','open','opens','opening','close','closes','closing','time','times','when'],
      holiday:   ['holiday','holidays','christmas','easter','festive','festival','public holiday'],
      returns:   ['return','returns','refund','refunds','exchange','warranty','guarantee','guarantees'],
      location:  ['where','location','locations','address','area','based','situated','find'],
      booking:   ['book','booking','bookings','appointment','appointments','schedule','reserve','reservation'],
      custom:    ['custom','customs','customise','customize','personalise','personalize','bespoke','special'],
      emergency: ['emergency','urgent','rush','asap','immediately']
    };

    function themesOf(text){
      const t = norm(text);
      const themes = [];
      for (const [theme, words] of Object.entries(FACT_THEMES)) {
        if (words.some(w => t.includes(w))) themes.push(theme);
      }
      return themes;
    }

    function findMatchingFacts(question){
      const q = norm(question);
      if (!q || !knowledge.facts.length) return [];
      const matched = [];
      for (const f of knowledge.facts) {
        const factThemes = themesOf(f.text);
        if (!factThemes.length) continue;
        for (const theme of factThemes) {
          if (FACT_THEMES[theme].some(w => q.includes(w))) {
            matched.push(f);
            break;
          }
        }
      }
      return matched;
    }

    function toggle(){
      isOpen = !isOpen;
      botBtn.classList.toggle('active', isOpen);
      panel.setAttribute('data-open', String(isOpen));
      if (isOpen && input) setTimeout(() => input.focus(), 100);
    }

    botBtn.addEventListener('click', toggle);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = input ? input.value : '';
        if (input) input.value = '';
        handleInput(val);
      });
    }

    try {

      function addMessage(html, who, extraClass){
        if (!log) return;
        const el = document.createElement('div');
        el.className = 'desk-bot-msg ' + who + (extraClass ? ' ' + extraClass : '');
        el.innerHTML = html;
        log.appendChild(el);
        log.scrollTop = log.scrollHeight;
      }

      function showTyping(){
        if (!log) return;
        if (document.getElementById('deskBotTyping')) return;
        const el = document.createElement('div');
        el.className = 'desk-bot-msg bot typing';
        el.id = 'deskBotTyping';
        el.innerHTML = '<span></span><span></span><span></span>';
        log.appendChild(el);
        log.scrollTop = log.scrollHeight;
      }

      function removeTyping(){
        const el = document.getElementById('deskBotTyping');
        if (el) el.remove();
      }

      function answerAbout(){
        const n = desk.name || 'this Desk';
        const role = desk.role || '';
        const tagline = desk.tagline || '';
        const about = desk.about || '';
        const parts = [];
        if (role) parts.push(escapeHtml(n) + ' is a ' + escapeHtml(role) + '.');
        if (tagline) parts.push(escapeHtml(tagline));
        if (about) parts.push(escapeHtml(about));
        if (!parts.length) return "I don't have a description for this Desk.";
        return parts.join('<br><br>');
      }

      function answerServices(){
        const isBusiness = desk.type === 'business';
        const source = isBusiness ? (desk.products || desk.services) : desk.services;
        const items = textLines(source);
        if (!items.length) return "I don't have a list of services for this Desk.";
        return (isBusiness ? 'Here&rsquo;s what this business offers:' : 'Here&rsquo;s what is offered:') + bulletList(source);
      }

      function answerLocation(){
        const loc = (desk.location || '').trim();
        if (!loc) return "I don't have a location for this Desk.";
        const label = desk.type === 'person' ? 'Service area:' : 'Location:';
        return label + ' <strong>' + escapeHtml(loc) + '</strong>';
      }

      function answerHours(){
        const hours = (desk.opening_hours || '').trim();
        const times = (desk.service_times || '').trim();
        if (hours) return 'Opening hours:<br><strong>' + escapeHtml(hours) + '</strong>';
        if (times) return 'Service times:<br><strong>' + escapeHtml(times) + '</strong>';
        return "I don't have the hours for this Desk.";
      }

      function answerProgrammes(){
        const progs = (desk.programmes || '').trim();
        if (!progs) return "I don't have a list of programmes.";
        return 'Programmes:' + bulletList(progs);
      }

      function answerFacilities(){
        const facs = (desk.facilities || '').trim();
        if (!facs) return "I don't have a list of facilities.";
        return 'Facilities:' + bulletList(facs);
      }

      function answerContact(){
        const n = desk.name || 'them';
        const parts = ['Here&rsquo;s how to reach ' + escapeHtml(n) + ':'];
        const buttons = [];
        if (desk.whatsapp) {
          const w = 'https://wa.me/' + desk.whatsapp + '?text=' + encodeURIComponent(desk.wamessage || '');
          buttons.push('<a href="' + w + '" target="_blank" rel="noopener">WhatsApp</a>');
        }
        if (desk.email) buttons.push('<a href="mailto:' + escapeHtml(desk.email) + '">Email</a>');
        if (desk.phone) buttons.push('<a href="tel:+' + desk.phone + '">Call</a>');
        if (desk.website) buttons.push('<a href="' + escapeHtml(desk.website) + '" target="_blank" rel="noopener">Website</a>');
        if (!buttons.length) return "I don't have contact details for this Desk.";
        parts.push(buttons.join(' &nbsp;·&nbsp; '));
        return parts.join('<br><br>');
      }

      function answerPrices(){
        if (!knowledge.prices.length) return answerServices();
        return 'Here are the prices:<ul>' +
          knowledge.prices.map(p => '<li><strong>' + escapeHtml(p.service) + '</strong> - ' + escapeHtml(p.price) + '</li>').join('') +
          '</ul>';
      }

      function answerFacts(list){
        const arr = (list && list.length) ? list : knowledge.facts;
        if (!arr.length) return null;
        return 'A few things to know:<ul>' +
          arr.map(f => '<li>' + escapeHtml(f.text) + '</li>').join('') +
          '</ul>';
      }

      function answerPhotos(){
        if (!photos.length) return "This Desk doesn&rsquo;t have any photos yet.";

        const intro = photos.length === 1
          ? 'Here&rsquo;s a photo:'
          : 'Here are ' + photos.length + ' photos:';

        const cells = photos.slice(0, 9).map((url, i) => {
          const safe = escapeHtml(url);
          return '<button type="button" class="desk-bot-photo" data-photo-index="' + i + '">' +
                   '<img src="' + safe + '" alt="" loading="lazy">' +
                 '</button>';
        }).join('');

        return intro + '<div class="desk-bot-photos">' + cells + '</div>';
      }

      function answerFallback(){
        const parts = [];

        const canDo = [];
        const serviceSource = desk.type === 'business' ? (desk.products || desk.services) : desk.services;
        if (textLines(serviceSource).length) canDo.push('services');
        if (photos.length) canDo.push('work');
        if ((desk.location || '').trim()) canDo.push('location');
        if ((desk.opening_hours || '').trim() || (desk.service_times || '').trim()) canDo.push('hours');
        if (knowledge.prices.length) canDo.push('prices');
        if ((desk.programmes || '').trim()) canDo.push('programmes');

        parts.push("That&rsquo;s outside what I know.");

        if (canDo.length) {
          parts.push(
            "I can tell you about " +
            formatList(canDo) +
            ' for ' + escapeHtml(desk.name || 'this Desk') + '.'
          );
        }

        if (desk.whatsapp) {
          const w = 'https://wa.me/' + desk.whatsapp + '?text=' + encodeURIComponent(desk.wamessage || '');
          parts.push(
            'For anything else, <a href="' + w + '" target="_blank" rel="noopener">message ' +
            escapeHtml(desk.name || 'them') + ' on WhatsApp</a>.'
          );
        }

        return parts.join('<br><br>');
      }

      function formatList(items){
        if (!items.length) return '';
        if (items.length === 1) return items[0];
        if (items.length === 2) return items[0] + ' or ' + items[1];
        return items.slice(0, -1).join(', ') + ', or ' + items[items.length - 1];
      }

      function matchQuestion(text){
        const q = norm(text);
        if (!q) return null;

        if (photos.length && /\b(photo|photos|picture|pictures|image|images|work|portfolio|gallery|see|show|sample|samples|previous|past)\b/.test(q)) {
          return answerPhotos;
        }

        if (knowledge.facts.length) {
          const matched = findMatchingFacts(text);
          if (matched.length) {
            return answerFacts(matched);
          }
        }

        if (/how much|price|cost|charge|₦/.test(q)) {
          const hit = findPriceFor(q);
          if (hit) {
            return 'That&rsquo;s <strong>' + escapeHtml(hit.service) + ' - ' + escapeHtml(hit.price) + '</strong>.';
          }
          if (knowledge.prices.length) return answerPrices();
        }

        if (/\b(contact|reach|call|whatsapp|phone|email|talk|message|speak)\b/.test(q)) return answerContact;
        if (/\b(service|offer|product|sell|do you|what do you|what can|menu|list)\b/.test(q)) return answerServices;
        if (/\b(where|location|address|area|find|based|situated)\b/.test(q)) return answerLocation;
        if (/\b(hour|open|close|time|when|schedule)\b/.test(q)) {
          if (/\b(programme|program)\b/.test(q) && desk.programmes) return answerProgrammes;
          if (/\b(facilit)\b/.test(q) && desk.facilities) return answerFacilities;
          return answerHours;
        }
        if (/\b(programme|program)\b/.test(q) && desk.programmes) return answerProgrammes;
        if (/\b(facilit)\b/.test(q) && desk.facilities) return answerFacilities;
        if (/\b(about|who|what is|describe|tell me about|more)\b/.test(q)) return answerAbout;

        return null;
      }

      function buildChips(){
        if (!chips) return;
        chips.innerHTML = '';

        const options = [];
        options.push({ label: 'What is this?', fn: answerAbout });

        const isBusiness = desk.type === 'business';
        const serviceSource = isBusiness ? (desk.products || desk.services) : desk.services;
        if (textLines(serviceSource).length) {
          options.push({ label: isBusiness ? 'What do they offer?' : 'What do you offer?', fn: answerServices });
        }

        if (photos.length) {
          options.push({ label: 'Show me your work', fn: answerPhotos });
        }

        if (knowledge.prices.length) {
          options.push({ label: 'What are the prices?', fn: answerPrices });
        }

        if ((desk.location || '').trim()) {
          options.push({ label: 'Where are you?', fn: answerLocation });
        }

        if ((desk.opening_hours || '').trim() || (desk.service_times || '').trim()) {
          options.push({ label: 'What are your hours?', fn: answerHours });
        }

        if ((desk.programmes || '').trim()) {
          options.push({ label: 'Programmes?', fn: answerProgrammes });
        }

        if ((desk.facilities || '').trim()) {
          options.push({ label: 'Facilities?', fn: answerFacilities });
        }

        if (knowledge.facts.length) {
          options.push({ label: 'Anything I should know?', fn: answerFacts });
        }

        options.push({ label: 'How do I reach you?', fn: answerContact });

        options.forEach(opt => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'desk-bot-chip';
          btn.textContent = opt.label;
          btn.addEventListener('click', () => {
            addMessage(escapeHtml(opt.label), 'user');
            showTyping();
            setTimeout(() => {
              removeTyping();
              const reply = opt.fn();
              if (reply) {
                const isPhotos = (opt.fn === answerPhotos);
                addMessage(reply, 'bot', isPhotos ? 'has-photos' : '');
                if (isPhotos) wirePhotoTaps();
              }
            }, 300 + Math.random() * 300);
          });
          chips.appendChild(btn);
        });
      }

      function wirePhotoTaps(){
        if (!log) return;
        log.querySelectorAll('.desk-bot-photo:not([data-wired])').forEach(btn => {
          btn.setAttribute('data-wired', '1');
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-photo-index'), 10);
            if (!isNaN(idx) && photos[idx]) openFull(photos[idx]);
          });
        });
      }

      function handleInput(text){
        const trimmed = String(text || '').trim();
        if (!trimmed) return;
        addMessage(escapeHtml(trimmed), 'user');
        const fn = matchQuestion(trimmed);
        showTyping();
        setTimeout(() => {
          removeTyping();
          const reply = (typeof fn === 'function') ? fn() : fn;
          if (reply) {
            const isPhotos = (fn === answerPhotos);
            addMessage(reply, 'bot', isPhotos ? 'has-photos' : '');
            if (isPhotos) wirePhotoTaps();
          } else {
            addMessage(answerFallback(), 'bot');
            try { DB.recordUnanswered(desk.id, trimmed); } catch(e) {}
          }
        }, 300 + Math.random() * 300);
      }

      const ownerName = desk.name || 'this Desk';
      if (nameEl) nameEl.textContent = 'Ask ' + ownerName;
      if (avatar) {
        if (desk.avatar_url) {
          avatar.textContent = '';
          avatar.style.backgroundImage = 'url("' + desk.avatar_url + '")';
          avatar.style.backgroundSize = 'cover';
          avatar.style.backgroundPosition = 'center';
        } else {
          avatar.textContent = (desk.initials || 'D').toUpperCase();
        }
      }

      if (log && log.children.length === 0) {
        addMessage("👋 Hi. I&rsquo;m " + escapeHtml(ownerName) + "&rsquo;s assistant.", 'bot');

        setTimeout(() => {
          addMessage("I can help with a few things about this Desk. Ask me below, or tap a button.", 'bot');
        }, 400);
      }

      buildChips();

      const botParam = new URLSearchParams(location.search).get('bot');
      if (botParam === '1') {
        setTimeout(() => { if (!isOpen) toggle(); }, 400);
      } else {
        const pulseKey = 'fd_bot_pulsed_' + desk.id;
        if (!localStorage.getItem(pulseKey)) {
          setTimeout(() => {
            if (!isOpen) {
              botBtn.classList.add('pulse');
              setTimeout(() => {
                botBtn.classList.remove('pulse');
                localStorage.setItem(pulseKey, '1');
              }, 3200);
            }
          }, 2000);
        }
      }

    } catch(e) {
      console.error('Bot setup error:', e);
    }

    panel.style.display = 'flex';
    botBtn.style.display = 'grid';

  })();

})();
