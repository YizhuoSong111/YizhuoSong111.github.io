/* Progressive enhancement: navigation, content, and figures work without JavaScript. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.querySelector('.site-menu');
const trigger = menu?.querySelector('summary');
function closeMenu(returnFocus = false) {
  if (!menu?.open) return;
  menu.open = false;
  if (returnFocus) trigger.focus();
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menu?.open) { e.preventDefault(); closeMenu(true); }
});
document.addEventListener('pointerdown', e => { if (menu?.open && !menu.contains(e.target)) closeMenu(); });
document.addEventListener('focusin', e => { if (menu?.open && !menu.contains(e.target)) closeMenu(); });
// Follow native anchors and preserve history while giving keyboard users the destination.
document.querySelectorAll('a[href*="#"]').forEach(a => a.addEventListener('click', e => {
  if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const url = new URL(a.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
  const section = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!section) return;
  closeMenu();
  const hadTabindex = section.hasAttribute('tabindex');
  if (!hadTabindex) section.setAttribute('tabindex', '-1');
  section.focus({preventScroll:true});
  if (!hadTabindex) section.addEventListener('blur', () => section.removeAttribute('tabindex'), {once:true});
}));

// The small menu indicator is an interruptible, critically damped spring.
const icon = menu?.querySelector('.menu-icon');
if (menu && icon) {
  let position = 0, velocity = 0, target = 0, frame = 0, previous = 0;
  function settle(time) {
    const dt = Math.min((time - previous) / 1000 || 1 / 60, 1 / 30);
    previous = time;
    velocity += (-460 * (position - target) - 43 * velocity) * dt;
    position += velocity * dt;
    icon.style.transform = `rotate(${position}deg)`;
    if (Math.abs(position-target) > .02 || Math.abs(velocity) > .02) frame = requestAnimationFrame(settle);
    else { position=target; velocity=0; frame=0; icon.style.transform=`rotate(${target}deg)`; }
  }
  const sync = () => {
    target = menu.open ? 45 : 0;
    if (reduced.matches) { cancelAnimationFrame(frame); frame=0; position=target; velocity=0; icon.style.transform=`rotate(${target}deg)`; return; }
    if (!frame) { previous=performance.now(); frame=requestAnimationFrame(settle); }
  };
  menu.addEventListener('toggle', sync);
  reduced.addEventListener('change', sync);
}

document.querySelectorAll('.copy-bib').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const citation = document.getElementById(button.dataset.copy);
    const status = button.parentElement.querySelector('.copy-status');
    try { await navigator.clipboard.writeText(citation.value); status.textContent='Citation copied.'; }
    catch { status.textContent='Select and copy the citation above.'; }
  });
});
const emailButton = document.querySelector('.copy-email');
if (emailButton && navigator.clipboard) {
  emailButton.hidden = false;
  emailButton.addEventListener('click', async () => {
    const status = document.querySelector('.email-status');
    try { await navigator.clipboard.writeText(emailButton.dataset.email); status.textContent='Email address copied.'; }
    catch { status.textContent='Select the email address to copy it.'; }
  });
}

// One scheduled scroll read, cached section offsets, no perpetual animation loop.
function enhanceWayfinding() {
  const homeSections = [...document.querySelectorAll('main > section[id]')];
  const readingSections = [...document.querySelectorAll('.research-section')];
  const sections = readingSections.length ? readingSections : homeSections;
  if (!sections.length) return;
  const links = [...document.querySelectorAll('.desktop-nav a, .site-menu nav a, .research-reading aside a')];
  const context = document.querySelector('.header-context');
  const progress = document.querySelector('.reading-progress');
  let offsets = [], maxScroll = 1, frame = 0, active = '';
  function update() {
    frame = 0;
    const y = scrollY;
    const index = y >= maxScroll - 2 ? sections.length - 1 : Math.max(0, offsets.findLastIndex(top => top <= y + innerHeight * .28));
    const current = sections[index];
    if (current.id !== active) {
      active = current.id;
      links.forEach(a => {
        const url = new URL(a.href);
        if (url.pathname === location.pathname && url.hash === `#${active}`) a.setAttribute('aria-current','location');
        else a.removeAttribute('aria-current');
      });
      if (context && homeSections.length) {
        const label = current.querySelector('.section-heading .eyebrow')?.textContent;
        context.textContent = label || '';
      }
    }
    if (progress) progress.style.transform = `scaleX(${Math.min(1,Math.max(0,y/maxScroll)).toFixed(4)})`;
  }
  function schedule() { if (!frame && !document.hidden) frame=requestAnimationFrame(update); }
  function measure() {
    offsets = sections.map(section => section.getBoundingClientRect().top + scrollY);
    maxScroll = Math.max(1,document.documentElement.scrollHeight-innerHeight);
    schedule();
  }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', measure, {passive:true});
  window.addEventListener('pageshow', measure);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame=0; }
    else measure();
  });
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  measure();
}
enhanceWayfinding();

function enhanceEntrances() {
  if (!('IntersectionObserver' in window)) return;
  const entering = new Set();
  function reveal(el, delay = 0) {
    if (reduced.matches) return;
    el.style.setProperty('--reveal-delay', `${delay}ms`);
    el.classList.add('is-entering');
    entering.add(el);
    const clear = () => {
      el.classList.remove('is-entering');
      el.style.removeProperty('--reveal-delay');
      entering.delete(el);
    };
    el.addEventListener('animationend', clear, {once:true});
    el.addEventListener('animationcancel', clear, {once:true});
  }
  if (!location.hash && scrollY < 40) document.querySelectorAll('[data-hero]').forEach(el => reveal(el,Number(el.dataset.hero)*55));
  const entrances = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entrances.unobserve(entry.target);
      // Avoid replaying content already above the viewport on restored scroll positions.
      if (entry.boundingClientRect.bottom < 0) continue;
      reveal(entry.target,Math.min(180,Number(entry.target.dataset.revealOrder || 0)*65));
    }
  }, {threshold:.08});
  if (!reduced.matches) document.querySelectorAll('[data-reveal],[data-reveal-group]').forEach(el => entrances.observe(el));
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    entrances.disconnect();
    entering.forEach(el => {el.classList.remove('is-entering');el.style.removeProperty('--reveal-delay');});
    entering.clear();
  });
}
enhanceEntrances();
const gene = document.querySelector('.gene-mark');
if (gene) import('./gene-mark.js').then(({animateGeneMark}) => animateGeneMark(gene,reduced)).catch(() => {});
if (document.querySelector('[data-continuum]')) import('./continuum.js').then(({enhanceContinuums}) => enhanceContinuums()).catch(() => {});
