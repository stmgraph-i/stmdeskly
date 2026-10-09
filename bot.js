/* ============================================================
   DESKLY · OWNER BOT
   Talk to your bot. It learns facts about your Desk.
   ============================================================ */

(function initOwnerBot(){

  const root      = document.getElementById('botRoot');
  const loading   = document.getElementById('botLoading');
  const noAuth    = document.getElementById('noAuth');

  const log     = document.getElementById('ownerLog');
  const chips   = document.getElementById('ownerChips');
  const form    = document.getElementById('ownerForm');
  const input   = document.getElementById('ownerInput');

  const params   = new URLSearchParams(location.search);
  const askQuery = params.get('ask');

  let desk = null;
  let knowledge = null;
  let type = 'person';
  let pending = null;

  /* ---------------- TYPE WORDS ---------------- */

  function words(){
    if (type === 'business') {
      return {
        offering: 'products and services',
        offeringWord: 'product or service',
        hoursLabel: 'opening hours',
        priceLabel: 'price',
        showsPrice: true,
        addServiceChip: 'Add a product or service',
        setPriceChip: 'Set a price'
      };
    }
    if (type === 'organisation') {
      return {
        offering: 'services and programmes',
        offeringWord: 'service or programme',
        hoursLabel: 'service times',
        priceLabel: null,
        showsPrice: false,
        addServiceChip: 'Add a service or programme',
        setPriceChip: null
      };
    }
    return {
      offering: 'services',
      offeringWord: 'service',
      hoursLabel: 'hours',
      priceLabel: 'price',
      showsPrice: true,
      addServiceChip: 'Add a service',
      setPriceChip: 'Set a price'
    };
  }

  /* ---------------- HELPERS ---------------- */

  function escapeHtml(s){
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }

  function textLines(str){
    return (str || '').split('\n').map(s => s.trim()).filter(Boolean);
  }

  function parseKnowledge(raw){
    if (!raw) return { prices: [], facts: [] };
    try {
      const k = JSON.parse(raw);
      return {
        prices: Array.isArray(k.prices) ? k.prices : [],
        facts:  Array.isArray(k.facts)  ? k.facts  : []
      };
    } catch(e) {
      return { prices: [], facts: [] };
    }
  }

  /* ---------------- KNOWLEDGE DUMP ---------------- */

  function formatKnowledge(){
    const name = desk.name || 'your Desk';
    const services = textLines(desk.services);
    const w = words();
    const parts = [];

    parts.push('<strong>Here&rsquo;s what I know about ' + escapeHtml(name) + ':</strong>');

    if (services.length) {
      parts.push('<strong>' + (type === 'organisation' ? 'Services &amp; programmes' : (type === 'business' ? 'Products &amp; services' : 'Services')) + ':</strong><ul>' +
        services.map(s => '<li>' + escapeHtml(s) + '</li>').join('') + '</ul>');
    }

    if (w.showsPrice && knowledge.prices.length) {
      parts.push('<strong>Prices:</strong><ul>' +
        knowledge.prices.map(p => '<li>' + escapeHtml(p.service) + ' — ' + escapeHtml(p.price) + '</li>').join('') +
        '</ul>');
    }

    if (knowledge.facts.length) {
      parts.push('<strong>Things to remember:</strong><ul>' +
        knowledge.facts.map(f => '<li>' + escapeHtml(f.text) + '</li>').join('') + '</ul>');
    }

    if ((desk.location || '').trim()) {
      parts.push('<strong>Location:</strong> ' + escapeHtml(desk.location.trim()));
    }

    const hoursVal = type === 'organisation' ? desk.service_times : desk.opening_hours;
    if ((hoursVal || '').trim()) {
      parts.push('<strong>' + (type === 'organisation' ? 'Service times' : 'Hours') + ':</strong> ' + escapeHtml(hoursVal.trim()));
    }

    if (type === 'organisation' && (desk.programmes || '').trim()) {
      parts.push('<strong>Programmes:</strong><ul>' +
        textLines(desk.programmes).map(p => '<li>' + escapeHtml(p) + '</li>').join('') + '</ul>');
    }

    if (type === 'organisation' && (desk.facilities || '').trim()) {
      parts.push('<strong>Facilities:</strong><ul>' +
        textLines(desk.facilities).map(f => '<li>' + escapeHtml(f) + '</li>').join('') + '</ul>');
    }

    return parts.join('<br>');
  }

  /* ---------------- SAVE ---------------- */

  async function save(){
    const payload = {
      services: desk.services || '',
      location: desk.location || '',
      opening_hours: desk.opening_hours || '',
      service_times: desk.service_times || '',
      programmes: desk.programmes || '',
      facilities: desk.facilities || '',
      bot_knowledge: JSON.stringify(knowledge)
    };

    try {
      await DB.updateDesk(desk.id, payload);
      desk.services      = payload.services;
      desk.location      = payload.location;
      desk.opening_hours = payload.opening_hours;
      desk.service_times = payload.service_times;
      desk.programmes    = payload.programmes;
      desk.facilities    = payload.facilities;
    } catch(e) {
      console.error('Save failed:', e);
      addMessage('⚠️ I couldn&rsquo;t save that. Check your connection and try again.', 'bot');
    }
  }

  /* ---------------- GUIDED FLOWS ---------------- */

  function startFlow(action, data){
    const w = words();
    pending = { action: action, step: 1, data: data || {} };

    switch (action) {
      case 'add_service':
        return "Sure — what&rsquo;s " + (type === 'organisation' ? 'it' : (type === 'business' ? 'the product or service' : 'the service')) + "?<br><br>Just type it. Example: <em>Logo design, ₦15,000</em>";

      case 'set_price':
        return "Which " + (type === 'business' ? 'product or service' : 'service') + ", and how much?<br><br>Example: <em>Logo design, ₦15,000</em>";

      case 'add_fact':
        return "What should I remember?<br><br>Example: <em>I don&rsquo;t deliver on Sundays</em> or <em>Cash and transfer only</em>";

      case 'update_location':
        return "Where are you?<br><br>Type your location or service area.";

      case 'update_hours':
        return "What are your " + w.hoursLabel + "?<br><br>Example: <em>Mon to Sat, 9am to 6pm</em>";

      case 'add_programme':
        return "What&rsquo;s the programme?<br><br>Example: <em>Sunday service, 8am and 10am</em>";

      case 'add_facility':
        return "What facility should visitors know about?<br><br>Example: <em>Parking for 50 cars</em>";

      default:
        pending = null;
        return null;
    }
  }

  async function handlePending(text){
    const raw = String(text || '').trim();
    if (!raw) return null;

    const w = words();
    const action = pending.action;
    pending = null;

    if (action === 'add_service') {
      let entry = raw;
      let price = null;

      const priceMatch = entry.match(/[,\-–]\s*(₦?[\d,]+k?)\s*$/i);
      if (priceMatch && w.showsPrice) {
        price = priceMatch[1].replace(/^₦/, '').trim();
        entry = entry.slice(0, priceMatch.index).trim();
        if (price) price = '₦' + price;
      }

      if (!entry) return "I didn&rsquo;t catch that. Try again?";

      const current = textLines(desk.services);
      if (current.indexOf(entry) === -1) current.push(entry);
      desk.services = current.join('\n');

      if (price) {
        knowledge.prices = knowledge.prices.filter(p => p.service.toLowerCase() !== entry.toLowerCase());
        knowledge.prices.push({ service: entry, price: price });
      }

      await save();

      const note = price ? ' — ' + price : '';
      return '✅ Added <strong>' + escapeHtml(entry) + '</strong>' + escapeHtml(note) + '.';
    }

    if (action === 'set_price') {
      let entry = raw;
      let price = null;

      const priceMatch = entry.match(/(₦?[\d,]+k?)\s*$/i);
      if (priceMatch) {
        price = priceMatch[1].replace(/^₦/, '').trim();
        entry = entry.slice(0, priceMatch.index).replace(/[,\-–]\s*$/, '').trim();
        if (price) price = '₦' + price;
      }

      if (!entry || !price) {
        return "I need both — the name and the price. Try: <em>Logo design, ₦15,000</em>";
      }

      knowledge.prices = knowledge.prices.filter(p => p.service.toLowerCase() !== entry.toLowerCase());
      knowledge.prices.push({ service: entry, price: price });

      await save();
      return '✅ Noted. <strong>' + escapeHtml(entry) + '</strong> — <strong>' + escapeHtml(price) + '</strong>.';
    }

    if (action === 'add_fact') {
      knowledge.facts.push({ text: raw });
      await save();
      return '✅ I&rsquo;ll remember: <strong>' + escapeHtml(raw) + '</strong>.';
    }

    if (action === 'update_location') {
      desk.location = raw;
      await save();
      return '✅ Updated your location to <strong>' + escapeHtml(raw) + '</strong>.';
    }

    if (action === 'update_hours') {
      if (type === 'organisation') {
        desk.service_times = raw;
      } else {
        desk.opening_hours = raw;
      }
      await save();
      return '✅ Noted your ' + w.hoursLabel + ': <strong>' + escapeHtml(raw) + '</strong>.';
    }

    if (action === 'add_programme') {
      const progs = textLines(desk.programmes);
      progs.push(raw);
      desk.programmes = progs.join('\n');
      await save();
      return '✅ Added programme: <strong>' + escapeHtml(raw) + '</strong>.';
    }

    if (action === 'add_facility') {
      const facs = textLines(desk.facilities);
      facs.push(raw);
      desk.facilities = facs.join('\n');
      await save();
      return '✅ Added facility: <strong>' + escapeHtml(raw) + '</strong>.';
    }

    return null;
  }

  /* ---------------- TEXT PARSER ---------------- */

  async function parseText(raw){
    const lower = raw.toLowerCase();

    if (/what do you know|what have you learned|show my info|show what you know/.test(lower)) {
      return formatKnowledge();
    }

    let m = raw.match(/^(?:new service|add service|add a service|new product|add product)[:\s]+(.+)$/i);
    if (m) {
      let entry = m[1].trim();
      let price = null;

      const priceMatch = entry.match(/[,\-–]\s*(₦?[\d,]+k?)\s*$/i);
      if (priceMatch && words().showsPrice) {
        price = priceMatch[1].replace(/^₦/, '').trim();
        entry = entry.slice(0, priceMatch.index).trim();
        if (price) price = '₦' + price;
      }
      if (!entry) return "I didn&rsquo;t catch the name. Try again.";

      const current = textLines(desk.services);
      if (current.indexOf(entry) === -1) current.push(entry);
      desk.services = current.join('\n');

      if (price) {
        knowledge.prices = knowledge.prices.filter(p => p.service.toLowerCase() !== entry.toLowerCase());
        knowledge.prices.push({ service: entry, price: price });
      }

      await save();
      const note = price ? ' — ' + price : '';
      return '✅ Added <strong>' + escapeHtml(entry) + '</strong>' + escapeHtml(note) + '.';
    }

    m = raw.match(/^(?:remove service|delete service|remove product)[:\s]+(.+)$/i);
    if (m) {
      const entry = m[1].trim();
      const current = textLines(desk.services);
      const filtered = current.filter(s => s.toLowerCase() !== entry.toLowerCase());
      if (filtered.length === current.length) {
        return "I couldn&rsquo;t find <strong>" + escapeHtml(entry) + "</strong> in your list.";
      }
      desk.services = filtered.join('\n');
      knowledge.prices = knowledge.prices.filter(p => p.service.toLowerCase() !== entry.toLowerCase());
      await save();
      return '✅ Removed <strong>' + escapeHtml(entry) + '</strong>.';
    }

    m = raw.match(/price\s+(?:for|of)\s+(.+?)\s+(?:is|at)\s+(₦?[\d,]+k?)/i);
    if (m && words().showsPrice) {
      const service = m[1].trim();
      let price = m[2].replace(/^₦/, '').trim();
      price = '₦' + price;

      knowledge.prices = knowledge.prices.filter(p => p.service.toLowerCase() !== service.toLowerCase());
      knowledge.prices.push({ service: service, price: price });

      await save();
      return '✅ Noted. <strong>' + escapeHtml(service) + '</strong> — <strong>' + escapeHtml(price) + '</strong>.';
    }

    m = raw.match(/^(?:remember|note|remember that|note that|keep in mind)[:\s]+(.+)$/i);
    if (m) {
      const fact = m[1].trim();
      knowledge.facts.push({ text: fact });
      await save();
      return '✅ I&rsquo;ll remember: <strong>' + escapeHtml(fact) + '</strong>.';
    }

    if (/^(?:i |we )(?:don&rsquo;t|don't|do not|never|am closed|are closed)\b/i.test(raw) ||
        /closed on/i.test(raw) ||
        /^(?:delivery|deliver)/i.test(raw)) {
      knowledge.facts.push({ text: raw });
      await save();
      return '✅ Got it. I&rsquo;ll tell visitors: <strong>' + escapeHtml(raw) + '</strong>.';
    }

    if (window.HOW_TO) {
      const topic = HOW_TO.find(raw);
      if (topic) {
        return topic.answer(type);
      }
    }

    return (
      "I didn&rsquo;t catch that. You can:<br><br>" +
      "• Tap one of the buttons below the chat<br>" +
      "• Ask me a question about using Deskly — like <em>how do I add photos?</em><br>" +
      "• Or tell me something about your work — like <em>new service: Logo design, ₦15,000</em>"
    );
  }

  /* ---------------- MAIN HANDLER ---------------- */

  async function handleMessage(text){
    if (pending) {
      const res = await handlePending(text);
      if (res !== null) return res;
    }
    return await parseText(text);
  }

  /* ---------------- RENDER ---------------- */

  function addMessage(html, who){
    if (!log) return;
    const el = document.createElement('div');
    el.className = 'desk-bot-msg ' + who;
    el.innerHTML = html;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    saveHistory();
  }

  function showTyping(){
    if (!log) return;
    if (document.getElementById('ownerTyping')) return;
    const el = document.createElement('div');
    el.className = 'desk-bot-msg bot typing';
    el.id = 'ownerTyping';
    el.innerHTML = '<span></span><span></span><span></span>';
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  function removeTyping(){
    const el = document.getElementById('ownerTyping');
    if (el) el.remove();
  }

  /* ---------------- CHIPS ---------------- */

  function renderChips(){
    if (!chips) return;
    chips.innerHTML = '';
    const w = words();
    const actions = [];

    actions.push({ label: w.addServiceChip, action: 'add_service' });

    if (w.showsPrice) {
      actions.push({ label: w.setPriceChip, action: 'set_price' });
    }

    actions.push({ label: 'Update location', action: 'update_location' });

    actions.push({
      label: type === 'organisation' ? 'Update service times' : 'Update hours',
      action: 'update_hours'
    });

    if (type === 'organisation') {
      actions.push({ label: 'Add a programme', action: 'add_programme' });
      actions.push({ label: 'Add a facility', action: 'add_facility' });
    }

    actions.push({ label: 'Remember a fact', action: 'add_fact' });

    actions.push({ label: 'What do you know?', action: 'show_knowledge' });
    actions.push({ label: 'How-to', action: 'how_to' });
    actions.push({ label: 'Help', action: 'help' });

    actions.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'desk-bot-chip';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => runAction(opt.action));
      chips.appendChild(btn);
    });
  }

  async function runAction(action){
    if (!log) return;

    let label = '';
    switch (action) {
      case 'add_service':    label = words().addServiceChip; break;
      case 'set_price':      label = words().setPriceChip; break;
      case 'add_fact':       label = 'Remember a fact'; break;
      case 'update_location':label = 'Update location'; break;
      case 'update_hours':   label = type === 'organisation' ? 'Update service times' : 'Update hours'; break;
      case 'add_programme':  label = 'Add a programme'; break;
      case 'add_facility':   label = 'Add a facility'; break;
      case 'show_knowledge': label = 'What do you know?'; break;
      case 'how_to':         label = 'How-to'; break;
      case 'help':           label = 'Help'; break;
    }

    addMessage(escapeHtml(label), 'user');
    showTyping();

    setTimeout(async () => {
      removeTyping();
      let reply = null;

      if (action === 'show_knowledge') {
        reply = formatKnowledge();
      } else if (action === 'how_to') {
        const list = HOW_TO.list();
        reply = "What would you like help with?<br><br>" +
          list.map(t => '• <em>' + escapeHtml(t.label) + '</em>').join('<br>') +
          "<br><br>Just ask me, like: <em>how do I add photos?</em>";
      } else if (action === 'help') {
        const help = HOW_TO.get('help');
        reply = help ? help.answer(type) : "Say <em>how-to</em> to see what I can help with.";
      } else {
        reply = startFlow(action);
      }

      if (reply) addMessage(reply, 'bot');
    }, 400);
  }

  /* ---------------- SEND ---------------- */

  let busy = false;

  async function send(){
    if (busy) return;
    const val = input ? input.value.trim() : '';
    if (!val) return;
    if (input) input.value = '';

    addMessage(escapeHtml(val), 'user');
    busy = true;

    showTyping();

    setTimeout(async () => {
      removeTyping();
      try {
        const reply = await handleMessage(val);
        if (reply) addMessage(reply, 'bot');
      } catch(e) {
        console.error(e);
        addMessage('⚠️ Something went wrong. Try again.', 'bot');
      }
      busy = false;
    }, 400);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    send();
  });

  /* ---------------- HISTORY ---------------- */

  const HISTORY_KEY = 'fd_owner_bot_history_v2';

  function saveHistory(){
    try {
      const messages = [];
      log.querySelectorAll('.desk-bot-msg').forEach(el => {
        if (el.classList.contains('typing')) return;
        messages.push({
          text: el.innerHTML,
          who: el.classList.contains('user') ? 'user' : 'bot'
        });
      });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-40)));
    } catch(e) {}
  }

  function loadHistory(){
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return false;
      const msgs = JSON.parse(raw);
      if (!Array.isArray(msgs) || !msgs.length) return false;
      msgs.forEach(m => {
        const el = document.createElement('div');
        el.className = 'desk-bot-msg ' + m.who;
        el.innerHTML = m.text;
        log.appendChild(el);
      });
      log.scrollTop = log.scrollHeight;
      return true;
    } catch(e) { return false; }
  }

  /* ---------------- INIT ---------------- */

  async function init(){
    if (!window.DB || !DB.ready) {
      loading.style.display = 'none';
      noAuth.style.display = 'block';
      return;
    }

    if (!DB.currentUser()) {
      await new Promise(r => setTimeout(r, 400));
    }
    if (!DB.currentUser()) {
      loading.style.display = 'none';
      noAuth.style.display = 'block';
      return;
    }

    try {
      desk = await DB.getMyDesk();
    } catch(e) {
      console.error(e);
      loading.style.display = 'none';
      noAuth.querySelector('h1').textContent = 'Something went wrong';
      noAuth.querySelector('p').textContent = 'We could not load your Desk.';
      noAuth.style.display = 'block';
      return;
    }

    if (!desk) {
      loading.style.display = 'none';
      window.location.replace('signup.html');
      return;
    }

    type = desk.type || 'person';
    knowledge = parseKnowledge(desk.bot_knowledge);

    /* Greeting + intro, skipped when arriving with ?ask= */
    if (!loadHistory() && !askQuery) {
      const firstName = (desk.name || '').split(/\s+/)[0] || '';
      const greeting = firstName
        ? "👋 Hi " + escapeHtml(firstName) + " — I&rsquo;m your Desk bot."
        : "👋 Hi — I&rsquo;m your Desk bot.";

      addMessage(greeting, 'bot');

      setTimeout(() => {
        addMessage(
          "Tell me things about your work — services, prices, schedules.<br>" +
          "I&rsquo;ll remember them, and share them with visitors on your Desk.<br><br>" +
          "You can also ask me questions — like <em>how do I add photos?</em> or <em>what do you know about me?</em>",
          'bot'
        );
      }, 500);
    }

    renderChips();

    loading.style.display = 'none';
    root.style.display = '';

    /* Pre-fill from ?ask= */
    if (askQuery && input) {
      input.value = decodeURIComponent(askQuery);
      input.focus();
    }
  }

  init();

})();