/* ============================================================
   DESKLY · SUPABASE WRAPPER
   ============================================================ */

window.DB = (function(){

  function cfg(){ return window.SUPABASE_CONFIG || {}; }

  function isReady(){
    const c = cfg();
    return !!(c.url && c.url.startsWith('http') &&
              c.anonKey && c.anonKey.length > 50 &&
              !c.anonKey.includes('PASTE'));
  }

  function baseHeaders(){
    const c = cfg();
    return { 'apikey': c.anonKey, 'Content-Type': 'application/json' };
  }

  function authHeaders(extra){
    const c = cfg();
    const token = getSession()?.access_token || c.anonKey;
    return Object.assign({
      'apikey': c.anonKey,
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    }, extra || {});
  }

  /* ---------- SESSION ---------- */
  const SESSION_KEY = 'fd_session';
  const REMEMBER_KEY = 'fd_remember_until';

  function getSession(){
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e){ return null; }
  }
  function saveSession(s){
    try {
      if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      else localStorage.removeItem(SESSION_KEY);
    } catch(e){}
  }

  function persistLogin(remember){
    try {
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, 'never');
      } else {
        const until = Date.now() + (30 * 24 * 60 * 60 * 1000);
        localStorage.setItem(REMEMBER_KEY, String(until));
      }
    } catch(e){}
  }

  function loginStillFresh(){
    try {
      const raw = localStorage.getItem(REMEMBER_KEY);
      if (!raw) return false;
      if (raw === 'never') return true;
      const until = parseInt(raw, 10);
      if (!until || isNaN(until)) return false;
      return Date.now() < until;
    } catch(e){ return false; }
  }

  function clearPersist(){
    try { localStorage.removeItem(REMEMBER_KEY); } catch(e){}
  }

  /* ---------- TOKEN REFRESH ---------- */

  let refreshInFlight = null;

  async function refreshSession(){
    const session = getSession();
    if (!session || !session.refresh_token) return null;
    if (!isReady()) return null;

    if (refreshInFlight) return refreshInFlight;

    const c = cfg();
    refreshInFlight = (async () => {
      try {
        const res = await fetch(c.url + '/auth/v1/token?grant_type=refresh_token', {
          method: 'POST',
          headers: baseHeaders(),
          body: JSON.stringify({ refresh_token: session.refresh_token })
        });
        if (!res.ok) {
          saveSession(null);
          clearPersist();
          return null;
        }
        const data = await res.json();
        saveSession(data);
        return data;
      } catch(e) {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();

    return refreshInFlight;
  }

  function tokenExpiringSoon(){
    const session = getSession();
    if (!session || !session.access_token) return true;

    try {
      const payload = session.access_token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/')));
      if (!decoded.exp) return false;
      const now = Math.floor(Date.now() / 1000);
      return (decoded.exp - now) < 300;
    } catch(e) {
      return false;
    }
  }

  /* ---------- AUTH ---------- */
  async function signUp(email, password){
    if (!isReady()) throw new Error('Database not configured.');
    const c = cfg();
    const res = await fetch(c.url + '/auth/v1/signup', {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.message || 'Signup failed');
    if (!data.access_token) return await logIn(email, password);
    saveSession(data);
    return data;
  }

  async function logIn(email, password){
    if (!isReady()) throw new Error('Database not configured.');
    const c = cfg();
    const res = await fetch(c.url + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || 'Login failed');
    saveSession(data);
    return data;
  }

  async function logOut(){
    saveSession(null);
    clearPersist();
  }

  function currentUser(){
    let s = getSession();
    if (s?.user) return s.user;
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        s = JSON.parse(raw);
        if (s?.user) return s.user;
      }
    } catch(e) {}
    return null;
  }

  /* ---------- KNOWN ACCOUNTS ---------- */

  const ACCOUNTS_KEY = 'fd_accounts';
  const MAX_ACCOUNTS = 3;

  function knownAccounts(){
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.sort((a,b) => (b.lastUsed || 0) - (a.lastUsed || 0));
    } catch(e) { return []; }
  }

  function rememberAccount(email, info){
    if (!email) return;
    email = String(email).trim().toLowerCase();
    if (!email) return;

    let list = knownAccounts();
    list = list.filter(a => a.email !== email);

    list.unshift({
      email: email,
      name: info?.name || '',
      initials: info?.initials || '',
      avatar_url: info?.avatar_url || '',
      lastUsed: Date.now()
    });

    if (list.length > MAX_ACCOUNTS) list = list.slice(0, MAX_ACCOUNTS);

    try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list)); } catch(e){}
  }

  function forgetAccount(email){
    if (!email) return;
    email = String(email).trim().toLowerCase();
    const list = knownAccounts().filter(a => a.email !== email);
    try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list)); } catch(e){}
  }

  function forgetAllAccounts(){
    try { localStorage.removeItem(ACCOUNTS_KEY); } catch(e){}
  }

  /* ---------- PASSWORD RESET ---------- */

  async function recoverPassword(email){
    if (!isReady()) throw new Error('Database not configured.');
    const c = cfg();
    const res = await fetch(c.url + '/auth/v1/recover', {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        email: email,
        gotrue_meta_security: {},
        options: {
          redirect_to: window.location.origin + '/new-password.html'
        }
      })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.msg || data.message || 'Could not send the reset link.');
    }
    return true;
  }

  async function updatePassword(newPassword){
    if (!isReady()) throw new Error('Database not configured.');
    const c = cfg();
    const session = getSession();
    const token = session?.access_token || c.anonKey;
    const res = await fetch(c.url + '/auth/v1/user', {
      method: 'PUT',
      headers: {
        'apikey': c.anonKey,
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: newPassword })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.msg || data.message || 'Could not update your password.');
    }
    return true;
  }

  /* ---------- DESKS ---------- */
  async function getDesk(username){
    if (!isReady()) return null;
    const c = cfg();
    const url = c.url + '/rest/v1/desks?username=eq.' +
                encodeURIComponent(username) + '&select=*&limit=1';
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch desk');
    const rows = await res.json();
    return rows[0] || null;
  }

  async function getDeskById(id){
    if (!isReady() || !id) return null;
    const c = cfg();
    const url = c.url + '/rest/v1/desks?id=eq.' +
                encodeURIComponent(id) + '&select=*&limit=1';
    const res = await fetch(url, {
      headers: {
        'apikey': c.anonKey,
        'Authorization': 'Bearer ' + c.anonKey
      }
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] || null;
  }

  async function getMyDesk(){
    const user = currentUser();
    if (!user) return null;

    if (tokenExpiringSoon()) {
      await refreshSession();
    }

    const c = cfg();
    const url = c.url + '/rest/v1/desks?user_id=eq.' +
                encodeURIComponent(user.id) + '&select=*&limit=1';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      let res = await fetch(url, {
        headers: authHeaders(),
        signal: controller.signal
      });

      if (res.status === 401) {
        const refreshed = await refreshSession();
        if (refreshed) {
          res = await fetch(url, {
            headers: authHeaders(),
            signal: controller.signal
          });
        }
      }

      clearTimeout(timeout);

      if (!res.ok) {
        const txt = await res.text();
        console.error('getMyDesk failed:', res.status, txt);
        throw new Error('Failed to fetch your desk (status ' + res.status + ')');
      }

      const rows = await res.json();
      return rows[0] || null;

    } catch (e) {
      clearTimeout(timeout);
      if (e.name === 'AbortError') {
        throw new Error('The request to load your Desk timed out.');
      }
      throw e;
    }
  }

  async function createDesk(data, userIdOverride){
    if (!isReady()) throw new Error('Database not configured.');
    const user = currentUser();
    const uid = userIdOverride || user?.id;
    if (!uid) throw new Error('You must be logged in.');
    const c = cfg();
    const payload = Object.assign({}, data, { user_id: uid });
    const url = c.url + '/rest/v1/desks';
    const res = await fetch(url, {
      method: 'POST',
      headers: authHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    const rows = await res.json();
    return rows[0];
  }

  async function updateDesk(id, data){
    if (!isReady()) throw new Error('Database not configured.');
    const c = cfg();
    const url = c.url + '/rest/v1/desks?id=eq.' + encodeURIComponent(id);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: authHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    const rows = await res.json();
    return rows[0];
  }

  async function usernameTaken(username){
    if (!isReady()) return false;
    const c = cfg();
    const url = c.url + '/rest/v1/desks?select=username&username=eq.' +
                encodeURIComponent(username) + '&limit=1';
    try {
      const res = await fetch(url, {
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + c.anonKey
        }
      });
      if (!res.ok) return false;
      const rows = await res.json();
      return Array.isArray(rows) && rows.length > 0;
    } catch (e) {
      return false;
    }
  }

  /* ---------- VISITS ---------- */

  async function recordVisit(deskId){
    if (!isReady() || !deskId) return false;
    const c = cfg();
    try {
      const res = await fetch(c.url + '/rest/v1/desk_visits', {
        method: 'POST',
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + c.anonKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          desk_id: deskId,
          referrer: document.referrer || null
        })
      });
      return res.ok;
    } catch(e) {
      return false;
    }
  }

  async function getMyVisits(deskId){
    if (!isReady() || !deskId) return [];
    const c = cfg();
    const url = c.url + '/rest/v1/desk_visits?desk_id=eq.' +
                encodeURIComponent(deskId) + '&select=visited_at&order=visited_at.desc';
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch visits');
    return await res.json();
  }

  /* ---------- BOT · UNANSWERED QUESTIONS ---------- */

  async function recordUnanswered(deskId, question){
    if (!isReady() || !deskId || !question) return false;
    const q = String(question).trim();
    if (q.length < 4 || q.length > 300) return false;
    if (q.split(/\s+/).length < 3) return false;
    if (/^(hi|hello|hey|yo|thanks|thank you|ok|okay|good morning|good afternoon|good evening)\b/i.test(q)) return false;

    const c = cfg();
    try {
      const res = await fetch(c.url + '/rest/v1/bot_unanswered', {
        method: 'POST',
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + c.anonKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          desk_id: deskId,
          question: q.slice(0, 300)
        })
      });
      return res.ok;
    } catch(e) {
      return false;
    }
  }

  async function getUnanswered(deskId){
    if (!isReady() || !deskId) return [];
    const c = cfg();
    const url = c.url + '/rest/v1/bot_unanswered?desk_id=eq.' +
                encodeURIComponent(deskId) +
                '&select=id,question,asked_at&order=asked_at.desc&limit=100';
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch unanswered questions');
    return await res.json();
  }

  async function deleteUnanswered(id){
    if (!isReady() || !id) return false;
    const c = cfg();
    const url = c.url + '/rest/v1/bot_unanswered?id=eq.' + encodeURIComponent(id);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: authHeaders({ 'Prefer': 'return=minimal' })
    });
    return res.ok;
  }

  /* ---------- RATINGS ---------- */

  const RATER_KEY = 'fd_rater_key';

  function getRaterKey(){
    try {
      let key = localStorage.getItem(RATER_KEY);
      if (key) return key;
      const bytes = new Uint8Array(16);
      if (window.crypto && crypto.getRandomValues) {
        crypto.getRandomValues(bytes);
      } else {
        for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
      }
      key = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(RATER_KEY, key);
      return key;
    } catch(e) {
      return 'unknown-' + Date.now();
    }
  }

  async function addRating(deskId, rating){
    if (!isReady() || !deskId) throw new Error('Database not configured.');
    const value = parseInt(rating, 10);
    if (!value || value < 1 || value > 5) throw new Error('Rating must be 1 to 5.');

    const c = cfg();
    const key = getRaterKey();

    const url = c.url + '/rest/v1/desk_ratings' +
                '?on_conflict=desk_id,rater_key';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': c.anonKey,
        'Authorization': 'Bearer ' + c.anonKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        desk_id: deskId,
        rating: value,
        rater_key: key,
        rated_at: new Date().toISOString()
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('addRating failed:', err);
      throw new Error('Could not save your rating.');
    }
    return true;
  }

  async function getDeskRating(deskId){
    if (!isReady() || !deskId) return { rating_count: 0, rating_avg: 0 };
    const c = cfg();
    const url = c.url + '/rest/v1/rpc/get_desk_rating_stats';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + c.anonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ desk_id_input: deskId })
      });
      if (!res.ok) return { rating_count: 0, rating_avg: 0 };
      const data = await res.json();
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) return { rating_count: 0, rating_avg: 0 };
      return {
        rating_count: row.rating_count || 0,
        rating_avg: Number(row.rating_avg || 0)
      };
    } catch(e) {
      return { rating_count: 0, rating_avg: 0 };
    }
  }

  function getMyRating(deskId){
    try {
      const raw = localStorage.getItem('fd_my_ratings');
      if (!raw) return null;
      const map = JSON.parse(raw);
      return map[deskId] || null;
    } catch(e) { return null; }
  }

  function saveMyRating(deskId, rating){
    try {
      const raw = localStorage.getItem('fd_my_ratings');
      const map = raw ? JSON.parse(raw) : {};
      map[deskId] = rating;
      localStorage.setItem('fd_my_ratings', JSON.stringify(map));
    } catch(e) {}
  }

  /* ---------- REVIEWS ---------- */

  async function submitReview(deskId, data){
    if (!isReady() || !deskId) throw new Error('Database not configured.');

    const value = parseInt(data.rating, 10);
    if (!value || value < 1 || value > 5) throw new Error('Please pick a star rating.');

    const text = (data.text || '').trim().slice(0, 600);
    const name = (data.name || '').trim().slice(0, 60);

    const c = cfg();
    const key = getRaterKey();

    let verified = false;
    try {
      verified = localStorage.getItem('fd_wa_tapped_' + deskId) === '1';
    } catch(e) {}

    const url = c.url + '/rest/v1/desk_ratings?on_conflict=desk_id,rater_key';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': c.anonKey,
        'Authorization': 'Bearer ' + c.anonKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify({
        desk_id:       deskId,
        rating:        value,
        rater_key:     key,
        review_text:   text || null,
        reviewer_name: name || null,
        verified:      verified,
        rated_at:      new Date().toISOString()
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('submitReview failed:', err);
      throw new Error('Could not save your review.');
    }

    const rows = await res.json();
    if (saveMyRating) saveMyRating(deskId, value);
    return rows[0];
  }

  async function deleteReview(deskId){
    if (!isReady() || !deskId) throw new Error('Database not configured.');
    const c = cfg();
    const key = getRaterKey();

    const url = c.url + '/rest/v1/desk_ratings?desk_id=eq.' +
                encodeURIComponent(deskId) +
                '&rater_key=eq.' + encodeURIComponent(key);

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': c.anonKey,
        'Authorization': 'Bearer ' + c.anonKey,
        'x-rater-key': key,
        'Prefer': 'return=minimal'
      }
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('deleteReview failed:', err);
      throw new Error('Could not delete your review.');
    }

    try {
      const raw = localStorage.getItem('fd_my_ratings');
      const map = raw ? JSON.parse(raw) : {};
      delete map[deskId];
      localStorage.setItem('fd_my_ratings', JSON.stringify(map));
    } catch(e) {}

    return true;
  }

  async function getReviews(deskId){
    if (!isReady() || !deskId) return [];
    const c = cfg();
    const url = c.url + '/rest/v1/desk_ratings?desk_id=eq.' +
                encodeURIComponent(deskId) +
                '&select=id,rating,review_text,reviewer_name,verified,owner_reply,replied_at,rated_at,rater_key' +
                '&order=rated_at.desc' +
                '&limit=50';
    try {
      const res = await fetch(url, {
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + c.anonKey
        }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch(e) {
      return [];
    }
  }

  async function replyToReview(ratingId, replyText){
    if (!isReady() || !ratingId) throw new Error('Database not configured.');
    const trimmed = String(replyText || '').trim().slice(0, 500);
    if (!trimmed) throw new Error('Reply is empty.');

    const c = cfg();
    const url = c.url + '/rest/v1/desk_ratings?id=eq.' + encodeURIComponent(ratingId);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: authHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify({
        owner_reply: trimmed,
        replied_at: new Date().toISOString()
      })
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('replyToReview failed:', err);
      throw new Error('Could not post your reply.');
    }
    const rows = await res.json();
    return rows[0];
  }

  async function deleteReviewAsOwner(ratingId){
    if (!isReady() || !ratingId) throw new Error('Database not configured.');
    const c = cfg();
    const url = c.url + '/rest/v1/desk_ratings?id=eq.' + encodeURIComponent(ratingId);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: authHeaders({ 'Prefer': 'return=minimal' })
    });
    if (!res.ok) throw new Error('Could not delete the review.');
    return true;
  }

  function markWhatsAppTap(deskId){
    try {
      localStorage.setItem('fd_wa_tapped_' + deskId, '1');
    } catch(e) {}
  }

  function hasTappedWhatsApp(deskId){
    try {
      return localStorage.getItem('fd_wa_tapped_' + deskId) === '1';
    } catch(e) {
      return false;
    }
  }

  /* ---------- EXPLORE / SEARCH ---------- */

  async function searchDesks(query, typeFilter){
    if (!isReady()) return [];
    const c = cfg();

    let url = c.url + '/rest/v1/desks' +
              '?select=id,username,name,role,tagline,location,avatar_url,initials,type,accent,accentsoft,services' +
              '&show_in_explore=eq.true' +
              '&order=created_at.desc' +
              '&limit=50';

    if (typeFilter && typeFilter !== 'all') {
      url += '&type=eq.' + encodeURIComponent(typeFilter);
    }

    if (query && query.trim()) {
      const q = query.trim();
      const pattern = '*' + encodeURIComponent(q) + '*';
      const orClause =
        'or=(' +
        'username.ilike.' + pattern + ',' +
        'name.ilike.' + pattern + ',' +
        'role.ilike.' + pattern + ',' +
        'tagline.ilike.' + pattern + ',' +
        'services.ilike.' + pattern + ',' +
        'location.ilike.' + pattern +
        ')';
      url += '&' + orClause;
    }

    try {
      const res = await fetch(url, {
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + c.anonKey
        }
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error('searchDesks failed:', txt);
        return [];
      }
      return await res.json();
    } catch(e) {
      console.error(e);
      return [];
    }
  }

  /* ---------- GIGS ---------- */

  async function searchGigs(query, opts){
    if (!isReady()) return [];
    opts = opts || {};

    const c = cfg();
    let url = c.url + '/rest/v1/gigs' +
              '?select=id,user_id,desk_id,type,role,title,body,location,days,pay_min,pay_max,pay_unit,status,created_at,expires_at' +
              '&status=eq.open' +
              '&order=created_at.desc' +
              '&limit=40';

    if (opts.type === 'need' || opts.type === 'available') {
      url += '&type=eq.' + encodeURIComponent(opts.type);
    }

    if (opts.location) {
      url += '&location.ilike.*' + encodeURIComponent(opts.location) + '*';
    }

    if (query && query.trim()) {
      const q = query.trim();
      const pattern = '*' + encodeURIComponent(q) + '*';
      const orClause =
        'or=(' +
        'title.ilike.' + pattern + ',' +
        'role.ilike.' + pattern + ',' +
        'body.ilike.' + pattern + ',' +
        'location.ilike.' + pattern +
        ')';
      url += '&' + orClause;
    }

    try {
      const res = await fetch(url, {
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + c.anonKey
        }
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error('searchGigs failed:', txt);
        return [];
      }
      return await res.json();
    } catch(e) {
      console.error(e);
      return [];
    }
  }

  async function getGig(id){
    if (!isReady() || !id) return null;
    const c = cfg();
    const url = c.url + '/rest/v1/gigs?id=eq.' + encodeURIComponent(id) + '&select=*&limit=1';
    const res = await fetch(url, {
      headers: {
        'apikey': c.anonKey,
        'Authorization': 'Bearer ' + c.anonKey
      }
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] || null;
  }

  async function getMyGigs(){
    const user = currentUser();
    if (!user) return [];
    const c = cfg();
    const url = c.url + '/rest/v1/gigs?user_id=eq.' +
                encodeURIComponent(user.id) +
                '&select=*&order=created_at.desc';
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) return [];
    return await res.json();
  }

  async function createGig(data){
    if (!isReady()) throw new Error('Database not configured.');
    const user = currentUser();
    if (!user) throw new Error('You must be logged in.');

    const desk = await getMyDesk();
    if (!desk) throw new Error('You need a Desk before posting a gig.');

    const c = cfg();
    const payload = Object.assign({}, data, {
      user_id: user.id,
      desk_id: desk.id
    });

    const res = await fetch(c.url + '/rest/v1/gigs', {
      method: 'POST',
      headers: authHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Could not create the gig.');
    }
    const rows = await res.json();
    return rows[0];
  }

  async function updateGig(id, data){
    if (!isReady() || !id) throw new Error('Database not configured.');
    const c = cfg();
    const url = c.url + '/rest/v1/gigs?id=eq.' + encodeURIComponent(id);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: authHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Could not update the gig.');
    }
    const rows = await res.json();
    return rows[0];
  }

  async function deleteGig(id){
    if (!isReady() || !id) throw new Error('Database not configured.');
    const c = cfg();
    const url = c.url + '/rest/v1/gigs?id=eq.' + encodeURIComponent(id);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: authHeaders({ 'Prefer': 'return=minimal' })
    });
    if (!res.ok) throw new Error('Could not delete the gig.');
    return true;
  }

  async function reportGig(gigId, reason){
    if (!isReady() || !gigId) throw new Error('Database not configured.');
    const c = cfg();
    const key = getRaterKey();
    const res = await fetch(c.url + '/rest/v1/gig_reports', {
      method: 'POST',
      headers: {
        'apikey': c.anonKey,
        'Authorization': 'Bearer ' + c.anonKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        gig_id: gigId,
        reason: reason || null,
        reporter_key: key
      })
    });
    if (!res.ok) throw new Error('Could not submit the report.');
    return true;
  }

  /* ---------- WALL ---------- */

  const AUTHOR_KEY = 'fd_author_key';

  function getAuthorKey(){
    try {
      let key = localStorage.getItem(AUTHOR_KEY);
      if (key) return key;
      const bytes = new Uint8Array(16);
      if (window.crypto && crypto.getRandomValues) {
        crypto.getRandomValues(bytes);
      } else {
        for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
      }
      key = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(AUTHOR_KEY, key);
      return key;
    } catch(e) {
      return 'unknown-' + Date.now();
    }
  }

  async function uploadWallPhoto(blob, deskId){
    const c = cfg();
    if (!c.url || !c.anonKey) throw new Error('Storage is not connected.');

    const token = getSession()?.access_token || c.anonKey;
    const filename = 'wall-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
    const path = deskId + '/wall/' + filename;

    const url = c.url + '/storage/v1/object/desk-photos/' + path;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey':        c.anonKey,
        'Authorization': 'Bearer ' + token,
        'Content-Type':  'image/jpeg',
        'x-upsert':      'false'
      },
      body: blob
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Wall upload failed:', err);
      throw new Error('Could not upload the photo.');
    }

    return c.url + '/storage/v1/object/public/desk-photos/' + path;
  }

  async function getWallPosts(deskId){
    if (!isReady() || !deskId) return { posts: [], reactions: [] };
    const c = cfg();

    let posts = [];
    try {
      const url = c.url + '/rest/v1/desk_wall?desk_id=eq.' +
                  encodeURIComponent(deskId) +
                  '&select=id,author_name,body,author_key,posted_at,photo_url,pinned,reply_to' +
                  '&order=pinned.desc,posted_at.desc' +
                  '&limit=100';
      const res = await fetch(url, {
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + c.anonKey
        }
      });
      if (res.ok) posts = await res.json();
    } catch(e) { console.error(e); }

    let reactions = [];
    if (posts.length) {
      try {
        const ids = posts.map(p => p.id).join(',');
        const url = c.url + '/rest/v1/desk_wall_reactions?post_id=in.(' +
                    encodeURIComponent(ids) +
                    ')&select=post_id,emoji,reactor_key';
        const res = await fetch(url, {
          headers: {
            'apikey': c.anonKey,
            'Authorization': 'Bearer ' + c.anonKey
          }
        });
        if (res.ok) reactions = await res.json();
      } catch(e) { console.error(e); }
    }

    return { posts: posts || [], reactions: reactions || [] };
  }

  async function postToWallV2(deskId, opts){
    if (!isReady() || !deskId) throw new Error('Database not configured.');

    const body = String(opts.body || '').trim();
    const name = opts.name ? String(opts.name).trim().slice(0, 60) : null;
    const photoBlob = opts.photoBlob || null;
    const replyTo = opts.replyTo || null;

    if (!body && !photoBlob) throw new Error('Write something or attach a photo.');
    if (body.length > 500) throw new Error('Message is too long.');

    const c = cfg();
    const key = getAuthorKey();

    let photoUrl = null;
    if (photoBlob) {
      photoUrl = await uploadWallPhoto(photoBlob, deskId);
    }

    const payload = {
      desk_id: deskId,
      author_name: name,
      body: body ? body.slice(0, 500) : '',
      author_key: key,
      photo_url: photoUrl
    };
    if (replyTo) payload.reply_to = replyTo;

    const res = await fetch(c.url + '/rest/v1/desk_wall', {
      method: 'POST',
      headers: {
        'apikey': c.anonKey,
        'Authorization': 'Bearer ' + c.anonKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('postToWallV2 failed:', err);
      throw new Error('Could not post your message.');
    }
    const rows = await res.json();
    return rows[0];
  }

  async function getWall(deskId){
    if (!isReady() || !deskId) return [];
    const c = cfg();
    const url = c.url + '/rest/v1/desk_wall?desk_id=eq.' +
                encodeURIComponent(deskId) +
                '&select=id,author_name,body,author_key,posted_at,photo_url,pinned,reply_to' +
                '&order=pinned.desc,posted_at.desc&limit=100';
    try {
      const res = await fetch(url, {
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + c.anonKey
        }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch(e) {
      return [];
    }
  }

  async function postToWall(deskId, name, body){
    return postToWallV2(deskId, { name: name, body: body });
  }

  async function deleteWallPost(id){
    if (!isReady() || !id) throw new Error('Database not configured.');

    const c = cfg();
    const key = getAuthorKey();
    const token = getSession()?.access_token || c.anonKey;
    const url = c.url + '/rest/v1/desk_wall?id=eq.' + encodeURIComponent(id);

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': c.anonKey,
        'Authorization': 'Bearer ' + token,
        'x-author-key': key,
        'Prefer': 'return=minimal'
      }
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('deleteWallPost failed:', res.status, err);
      throw new Error('Could not delete that post.');
    }
    return true;
  }

  async function toggleReaction(postId, emoji){
    if (!isReady() || !postId || !emoji) throw new Error('Database not configured.');
    const c = cfg();
    const key = getAuthorKey();

    const checkUrl = c.url + '/rest/v1/desk_wall_reactions' +
                     '?post_id=eq.' + encodeURIComponent(postId) +
                     '&emoji=eq.' + encodeURIComponent(emoji) +
                     '&reactor_key=eq.' + encodeURIComponent(key);

    const checkRes = await fetch(checkUrl, {
      headers: {
        'apikey': c.anonKey,
        'Authorization': 'Bearer ' + c.anonKey
      }
    });
    const existing = await checkRes.json();

    if (existing && existing.length) {
      const delUrl = c.url + '/rest/v1/desk_wall_reactions?id=eq.' + encodeURIComponent(existing[0].id);
      await fetch(delUrl, {
        method: 'DELETE',
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + c.anonKey,
          'Prefer': 'return=minimal'
        }
      });
      return false;
    } else {
      const res = await fetch(c.url + '/rest/v1/desk_wall_reactions', {
        method: 'POST',
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + c.anonKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          post_id: postId,
          emoji: emoji,
          reactor_key: key
        })
      });
      if (!res.ok) throw new Error('Could not react.');
      return true;
    }
  }

  async function togglePin(postId, pinState){
    if (!isReady() || !postId) throw new Error('Database not configured.');
    const c = cfg();
    const url = c.url + '/rest/v1/desk_wall?id=eq.' + encodeURIComponent(postId);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: authHeaders({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify({ pinned: !!pinState })
    });
    if (!res.ok) throw new Error('Could not update pin.');
    return true;
  }

  /* ---------- CHAT ---------- */

  function orderPair(idA, idB){
    if (!idA || !idB) throw new Error('Two user IDs required.');
    if (idA === idB) throw new Error('Cannot chat with yourself.');
    return idA < idB ? [idA, idB] : [idB, idA];
  }

  async function isBlocked(userX, userY){
    if (!isReady() || !userX || !userY) return false;
    const c = cfg();
    const url = c.url + '/rest/v1/chat_blocks?or=(' +
                'and(blocker_id.eq.' + encodeURIComponent(userX) +
                ',blocked_id.eq.' + encodeURIComponent(userY) + '),' +
                'and(blocker_id.eq.' + encodeURIComponent(userY) +
                ',blocked_id.eq.' + encodeURIComponent(userX) + ')' +
                ')&select=id&limit=1';
    try {
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) return false;
      const rows = await res.json();
      return Array.isArray(rows) && rows.length > 0;
    } catch(e) {
      return false;
    }
  }

  async function uploadChatPhoto(blob, threadId){
    const c = cfg();
    if (!c.url || !c.anonKey) throw new Error('Storage not configured.');

    const session = getSession();
    const token = session?.access_token || c.anonKey;
    const filename = 'chat-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
    const path = 'chat/' + threadId + '/' + filename;

    const url = c.url + '/storage/v1/object/desk-photos/' + path;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey':        c.anonKey,
        'Authorization': 'Bearer ' + token,
        'Content-Type':  'image/jpeg',
        'x-upsert':      'false'
      },
      body: blob
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('uploadChatPhoto failed:', err);
      throw new Error('Could not upload the photo.');
    }

    return c.url + '/storage/v1/object/public/desk-photos/' + path;
  }

  async function getOrCreateThread(otherUserId, firstMessage){
    const me = currentUser();
    if (!me) throw new Error('You must be logged in.');
    if (!otherUserId) throw new Error('Missing recipient.');

    const [user_a, user_b] = orderPair(me.id, otherUserId);

    const c = cfg();
    const checkUrl = c.url + '/rest/v1/chat_threads' +
                     '?user_a=eq.' + encodeURIComponent(user_a) +
                     '&user_b=eq.' + encodeURIComponent(user_b) +
                     '&select=*&limit=1';

    const checkRes = await fetch(checkUrl, { headers: authHeaders() });
    if (!checkRes.ok) throw new Error('Could not check for existing thread.');
    const existing = await checkRes.json();

    if (existing && existing.length) {
      return existing[0];
    }

    const blocked = await isBlocked(me.id, otherUserId);
    if (blocked) {
      throw new Error('You cannot message this person.');
    }

    const createUrl = c.url + '/rest/v1/chat_threads';
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: authHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify({
        user_a: user_a,
        user_b: user_b,
        status: 'pending',
        initiated_by: me.id,
        last_message_at: new Date().toISOString()
      })
    });
    if (!createRes.ok) {
      const err = await createRes.text();
      console.error('createThread failed:', err);
      throw new Error('Could not start the conversation.');
    }
    const created = await createRes.json();
    const thread = created[0];

    if (firstMessage && firstMessage.trim()) {
      await sendChatMessage(thread.id, { body: firstMessage.trim() });
    }

    return thread;
  }

  async function startConversation(recipientId, firstMessage){
    const me = currentUser();
    if (!me) throw new Error('You must be logged in.');
    if (!recipientId) throw new Error('Missing recipient.');
    if (!firstMessage || !firstMessage.trim()) throw new Error('Write a message first.');

    const [user_a, user_b] = orderPair(me.id, recipientId);
    const c = cfg();

    const checkUrl = c.url + '/rest/v1/chat_threads' +
                     '?user_a=eq.' + encodeURIComponent(user_a) +
                     '&user_b=eq.' + encodeURIComponent(user_b) +
                     '&select=*&limit=1';

    const checkRes = await fetch(checkUrl, { headers: authHeaders() });
    if (!checkRes.ok) throw new Error('Could not check for existing thread.');
    const existing = await checkRes.json();

    if (existing && existing.length) {
      await sendChatMessage(existing[0].id, { body: firstMessage.trim() });
      return existing[0];
    }

    const blocked = await isBlocked(me.id, recipientId);
    if (blocked) {
      throw new Error('You cannot message this person.');
    }

    const createRes = await fetch(c.url + '/rest/v1/chat_threads', {
      method: 'POST',
      headers: authHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify({
        user_a: user_a,
        user_b: user_b,
        status: 'pending',
        initiated_by: me.id,
        last_message_at: new Date().toISOString()
      })
    });
    if (!createRes.ok) {
      const err = await createRes.text();
      console.error('createThread failed:', err);
      throw new Error('Could not start the conversation.');
    }
    const created = await createRes.json();
    const thread = created[0];

    await sendChatMessage(thread.id, { body: firstMessage.trim() });

    return thread;
  }

  async function sendChatMessage(threadId, opts){
    if (!isReady() || !threadId) throw new Error('Database not configured.');
    const me = currentUser();
    if (!me) throw new Error('You must be logged in.');

    const body = (opts && opts.body ? String(opts.body).trim() : '');
    const photoBlob = (opts && opts.photoBlob) || null;

    if (!body && !photoBlob) throw new Error('Nothing to send.');

    const c = cfg();

    let photoUrl = null;
    if (photoBlob) {
      photoUrl = await uploadChatPhoto(photoBlob, threadId);
    }

    const payload = {
      thread_id: threadId,
      sender_id: me.id,
      body: body ? body.slice(0, 2000) : null,
      photo_url: photoUrl
    };

    const res = await fetch(c.url + '/rest/v1/chat_messages', {
      method: 'POST',
      headers: authHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('sendChatMessage failed:', err);
      throw new Error('Could not send message.');
    }

    await fetch(c.url + '/rest/v1/chat_threads?id=eq.' + encodeURIComponent(threadId), {
      method: 'PATCH',
      headers: authHeaders({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify({ last_message_at: new Date().toISOString() })
    });

    const rows = await res.json();
    return rows[0];
  }

  async function sendChatMessageWithReply(threadId, opts){
    if (!isReady() || !threadId) throw new Error('Database not configured.');
    const me = currentUser();
    if (!me) throw new Error('You must be logged in.');

    const body = (opts && opts.body ? String(opts.body).trim() : '');
    const photoBlob = (opts && opts.photoBlob) || null;
    const replyToId = (opts && opts.replyToId) || null;

    if (!body && !photoBlob) throw new Error('Nothing to send.');

    const c = cfg();

    let photoUrl = null;
    if (photoBlob) {
      photoUrl = await uploadChatPhoto(photoBlob, threadId);
    }

    const payload = {
      thread_id: threadId,
      sender_id: me.id,
      body: body ? body.slice(0, 2000) : null,
      photo_url: photoUrl,
      reply_to_id: replyToId
    };

    const res = await fetch(c.url + '/rest/v1/chat_messages', {
      method: 'POST',
      headers: authHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('sendChatMessageWithReply failed:', err);
      throw new Error('Could not send message.');
    }

    await fetch(c.url + '/rest/v1/chat_threads?id=eq.' + encodeURIComponent(threadId), {
      method: 'PATCH',
      headers: authHeaders({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify({ last_message_at: new Date().toISOString() })
    });

    const rows = await res.json();
    return rows[0];
  }

  async function getThread(threadId){
    if (!isReady() || !threadId) return null;
    const me = currentUser();
    if (!me) return null;

    const c = cfg();
    const url = c.url + '/rest/v1/chat_threads?id=eq.' +
                encodeURIComponent(threadId) + '&select=*&limit=1';
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) return null;
    const rows = await res.json();
    const thread = rows[0];
    if (!thread) return null;

    if (thread.user_a !== me.id && thread.user_b !== me.id) return null;

    const otherId = thread.user_a === me.id ? thread.user_b : thread.user_a;
    return { thread, otherId };
  }

  async function getChatMessages(threadId){
    if (!isReady() || !threadId) return [];
    const c = cfg();
    const url = c.url + '/rest/v1/chat_messages?thread_id=eq.' +
                encodeURIComponent(threadId) +
                '&select=id,sender_id,body,photo_url,read_at,created_at' +
                '&order=created_at.asc&limit=200';
    try {
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch(e) {
      return [];
    }
  }

  async function getChatMessagesWithMeta(threadId){
    if (!isReady() || !threadId) return [];
    const c = cfg();
    const me = currentUser();
    if (!me) return [];

    const url = c.url + '/rest/v1/chat_messages?thread_id=eq.' +
                encodeURIComponent(threadId) +
                '&select=id,sender_id,body,photo_url,read_at,created_at,reply_to_id,deleted_at,deleted_by,deleted_for' +
                '&order=created_at.asc&limit=200';

    let messages = [];
    try {
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) return [];
      messages = await res.json();
    } catch(e) {
      return [];
    }

    if (!messages.length) return [];

    messages = messages.filter(m => {
      const hidden = Array.isArray(m.deleted_for) && m.deleted_for.indexOf(me.id) !== -1;
      return !hidden;
    });

    if (!messages.length) return [];

    const ids = messages.map(m => m.id);
    let reactions = [];
    try {
      const rurl = c.url + '/rest/v1/chat_reactions?message_id=in.(' +
                   encodeURIComponent(ids.join(',')) +
                   ')&select=id,message_id,user_id,emoji';
      const rres = await fetch(rurl, { headers: authHeaders() });
      if (rres.ok) {
        const parsed = await rres.json();
        if (Array.isArray(parsed)) reactions = parsed;
      }
    } catch(e) { /* silent */ }

    const reactionMap = {};
    for (const r of (reactions || [])) {
      if (!reactionMap[r.message_id]) reactionMap[r.message_id] = [];
      reactionMap[r.message_id].push(r);
    }

    const msgById = {};
    for (const m of messages) msgById[m.id] = m;

    for (const m of messages) {
      m.reactions = reactionMap[m.id] || [];
      if (m.deleted_at) {
        m.body = null;
        m.photo_url = null;
      }
      if (m.reply_to_id && msgById[m.reply_to_id]) {
        const orig = msgById[m.reply_to_id];
        m.reply_to = {
          id: orig.id,
          sender_id: orig.sender_id,
          body: orig.deleted_at ? null : orig.body,
          photo_url: orig.deleted_at ? null : orig.photo_url,
          deleted: !!orig.deleted_at
        };
      } else {
        m.reply_to = null;
      }
    }

    return messages;
  }

  async function toggleChatReaction(messageId, emoji){
    if (!isReady() || !messageId || !emoji) throw new Error('Database not configured.');
    const me = currentUser();
    if (!me) throw new Error('You must be logged in.');

    const allowed = ['heart', 'thumbsup', 'fire', 'wow', 'pray', 'like'];
    if (!allowed.includes(emoji)) throw new Error('Invalid reaction.');

    const c = cfg();

    const checkUrl = c.url + '/rest/v1/chat_reactions' +
                     '?message_id=eq.' + encodeURIComponent(messageId) +
                     '&user_id=eq.' + encodeURIComponent(me.id) +
                     '&emoji=eq.' + encodeURIComponent(emoji) +
                     '&select=id&limit=1';

    const checkRes = await fetch(checkUrl, { headers: authHeaders() });
    if (!checkRes.ok) throw new Error('Could not check reaction.');
    const existing = await checkRes.json();

    if (existing && existing.length) {
      const delUrl = c.url + '/rest/v1/chat_reactions?id=eq.' + encodeURIComponent(existing[0].id);
      const delRes = await fetch(delUrl, {
        method: 'DELETE',
        headers: authHeaders({ 'Prefer': 'return=minimal' })
      });
      if (!delRes.ok) throw new Error('Could not remove reaction.');
      return false;
    }

    const addRes = await fetch(c.url + '/rest/v1/chat_reactions', {
      method: 'POST',
      headers: authHeaders({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify({
        message_id: messageId,
        user_id: me.id,
        emoji: emoji
      })
    });
    if (!addRes.ok) {
      const err = await addRes.text();
      console.error('toggleChatReaction failed:', err);
      throw new Error('Could not react.');
    }
    return true;
  }

  async function hideMessageForMe(messageId){
    if (!isReady() || !messageId) throw new Error('Database not configured.');
    const c = cfg();

    const res = await fetch(c.url + '/rest/v1/rpc/hide_message_for_me', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ msg_id: messageId })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('hideMessageForMe failed:', err);
      throw new Error('Could not hide message.');
    }
    return true;
  }

  async function deleteMessageForEveryone(messageId){
    if (!isReady() || !messageId) throw new Error('Database not configured.');
    const c = cfg();

    const res = await fetch(c.url + '/rest/v1/rpc/delete_message_for_everyone', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ msg_id: messageId })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('deleteMessageForEveryone failed:', err);

      try {
        const parsed = JSON.parse(err);
        if (parsed.message && parsed.message.indexOf('Too late') !== -1) {
          throw new Error('Too late to delete for everyone (24h limit).');
        }
        if (parsed.message && parsed.message.indexOf('Only the sender') !== -1) {
          throw new Error('You can only delete your own messages for everyone.');
        }
      } catch(e) {
        if (e.message && e.message.indexOf('Too late') !== -1) throw e;
        if (e.message && e.message.indexOf('Only the sender') !== -1) throw e;
      }

      throw new Error('Could not delete for everyone.');
    }
    return true;
  }

  async function getMyThreads(){
    const me = currentUser();
    if (!me) return { accepted: [], pending: [], declined: [] };

    const c = cfg();
    const url = c.url + '/rest/v1/chat_threads' +
                '?or=(user_a.eq.' + encodeURIComponent(me.id) +
                ',user_b.eq.' + encodeURIComponent(me.id) + ')' +
                '&select=id,user_a,user_b,status,initiated_by,last_message_at,created_at,archived_at' +
                '&order=last_message_at.desc&limit=100';

    try {
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) return { accepted: [], pending: [], declined: [] };
      const all = await res.json();

      const accepted = [];
      const pending = [];
      const declined = [];

      for (const t of (all || [])) {
        if (t.status === 'accepted') accepted.push(t);
        else if (t.status === 'pending') pending.push(t);
        else if (t.status === 'declined') declined.push(t);
      }

      return { accepted, pending, declined };
    } catch(e) {
      console.error('getMyThreads failed:', e);
      return { accepted: [], pending: [], declined: [] };
    }
  }

  async function getLastMessages(threadIds){
    if (!threadIds || !threadIds.length) return {};
    const c = cfg();
    const ids = threadIds.join(',');
    const url = c.url + '/rest/v1/chat_messages' +
                '?thread_id=in.(' + encodeURIComponent(ids) + ')' +
                '&select=thread_id,sender_id,body,photo_url,created_at' +
                '&order=created_at.desc&limit=500';

    try {
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) return {};
      const rows = await res.json();

      const map = {};
      for (const r of (rows || [])) {
        if (!map[r.thread_id]) map[r.thread_id] = r;
      }
      return map;
    } catch(e) {
      return {};
    }
  }

  async function getUnreadPerThread(threadIds){
    if (!isReady() || !threadIds || !threadIds.length) return {};
    const me = currentUser();
    if (!me) return {};

    const c = cfg();
    const ids = threadIds.join(',');
    const url = c.url + '/rest/v1/chat_messages' +
                '?thread_id=in.(' + encodeURIComponent(ids) + ')' +
                '&sender_id=neq.' + encodeURIComponent(me.id) +
                '&read_at=is.null' +
                '&select=thread_id&limit=1000';

    try {
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) return {};
      const rows = await res.json();

      const map = {};
      for (const r of (rows || [])) {
        map[r.thread_id] = (map[r.thread_id] || 0) + 1;
      }
      return map;
    } catch(e) {
      return {};
    }
  }

  async function getUnreadCount(){
    const me = currentUser();
    if (!me) return 0;

    const c = cfg();
    const url = c.url + '/rest/v1/chat_messages' +
                '?sender_id=neq.' + encodeURIComponent(me.id) +
                '&read_at=is.null' +
                '&select=id&limit=500';

    try {
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) return 0;
      const rows = await res.json();
      return (rows || []).length;
    } catch(e) {
      return 0;
    }
  }

  async function markThreadRead(threadId){
    if (!isReady() || !threadId) return false;
    const me = currentUser();
    if (!me) return false;

    const c = cfg();
    const url = c.url + '/rest/v1/chat_messages' +
                '?thread_id=eq.' + encodeURIComponent(threadId) +
                '&sender_id=neq.' + encodeURIComponent(me.id) +
                '&read_at=is.null';

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: authHeaders({ 'Prefer': 'return=minimal' }),
        body: JSON.stringify({ read_at: new Date().toISOString() })
      });
      return res.ok;
    } catch(e) {
      return false;
    }
  }

  async function acceptThread(threadId){
    const me = currentUser();
    if (!me) throw new Error('Not logged in.');

    const c = cfg();
    const url = c.url + '/rest/v1/chat_threads?id=eq.' + encodeURIComponent(threadId);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: authHeaders({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify({ status: 'accepted' })
    });
    if (!res.ok) throw new Error('Could not accept.');
    return true;
  }

  async function declineThread(threadId){
    const me = currentUser();
    if (!me) throw new Error('Not logged in.');

    const c = cfg();
    const url = c.url + '/rest/v1/chat_threads?id=eq.' + encodeURIComponent(threadId);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: authHeaders({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify({ status: 'declined' })
    });
    if (!res.ok) throw new Error('Could not decline.');
    return true;
  }

  async function archiveThread(threadId, archived){
    const me = currentUser();
    if (!me) throw new Error('Not logged in.');
    if (!threadId) throw new Error('Missing thread.');

    const c = cfg();
    const url = c.url + '/rest/v1/chat_threads?id=eq.' + encodeURIComponent(threadId);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: authHeaders({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify({
        archived_at: archived ? new Date().toISOString() : null
      })
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('archiveThread failed:', err);
      throw new Error('Could not ' + (archived ? 'archive' : 'unarchive') + '.');
    }
    return true;
  }

  async function deleteThread(threadId){
    const me = currentUser();
    if (!me) throw new Error('Not logged in.');
    if (!threadId) throw new Error('Missing thread.');

    const c = cfg();

    await fetch(c.url + '/rest/v1/chat_messages?thread_id=eq.' + encodeURIComponent(threadId), {
      method: 'DELETE',
      headers: authHeaders({ 'Prefer': 'return=minimal' })
    });

    const res = await fetch(c.url + '/rest/v1/chat_threads?id=eq.' + encodeURIComponent(threadId), {
      method: 'DELETE',
      headers: authHeaders({ 'Prefer': 'return=minimal' })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('deleteThread failed:', err);
      throw new Error('Could not delete this conversation.');
    }
    return true;
  }

  /* ---------- PRESENCE ---------- */

  async function updateLastSeen(){
    const me = currentUser();
    if (!me) return false;

    const c = cfg();
    const url = c.url + '/rest/v1/desks?user_id=eq.' + encodeURIComponent(me.id);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: authHeaders({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify({ last_seen_at: new Date().toISOString() })
    });
    return res.ok;
  }

  async function getPresence(userId){
    if (!isReady() || !userId) return null;
    const c = cfg();
    const url = c.url + '/rest/v1/desks?user_id=eq.' +
                encodeURIComponent(userId) +
                '&select=last_seen_at,presence_privacy&limit=1';
    try {
      const res = await fetch(url, {
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + c.anonKey
        }
      });
      if (!res.ok) return null;
      const rows = await res.json();
      return rows[0] || null;
    } catch(e) {
      return null;
    }
  }

  async function setPresencePrivacy(level){
    const me = currentUser();
    if (!me) throw new Error('Not logged in.');

    const allowed = ['everyone', 'contacts', 'nobody'];
    if (!allowed.includes(level)) throw new Error('Invalid privacy level.');

    const c = cfg();
    const url = c.url + '/rest/v1/desks?user_id=eq.' + encodeURIComponent(me.id);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: authHeaders({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify({ presence_privacy: level })
    });
    if (!res.ok) throw new Error('Could not update privacy.');
    return true;
  }

  async function blockUser(blockedId){
    const me = currentUser();
    if (!me) throw new Error('Not logged in.');
    if (me.id === blockedId) throw new Error('You cannot block yourself.');

    const c = cfg();

    const blockRes = await fetch(c.url + '/rest/v1/chat_blocks', {
      method: 'POST',
      headers: authHeaders({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify({
        blocker_id: me.id,
        blocked_id: blockedId
      })
    });
    if (!blockRes.ok && blockRes.status !== 409) {
      throw new Error('Could not block.');
    }

    const [a, b] = orderPair(me.id, blockedId);
    await fetch(c.url + '/rest/v1/chat_threads' +
                '?user_a=eq.' + encodeURIComponent(a) +
                '&user_b=eq.' + encodeURIComponent(b), {
      method: 'PATCH',
      headers: authHeaders({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify({ status: 'blocked' })
    });

    return true;
  }

  async function unblockUser(blockedId){
    const me = currentUser();
    if (!me) throw new Error('Not logged in.');

    const c = cfg();
    const url = c.url + '/rest/v1/chat_blocks' +
                '?blocker_id=eq.' + encodeURIComponent(me.id) +
                '&blocked_id=eq.' + encodeURIComponent(blockedId);

    const res = await fetch(url, {
      method: 'DELETE',
      headers: authHeaders({ 'Prefer': 'return=minimal' })
    });
    return res.ok;
  }

  async function getMyBlocks(){
    const me = currentUser();
    if (!me) return [];

    const c = cfg();
    const url = c.url + '/rest/v1/chat_blocks' +
                '?blocker_id=eq.' + encodeURIComponent(me.id) +
                '&select=id,blocked_id,created_at' +
                '&order=created_at.desc';
    try {
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch(e) {
      return [];
    }
  }

  async function reportUser(reportedId, reason, threadId){
    const me = currentUser();
    if (!me) throw new Error('Not logged in.');
    if (me.id === reportedId) throw new Error('You cannot report yourself.');

    const c = cfg();
    const payload = {
      reporter_id: me.id,
      reported_id: reportedId,
      reason: String(reason || 'No reason given').slice(0, 500)
    };
    if (threadId) payload.thread_id = threadId;

    const res = await fetch(c.url + '/rest/v1/chat_reports', {
      method: 'POST',
      headers: authHeaders({ 'Prefer': 'return=minimal' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Could not send report.');
    return true;
  }

  async function getPublicUser(userId){
    if (!isReady() || !userId) return null;
    const c = cfg();
    const url = c.url + '/rest/v1/desks?user_id=eq.' +
                encodeURIComponent(userId) +
                '&select=id,user_id,username,name,initials,avatar_url,role,last_seen_at,presence_privacy' +
                '&limit=1';
    try {
      const res = await fetch(url, {
        headers: {
          'apikey': c.anonKey,
          'Authorization': 'Bearer ' + c.anonKey
        }
      });
      if (!res.ok) return null;
      const rows = await res.json();
      return rows[0] || null;
    } catch(e) {
      return null;
    }
  }

  /* ---------- CHAT · REALTIME ---------- */

  function realtimeWsUrl(){
    const c = cfg();
    return c.url
      .replace('https://', 'wss://')
      .replace('http://', 'ws://') +
      '/realtime/v1/websocket?apikey=' + encodeURIComponent(c.anonKey) +
      '&vsn=1.0.0';
  }

  function subscribeToThreadMessages(threadId, onMessage){
    if (!isReady() || !threadId || typeof onMessage !== 'function') return null;

    let ws;
    let heartbeat;

    try {
      ws = new WebSocket(realtimeWsUrl());
    } catch(e) {
      console.error('WebSocket connect failed:', e);
      return null;
    }

    ws.onopen = () => {
      ws.send(JSON.stringify({
        topic: 'realtime:public:chat_messages',
        event: 'phx_join',
        payload: {
          config: {
            broadcast: { self: false },
            presence: { key: '' },
            postgres_changes: [
              {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: 'thread_id=eq.' + threadId
              }
            ]
          }
        },
        ref: '1'
      }));

      heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            topic: 'phoenix',
            event: 'heartbeat',
            payload: {},
            ref: 'hb'
          }));
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === 'postgres_changes' && msg.payload && msg.payload.data) {
          const record = msg.payload.data.record;
          if (record) onMessage(record);
        }
      } catch(e) { /* ignore */ }
    };

    ws.onerror = (err) => {
      console.error('Realtime error:', err);
    };

    ws.onclose = () => {
      if (heartbeat) clearInterval(heartbeat);
    };

    return function unsubscribe(){
      if (heartbeat) clearInterval(heartbeat);
      try { ws.close(); } catch(e) {}
    };
  }

  function subscribeToMyThreads(onChange){
    if (!isReady() || typeof onChange !== 'function') return null;
    const me = currentUser();
    if (!me) return null;

    let ws;
    let heartbeat;
    const myId = me.id;

    try {
      ws = new WebSocket(realtimeWsUrl());
    } catch(e) {
      console.error('WebSocket connect failed:', e);
      return null;
    }

    ws.onopen = () => {
      ws.send(JSON.stringify({
        topic: 'realtime:public:chat_threads',
        event: 'phx_join',
        payload: {
          config: {
            broadcast: { self: false },
            presence: { key: '' },
            postgres_changes: [
              { event: '*', schema: 'public', table: 'chat_threads' }
            ]
          }
        },
        ref: '1'
      }));

      heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            topic: 'phoenix',
            event: 'heartbeat',
            payload: {},
            ref: 'hb'
          }));
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === 'postgres_changes' && msg.payload && msg.payload.data) {
          const record = msg.payload.data.record || msg.payload.data.old_record;
          if (record && (record.user_a === myId || record.user_b === myId)) {
            onChange(record);
          }
        }
      } catch(e) { /* ignore */ }
    };

    ws.onerror = (err) => {
      console.error('Realtime error:', err);
    };

    ws.onclose = () => {
      if (heartbeat) clearInterval(heartbeat);
    };

    return function unsubscribe(){
      if (heartbeat) clearInterval(heartbeat);
      try { ws.close(); } catch(e) {}
    };
  }

  /* ---------- DELETE ACCOUNT ---------- */

  async function deleteMyDesk(deskId){
    if (!isReady() || !deskId) throw new Error('Database not configured.');
    const c = cfg();
    const url = c.url + '/rest/v1/desks?id=eq.' + encodeURIComponent(deskId);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: authHeaders({ 'Prefer': 'return=minimal' })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error('Could not delete your Desk.');
    }
    return true;
  }

  async function freeUpEmail(){
    const c = cfg();
    const session = getSession();
    if (!session?.access_token) return false;

    const random = Math.random().toString(36).slice(2, 10);
    const deletedEmail = 'deleted-' + Date.now() + '-' + random + '@deskly.local';

    const res = await fetch(c.url + '/auth/v1/user', {
      method: 'PUT',
      headers: {
        'apikey': c.anonKey,
        'Authorization': 'Bearer ' + session.access_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: deletedEmail })
    });
    return res.ok;
  }

  /* ============================================================
     VALIDATORS
     ============================================================ */

  function normalizeNGNumber(input){
    if (!input) return null;
    let digits = String(input).replace(/[^\d]/g,'');
    if (digits.startsWith('234')) {
      /* ok */
    } else if (digits.startsWith('0')) {
      digits = '234' + digits.slice(1);
    } else {
      return null;
    }
    if (!/^234\d{10}$/.test(digits)) return null;
    const prefix = digits.slice(3, 6);
    const validPrefixes = ['700','701','702','703','704','705','706','707','708','709',
                           '802','803','805','806','807','808','809',
                           '810','811','812','813','814','815','816','817','818','819',
                           '902','903','905','906','907','908','909',
                           '910','911','912','913','914','915','916','917','918','919'];
    if (!validPrefixes.includes(prefix)) return null;
    return digits;
  }

  function isValidEmail(input){
    if (!input) return false;
    const s = String(input).trim();
    if (s.length > 254) return false;
    if (s.includes(' ')) return false;
    if (s.includes('..')) return false;
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(s);
  }

  function formatNGNumber(input){
    const n = normalizeNGNumber(input);
    if (!n) return input || '';
    return '+' + n.slice(0,3) + ' ' + n.slice(3,6) + ' ' + n.slice(6,9) + ' ' + n.slice(9);
  }

  return {
    get ready(){ return isReady(); },
    signUp, logIn, logOut, currentUser, getSession,
    refreshSession, tokenExpiringSoon,
    persistLogin, loginStillFresh, clearPersist,
    knownAccounts, rememberAccount, forgetAccount, forgetAllAccounts,
    getDesk, getDeskById, getMyDesk, createDesk, updateDesk, usernameTaken,
    recoverPassword, updatePassword,
    recordVisit, getMyVisits,
    recordUnanswered, getUnanswered, deleteUnanswered,
    addRating, getDeskRating, getMyRating, saveMyRating, getRaterKey,
    submitReview, deleteReview, getReviews, replyToReview, deleteReviewAsOwner,
    markWhatsAppTap, hasTappedWhatsApp,
    searchDesks,
    searchGigs, getGig, getMyGigs, createGig, updateGig, deleteGig, reportGig,
    getWall, postToWall, deleteWallPost, getAuthorKey,
    getWallPosts, postToWallV2, uploadWallPhoto, toggleReaction, togglePin,
    getOrCreateThread, startConversation, sendChatMessage, sendChatMessageWithReply,
    uploadChatPhoto,
    getThread, getChatMessages, getChatMessagesWithMeta, getMyThreads, getLastMessages,
    toggleChatReaction,
    hideMessageForMe, deleteMessageForEveryone,
    getUnreadCount, getUnreadPerThread, markThreadRead, acceptThread, declineThread,
    archiveThread, deleteThread,
    updateLastSeen, getPresence, setPresencePrivacy,
    blockUser, unblockUser, getMyBlocks, reportUser, isBlocked,
    getPublicUser,
    subscribeToThreadMessages, subscribeToMyThreads,
    deleteMyDesk, freeUpEmail,
    normalizeNGNumber, isValidEmail, formatNGNumber
  };

})();
