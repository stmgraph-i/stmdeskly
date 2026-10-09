/* ============================================================
   DESKLY · SIGNUP
   ============================================================ */

(function initSignup(){

  const form       = document.getElementById('signupForm');
  if (!form) return;

  const typeList   = document.getElementById('typeList');
  const fields     = document.getElementById('formFields');
  const colorGrid  = document.getElementById('colorGrid');
  const messageBox = document.getElementById('formMessage');
  const submitBtn  = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const linkPrefix = document.getElementById('linkPrefix');
  const occSlot    = document.getElementById('occSlot');

  const headTitle  = document.getElementById('headTitle');
  const headSub    = document.getElementById('headSub');
  const labelName  = document.getElementById('labelName');
  const labelRole  = document.getElementById('labelRole');
  const roleHelper = document.getElementById('roleHelper');
  const nameInput  = document.getElementById('name');
  const linkInput  = document.getElementById('link');
  const roleInput  = document.getElementById('role');
  const roleChips  = document.getElementById('roleChips');
  const passwordEl = document.getElementById('password');
  const pwMeter    = document.getElementById('pwMeter');
  const pwLabel    = document.getElementById('pwLabel');
  const pwToggle   = document.getElementById('pwToggle');

  const COLORS = [
    { name:'Forest',  accent:'#2E6E44', hover:'#245C38', soft:'#E3ECE4' },
    { name:'Clay',    accent:'#A63D1F', hover:'#8B3217', soft:'#F5E0D5' },
    { name:'Ink',     accent:'#1D1D1F', hover:'#3A3A3C', soft:'#E5E5E7' },
    { name:'Gold',    accent:'#C8912E', hover:'#A8791F', soft:'#F5E8CB' },
    { name:'Ocean',   accent:'#2E6B8A', hover:'#245673', soft:'#DCEBF2' },
    { name:'Plum',    accent:'#7A3D6B', hover:'#5E2F52', soft:'#EEDCEC' },
    { name:'Sunset',  accent:'#D96B3A', hover:'#B85528', soft:'#F7E1D4' },
    { name:'Mint',    accent:'#3D8C7A', hover:'#2E6F60', soft:'#D6EEE8' },
    { name:'Rose',    accent:'#B8446A', hover:'#963458', soft:'#F7DCE6' },
    { name:'Slate',   accent:'#4A5A6B', hover:'#394653', soft:'#E1E6EB' },
    { name:'Wine',    accent:'#7A1F3A', hover:'#5E172C', soft:'#F2DCE2' },
    { name:'Sand',    accent:'#B89156', hover:'#9A7742', soft:'#F4EAD6' }
  ];

  const CHIPS = {
    person: [
      'Tailor','Barber','Hair stylist','Makeup artist','Photographer','Videographer',
      'Musician','DJ','Caterer','Chef','Baker','Phone repair','Laptop repair',
      'Electrician','Plumber','Carpenter','Driver','Dispatch rider','Developer',
      'Graphic designer','Content creator','Tutor','Cleaner','Laundry services','Other'
    ],
    business: [
      'Fashion and clothing','Food and drinks','Beauty and cosmetics','Phone and accessories',
      'Supermarket and provisions','Home and furniture','Print and branding','Repairs and services',
      'Electronics','Pharmacy','Salon and spa','Bakery','Restaurant','Events and rentals','Other'
    ],
    organisation: [
      'Church','Mosque','Fellowship','Ministry','Event centre','School',
      'Training centre','Community centre','Fitness centre','Clinic','Charity','NGO','Other'
    ]
  };

  let selectedType   = null;
  let selectedColor  = COLORS[0];
  let userEditedLink = false;
  let filled         = { tagline: '', services: '' };
  let occController  = null;

  /* ---------------- PASSWORD METER + TOGGLE ---------------- */

  function updateMeter(){
    const pw = passwordEl.value;
    if (!pw) {
      pwMeter.hidden = true;
      return;
    }
    pwMeter.hidden = false;
    const s = PASSWORD.score(pw);
    const label = PASSWORD.label(s);
    pwMeter.setAttribute('data-score', String(s));
    pwLabel.textContent = label;
  }

  passwordEl.addEventListener('input', updateMeter);

  if (pwToggle) {
    pwToggle.setAttribute('data-state', 'hidden');
    pwToggle.addEventListener('click', () => {
      const showing = passwordEl.type === 'text';
      passwordEl.type = showing ? 'password' : 'text';
      pwToggle.setAttribute('data-state', showing ? 'hidden' : 'shown');
      pwToggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    });
  }

  /* ---------------- TYPE CARDS ---------------- */

  typeList.querySelectorAll('.type-card').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedType = btn.getAttribute('data-type');
      typeList.querySelectorAll('.type-card').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyTypeCopy(selectedType);
      renderChips(selectedType);
      fields.hidden = false;
      headSub.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });

  function applyTypeCopy(type){
    if (type === 'person') {
      headTitle.textContent  = 'Create a Desk';
      headSub.textContent    = 'Start with the basics. You can add more later.';
      labelName.textContent  = 'Your name';
      nameInput.placeholder  = 'Utibe';
      labelRole.textContent  = 'What do you do?';
      roleHelper.textContent = 'Your occupation.';
      roleInput.placeholder  = 'Tailor';
    } else if (type === 'business') {
      headTitle.textContent  = 'Create a Desk for your business';
      headSub.textContent    = 'Start with the basics. You can add more later.';
      labelName.textContent  = 'Business name';
      nameInput.placeholder  = 'Faith Cosmetics';
      labelRole.textContent  = 'What does your business do?';
      roleHelper.textContent = 'What the business sells or provides.';
      roleInput.placeholder  = 'Fashion and clothing';
    } else if (type === 'organisation') {
      headTitle.textContent  = 'Create a Desk for your organisation';
      headSub.textContent    = 'Start with the basics. You can add more later.';
      labelName.textContent  = 'Name of the place or organisation';
      nameInput.placeholder  = 'El-Bethel Prophetic Church';
      labelRole.textContent  = 'What is this place?';
      roleHelper.textContent = 'What kind of place or organisation this is.';
      roleInput.placeholder  = 'Church';
    }

    if (window.OCCUPATION) {
      const list = listForType(type);
      occController = OCCUPATION.attach(
        roleInput,
        occSlot,
        (variant, job) => {
          filled.tagline  = variant.tagline;
          filled.services = (variant.services || []).join('\n');
        },
        () => {
          filled.tagline  = '';
          filled.services = '';
        },
        list
      );
    }
  }

  function listForType(type){
    if (type === 'organisation') return window.ORGANISATIONS || [];
    if (type === 'business') {
      if (typeof BUSINESSES !== 'undefined' && Array.isArray(BUSINESSES)) return BUSINESSES;
      if (window.BUSINESSES && Array.isArray(window.BUSINESSES)) return window.BUSINESSES;
    }
    if (typeof JOBS !== 'undefined' && Array.isArray(JOBS)) return JOBS;
    if (window.JOBS && Array.isArray(window.JOBS)) return window.JOBS;
    return [];
  }

  function showChipSuggestion(item, variant){
    occSlot.innerHTML = '';
    occSlot.hidden = false;

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

    filled.tagline  = variant.tagline || '';
    filled.services = (variant.services || []).join('\n');

    const hint = document.createElement('div');
    hint.className = 'occ-hint';
    hint.textContent = 'This will be added to your Desk.';
    box.appendChild(hint);

    occSlot.appendChild(box);
  }

  function hideChipSuggestion(){
    occSlot.innerHTML = '';
    occSlot.hidden = true;
    filled.tagline = '';
    filled.services = '';
  }

  function renderChips(type){
    roleChips.innerHTML = '';
    const list = CHIPS[type] || [];
    list.forEach(label => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'role-chip ripple';
      chip.textContent = label;
      chip.dataset.value = label;
      chip.addEventListener('click', () => {
        if (label === 'Other') {
          roleInput.value = '';
          roleInput.focus();
          hideChipSuggestion();
          return;
        }
        roleInput.value = label;
        const sourceList = listForType(selectedType);
        const hit = CHIP_LOOKUP.lookup(label, sourceList);
        if (hit) {
          showChipSuggestion(hit.item, hit.variant);
        } else {
          hideChipSuggestion();
        }
      });
      roleChips.appendChild(chip);
    });
  }

  COLORS.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'color-dot' + (i === 0 ? ' active' : '');
    btn.style.background = c.accent;
    btn.title = c.name;
    btn.setAttribute('aria-label', c.name);
    btn.addEventListener('click', () => {
      selectedColor = c;
      colorGrid.querySelectorAll('.color-dot').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    colorGrid.appendChild(btn);
  });

  if (linkPrefix && window.SUPABASE_CONFIG?.siteUrl) {
    linkPrefix.textContent = window.SUPABASE_CONFIG.siteUrl.replace(/^https?:\/\//,'') + '/';
  }

  function slugify(v){
    return String(v).toLowerCase().trim()
      .replace(/[^a-z0-9-]/g,'-')
      .replace(/-+/g,'-')
      .replace(/^-|-$/g,'')
      .slice(0, 40);
  }

  nameInput.addEventListener('input', () => {
    if (!userEditedLink) linkInput.value = slugify(nameInput.value);
  });
  linkInput.addEventListener('input', (e) => {
    userEditedLink = true;
    e.target.value = slugify(e.target.value);
  });

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
      submitText.innerHTML = '<span class="spinner"></span>' + (text || 'Working...');
    } else {
      submitBtn.disabled = false;
      submitText.textContent = 'Create my Desk';
    }
  }

  function recordSignupFailure(message){
    const after = RATE.record('signup');
    if (after.blocked) {
      showMessage('Too many attempts. Please wait ' + RATE.prettyTime(after.secondsLeft) + ' and try again.', 'error');
    } else if (after.remaining <= 2) {
      const tries = after.remaining === 1 ? '1 try left' : after.remaining + ' tries left';
      showMessage(message + ' You have ' + tries + '.', 'error');
    } else {
      showMessage(message, 'error');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();

    const before = RATE.check('signup');
    if (before.blocked) {
      return showMessage('Too many attempts. Please wait ' + RATE.prettyTime(before.secondsLeft) + ' and try again.', 'error');
    }

    if (!selectedType) return recordSignupFailure('Pick what this Desk is for.');

    const email    = document.getElementById('email').value.trim();
    const password = passwordEl.value;
    const name     = nameInput.value.trim();
    const link     = slugify(linkInput.value);
    const role     = roleInput.value.trim();
    const waRaw    = document.getElementById('whatsapp').value;

    if (!DB.isValidEmail(email))  return recordSignupFailure('Please enter a valid email address.');

    const check = PASSWORD.validate(password);
    if (!check.ok) return recordSignupFailure(check.errors[0]);

    if (!name)                    return recordSignupFailure('Please enter your name.');
    if (link.length < 3)          return recordSignupFailure('Your link needs at least 3 characters.');
    if (!role)                    return recordSignupFailure('Please say what you do.');

    const phone = DB.normalizeNGNumber(waRaw);
    if (!phone) return recordSignupFailure('Please enter a valid Nigerian mobile number.');

    if (!window.DB || !window.DB.ready) return recordSignupFailure('Database not connected yet.');

    setLoading(true, 'Checking your link...');

    try {
      const taken = await DB.usernameTaken(link);
      if (taken) {
        setLoading(false);
        return recordSignupFailure('That link is already taken. Try another.');
      }

      /* Silent breach check — friendly message if it hits */
      setLoading(true, 'Just a moment...');
      const breached = await PASSWORD.isBreached(password);
      if (breached) {
        setLoading(false);
        return recordSignupFailure('That password isn\u2019t safe. Try a different one.');
      }

      setLoading(true, 'Creating your account...');
      const session = await DB.signUp(email, password);
      const userId  = session?.user?.id;
      if (!userId) throw new Error('Could not create your account.');

      setLoading(true, 'Setting up your Desk...');
      const initials = (name.split(/\s+/).map(w => w[0]).join('').slice(0,4) || 'D').toUpperCase();

      const desk = {
        type:        selectedType,
        name:        name,
        username:    link,
        initials:    initials,
        role:        role,
        tagline:     filled.tagline || '',
        services:    filled.services || '',
        about:       '',
        whatsapp:    phone,
        email:       email,
        wamessage:   'Hi ' + name + ", I'd like to talk.",
        accent:      selectedColor.accent,
        accenthover: selectedColor.hover,
        accentsoft:  selectedColor.soft,
        accentink:   '#FFFFFF',
        footer:      name + ' on Deskly',
        bot_enabled: false,
        photos:      JSON.stringify([]),
        photo_layout:'grid',
        pattern:     'none'
      };

      try {
        await DB.createDesk(desk, userId);
      } catch (insertErr) {
        const msg = String(insertErr && insertErr.message || insertErr);
        if (msg.indexOf('duplicate key') !== -1 || msg.indexOf('unique') !== -1) {
          setLoading(false);
          return recordSignupFailure('That link is already taken. Try another.');
        }
        throw insertErr;
      }

      RATE.reset('signup');

      setLoading(true, 'Opening your Desk...');
      await new Promise(r => setTimeout(r, 400));
      window.location.replace('home.html');

    } catch (err) {
      console.error(err);
      setLoading(false);
      recordSignupFailure(err.message || 'Something went wrong. Please try again.');
    }
  });

  /* Auth guard — if already logged in, bounce to home */
  (async function redirectIfLoggedIn(){
    let tries = 0;
    while ((!window.DB || !DB.ready) && tries < 40) {
      await new Promise(r => setTimeout(r, 100));
      tries++;
    }
    if (window.DB && DB.ready && DB.currentUser()) {
      window.location.replace('home.html');
    }
  })();

})();