/* ============================================================
   DESKLY · RATE LIMIT (client-side, soft)
   Tracks failed attempts per action and blocks after a limit.
   This is a UX layer, not real security — Supabase also
   rate-limits on the server side.
   ============================================================ */

window.RATE = (function(){

  const STORAGE_KEY = 'fd_rate';
  const WINDOW_MS   = 15 * 60 * 1000;   // rolling window: 15 min

  const LIMITS = {
    login:  { max: 5, blockMs: 5  * 60 * 1000 },
    signup: { max: 8, blockMs: 5  * 60 * 1000 },
    forgot: { max: 3, blockMs: 15 * 60 * 1000 }
  };

  function read(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch(e) { return {}; }
  }

  function write(data){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch(e) {}
  }

  function cleanup(entry){
    const now = Date.now();
    if (!entry) return { attempts: [], blockedUntil: 0 };
    entry.attempts = (entry.attempts || []).filter(t => now - t < WINDOW_MS);
    if (entry.blockedUntil && entry.blockedUntil < now) entry.blockedUntil = 0;
    return entry;
  }

  function getEntry(action){
    const data = read();
    return cleanup(data[action]);
  }

  function setEntry(action, entry){
    const data = read();
    data[action] = entry;
    write(data);
  }

  /* Returns:
       { blocked, secondsLeft, remaining, warn }
       - blocked: true if currently locked out
       - secondsLeft: how long the block lasts (only if blocked)
       - remaining: attempts remaining before block
       - warn: true if 1 or 2 tries left
  */
  function check(action){
    const limit = LIMITS[action];
    if (!limit) return { blocked: false, remaining: 999, warn: false };

    const entry = getEntry(action);
    const now = Date.now();

    if (entry.blockedUntil && entry.blockedUntil > now) {
      return {
        blocked: true,
        secondsLeft: Math.ceil((entry.blockedUntil - now) / 1000),
        remaining: 0,
        warn: false
      };
    }

    const used = entry.attempts.length;
    const remaining = Math.max(0, limit.max - used);

    return {
      blocked: false,
      secondsLeft: 0,
      remaining: remaining,
      warn: remaining > 0 && remaining <= 2
    };
  }

  /* Record a failure. Returns the new state. */
  function record(action){
    const limit = LIMITS[action];
    if (!limit) return;

    const entry = getEntry(action);
    const now = Date.now();

    entry.attempts.push(now);

    if (entry.attempts.length >= limit.max) {
      entry.blockedUntil = now + limit.blockMs;
      entry.attempts = [];
    }

    setEntry(action, entry);
    return check(action);
  }

  /* Clear all attempts for an action (used on success). */
  function reset(action){
    const data = read();
    delete data[action];
    write(data);
  }

  /* Format seconds as "4 minutes" or "45 seconds" */
  function prettyTime(seconds){
    if (seconds >= 120) return Math.ceil(seconds / 60) + ' minutes';
    if (seconds >= 60)  return '1 minute';
    return seconds + ' seconds';
  }

  return { check, record, reset, prettyTime };

})();