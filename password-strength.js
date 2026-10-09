/* ============================================================
   DESKLY · PASSWORD STRENGTH
   Softer rules. Still safe. Uses HIBP silently.
   ============================================================ */

window.PASSWORD = (function(){

  const MIN_LENGTH = 8;

  /* ---- Rule checks ---- */

  function isLongEnough(pw){
    return pw.length >= MIN_LENGTH;
  }

  function hasLetter(pw){
    return /[a-zA-Z]/.test(pw);
  }

  function hasNumber(pw){
    return /[0-9]/.test(pw);
  }

  /* Common patterns we refuse outright (short, guessable) */
  function isCommon(pw){
    const lower = String(pw).toLowerCase();
    const common = [
      'password', 'password1', 'password123',
      '12345678', '123456789', '1234567890',
      'qwertyui', 'qwerty123', 'iloveyou',
      'admin123', 'welcome1', 'letmein1',
      'abcd1234', 'passw0rd', 'football1'
    ];
    if (common.indexOf(lower) !== -1) return true;

    /* Same character repeated 4+ times */
    if (/(.)\1{3,}/.test(pw)) return true;

    /* Sequential digits or letters 6+ long */
    if (/(?:012345|123456|234567|345678|456789|567890|abcdef|bcdefg|cdefgh)/i.test(pw)) return true;

    return false;
  }

  /* Return { ok, errors[] } */
  function validate(pw){
    const errors = [];
    const s = String(pw || '');

    if (!s) {
      errors.push('Please enter a password.');
      return { ok: false, errors };
    }

    if (!isLongEnough(s)) {
      errors.push('Use at least 8 characters.');
    }

    if (isCommon(s)) {
      errors.push('That password is too easy to guess. Try another.');
    }

    return { ok: errors.length === 0, errors };
  }

  /* ---- Strength score 0..4 ---- */

  function score(pw){
    if (!pw) return 0;
    const s = String(pw);
    let n = 0;

    /* Length tiers */
    if (s.length >= 8)  n++;
    if (s.length >= 12) n++;

    /* Variety: any two of letters, numbers, symbols */
    let variety = 0;
    if (/[a-zA-Z]/.test(s)) variety++;
    if (/[0-9]/.test(s))    variety++;
    if (/[^a-zA-Z0-9]/.test(s)) variety++;
    if (variety >= 2) n++;

    /* Bonus for 16+ */
    if (s.length >= 16) n++;

    return Math.min(n, 4);
  }

  function label(s){
    if (s === 0) return '';
    if (s === 1) return 'Getting there';
    if (s === 2) return 'Fair';
    if (s === 3) return 'Good';
    return 'Strong';
  }

  function isGoodEnough(pw){
    return validate(pw).ok && score(pw) >= 2;
  }

  /* ---- Breach check via HaveIBeenPwned ---- */

  async function sha1Hex(str){
    const buf = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-1', buf);
    const bytes = Array.from(new Uint8Array(hash));
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  async function isBreached(pw){
    try {
      const hash = await sha1Hex(pw);
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);

      const res = await fetch('https://api.pwnedpasswords.com/range/' + prefix);
      if (!res.ok) return false;

      const text = await res.text();
      const lines = text.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(':');
        if (parts[0] === suffix) {
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  return { validate, score, label, isGoodEnough, isBreached, MIN_LENGTH };

})();