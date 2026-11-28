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
  // anything already on screen at load stays visible (no fade = faster first paint)
  if (el.getBoundingClientRect().top < window.innerHeight) return;
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
  const THEME_COLOR = { morning: '#ffffff', noon: '#fff3e8', evening: '#fff8db', night: '#0e1016' };
  // favicon follows the colour mode too: [background, letters]
  const ICON_COLORS = { morning: ['#ffffff', '#2222EE'], noon: ['#fff3e8', '#a8380a'], evening: ['#fff8db', '#8a5300'], night: ['#0e1016', '#9aabff'] };
  const iconSvg = (bg, fg) => 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="1.5" y="1.5" width="61" height="61" rx="14" fill="' + bg +
    '" stroke="' + fg + '" stroke-opacity=".35" stroke-width="3"/><text x="32" y="43" text-anchor="middle" font-family="Archivo, Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="29" fill="' + fg + '" letter-spacing="-1">KS</text></svg>');
  const fromClock = () => {
    const h = new Date().getHours();
    return h >= 5 && h < 11 ? 'morning' : h >= 11 && h < 16 ? 'noon' : h >= 16 && h < 20 ? 'evening' : 'night';
  };
  // a picked mode is remembered across every page (and open tabs) until the visitor cycles back to their clock
  const KEY = 'ks-colour-mode';
  const load = () => { try { const v = localStorage.getItem(KEY); return MODES.includes(v) ? v : null; } catch (e) { return null; } };
  const save = v => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) {} };
  let override = load();

  function apply(mode){
    root.setAttribute('data-time', mode);
    const chip = document.getElementById('timeChip');
    if (chip) {
      chip.querySelector('.time-chip__icon').textContent = ICON[mode];
      chip.title = mode + (override ? '' : ' · follows your clock');
      chip.setAttribute('aria-label', 'Colour mode: ' + mode + (override ? ' (picked)' : ' (follows your clock)') + '. Click to try another.');
    }
    const note = document.getElementById('clockNote');
    if (note) note.textContent = override
      ? 'you picked ' + mode + ' - tap the chip again to go back to your clock'
      : 'it’s ' + fromClock() + ' where you are, so this page is in ' + fromClock() + ' colours';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOR[mode]);
    const icon = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
    if (icon) icon.setAttribute('href', iconSvg(...ICON_COLORS[mode]));
  }

  document.getElementById('timeChip')?.addEventListener('click', () => {
    const current = override || fromClock();
    const next = MODES[(MODES.indexOf(current) + 1) % MODES.length];
    // after cycling through every mode, return to following the clock
    override = next === fromClock() ? null : next;
    save(override);
    apply(override || fromClock());
  });

  // a pick made in another tab applies here too
  window.addEventListener('storage', e => { if (e.key === KEY || e.key === null) { override = load(); apply(override || fromClock()); } });
  // pages restored from the back/forward cache pick up a change made elsewhere
  window.addEventListener('pageshow', e => { if (e.persisted) { override = load(); apply(override || fromClock()); } });

  apply(override || fromClock());
  // keep following the clock if the tab stays open across a boundary
  setInterval(() => { if (!override && root.getAttribute('data-time') !== fromClock()) apply(fromClock()); }, 60000);
})();

// ---------------------------------------------------------------------------
// Videos: only download + play while on screen (saves ~9 MB on the Life page)
(function(){
  const vids = document.querySelectorAll('video[data-autoplay]');
  if (!vids.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { vids.forEach(v => { v.controls = true; }); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
      else v.pause();
    });
  }, { rootMargin: '200px 0px' });
  vids.forEach(v => io.observe(v));
})();

// ---------------------------------------------------------------------------
// Photos open full screen (Life page polaroids, journey photos). Click/Esc to close.
(function(){
  const imgs = document.querySelectorAll('.life-photo__frame img');
  if (!imgs.length || typeof HTMLDialogElement !== 'function') return;
  const dlg = document.createElement('dialog');
  dlg.className = 'viewer';
  dlg.innerHTML = '<img class="viewer__img" alt=""><p class="viewer__cap"></p><button type="button" class="viewer__close" aria-label="Close photo">×</button>';
  document.body.appendChild(dlg);
  const big = dlg.querySelector('.viewer__img'), cap = dlg.querySelector('.viewer__cap');
  const largest = (img) => {
    const set = img.getAttribute('srcset');
    if (!set) return img.currentSrc || img.src;
    return set.split(',').map(s => s.trim().split(/\s+/)[0]).pop();
  };
  function open(img){
    big.src = largest(img);
    big.alt = img.alt;
    const fc = img.closest('figure')?.querySelector('figcaption');
    cap.textContent = fc ? fc.textContent.trim() : '';
    dlg.showModal();
  }
  imgs.forEach(img => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Open photo: ' + (img.alt || 'photo'));
    img.addEventListener('click', () => open(img));
    img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); } });
  });
  dlg.addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => { big.removeAttribute('src'); });
})();
