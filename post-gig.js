/* ============================================================
   DESKLY · POST A GIG
   ============================================================ */

(function initPostGig(){

  const root       = document.getElementById('postGigRoot');
  const loading    = document.getElementById('gigLoading');
  const noAuth     = document.getElementById('noAuth');
  const form       = document.getElementById('gigForm');
  const typeList   = document.getElementById('gigTypeList');
  const fields     = document.getElementById('gigFields');
  const messageBox = document.getElementById('gigMessage');
  const submitBtn  = document.getElementById('gigSubmit');
  const submitText = document.getElementById('gigSubmitText');

  const roleEl     = document.getElementById('gigRole');
  const titleEl    = document.getElementById('gigTitle');
  const bodyEl     = document.getElementById('gigBody');
  const locationEl = document.getElementById('gigLocation');
  const daysEl     = document.getElementById('gigDays');
  const payMinEl   = document.getElementById('gigPayMin');
  const payMaxEl   = document.getElementById('gigPayMax');
  const payUnitEl  = document.getElementById('gigPayUnit');
  const expiresEl  = document.getElementById('gigExpires');

  if (!form) return;

  let gigType = null;
  let editingId = null;

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
      submitText.innerHTML = '<span class="spinner"></span>' + (text || 'Posting…');
    } else {
      submitBtn.disabled = false;
      submitText.textContent = editingId ? 'Save changes' : 'Post gig';
    }
  }

  /* ---- Type cards ---- */
  typeList.querySelectorAll('.type-card').forEach(btn => {
    btn.addEventListener('click', () => {
      gigType = btn.getAttribute('data-type');
      typeList.querySelectorAll('.type-card').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      fields.hidden = false;

      if (gigType === 'available') {
        titleEl.placeholder = "Available for Sunday services and rehearsals";
      } else {
        titleEl.placeholder = "Keyboardist needed for Sunday services";
      }

      fields.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });

  /* ---- Submit ---- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();

    if (!gigType) {
      return showMessage('Choose whether you need someone or you&rsquo;re available.');
    }

    const role     = roleEl.value.trim();
    const title    = titleEl.value.trim();
    const body     = bodyEl.value.trim();
    const location = locationEl.value.trim();
    const days     = daysEl.value.trim();

    const payMin   = payMinEl.value ? parseInt(payMinEl.value, 10) : null;
    const payMax   = payMaxEl.value ? parseInt(payMaxEl.value, 10) : null;
    const payUnit  = payUnitEl.value || null;

    if (!role)     return showMessage('Please add a role or category.');
    if (!title)    return showMessage('Please add a title.');
    if (!location) return showMessage('Please add a location.');

    if (payMin !== null && payMax !== null && payMin > payMax) {
      return showMessage('The minimum pay cannot be higher than the maximum.');
    }

    let expiresAt = null;
    if (expiresEl.value) {
      const expDays = parseInt(expiresEl.value, 10);
      if (expDays > 0) {
        expiresAt = new Date(Date.now() + expDays * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    const payload = {
      type:       gigType,
      role:       role,
      title:      title,
      body:       body || null,
      location:   location,
      days:       days || null,
      pay_min:    payMin,
      pay_max:    payMax,
      pay_unit:   payUnit,
      expires_at: expiresAt,
      status:     'open'
    };

    setLoading(true, editingId ? 'Saving…' : 'Posting…');

    try {
      let gig;
      if (editingId) {
        gig = await DB.updateGig(editingId, payload);
      } else {
        gig = await DB.createGig(payload);
      }
      setLoading(false);
      showMessage(editingId ? 'Saved.' : 'Posted. Taking you to your gig…', 'success');
      setTimeout(() => {
        window.location.replace('gig.html?id=' + encodeURIComponent(gig.id));
      }, 800);
    } catch (err) {
      console.error(err);
      setLoading(false);
      showMessage(err.message || 'Could not save the gig.', 'error');
    }
  });

  /* ---- Init ---- */
  (async function init(){
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

    /* Edit mode */
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');

    if (editId) {
      editingId = editId;
      submitText.textContent = 'Save changes';
      document.querySelector('.settings-title').textContent = 'Edit gig';

      try {
        const gig = await DB.getGig(editId);
        if (gig) {
          gigType = gig.type;

          const card = typeList.querySelector('[data-type="' + gig.type + '"]');
          if (card) card.classList.add('active');

          fields.hidden = false;

          roleEl.value     = gig.role || '';
          titleEl.value    = gig.title || '';
          bodyEl.value     = gig.body || '';
          locationEl.value = gig.location || '';
          daysEl.value     = gig.days || '';
          payMinEl.value   = gig.pay_min || '';
          payMaxEl.value   = gig.pay_max || '';
          payUnitEl.value  = gig.pay_unit || '';

          /* Expiry — leave default */
        }
      } catch(e) {
        console.error(e);
      }
    }

    loading.style.display = 'none';
    root.style.display = '';
  })();

})();