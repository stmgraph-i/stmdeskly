/* ============================================================
   DESKLY · SEARCH PARSER
   Turns "photographer lagos under 50k" into structured filters.
   No AI. Just pattern matching on common Nigerian English.
   ============================================================ */

window.SEARCH_PARSER = (function(){

  const LOCATIONS = [
    // Nigeria — states & cities
    'lagos','abuja','kano','ibadan','port harcourt','benin','kaduna','maiduguri',
    'zaria','aba','jos','ilorin','enugu','onitsha','warri','abeokuta','akure',
    'owerri','uyo','calabar','sokoto','katsina','gombe','bauchi','makurdi',
    'minna','osogbo','ado ekiti','yenagoa','jalingo','lafia','asaba','awka',
    'umuahia','damaturu','birnin kebbi','dutse','gusau','lokoja',

    // Lagos & Abuja neighbourhoods
    'lekki','ikeja','yaba','surulere','ajah','ikoyi','victoria island','vi',
    'oshodi','ikorodu','apapa','festac','magodo','gbagada','maryland','agege',
    'alimosho','badagry','epe','ikoyi','ikeja','ikeja along','ogba','ojota',
    'ojodu','palmgrove','pen cinema','somolu','ketu','mile 12','ojuelegba',
    'ebute metta','isolo','amukoko','ajegunle','mushin','idimu','ipaja',

    // Abuja neighbourhoods
    'wuse','garki','maitama','asokoro','gwarinpa','jabi','utako','life camp',
    'kubwa','lugbe','karu','nyanya','wuye','gudu','apo','dutse'
  ];

  const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday',
                'mon','tue','tues','wed','thu','thur','thurs','fri','sat','sun',
                'weekend','weekends','weekday','weekdays'];

  /* Money pattern: "under 50k", "below ₦100,000", "less than 20k" */
  const MONEY_PATTERNS = [
    /(?:under|below|less than|within|max|maximum|up to)\s*[₦N]?\s*(\d[\d,]*)\s*k?/i,
    /[₦N]\s*(\d[\d,]*)\s*k?/i
  ];

  /* Intent keywords */
  const INTENT_NEED    = /\b(need|hire|hiring|looking for|want|searching for|find me|i need|in need of)\b/;
  const INTENT_AVAIL   = /\b(available|i am|i'm|am a|i do|offer|providing)\b/;

  function norm(s){
    return String(s || '')
      .toLowerCase()
      .replace(/[^\w\s₦]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function extractLocation(text){
    const t = norm(text);
    /* Longest match first so "victoria island" beats "vi" and "port harcourt" beats "ph" */
    const sorted = LOCATIONS.slice().sort((a,b) => b.length - a.length);
    for (const loc of sorted) {
      const re = new RegExp('\\b' + loc.replace(/ /g,'\\s+') + '\\b');
      if (re.test(t)) return loc;
    }
    return null;
  }

  function extractDay(text){
    const t = norm(text);
    for (const d of DAYS) {
      const re = new RegExp('\\b' + d + '\\b');
      if (re.test(t)) {
        /* Normalize abbreviations */
        if (d === 'mon') return 'monday';
        if (d === 'tue' || d === 'tues') return 'tuesday';
        if (d === 'wed') return 'wednesday';
        if (d === 'thu' || d === 'thur' || d === 'thurs') return 'thursday';
        if (d === 'fri') return 'friday';
        if (d === 'sat') return 'saturday';
        if (d === 'sun') return 'sunday';
        return d;
      }
    }
    return null;
  }

  function extractMaxPrice(text){
    const raw = String(text || '');
    for (const re of MONEY_PATTERNS) {
      const m = raw.match(re);
      if (m) {
        let n = parseInt(m[1].replace(/,/g,''), 10);
        if (!isNaN(n)) {
          /* "50k" pattern — if there's a k right after, multiply */
          const after = raw.slice(m.index + m[0].length, m.index + m[0].length + 1);
          const before = m[0];
          if (/k$/i.test(before.trim()) || after.toLowerCase() === 'k') {
            n *= 1000;
          }
          /* If value looks tiny (like 50), assume they meant 50k */
          if (n > 0 && n < 1000) n *= 1000;
          return n;
        }
      }
    }
    return null;
  }

  function extractIntent(text){
    const t = norm(text);
    if (INTENT_NEED.test(t)) return 'gigs';
    if (INTENT_AVAIL.test(t)) return 'desks';
    return 'all';
  }

  /* Remove parsed tokens from the query to leave the "search term" */
  function extractSearchTerm(text, parsed){
    let t = norm(text);

    /* Strip location */
    if (parsed.location) {
      t = t.replace(new RegExp('\\b' + parsed.location.replace(/ /g,'\\s+') + '\\b','g'), ' ');
    }

    /* Strip day */
    if (parsed.day) {
      const abbrevs = {
        monday:['monday','mon'],
        tuesday:['tuesday','tue','tues'],
        wednesday:['wednesday','wed'],
        thursday:['thursday','thu','thur','thurs'],
        friday:['friday','fri'],
        saturday:['saturday','sat'],
        sunday:['sunday','sun']
      };
      const list = abbrevs[parsed.day] || [parsed.day];
      list.forEach(a => {
        t = t.replace(new RegExp('\\b' + a + '\\b','g'), ' ');
      });
    }

    /* Strip money phrases */
    t = t.replace(/(?:under|below|less than|within|max|maximum|up to)\s*[₦N]?\s*\d[\d,]*\s*k?/gi, ' ');
    t = t.replace(/[₦N]\s*\d[\d,]*\s*k?/gi, ' ');

    /* Strip filler words */
    t = t.replace(/\b(need|hire|hiring|looking for|want|searching for|find|me|a|an|the|in|near|at|i|am|available|offer|providing|is|are|do|does)\b/g, ' ');

    return t.replace(/\s+/g,' ').trim();
  }

  function parse(raw){
    const text = String(raw || '').trim();

    const parsed = {
      raw:            text,
      searchTerm:     '',
      location:       null,
      day:            null,
      maxPrice:       null,
      intent:         'all'
    };

    if (!text) return parsed;

    parsed.location = extractLocation(text);
    parsed.day      = extractDay(text);
    parsed.maxPrice = extractMaxPrice(text);
    parsed.intent   = extractIntent(text);
    parsed.searchTerm = extractSearchTerm(text, parsed);

    return parsed;
  }

  return { parse };

})();