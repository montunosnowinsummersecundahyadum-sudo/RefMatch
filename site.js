/** Landing-page navigation, film playback, and explicitly synthetic what-if demo. */
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
});
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

const film = document.querySelector('#refmatch-film');
document.querySelectorAll('[data-watch]').forEach(link => link.addEventListener('click', () => {
  if (film.ended) film.currentTime = 0;
  film.play().catch(() => {
    document.querySelector('#playback-status').textContent = 'Use the video player’s Play control, or download the film.';
  });
}));

// Presentation values for the concept. These are not a live scoring algorithm.
const profiles = {
  A: { score: 87, reasons: '42 high-intensity matches. 92/100 consistency.', flag: 'Watch: shorter rest at 4 days.' },
  B: { score: 81, reasons: '34 high-intensity matches. 88/100 consistency.', flag: 'Watch: less intensity experience than Referee A.' },
  C: { score: 76, reasons: '26 high-intensity matches. 85/100 consistency.', flag: 'Watch: fewer high-intensity fixtures managed.' },
};
const shortlist = document.querySelector('.shortlist');
const candidates = [...document.querySelectorAll('[data-candidate]')];
const availability = document.querySelector('#unavailable-a');
let selected = 'A';

function updateBoard(announce = false) {
  const unavailable = availability.checked;
  const best = unavailable ? 'B' : 'A';
  const order = unavailable ? ['B', 'C', 'A'] : ['A', 'B', 'C'];
  order.forEach((id, index) => {
    const row = candidates.find(button => button.dataset.candidate === id);
    const excluded = unavailable && id === 'A';
    row.disabled = excluded;
    row.classList.toggle('is-selected', id === selected);
    row.classList.toggle('is-best', id === best);
    row.setAttribute('aria-pressed', String(id === selected));
    row.querySelector('.candidate-rank').textContent = excluded ? '—' : `0${index + 1}`;
    row.querySelector('.candidate-status').textContent = excluded ? 'Unavailable' : id === best ? 'Best fit · available' : 'Available';
    const score = row.querySelector('.candidate-score');
    score.replaceChildren(document.createTextNode(excluded ? '—' : String(profiles[id].score)));
    if (!excluded) { const unit = document.createElement('small'); unit.textContent = '%'; score.append(unit); }
    shortlist.append(row);
  });
  document.querySelector('#reason-title').textContent = `Why Referee ${selected}?`;
  document.querySelector('#reason-copy').textContent = profiles[selected].reasons;
  document.querySelector('#reason-flag').textContent = profiles[selected].flag;
  if (announce) document.querySelector('#ranking-status').textContent = unavailable
    ? 'Referee A is unavailable. Referee B now leads the illustrative shortlist at 81 percent fit.'
    : 'Referee A is available again and leads the illustrative shortlist at 87 percent fit.';
}
candidates.forEach(button => button.addEventListener('click', () => {
  selected = button.dataset.candidate;
  updateBoard();
  button.focus();
}));
availability.addEventListener('change', () => { selected = availability.checked ? 'B' : 'A'; updateBoard(true); });
