/* ============================================================
   DESKLY · BUSINESSES
   Combines A, B, C, D into one list.
   Load this AFTER the four part files.
   ============================================================ */

window.BUSINESSES = [].concat(
  window.BUSINESSES_A || [],
  window.BUSINESSES_B || [],
  window.BUSINESSES_C || [],
  window.BUSINESSES_D || []
);