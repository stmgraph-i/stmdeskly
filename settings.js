/* ============================================================
   DESKLY · SETTINGS
   Accordion sections. Fixed save bar. Same field logic.
   ============================================================ */

(function initSettings(){

  const root        = document.getElementById('settingsRoot');
  const loading     = document.getElementById('dashLoading');
  const noAuth      = document.getElementById('noAuth');
  const form        = document.getElementById('editForm');
  const messageBox  = document.getElementById('formMessage');
  const submitBtn   = document.getElementById('saveBtn');
  const submitText  = document.getElementById('submitText');
  const saveBar     = document.getElementById('settingsSaveBar');

  const accentPicker      = document.getElementById('accentPicker');
  const pagePicker        = document.getElementById('pagePicker');
  const fontPicker        = document.getElementById('fontPicker');
  const cornerPicker      = document.getElementById('cornerPicker');
  const layoutPicker      = document.getElementById('layoutPicker');
  const explorePicker     = document.getElementById('explorePicker');
  const wallPicker        = document.getElementById('wallPicker');
  const gigAvailPicker    = document.getElementById('gigAvailPicker');
  const photoGrid         = document.getElementById('photoGrid');
  const photoInput        = document.getElementById('photoInput');
  const photoHelp         = document.getElementById('photoHelp');
  const photoLayoutPicker = document.getElementById('photoLayoutPicker');
  const occSlot           = document.getElementById('occSlot');

  const gigDetailsGroup   = document.getElementById('gigDetailsGroup');
  const gigLocationGroup  = document.getElementById('gigLocationGroup');
  const gigRateGroup      = document.getElementById('gigRateGroup');
  const gigRolesInput     = document.getElementById('gigRoles');
  const gigLocationInput  = document.getElementById('gigLocation');
  const gigRateInput      = document.getElementById('gigRate');

  const notifyPicker      = document.getElementById('notifyPicker');
  const accSubNotify      = document.getElementById('accSubNotify');
  const notifyStatus      = document.getElementById('notifyStatus');

  const privacyPicker     = document.getElementById('privacyPicker');
  const accSubPrivacy     = document.getElementById('accSubPrivacy');
  const privacyStatus     = document.getElementById('privacyStatus');

  const avatarPreview   = document.getElementById('avatarPreview');
  const avatarInitials  = document.getElementById('avatarInitials');
  const avatarUploadBtn = document.getElementById('avatarUploadBtn');
  const avatarRemoveBtn = document.getElementById('avatarRemoveBtn');
  const avatarInput     = document.getElementById('avatarInput');

  const labelName     = document.getElementById('labelName');
  const labelRole     = document.getElementById('labelRole');
  const labelLocation = document.getElementById('labelLocation');
  const labelServices = document.getElementById('labelServices');

  const rowHours        = document.getElementById('rowHours');
  const rowServiceTimes = document.getElementById('rowServiceTimes');
  const rowProgrammes   = document.getElementById('rowProgrammes');
  const rowFacilities   = document.getElementById('rowFacilities');

  const accSubIdentity   = document.getElementById('accSubIdentity');
  const accSubOffer      = document.getElementById('accSubOffer');
  const accSubDetails    = document.getElementById('accSubDetails');
  const accSubContact    = document.getElementById('accSubContact');
  const accSubPhotos     = document.getElementById('accSubPhotos');
  const accSubGigs       = document.getElementById('accSubGigs');
  const accSubAppearance = document.getElementById('accSubAppearance');

  const previewBtn      = document.getElementById('previewBtn');
  const previewModal    = document.getElementById('previewModal');
  const previewBackdrop = document.getElementById('previewBackdrop');
  const previewClose    = document.getElementById('previewClose');
  const pvBand          = document.getElementById('pvBand');
  const pvMark          = document.getElementById('pvMark');
  const pvName          = document.getElementById('pvName');
  const pvRole          = document.getElementById('pvRole');
  const pvTagline       = document.getElementById('pvTagline');
  const pvOfferBlock    = document.getElementById('pvOfferBlock');
  const pvOffer         = document.getElementById('pvOffer');
  const pvAboutBlock    = document.getElementById('pvAboutBlock');
  const pvAbout         = document.getElementById('pvAbout');

  const logoutBtn        = document.getElementById('logoutBtn');
  const logoutModal      = document.getElementById('logoutModal');
  const logoutBackdrop   = document.getElementById('logoutBackdrop');
  const logoutCancel     = document.getElementById('logoutCancel');
  const logoutConfirm    = document.getElementById('logoutConfirm');

  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  const confirmModal     = document.getElementById('confirmModal');
  const confirmBackdrop  = document.getElementById('confirmBackdrop');
  const confirmCancel    = document.getElementById('confirmCancel');
  const confirmDelete    = document.getElementById('confirmDelete');
  const confirmEmail     = document.getElementById('confirmEmail');
  const confirmPassword  = document.getElementById('confirmPassword');
  const confirmMessage   = document.getElementById('confirmMessage');

  /* ---- Icons (inline SVG) ---- */
  const ICON_UP    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  const ICON_DOWN  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>';
  const ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  const ICON_PLUS  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';

  const ACCENTS = [
    { name:'Forest', accent:'#2E6E44', hover:'#245C38', soft:'#E3ECE4' },
    { name:'Clay',   accent:'#A63D1F', hover:'#8B3217', soft:'#F5E0D5' },
    { name:'Ink',    accent:'#1D1D1F', hover:'#3A3A3C', soft:'#E5E5E7' },
    { name:'Gold',   accent:'#C8912E', hover:'#A8791F', soft:'#F5E8CB' },
    { name:'Ocean',  accent:'#2E6B8A', hover:'#245673', soft:'#DCEBF2' },
    { name:'Plum',   accent:'#7A3D6B', hover:'#5E2F52', soft:'#EEDCEC' },
    { name:'Sunset', accent:'#D96B3A', hover:'#B85528', soft:'#F7E1D4' },
    { name:'Mint',   accent:'#3D8C7A', hover:'#2E6F60', soft:'#D6EEE8' },
    { name:'Rose',   accent:'#B8446A', hover:'#963458', soft:'#F7DCE6' },
    { name:'Slate',  accent:'#4A5A6B', hover:'#394653', soft:'#E1E6EB' },
    { name:'Wine',   accent:'#7A1F3A', hover:'#5E172C', soft:'#F2DCE2' },
    { name:'Sand',   accent:'#B89156', hover:'#9A7742', soft:'#F4EAD6' }
  ];

  const PAGES = [
    { name:'Soft White', value:'#FDFDFB' },
    { name:'Warm Cream', value:'#F7F6F2' },
    { name:'Cool Grey',  value:'#F1F2F0' },
    { name:'Pale Sage',  value:'#EEF2EC' },
    { name:'Blush',      value:'#F7EFF0' },
    { name:'Sky',        value:'#EEF2F6' },
    { name:'Ivory',      value:'#F8F5EC' },
    { name:'Stone',      value:'#F0EEE9' }
  ];

  const FONTS = [
    { id:'modern',  name:'Modern' },
    { id:'classic', name:'Classic' },
    { id:'clean',   name:'Clean' },
    { id:'bold',    name:'Bold' }
  ];

  const PATTERNS = [
    { id:'none',     name:'None'     },
    { id:'dots',     name:'Dots'     },
    { id:'grid',     name:'Grid'     },
    { id:'diagonal', name:'Diagonal' },
    { id:'waves',    name:'Waves'    },
    { id:'plus',     name:'Plus'     },
    { id:'rings',    name:'Rings'    }
  ];

  let currentDesk    = null;
  let currentType    = 'person';
  let currentAccent  = ACCENTS[0];
  let currentPage    = PAGES[0].value;
  let currentFont    = FONTS[0].id;
  let currentCorner  = 'rounded';
  let currentLayout  = 'spacious';
  let currentPattern = 'none';
  let currentExplore = 'on';
  let currentWall    = 'on';
  let currentGigAvail= 'off';
  let currentAvatar  = null;

  let photoUrls      = [];
  let originalPhotos = [];
  let currentPhotoLayout = 'grid';
  let uploading = false;

  /* ============================================================
     ACCORDIONS
     ============================================================ */

  function initAccordions(){
    const sections = document.querySelectorAll('.acc');
    sections.forEach(sec => {
      const head = sec.querySelector('.acc-head');
      head.addEventListener('click', () => {
        const isOpen = sec.classList.contains('open');
        sections.forEach(s => {
          s.classList.remove('open');
          s.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          sec.classList.add('open');
          head.setAttribute('aria-expanded', 'true');
          setTimeout(() => {
            const rect = sec.getBoundingClientRect();
            if (rect.top < 70) {
              sec.scrollIntoView({ behavior:'smooth', block:'start' });
            }
          }, 60);
        }
      });
    });

    const first = document.querySelector('.acc[data-section="identity"]');
    if (first) {
      first.classList.add('open');
      first.querySelector('.acc-head').setAttribute('aria-expanded', 'true');
    }
  }

  function updateSubtitles(){
    if (accSubIdentity) {
      const name = form.name.value.trim();
      accSubIdentity.textContent = name || 'Name, role, tagline';
    }
    if (accSubOffer) {
      const count = (form.services.value || '').split('\n').filter(s => s.trim()).length;
      accSubOffer.textContent = count ? count + ' item' + (count === 1 ? '' : 's') : 'Services, about';
    }
    if (accSubDetails) {
      const loc = form.location.value.trim();
      accSubDetails.textContent = loc || 'Location, hours';
    }
    if (accSubContact) {
      accSubContact.textContent = form.whatsapp.value ? 'WhatsApp set' : 'WhatsApp, email';
    }
    if (accSubPhotos) {
      const n = photoUrls.length;
      accSubPhotos.textContent = n ? n + ' photo' + (n === 1 ? '' : 's') : 'No photos yet';
    }
    if (accSubGigs) {
      const gig = currentGigAvail === 'on' ? 'Gigs: On' : 'Gigs: Off';
      const exp = currentExplore === 'on' ? 'In Explore' : 'Not in Explore';
      accSubGigs.textContent = gig + ' · ' + exp;
    }
    if (accSubAppearance) {
      accSubAppearance.textContent = currentAccent.name + ' · ' + capitalize(currentFont);
    }
    if (accSubPrivacy) {
      const p = (currentDesk && currentDesk.presence_privacy) || 'everyone';
      const map = { 'everyone': 'Everyone', 'contacts': 'Contacts', 'nobody': 'Nobody' };
      accSubPrivacy.textContent = map[p] || 'Everyone';
    }
    updateNotifySubtitle();
  }

  function capitalize(s){ return String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1); }

  /* ============================================================
     BASIC STATE
     ============================================================ */

  function showLoading(on){
    if (!loading) return;
    loading.style.display = on ? 'block' : 'none';
  }

  function showMessage(text, kind){
    messageBox.textContent = text;
    messageBox.className = 'form-message ' + (kind || 'error');
    messageBox.hidden = false;
    messageBox.scrollIntoView({ behavior:'smooth', block:'center' });
  }
  function clearMessage(){ messageBox.hidden = true; messageBox.textContent = ''; }

  function setLoading(on, text){
    if (on) {
      submitBtn.disabled = true;
      submitText.innerHTML = '<span class="spinner"></span>' + (text || 'Saving...');
    } else {
      submitBtn.disabled = false;
      submitText.textContent = 'Save changes';
    }
  }

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

  function normalizeUrl(input){
    let v = (input || '').trim();
    if (!v) return '';
    if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
    return v;
  }

  /* ============================================================
     AVATAR
     ============================================================ */

  function renderAvatar(){
    const name = form.name.value.trim() || 'Deskly';
    const initials = (name.split(/\s+/).map(w => w[0]).join('').slice(0,4) || 'D').toUpperCase();
    avatarInitials.textContent = initials;

    if (currentAvatar) {
      avatarPreview.style.backgroundImage = 'url("' + currentAvatar + '")';
      avatarPreview.classList.add('has-image');
      avatarRemoveBtn.hidden = false;
    } else {
      avatarPreview.style.backgroundImage = '';
      avatarPreview.classList.remove('has-image');
      avatarRemoveBtn.hidden = true;
    }
  }

  /* ============================================================
     PHOTOS
     ============================================================ */

  function renderPhotos(){
    photoGrid.innerHTML = '';

    photoUrls.forEach((url, i) => {
      const cell = document.createElement('div');
      cell.className = 'photo-cell';

      const img = document.createElement('img');
      img.src = url;
      img.alt = '';
      cell.appendChild(img);

      const up = document.createElement('button');
      up.type = 'button';
      up.className = 'photo-btn photo-up';
      up.setAttribute('aria-label', 'Move earlier');
      up.innerHTML = ICON_UP;
      up.disabled = i === 0;
      up.addEventListener('click', () => movePhoto(i, -1));
      cell.appendChild(up);

      const down = document.createElement('button');
      down.type = 'button';
      down.className = 'photo-btn photo-down';
      down.setAttribute('aria-label', 'Move later');
      down.innerHTML = ICON_DOWN;
      down.disabled = i === photoUrls.length - 1;
      down.addEventListener('click', () => movePhoto(i, 1));
      cell.appendChild(down);

      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'photo-btn photo-remove';
      rm.setAttribute('aria-label', 'Remove photo');
      rm.innerHTML = ICON_CLOSE;
      rm.addEventListener('click', () => removePhoto(i));
      cell.appendChild(rm);

      photoGrid.appendChild(cell);
    });

    if (photoUrls.length < PHOTOS.MAX_PHOTOS) {
      if (photoUrls.length === 0) {
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'photo-cell photo-add-tile photo-add-empty ripple';
        add.innerHTML =
          '<span class="photo-add-plus">' + ICON_PLUS + '</span>' +
          '<span class="photo-add-label">Add your first photo</span>';
        add.addEventListener('click', () => photoInput.click());
        photoGrid.appendChild(add);
      } else {
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'photo-cell photo-add-tile ripple';
        add.setAttribute('aria-label', 'Add photo');
        add.innerHTML = ICON_PLUS;
        add.addEventListener('click', () => photoInput.click());
        photoGrid.appendChild(add);
      }
    }

    if (photoUrls.length === 0) {
      photoHelp.textContent = 'Up to 10 photos.';
    } else {
      photoHelp.textContent = photoUrls.length + ' of ' + PHOTOS.MAX_PHOTOS + ' photos. Tap the arrows to reorder, or the X to remove.';
    }

    updateSubtitles();
  }

  function movePhoto(index, delta){
    const target = index + delta;
    if (target < 0 || target >= photoUrls.length) return;
    const tmp = photoUrls[index];
    photoUrls[index] = photoUrls[target];
    photoUrls[target] = tmp;
    renderPhotos();
  }

  async function removePhoto(index){
    const url = photoUrls[index];
    photoUrls.splice(index, 1);
    renderPhotos();
    try { await PHOTOS.remove(url); } catch(e) {}
    originalPhotos = originalPhotos.filter(u => u !== url);
  }

  photoInput.addEventListener('change', async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (uploading) return;
    if (photoUrls.length >= PHOTOS.MAX_PHOTOS) { photoInput.value = ''; return; }

    uploading = true;

    try {
      const file = e.target.files[0];
      const blob = await PHOTOS.compress(file);
      const url  = await PHOTOS.upload(blob, currentDesk.id);
      photoUrls.push(url);
      renderPhotos();
    } catch (err) {
      console.error(err);
      showMessage(err.message || 'Could not upload the photo.', 'error');
    } finally {
      uploading = false;
      photoInput.value = '';
    }
  });

  function renderPhotoLayout(){
    photoLayoutPicker.querySelectorAll('.option-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.value === currentPhotoLayout);
    });
  }

  photoLayoutPicker.addEventListener('click', (e) => {
    const t = e.target.closest('.option-btn');
    if (!t) return;
    currentPhotoLayout = t.dataset.value;
    renderPhotoLayout();
  });

  /* ============================================================
     COLOURS, PAGES, FONTS, PATTERNS
     ============================================================ */

  function renderAccents(){
    accentPicker.innerHTML = '';
    ACCENTS.forEach(pal => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'color-dot' + (pal.accent === currentAccent.accent ? ' active' : '');
      btn.style.background = pal.accent;
      btn.title = pal.name;
      btn.addEventListener('click', () => {
        currentAccent = pal;
        renderAccents();
        updateSubtitles();
      });
      accentPicker.appendChild(btn);
    });
  }

  function renderPages(){
    pagePicker.innerHTML = '';
    PAGES.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'color-dot' + (p.value === currentPage ? ' active' : '');
      btn.style.background = p.value;
      btn.style.boxShadow = 'inset 0 0 0 1px rgba(31,27,20,.12)';
      btn.title = p.name;
      btn.addEventListener('click', () => {
        currentPage = p.value;
        renderPages();
      });
      pagePicker.appendChild(btn);
    });
  }

  function renderFonts(){
    fontPicker.innerHTML = '';
    FONTS.forEach(f => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn' + (f.id === currentFont ? ' active' : '');
      btn.textContent = f.name;
      btn.addEventListener('click', () => {
        currentFont = f.id;
        renderFonts();
        updateSubtitles();
      });
      fontPicker.appendChild(btn);
    });
  }

  function renderPatterns(){
    const picker = document.getElementById('patternPicker');
    if (!picker) return;
    picker.innerHTML = '';
    PATTERNS.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pattern-btn pattern-preview-' + p.id + (p.id === currentPattern ? ' active' : '');
      btn.title = p.name;
      btn.setAttribute('aria-label', p.name);
      btn.textContent = p.name;
      btn.addEventListener('click', () => {
        currentPattern = p.id;
        renderPatterns();
      });
      picker.appendChild(btn);
    });
  }

  function renderToggles(container, value){
    container.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b.dataset.value === value);
    });
  }

  function renderGigAvail(){
    renderToggles(gigAvailPicker, currentGigAvail);
    const on = currentGigAvail === 'on';
    if (gigDetailsGroup)  gigDetailsGroup.hidden  = !on;
    if (gigLocationGroup) gigLocationGroup.hidden = !on;
    if (gigRateGroup)     gigRateGroup.hidden     = !on;
  }

  function applyType(type){
    if (type === 'business') {
      labelName.textContent     = 'Business name';
      labelRole.textContent     = 'What does the business do?';
      labelLocation.textContent = 'Location';
      labelServices.textContent = 'Products and services';
      rowHours.hidden = false;
      rowServiceTimes.hidden = true;
      rowProgrammes.hidden = true;
      rowFacilities.hidden = true;
    } else if (type === 'organisation') {
      labelName.textContent     = 'Name of the place';
      labelRole.textContent     = 'What is this place?';
      labelLocation.textContent = 'Location';
      labelServices.textContent = 'Services';
      rowHours.hidden = true;
      rowServiceTimes.hidden = false;
      rowProgrammes.hidden = false;
      rowFacilities.hidden = false;
    } else {
      labelName.textContent     = 'Name';
      labelRole.textContent     = 'What you do';
      labelLocation.textContent = 'Service area';
      labelServices.textContent = 'Services';
      rowHours.hidden = true;
      rowServiceTimes.hidden = true;
      rowProgrammes.hidden = true;
      rowFacilities.hidden = true;
    }
  }

  function fillForm(desk){
    form.name.value         = desk.name || '';
    form.role.value         = desk.role || '';
    form.tagline.value      = desk.tagline || '';
    form.services.value     = desk.services || '';
    form.about.value        = desk.about || '';
    form.location.value     = desk.location || '';
    form.hours.value        = desk.opening_hours || '';
    form.serviceTimes.value = desk.service_times || '';
    form.programmes.value   = desk.programmes || '';
    form.facilities.value   = desk.facilities || '';
    form.whatsapp.value     = desk.whatsapp || '';
    form.email.value        = desk.email    || '';
    form.phone.value        = desk.phone    || '';
    form.website.value      = desk.website  || '';

    currentAvatar  = desk.avatar_url || null;
    currentType    = desk.type || 'person';

    currentAccent  = ACCENTS.find(a => a.accent === desk.accent) || ACCENTS[0];
    currentPage    = desk.page_color   || PAGES[0].value;
    currentFont    = desk.font_pair    || FONTS[0].id;
    currentCorner  = desk.corner_style || 'rounded';
    currentLayout  = desk.layout_style || 'spacious';
    currentPattern = desk.pattern      || 'none';
    currentExplore = (desk.show_in_explore === false) ? 'off' : 'on';
    currentWall    = (desk.wall_enabled === false) ? 'off' : 'on';
    currentGigAvail= (desk.available_for_gigs === true) ? 'on' : 'off';

    if (gigRolesInput)    gigRolesInput.value    = desk.gig_roles || '';
    if (gigLocationInput) gigLocationInput.value = desk.gig_location || '';
    if (gigRateInput)     gigRateInput.value     = desk.gig_rate || '';

    currentPhotoLayout = desk.photo_layout || 'grid';

    try {
      photoUrls = desk.photos ? JSON.parse(desk.photos) : [];
      if (!Array.isArray(photoUrls)) photoUrls = [];
    } catch(e) { photoUrls = []; }
    originalPhotos = photoUrls.slice();

    renderAvatar();
    renderAccents();
    renderPages();
    renderFonts();
    renderPatterns();
    renderPhotoLayout();
    renderToggles(cornerPicker, currentCorner);
    renderToggles(layoutPicker, currentLayout);
    if (explorePicker) renderToggles(explorePicker, currentExplore);
    if (wallPicker) renderToggles(wallPicker, currentWall);
    renderGigAvail();
    renderPhotos();
    renderNotifyToggle();
    renderPrivacy();

    applyType(currentType);
    updateSubtitles();
  }

  /* ============================================================
     NOTIFICATIONS
     ============================================================ */

  function updateNotifySubtitle(){
    if (!accSubNotify || !window.NOTIFY) return;
    const on = NOTIFY.permissionState() === 'granted' && NOTIFY.isEnabled();
    accSubNotify.textContent = on ? 'On' : 'Off';
  }

  function renderNotifyToggle(){
    if (!notifyPicker || !window.NOTIFY) return;

    const supported = NOTIFY.isPushSupported();
    const state = NOTIFY.permissionState();
    const enabled = NOTIFY.isEnabled();

    if (!supported) {
      notifyPicker.querySelectorAll('button').forEach(b => {
        b.disabled = true;
        b.classList.remove('active');
      });
      if (notifyStatus) notifyStatus.textContent = 'Push notifications are not supported in this browser.';
      if (accSubNotify) accSubNotify.textContent = 'Not supported';
      return;
    }

    const on = (state === 'granted' && enabled);
    notifyPicker.querySelectorAll('button').forEach(b => {
      b.disabled = false;
      b.classList.toggle('active', (on && b.dataset.value === 'on') || (!on && b.dataset.value === 'off'));
    });

    if (notifyStatus) {
      if (state === 'denied') {
        notifyStatus.textContent = 'Blocked. Enable notifications for this site in Chrome settings.';
      } else if (on) {
        notifyStatus.textContent = 'You\u2019ll get a notification when someone messages you.';
      } else {
        notifyStatus.textContent = '';
      }
    }

    updateNotifySubtitle();
  }

  if (notifyPicker) {
    notifyPicker.addEventListener('click', async (e) => {
      const btn = e.target.closest('.option-btn');
      if (!btn || btn.disabled) return;
      if (!window.NOTIFY) return;

      const want = btn.dataset.value === 'on';
      const currentlyOn = NOTIFY.isEnabled() && NOTIFY.permissionState() === 'granted';

      if (want === currentlyOn) return;

      if (want) {
        btn.disabled = true;
        const orig = btn.textContent;
        btn.textContent = '...';
        const result = await NOTIFY.enablePush();
        btn.disabled = false;
        btn.textContent = orig;

        if (!result.ok) {
          if (result.reason === 'denied') {
            alert('Notifications were denied. Enable them for this site in Chrome settings.');
          } else if (result.reason === 'unsupported') {
            alert('This browser does not support push notifications.');
          } else {
            alert('Could not enable notifications. Try again.\n\nReason: ' + result.reason);
          }
        }
      } else {
        btn.disabled = true;
        const orig = btn.textContent;
        btn.textContent = '...';
        await NOTIFY.disablePush();
        btn.disabled = false;
        btn.textContent = orig;
      }

      renderNotifyToggle();
    });
  }

  /* ============================================================
     PRIVACY (presence visibility)
     ============================================================ */

  function renderPrivacy(){
    if (!privacyPicker) return;
    const current = (currentDesk && currentDesk.presence_privacy) || 'everyone';

    privacyPicker.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b.dataset.value === current);
    });

    if (accSubPrivacy) {
      const map = { 'everyone': 'Everyone', 'contacts': 'Contacts', 'nobody': 'Nobody' };
      accSubPrivacy.textContent = map[current] || 'Everyone';
    }

    if (privacyStatus) {
      if (current === 'nobody') {
        privacyStatus.textContent = 'Your status is hidden. You also won\u2019t see anyone else\u2019s.';
      } else if (current === 'contacts') {
        privacyStatus.textContent = 'Only people you\u2019ve chatted with can see your status.';
      } else {
        privacyStatus.textContent = '';
      }
    }
  }

  if (privacyPicker) {
    privacyPicker.addEventListener('click', async (e) => {
      const btn = e.target.closest('.option-btn');
      if (!btn || btn.disabled) return;
      const level = btn.dataset.value;
      if (!level) return;

      const current = (currentDesk && currentDesk.presence_privacy) || 'everyone';
      if (level === current) return;

      btn.disabled = true;
      const orig = btn.textContent;
      btn.textContent = '...';

      try {
        await DB.setPresencePrivacy(level);
        if (currentDesk) currentDesk.presence_privacy = level;

        if (window.PRESENCE && PRESENCE.clearPrivacyCache) {
          PRESENCE.clearPrivacyCache();
        }

        renderPrivacy();
        updateSubtitles();
      } catch (err) {
        console.error(err);
        alert(err.message || 'Could not update privacy.');
      } finally {
        btn.disabled = false;
        btn.textContent = orig;
      }
    });
  }

  /* ============================================================
     PREVIEW
     ============================================================ */

  function isPreviewOpen(){
    return previewModal && !previewModal.hidden;
  }

  function renderPreview(){
    const name    = form.name.value.trim() || 'Your name';
    const role    = form.role.value.trim() || (currentType === 'business' ? 'What the business does' : 'What you do');
    const tagline = form.tagline.value.trim();
    const services = form.services.value.split('\n').map(s => s.trim()).filter(Boolean);
    const about    = form.about.value.trim();

    if (currentAvatar) {
      pvMark.textContent = '';
      pvMark.style.backgroundImage = 'url("' + currentAvatar + '")';
      pvMark.style.backgroundSize = 'cover';
      pvMark.style.backgroundPosition = 'center';
      pvMark.style.borderColor = 'transparent';
      pvMark.classList.add('has-image');
    } else {
      pvMark.textContent = (name.split(/\s+/).map(w => w[0]).join('').slice(0,4) || 'D').toUpperCase();
      pvMark.style.backgroundImage = '';
      pvMark.style.borderColor = currentAccent.accent;
      pvMark.classList.remove('has-image');
    }

    pvName.textContent    = name;
    pvRole.textContent    = role;
    pvTagline.textContent = tagline;
    pvTagline.hidden      = !tagline;

    pvBand.style.background = hexToRgba(currentAccent.accent, 0.06);
    pvBand.style.borderBottomColor = hexToRgba(currentAccent.accent, 0.12);
    pvMark.style.color = currentAccent.accent;
    pvRole.style.color = currentAccent.accent;

    if (services.length) {
      pvOffer.innerHTML = '';
      services.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        pvOffer.appendChild(li);
      });
      pvOfferBlock.hidden = false;
    } else {
      pvOfferBlock.hidden = true;
    }

    if (about) {
      pvAbout.textContent = about;
      pvAboutBlock.hidden = false;
    } else {
      pvAboutBlock.hidden = true;
    }

    const fontMap = {
      modern:  { display:"'Inter', -apple-system, system-ui, sans-serif", body:"'Inter', -apple-system, system-ui, sans-serif" },
      classic: { display:"Georgia, 'Times New Roman', serif",             body:"'Inter', -apple-system, system-ui, sans-serif" },
      clean:   { display:"'Inter', -apple-system, system-ui, sans-serif", body:"'Inter', -apple-system, system-ui, sans-serif" },
      bold:    { display:"'Inter', -apple-system, system-ui, sans-serif", body:"Georgia, serif" }
    };
    const font = fontMap[currentFont] || fontMap.modern;
    previewModal.style.setProperty('--pv-display', font.display);
    previewModal.style.setProperty('--pv-body',    font.body);

    const bodyEl = document.querySelector('.preview-body');
    if (bodyEl) bodyEl.style.background = currentPage;
  }

  function openPreview(){
    previewModal.hidden = false;
    document.body.style.overflow = 'hidden';
    renderPreview();
  }
  function closePreview(){
    previewModal.hidden = true;
    document.body.style.overflow = '';
  }

  if (previewBtn) previewBtn.addEventListener('click', openPreview);
  if (previewClose) previewClose.addEventListener('click', closePreview);
  if (previewBackdrop) previewBackdrop.addEventListener('click', closePreview);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isPreviewOpen()) closePreview();
      if (logoutModal && !logoutModal.hidden) logoutModal.hidden = true;
      if (confirmModal && !confirmModal.hidden) confirmModal.hidden = true;
    }
  });

  ['name','role','tagline','services','about','location','whatsapp'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateSubtitles);
  });

  /* ============================================================
     OCCUPATION SUGGESTION
     ============================================================ */

  function pickListFor(type){
    if (type === 'business' && typeof BUSINESSES !== 'undefined') return BUSINESSES;
    if (typeof JOBS !== 'undefined') return JOBS;
    return [];
  }

  function wireSuggestion(){
    if (typeof OCCUPATION === 'undefined') return;

    const list = pickListFor(currentType);
    if (!list.length) return;

    OCCUPATION.attach(
      form.role,
      occSlot,
      (variant, job) => {
        form.role.value = job.local
          ? job.title + ' (' + job.local + ')'
          : job.title;
        if (variant.tagline) form.tagline.value = variant.tagline;
        if (variant.services && variant.services.length) {
          form.services.value = variant.services.join('\n');
        }
        updateSubtitles();
      },
      () => {},
      list
    );
  }

  /* ============================================================
     INIT
     ============================================================ */

  async function init(){
    if (!window.DB || !DB.ready) { showLoading(false); noAuth.style.display = 'block'; return; }

    if (!DB.currentUser()) {
      await new Promise(r => setTimeout(r, 400));
    }
    if (!DB.currentUser()) {
      showLoading(false);
      noAuth.style.display = 'block';
      return;
    }

    let desk;
    try { desk = await DB.getMyDesk(); }
    catch (err) {
      console.error(err);
      showLoading(false);
      noAuth.querySelector('h1').textContent = 'Something went wrong';
      noAuth.querySelector('p').textContent  = 'We could not load your Desk.';
      noAuth.style.display = 'block';
      return;
    }

    if (!desk) { showLoading(false); window.location.replace('signup.html'); return; }

    currentDesk = desk;
    fillForm(desk);
    wireSuggestion();
    initAccordions();

    /* Logout modal */
    function openLogout(){ if (logoutModal) logoutModal.hidden = false; }
    function closeLogout(){ if (logoutModal) logoutModal.hidden = true; }

    if (logoutBtn)      logoutBtn.addEventListener('click', openLogout);
    if (logoutCancel)   logoutCancel.addEventListener('click', closeLogout);
    if (logoutBackdrop) logoutBackdrop.addEventListener('click', closeLogout);

    if (logoutConfirm) {
      logoutConfirm.addEventListener('click', async () => {
        logoutConfirm.disabled = true;
        logoutConfirm.textContent = 'Logging out...';
        if (window.DB) await DB.logOut();
        window.location.replace('index.html');
      });
    }

    avatarUploadBtn.addEventListener('click', () => avatarInput.click());
    avatarPreview.addEventListener('click', () => avatarInput.click());

    avatarInput.addEventListener('change', async (e) => {
      if (!e.target.files || !e.target.files[0]) return;
      const file = e.target.files[0];

      try {
        avatarUploadBtn.disabled = true;
        avatarUploadBtn.textContent = 'Uploading...';

        const blob = await PHOTOS.compress(file);
        const url  = await PHOTOS.upload(blob, currentDesk.id);

        if (currentAvatar) {
          try { await PHOTOS.remove(currentAvatar); } catch(e) {}
        }

        currentAvatar = url;
        renderAvatar();
      } catch (err) {
        console.error(err);
        showMessage(err.message || 'Could not upload the picture.', 'error');
      } finally {
        avatarUploadBtn.disabled = false;
        avatarUploadBtn.textContent = 'Upload picture';
        avatarInput.value = '';
      }
    });

    avatarRemoveBtn.addEventListener('click', async () => {
      if (!currentAvatar) return;
      const oldUrl = currentAvatar;
      currentAvatar = null;
      renderAvatar();
      try { await PHOTOS.remove(oldUrl); } catch(e) {}
    });

    form.name.addEventListener('input', renderAvatar);

    showLoading(false);
    root.style.display = '';
    if (saveBar) saveBar.hidden = false;

    cornerPicker.addEventListener('click', (e) => {
      const t = e.target.closest('.option-btn');
      if (!t) return;
      currentCorner = t.dataset.value;
      renderToggles(cornerPicker, currentCorner);
    });

    layoutPicker.addEventListener('click', (e) => {
      const t = e.target.closest('.option-btn');
      if (!t) return;
      currentLayout = t.dataset.value;
      renderToggles(layoutPicker, currentLayout);
    });

    if (explorePicker) {
      explorePicker.addEventListener('click', (e) => {
        const t = e.target.closest('.option-btn');
        if (!t) return;
        currentExplore = t.dataset.value;
        renderToggles(explorePicker, currentExplore);
        updateSubtitles();
      });
    }

    if (wallPicker) {
      wallPicker.addEventListener('click', (e) => {
        const t = e.target.closest('.option-btn');
        if (!t) return;
        currentWall = t.dataset.value;
        renderToggles(wallPicker, currentWall);
      });
    }

    if (gigAvailPicker) {
      gigAvailPicker.addEventListener('click', (e) => {
        const t = e.target.closest('.option-btn');
        if (!t) return;
        currentGigAvail = t.dataset.value;
        renderGigAvail();
        updateSubtitles();
      });
    }

    /* Delete account */
    function openConfirm(){
      if (!confirmModal) return;
      confirmModal.hidden = false;
      if (confirmMessage) { confirmMessage.hidden = true; confirmMessage.textContent = ''; }
      if (confirmEmail) confirmEmail.value = '';
      if (confirmPassword) confirmPassword.value = '';
      setTimeout(() => { if (confirmEmail) confirmEmail.focus(); }, 100);
    }
    function closeConfirm(){ if (confirmModal) confirmModal.hidden = true; }

    if (deleteAccountBtn) deleteAccountBtn.addEventListener('click', openConfirm);
    if (confirmCancel) confirmCancel.addEventListener('click', closeConfirm);
    if (confirmBackdrop) confirmBackdrop.addEventListener('click', closeConfirm);

    if (confirmDelete) {
      confirmDelete.addEventListener('click', async () => {
        if (!confirmMessage) return;
        confirmMessage.hidden = true;

        const emailVal = confirmEmail ? confirmEmail.value.trim() : '';
        const passVal = confirmPassword ? confirmPassword.value : '';

        if (!emailVal || !passVal) {
          confirmMessage.textContent = 'Please enter your email and password.';
          confirmMessage.className = 'form-message error';
          confirmMessage.hidden = false;
          return;
        }

        confirmDelete.disabled = true;
        confirmDelete.textContent = 'Deleting...';

        try {
          await DB.logIn(emailVal, passVal);

          for (const url of photoUrls) {
            try { await PHOTOS.remove(url); } catch(e) {}
          }
          if (currentAvatar) {
            try { await PHOTOS.remove(currentAvatar); } catch(e) {}
          }

          await DB.deleteMyDesk(currentDesk.id);
          try { await DB.freeUpEmail(); } catch(e) {}
          DB.logOut();

          window.location.replace('index.html?deleted=1');
        } catch(err) {
          console.error(err);
          confirmDelete.disabled = false;
          confirmDelete.textContent = 'Delete forever';
          confirmMessage.textContent = 'Email or password is incorrect.';
          confirmMessage.className = 'form-message error';
          confirmMessage.hidden = false;
        }
      });
    }
  }

  /* ============================================================
     SAVE
     ============================================================ */

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveChanges();
  });

  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      saveChanges();
    });
  }

  async function saveChanges(){
    clearMessage();

    const phone = DB.normalizeNGNumber(form.whatsapp.value);
    if (!phone) return showMessage('Please enter a valid Nigerian mobile number.', 'error');

    const name = form.name.value.trim();
    const removed = originalPhotos.filter(u => photoUrls.indexOf(u) === -1);

    const updates = {
      name:           name,
      role:           form.role.value.trim(),
      tagline:        form.tagline.value.trim(),
      services:       form.services.value.trim(),
      about:          form.about.value.trim(),
      location:       form.location.value.trim(),
      opening_hours:  form.hours.value.trim(),
      service_times:  form.serviceTimes.value.trim(),
      programmes:     form.programmes.value.trim(),
      facilities:     form.facilities.value.trim(),
      whatsapp:       phone,
      email:          form.email.value.trim(),
      phone:          DB.normalizeNGNumber(form.phone.value) || '',
      website:        normalizeUrl(form.website.value),
      accent:         currentAccent.accent,
      accenthover:    currentAccent.hover,
      accentsoft:     currentAccent.soft,
      accentink:      '#FFFFFF',
      page_color:     currentPage,
      font_pair:      currentFont,
      corner_style:   currentCorner,
      layout_style:   currentLayout,
      pattern:        currentPattern,
      show_in_explore: currentExplore === 'on',
      wall_enabled:   currentWall === 'on',
      available_for_gigs: currentGigAvail === 'on',
      gig_roles:      gigRolesInput ? gigRolesInput.value.trim() : '',
      gig_location:   gigLocationInput ? gigLocationInput.value.trim() : '',
      gig_rate:       gigRateInput ? gigRateInput.value.trim() : '',
      photos:         JSON.stringify(photoUrls),
      photo_layout:   currentPhotoLayout,
      avatar_url:     currentAvatar,
      initials:       (name.split(/\s+/).map(w => w[0]).join('').slice(0,4) || 'D').toUpperCase(),
      footer:         (name || 'STMDeskly') + ' on STMDeskly'
    };

    if (!updates.name || !updates.role) {
      return showMessage('Please fill in your name and what you do.', 'error');
    }

    setLoading(true, 'Saving...');

    try {
      await DB.updateDesk(currentDesk.id, updates);
      currentDesk = Object.assign({}, currentDesk, updates);
      originalPhotos = photoUrls.slice();

      for (const url of removed) {
        try { await PHOTOS.remove(url); } catch(e) {}
      }

      if (DB.currentUser && DB.currentUser() && DB.rememberAccount) {
        DB.rememberAccount(DB.currentUser().email, {
          name: updates.name,
          initials: updates.initials,
          avatar_url: updates.avatar_url || ''
        });
      }

      fillForm(currentDesk);
      setLoading(false);
      showMessage('Saved.', 'success');
      setTimeout(() => { messageBox.hidden = true; }, 1800);
    } catch (err) {
      console.error(err);
      setLoading(false);
      showMessage(err.message || 'Could not save.', 'error');
    }
  }

  init();

})();
