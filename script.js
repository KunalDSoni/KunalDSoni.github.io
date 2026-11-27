// Mobile nav toggle
function initNav(){
  const navEl = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  if (!navEl || !navToggle) return;
  navToggle.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const open = navEl.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open);
  };
  navEl.querySelectorAll('.nav__links a').forEach(a => {
    a.addEventListener('click', () => navEl.classList.remove('is-open'));
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNav);
} else {
  initNav();
}

// Nav scroll state
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Hero video play/pause
const vctrl = document.getElementById('vctrl');
const video = document.querySelector('.hero__video');
let playing = true;
vctrl?.addEventListener('click', () => {
  if (playing) { video.pause(); vctrl.classList.add('is-paused'); vctrl.setAttribute('aria-label','Play video'); }
  else { video.play(); vctrl.classList.remove('is-paused'); vctrl.setAttribute('aria-label','Pause video'); }
  playing = !playing;
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Close the mobile menu with Escape
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const navEl = document.getElementById('nav');
  if (navEl && navEl.classList.contains('is-open')) {
    navEl.classList.remove('is-open');
    document.getElementById('navToggle')?.setAttribute('aria-expanded', 'false');
  }
  if (document.activeElement && document.activeElement.closest('.has-submenu')) document.activeElement.blur();
});

// Autoplaying videos: don't play for reduced-motion users (they keep the poster frame)
if (reduceMotion) {
  document.querySelectorAll('video[autoplay]').forEach(v => { v.removeAttribute('autoplay'); v.pause(); v.controls = true; });
}

// Reveal on scroll (skipped entirely for reduced-motion users)
if (!reduceMotion && 'IntersectionObserver' in window) {
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.15 });
document.querySelectorAll('.card, .stat, .display, .lede, blockquote').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1)';
  io.observe(el);
});
const style = document.createElement('style');
style.textContent = `.in{opacity:1!important;transform:none!important}`;
document.head.appendChild(style);
}

// Trigger hover-like state on .svc cards as they enter the viewport
const svcIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('svc--active');
      setTimeout(() => e.target.classList.remove('svc--active'), 900);
    }
  });
}, { threshold: 0.4 });
if (!reduceMotion) document.querySelectorAll('.svc').forEach(el => svcIO.observe(el));

// ---------------------------------------------------------------------------
// Time-of-day colour mode (the <head> script already set html[data-time])
(function(){
  const root = document.documentElement;
  const MODES = ['morning', 'noon', 'evening', 'night'];
  const ICON = { morning: '☀️', noon: '🌤️', evening: '🌇', night: '🌙' };
  const HELLO = { morning: 'Good morning.', noon: 'Good afternoon.', evening: 'Good evening.', night: 'Still up?' };
  const THEME_COLOR = { morning: '#ffffff', noon: '#fff3e8', evening: '#fff8db', night: '#0e1016' };
  const fromClock = () => {
    const h = new Date().getHours();
    return h >= 5 && h < 11 ? 'morning' : h >= 11 && h < 16 ? 'noon' : h >= 16 && h < 20 ? 'evening' : 'night';
  };
  let override = null;
  try { override = sessionStorage.getItem('kds-time'); } catch (e) {}

  function apply(mode){
    root.setAttribute('data-time', mode);
    const chip = document.getElementById('timeChip');
    if (chip) {
      chip.querySelector('.time-chip__icon').textContent = ICON[mode];
      chip.querySelector('.time-chip__label').textContent = override ? mode : mode + ' · auto';
      chip.setAttribute('aria-label', 'Colour mode: ' + mode + (override ? ' (picked)' : ' (follows your clock)') + '. Click to try another.');
    }
    const hello = document.getElementById('hello');
    if (hello) hello.textContent = HELLO[fromClock()];
    const note = document.getElementById('clockNote');
    if (note) note.textContent = override
      ? 'you picked ' + mode + ' - tap the chip again to go back to your clock'
      : 'it’s ' + fromClock() + ' where you are, so this page is in ' + fromClock() + ' colours';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOR[mode]);
  }

  document.getElementById('timeChip')?.addEventListener('click', () => {
    const current = override || fromClock();
    const next = MODES[(MODES.indexOf(current) + 1) % MODES.length];
    // after cycling through every mode, return to following the clock
    override = next === fromClock() ? null : next;
    try { override ? sessionStorage.setItem('kds-time', override) : sessionStorage.removeItem('kds-time'); } catch (e) {}
    apply(override || fromClock());
  });

  apply(override || fromClock());
  // keep following the clock if the tab stays open across a boundary
  setInterval(() => { if (!override && root.getAttribute('data-time') !== fromClock()) apply(fromClock()); }, 60000);
})();

// ---------------------------------------------------------------------------
// Portrait leans toward the cursor (one photo, faked 3D head-turn)
(function(){
  const el = document.getElementById('portrait');
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  let raf = null;
  const clamp = v => Math.max(-1, Math.min(1, v));

  function onMove(e){
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    target.x = clamp((e.clientX - cx) / (window.innerWidth * 0.45));
    target.y = clamp((e.clientY - cy) / (window.innerHeight * 0.45));
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function reset(){ target.x = 0; target.y = 0; if (!raf) raf = requestAnimationFrame(tick); }

  function tick(){
    cur.x += (target.x - cur.x) * 0.12;
    cur.y += (target.y - cur.y) * 0.12;
    const s = el.style;
    s.setProperty('--ry', (cur.x * 22).toFixed(2) + 'deg');
    s.setProperty('--rx', (-cur.y * 16).toFixed(2) + 'deg');
    s.setProperty('--tx', (cur.x * 9).toFixed(2) + 'px');
    s.setProperty('--ty', (cur.y * 7).toFixed(2) + 'px');
    s.setProperty('--gx', (50 + cur.x * 30).toFixed(1) + '%');
    s.setProperty('--gy', (30 + cur.y * 30).toFixed(1) + '%');
    const settled = Math.abs(target.x - cur.x) < 0.001 && Math.abs(target.y - cur.y) < 0.001;
    raf = settled ? null : requestAnimationFrame(tick);
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', reset);
  window.addEventListener('blur', reset);
})();
