/* The document stays readable without JavaScript; motion never gates its content. */
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
menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  closeMenu();
  const target = new URL(a.href);
  if (target.pathname === location.pathname && target.hash) {
    const section = document.getElementById(target.hash.slice(1));
    if (section) {
      section.setAttribute('tabindex', '-1');
      section.focus({preventScroll:true});
      section.addEventListener('blur', () => section.removeAttribute('tabindex'), {once:true});
    }
  }
}));
// Critically damped spring for the small menu indicator only. Retargeting keeps current velocity.
const icon = menu?.querySelector('.menu-icon');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if (menu && icon) {
  let position = 0, velocity = 0, target = 0, frame = 0, previous = 0;
  function settle(time) {
    const dt = Math.min((time - previous) / 1000 || 1 / 60, 1 / 30);
    previous = time;
    velocity += (-460 * (position - target) - 43 * velocity) * dt;
    position += velocity * dt;
    icon.style.transform = `rotate(${position}deg)`;
    if (Math.abs(position-target) > .02 || Math.abs(velocity) > .02) frame=requestAnimationFrame(settle);
    else {position=target;velocity=0;frame=0;icon.style.transform=`rotate(${target}deg)`;}
  }
  const sync = () => {
    target = menu.open ? 45 : 0;
    if (reduced.matches) {cancelAnimationFrame(frame);frame=0;position=target;velocity=0;icon.style.transform='none';return;}
    if (!frame) {previous=performance.now();frame=requestAnimationFrame(settle);}
  };
  new MutationObserver(sync).observe(menu,{attributes:true,attributeFilter:['open']});
  reduced.addEventListener('change',sync);
}
document.querySelectorAll('.copy-bib').forEach(button => button.addEventListener('click', async () => {
  const citation = document.getElementById(button.dataset.copy);
  const status = button.parentElement.querySelector('.copy-status');
  try {await navigator.clipboard.writeText(citation.value);status.textContent='Citation copied.';}
  catch {status.textContent='Select and copy the citation above.';}
}));
const readingLinks = [...document.querySelectorAll('.research-reading aside a')];
if ('IntersectionObserver' in window && readingLinks.length) {
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
    if(visible) readingLinks.forEach(a=>{if(a.hash===`#${visible.target.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  },{rootMargin:'-15% 0px -55% 0px',threshold:0});
  document.querySelectorAll('.research-section').forEach(section=>observer.observe(section));
}

function enhanceHomepageMotion() {
  const hero = document.querySelector('#home');
  if (!hero || !('IntersectionObserver' in window)) return;
  const desktop = matchMedia('(min-width:1051px) and (min-height:700px)');
  const entering = new Set();
  function reveal(element, delay = 0, isHero = false) {
    if (reduced.matches) return;
    element.style.setProperty('--reveal-delay', `${delay}ms`);
    element.classList.add('is-entering');
    if (isHero) element.classList.add('hero-entering');
    entering.add(element);
    element.addEventListener('animationend', () => {
      element.classList.remove('is-entering', 'hero-entering');
      element.style.removeProperty('--reveal-delay');
      entering.delete(element);
    }, {once:true});
  }
  // Only play the entrance on a fresh arrival at the top, never on an anchor return.
  if (!location.hash && scrollY < 40 && !reduced.matches) {
    hero.querySelectorAll('[data-hero]').forEach(el => reveal(el, Number(el.dataset.hero) * 65, true));
  }
  const entrances = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entrances.unobserve(entry.target);
      const delay = Number(entry.target.dataset.revealOrder || 0) * 90;
      if (entry.target.hasAttribute('data-reveal-group')) {
        [...entry.target.children].forEach((child,i) => reveal(child, delay + i * 75));
      } else reveal(entry.target, delay);
    }
  }, {threshold:.12});
  if (!reduced.matches) document.querySelectorAll('[data-reveal],[data-reveal-group]').forEach(el => entrances.observe(el));

  const portrait = hero.querySelector('.hero-portrait > img');
  const story = document.querySelector('.flagship-story');
  const steps = [...document.querySelectorAll('.flagship-step')];
  const transition = document.querySelector('.prediction-transition');
  const words = transition ? [...transition.children] : [];
  const visible = new Set();
  const geometry = {};
  let frame = 0, activeStep = -1;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const schedule = () => {
    if (!frame && !reduced.matches && !document.hidden) frame = requestAnimationFrame(update);
  };
  function measure() {
    // Read geometry in one phase; scroll frames only use these cached document coordinates.
    const y = scrollY;
    for (const [name, el] of Object.entries({hero, story, transition})) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      geometry[name] = {top:rect.top+y, height:rect.height, centerX:rect.left+rect.width/2};
    }
    geometry.steps = steps.map(el => {const rect=el.getBoundingClientRect();return rect.top+y+rect.height/2;});
    schedule();
  }
  function clearSpatialState() {
    cancelAnimationFrame(frame);
    frame = 0;
    portrait?.style.removeProperty('transform');
    words.forEach(el => el.style.removeProperty('opacity'));
    steps.forEach(el => {el.classList.remove('is-current');el.removeAttribute('aria-current');});
    activeStep = -1;
  }
  function update() {
    frame = 0;
    const y = scrollY, height = innerHeight;
    if (desktop.matches) {
      if (portrait && visible.has(hero)) {
        const progress = clamp((y-geometry.hero.top)/(geometry.hero.height*.8));
        portrait.style.transform = `translate3d(0,${(-progress*8).toFixed(2)}px,0)`;
      }
      if (story && visible.has(story)) {
        const point = y+height*.52;
        const nearest = geometry.steps.reduce((best, center, i) => Math.abs(center-point)<Math.abs(geometry.steps[best]-point)?i:best,0);
        if (nearest !== activeStep) {
          activeStep = nearest;
          steps.forEach((el,i) => {
            el.classList.toggle('is-current',i===nearest);
            if (i===nearest) el.setAttribute('aria-current','step'); else el.removeAttribute('aria-current');
          });
        }
      }
      if (transition && visible.has(transition)) {
        const progress = clamp((y+height*.7-geometry.transition.top)/(height*.6));
        words[0].style.opacity = (1-progress*.6).toFixed(3);
        words[1].style.opacity = (.4+progress*.6).toFixed(3);
        words[2].style.opacity = (.45+progress*.55).toFixed(3);
      }
    }
  }
  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
    }
    schedule();
  }, {rootMargin:'100px 0px'});
  [hero,story,transition].filter(Boolean).forEach(el => visibility.observe(el));
  window.addEventListener('scroll', () => {if(visible.size)schedule();}, {passive:true});
  window.addEventListener('resize', measure, {passive:true});
  window.addEventListener('pageshow', measure);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {cancelAnimationFrame(frame);frame=0;}
    else measure();
  });
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  function sync() {
    clearSpatialState();
    document.body.classList.toggle('motion-enabled', !reduced.matches);
    if (reduced.matches) {
      entrances.disconnect();
      entering.forEach(el => {el.classList.remove('is-entering','hero-entering');el.style.removeProperty('--reveal-delay');});
      entering.clear();
    } else measure();
  }
  reduced.addEventListener('change', sync);
  desktop.addEventListener('change', sync);
  sync();
}
enhanceHomepageMotion();
const gene = document.querySelector('.gene-mark');
if (gene) import('./gene-mark.js').then(({animateGeneMark}) => animateGeneMark(gene, reduced));
