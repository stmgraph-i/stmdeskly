/* ============================================================
   STMDESKLY · PUBLIC DESK
   Clean portfolio. No reviews, no wall — those live in
   the in-app profile view.
   ============================================================ */

(async function loadDesk(){

  const root    = document.getElementById('deskRoot');
  const missing = document.getElementById('deskMissing');
  const $ = (id) => document.getElementById(id);

  const params   = new URLSearchParams(location.search);
  let username   = (params.get('u') || '').toLowerCase().trim();

  if (!username) {
    const path = location.pathname.replace(/^\/+|\/+$/g, '');
    if (path && path !== 'desk.html') {
      username = path.split('/').pop().toLowerCase();
    }
  }

  if (!username) { missing.style.display = 'block'; return; }

  if (!window.DB || !DB.ready) {
    missing.querySelector('h1').textContent = 'Not available';
    missing.querySelector('p').textContent  = 'This Desk is not connected yet.';
    missing.style.display = 'block';
    return;
  }

  let desk;
  try { desk = await DB.getDesk(username); }
  catch (err) {
    console.error(err);
    missing.querySelector('h1').textContent = 'Something went wrong';
    missing.querySelector('p').textContent  = 'We could not load this Desk.';
    missing.style.display = 'block';
    return;
  }

  if (!desk) { missing.style.display = 'block'; return; }

  try { DB.recordVisit(desk.id); } catch(e) {}

  const type = desk.type || 'person';

  /* Split hero on desktop for desks with an avatar */
  if (desk.avatar_url) {
    document.body.classList.add('desk-split');
  }

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

  /* ----- Identity ----- */
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

  $('deskName').textContent    = desk.name || 'Desk';
  $('deskRole').textContent    = desk.role || '';
  $('deskTagline').textContent = desk.tagline || '';

  document.title = (desk.name || 'Desk') + ' | STMDeskly';

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

  /* ----- About ----- */
  if (desk.about && desk.about.trim()) {
    $('deskAbout').textContent = desk.about.trim();
    $('aboutBlock').hidden = false;
  }

  /* ----- Work ----- */
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

  /* ----- Contact ----- */
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

  if (anyContact) $('contactBlock').hidden = false;

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

  /* ============================================================
     HELPERS
     ============================================================ */

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

  /* ============================================================
     WORK
     ============================================================ */

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
      botBtn.setAttribute('data-open', String(isOpen));
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
