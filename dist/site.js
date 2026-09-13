/* Reading works without JavaScript. Enhancement is limited to navigation and citation feedback. */
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
