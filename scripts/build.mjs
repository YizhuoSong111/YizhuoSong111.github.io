import { readFile, writeFile, readdir, mkdir, rm, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { marked } from 'marked';
import { geneMark } from '../public/gene-mark.js';
import { continuumFigure } from '../public/continuum.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'content');
const out = path.join(root, 'dist');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const yaml = async name => parse(await readFile(path.join(source, `${name}.yml`), 'utf8'));
async function md(name) {
  const raw = await readFile(path.join(source, `${name}.md`), 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { body: raw };
  return { ...parse(match[1]), body: match[2] };
}
const safeURL = value => {
  if (!value) return '';
  if (!/^(https:\/\/|mailto:|#[a-zA-Z0-9-]+$|\/(?!\/))/.test(value)) throw Error(`Unsupported URL: ${value}`);
  return esc(value);
};
const site = await yaml('site');
const [about, beyond, journey, publications, recognition, methods] = await Promise.all([
  md('about'), md('beyond'), yaml('journey'), yaml('publications'), yaml('recognition'), yaml('methods')
]);
const filenames = (await readdir(path.join(source,'research'))).filter(f => f.endsWith('.md'));
const projects = (await Promise.all(filenames.map(async filename => ({slug:filename.slice(0,-3), ...await md(`research/${filename.slice(0,-3)}`)})))).sort((a,b)=>a.order-b.order);
const link = (url, text, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${safeURL(url)}">${esc(text)}</a>`;
const arrow = '<span aria-hidden="true">↗</span>';
const tags = values => `<ul class="tags" aria-label="Related methods">${values.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`;
function diagram(kind, title) {
  if (kind === 'regulation') return continuumFigure('research-cell-state');
  let content = '';
  if (kind === 'profiles') {
    content = `<text x="45" y="25">Cellular context</text><text x="232" y="275" text-anchor="middle">Cis-response profiles across loci</text>`;
    const vals = [[.15,.3,.7,.9,.6,.2],[.25,.4,.65,.8,.7,.3],[.8,.7,.3,.2,.4,.8],[.7,.8,.2,.3,.5,.9]];
    vals.forEach((row,y)=>row.forEach((v,x)=>{content+=`<rect x="${68+x*51}" y="${50+y*46}" width="41" height="33" rx="3" fill="var(--accent)" opacity="${v}"/>`;}));
  } else if (kind === 'dynamics') {
    content = `<path class="guide" d="M82 48V233M353 48V233"/><path class="curve teal" d="M82 153C180 155 230 60 354 72"/><path class="curve blue" d="M82 153C180 150 246 233 354 212" stroke-dasharray="6 6"/><circle class="teal-fill" cx="82" cy="153" r="9"/><circle class="teal-fill" cx="354" cy="72" r="9"/><circle cx="354" cy="212" r="9" fill="none" stroke="var(--blue)" stroke-width="2"/><text x="82" y="271" text-anchor="middle">Snapshot</text><text x="354" y="271" text-anchor="middle">Future population</text><text x="45" y="25">Compatible fits, different futures</text>`;
  } else {
    content = `<text x="45" y="26">Evaluate beyond the training context</text><rect class="diagram-box" x="45" y="70" width="146" height="100" rx="5"/><rect class="diagram-box" x="258" y="70" width="147" height="100" rx="5"/><path class="curve teal" d="M197 120H249M238 113L249 120L238 127"/><text x="118" y="112" text-anchor="middle">Generated</text><text x="118" y="135" text-anchor="middle">architectures</text><text x="331" y="112" text-anchor="middle">Held-out</text><text x="331" y="135" text-anchor="middle">perturbations</text><path class="guide" d="M118 185V219H331V185"/><text x="225" y="253" text-anchor="middle">Generalization &amp; reliability</text>`;
  }
  return `<figure class="concept-figure"><svg viewBox="0 0 450 300" role="img" aria-label="${esc(title)}">${content}</svg><figcaption>Conceptual illustration · not empirical data</figcaption></figure>`;
}
function header(homepage = false) {
  const wordmark = homepage
    ? `<a class="wordmark" href="/#home" aria-label="Yizhuo Song home">YS</a>`
    : `<a class="wordmark" href="/#home" aria-label="Yizhuo Song home">YS<span class="wordmark-name">Yizhuo Song</span></a>`;
  const navigation = [['work','Work'],['journey','Journey'],['contact','Contact']];
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="nav-shell">${wordmark}<span class="header-context" aria-hidden="true">${homepage ? 'Research &amp; perspective' : 'Research story'}</span><nav class="desktop-nav" aria-label="Primary navigation">${navigation.map(([id,label])=>link(`/#${id}`,label)).join('')}</nav><details class="site-menu"><summary aria-label="Explore all sections"><span>Explore</span><span class="menu-icon" aria-hidden="true">+</span></summary><nav aria-label="Explore all sections">${site.navigation.map((n,i)=>`<a href="/#${n.id}"><span class="menu-number" aria-hidden="true">0${i}</span>${esc(n.label)}<span class="menu-arrow" aria-hidden="true">↗</span></a>`).join('')}</nav></details></div><div class="reading-progress" aria-hidden="true"></div></header>`;
}
function footer() {
  return `<footer class="footer shell"><a href="/#home" class="footer-name">${esc(site.name)}</a><span>Statistical genetics &amp; computational biology</span><a href="#main">Back to top ↑</a></footer>`;
}
function page(title, description, body, bodyClass = '', homepage = false) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f7f7f2"><meta name="description" content="${esc(description)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><title>${esc(title)}</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/styles.css"><script src="/site.js" defer></script></head><body class="${bodyClass}">${header(homepage)}${body}${footer()}</body></html>`;
}
function sectionHead(id, number, extra = '') {
  return `<div class="section-heading"><p class="eyebrow">${number} / ${esc(site.navigation.find(n=>n.id===id).label)}</p>${extra}</div>`;
}
function publication(p) {
  return `<article class="publication"><span class="publication-year">${esc(p.year)}</span><div><p class="meta">${esc(p.venue)}</p><h3>${esc(p.title)}</h3><p class="authors">${esc(p.authors)}${p.author_note ? ` <span>${esc(p.author_note)}</span>` : ''}</p><p class="publication-status">${esc(p.status)}</p><div class="output-links">${p.links.map(l=>link(l.url,l.label,'text-link')).join('')}</div>${p.bibtex ? `<details class="citation"><summary>BibTeX</summary><pre><code>${esc(p.bibtex)}</code></pre><button type="button" class="copy-bib" hidden data-copy="bib-${esc(p.id)}">Copy citation</button><textarea id="bib-${esc(p.id)}" class="sr-only" tabindex="-1" aria-hidden="true">${esc(p.bibtex)}</textarea><span class="copy-status" role="status"></span></details>` : ''}</div></article>`;
}
function projectCopy(p, i) {
  return `<div class="project-copy"><p class="eyebrow project-category"><span class="project-number">0${i+1}</span>${esc(p.category)}</p><h3>${link(`/research/${p.slug}/`,p.title)}</h3><p class="project-headline">${esc(p.headline)}</p><p>${esc(p.summary)}</p>${tags(p.tags)}<a class="text-link" href="/research/${p.slug}/">Read the research story ${arrow}<span class="sr-only">: ${esc(p.title)}</span></a></div>`;
}
function homeProject(p, i) {
  if (p.home_story) {
    return `<article class="project flagship" id="project-${p.slug}" aria-label="${esc(p.title)} research story">
      <div class="flagship-story">
        <div class="flagship-intro">${projectCopy(p, i)}<p class="project-hook">${esc(p.hook)}</p></div>
        <div class="flagship-method">${continuumFigure('home-cell-state')}<ol class="flagship-steps" aria-label="scPME-QTL method">
          ${p.home_story.steps.map((step,j)=>`<li class="flagship-step"><span class="step-index">0${j+1}</span><div><h4>${esc(step.title)}</h4><p>${esc(step.text)}</p></div></li>`).join('')}
        </ol></div>
      </div>
      <div class="research-metrics" aria-label="scPME-QTL analysis"><p class="eyebrow">scPME-QTL · Analysis at scale</p>
        <ul>${p.home_story.metrics.map((m,j)=>`<li data-reveal data-reveal-order="${j}"><strong class="metric-value">${esc(m.value)}</strong><span class="metric-label">${esc(m.label)}</span></li>`).join('')}</ul>
      </div>
    </article>`;
  }
  return `<article class="project project-${i+1}" id="project-${p.slug}" data-reveal>${projectCopy(p, i)}<div class="project-side">${diagram(p.diagram,p.headline)}<p class="project-hook">${esc(p.hook)}</p></div></article>`;
}
const home = `<main id="main"><section id="home" class="hero shell" aria-labelledby="hero-name">
<div class="hero-layout">
  <div class="hero-intro">
    <p class="hero-kicker eyebrow" data-hero="0">A study in biological variation</p>
    <h1 id="hero-name" data-hero="1">${esc(site.name)}<span aria-hidden="true">.</span></h1>
    <p class="hero-affiliation" data-hero="2">${esc(site.affiliation)}</p>
    <ul class="identity" aria-label="Research identity" data-hero="2">${site.identity.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>
  </div>
  <div class="hero-copy">
    <p class="hero-statement" data-hero="3">${esc(site.statement)}</p><div class="hero-actions" data-hero="4"><a class="text-link" href="#work">Explore my research <span aria-hidden="true">↓</span></a><a class="quiet-link" href="${safeURL(site.links.find(l=>l.label==='CV').url)}">Curriculum vitae <span aria-hidden="true">↗</span></a></div>
  </div>
  <figure class="hero-portrait" data-hero="4">
    <img src="${safeURL(site.portrait.src)}" srcset="${safeURL(site.portrait.small)} 720w, ${safeURL(site.portrait.src)} ${esc(site.portrait.width)}w" sizes="(max-width:760px) 76vw, 380px" alt="${esc(site.portrait.alt)}" width="${esc(site.portrait.width)}" height="${esc(site.portrait.height)}" fetchpriority="high">
    <figcaption class="hero-focus">${geneMark()}<span>${esc(site.identity[0])}</span></figcaption>
  </figure>
</div>
<div class="themes">${site.themes.map((t,i)=>`<div data-reveal-group data-reveal-order="${i}"><span class="theme-number">0${i+1}</span><h2><a href="#project-${esc(t.project)}">${esc(t.title)} <span aria-hidden="true">↗</span></a></h2><p>${esc(t.text)}</p></div>`).join('')}</div></section>
<section id="about" class="section about" aria-labelledby="about-heading"><div class="shell">${sectionHead('about','01')}<div class="about-grid"><h2 id="about-heading" class="display-heading">${esc(about.heading)}</h2><div class="prose">${marked.parse(about.body)}<p class="affiliation">${esc(about.affiliation)}</p></div></div></div></section>
<section id="work" class="section shell" aria-labelledby="work-heading">${sectionHead('work','02')}<div class="section-title-row"><h2 id="work-heading" class="display-heading">Questions into work.</h2><p>Four connected research stories.</p></div><div class="projects">${projects.map(homeProject).join('')}</div></section>
<section id="journey" class="section journey-section" aria-labelledby="journey-heading"><div class="shell">${sectionHead('journey','03')}<div class="journey-layout"><div class="journey-intro"><h2 id="journey-heading" class="display-heading">Following the next question.</h2><p>${esc(journey.intro)}</p><p class="prediction-transition" aria-label="Prediction to inference"><span class="prediction-word">${esc(journey.transition.from)}</span><span class="inference-arrow" aria-hidden="true">→</span><span class="inference-word">${esc(journey.transition.to)}</span></p></div><ol class="journey-chapters">${journey.chapters.map((c,i)=>`<li><span class="chapter-number">0${i+1}</span><div><h3>${esc(c.title)}</h3><p class="context">${esc(c.context)}</p><p>${esc(c.text)}</p></div></li>`).join('')}</ol></div></div><div class="vision-chapter" aria-labelledby="vision-heading"><svg class="vision-field" viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden="true">${Array.from({length:15},(_,i)=>`<path d="M-80 ${90+i*23}C270 ${-190+i*33} 460 ${640-i*23} 730 ${240+i*9}S1100 ${70+i*21} 1300 ${190+i*23}"/>`).join('')}</svg><div class="shell"><h3 id="vision-heading" class="eyebrow">Research vision</h3><ol class="vision-stages">${journey.vision.stages.map((stage,i)=>`<li data-reveal data-reveal-order="${i}"><span class="vision-index" aria-hidden="true">0${i+1}</span><span>${esc(stage)}</span>${i<journey.vision.stages.length-1?'<span class="vision-arrow" aria-hidden="true">→</span>':''}</li>`).join('')}</ol><p class="vision-statement" data-reveal>${esc(journey.vision.statement)}</p></div></div></section>
<section id="publications" class="section shell" aria-labelledby="publications-heading">${sectionHead('publications','04')}<h2 id="publications-heading" class="display-heading">Publications &amp; recognition.</h2><div class="publications">${publications.map(publication).join('')}</div><div class="recognition">${recognition.map(r=>`<div><h3>${esc(r.title)}</h3><p>${esc(r.context)}</p></div>`).join('')}</div></section>
<section id="methods" class="section shell methods-section" aria-labelledby="methods-heading">${sectionHead('methods','05')}<h2 id="methods-heading" class="display-heading">Tools for the questions.</h2><div class="methods-grid">${methods.map((m,i)=>`<div><span class="method-index">0${i+1}</span><h3>${esc(m.title)}</h3><ul>${m.methods.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>${m.software?`<p class="software">${esc(m.software)}</p>`:''}</div>`).join('')}</div></section>
<section id="beyond" class="section beyond-section" aria-labelledby="beyond-heading"><div class="shell">
  ${sectionHead('beyond','06')}
  <h2 id="beyond-heading" class="display-heading">${esc(beyond.heading)}</h2>
  <article aria-labelledby="basketball-heading">
    <figure class="beyond-photo" data-reveal><img src="${safeURL(beyond.basketball.photo.src)}" srcset="${safeURL(beyond.basketball.photo.small)} 960w, ${safeURL(beyond.basketball.photo.src)} ${esc(beyond.basketball.photo.width)}w" sizes="(max-width:760px) calc(100vw - 2.5rem), (max-width:1100px) calc(100vw - 4rem), (max-width:1328px) calc(100vw - 7rem), 76rem" alt="${esc(beyond.basketball.photo.alt)}" width="${esc(beyond.basketball.photo.width)}" height="${esc(beyond.basketball.photo.height)}" loading="lazy" decoding="async"></figure>
    <div class="beyond-entry"><h3 id="basketball-heading">${esc(beyond.basketball.heading)}</h3><p>${esc(beyond.basketball.text)}</p></div>
  </article>
  <article class="firefly" aria-labelledby="firefly-heading">
    <header class="firefly-header">
      <div><h3 id="firefly-heading">${esc(beyond.firefly.heading)}</h3><p class="firefly-meta">${esc(beyond.firefly.metadata)}</p></div>
      <p class="firefly-description">${esc(beyond.firefly.description)}</p>
    </header>
    <ul class="firefly-metrics" aria-label="Firefly Girls impact">${beyond.firefly.metrics.map(metric=>`<li><strong>${esc(metric.value)}</strong><span>${esc(metric.label)}</span></li>`).join('')}</ul>
    <div class="firefly-footer">
      <p class="firefly-role">${esc(beyond.firefly.role)}</p>
      <div class="firefly-recognition"><p class="eyebrow">Recognition</p><ul>${beyond.firefly.recognition.map(item=>`<li><strong>${esc(item.title)}</strong><span>${esc(item.date)}</span></li>`).join('')}</ul></div>
    </div>
  </article>
</div></section>
<section id="contact" class="section shell contact" aria-labelledby="contact-heading">${sectionHead('contact','07')}<div class="contact-grid"><div><h2 id="contact-heading" class="display-heading">Let's think<br><em>together.</em></h2><p>${esc(site.contact_intro)}</p><a class="email-link" href="mailto:${esc(site.email)}">${esc(site.email)} ${arrow}</a><div class="email-tools"><button type="button" class="copy-email" data-email="${esc(site.email)}" hidden>Copy email address <span aria-hidden="true">⧉</span></button><span class="email-status" role="status"></span></div></div><div class="contact-links"><p class="eyebrow">${esc(site.name)}</p>${site.links.filter(l=>l.label!=='Email' && l.url).map(l=>l.url?`<a href="${safeURL(l.url)}"><span>${esc(l.label)}${l.detail?`<small>${esc(l.detail)}</small>`:''}</span>${arrow}</a>`:`<div class="unavailable"><span>${esc(l.label)}</span><small>${esc(l.placeholder)}</small></div>`).join('')}</div></div></section></main>`;

await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await cp(path.join(root,'public'),out,{recursive:true});
await writeFile(path.join(out,'index.html'),page(`${site.name} — Research`,site.description,home,'',true));

const requiredHeadings = ['The Question','Why It Matters','The Approach','My Contribution','What We Found','What It Led Me To Ask','Outputs'];
for (let i=0;i<projects.length;i++) {
  const p=projects[i];
  const chunks = [...p.body.matchAll(/^## (\d{2})\. (.+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
  if(chunks.length!==7 || chunks.some((m,j)=>m[2].trim()!==requiredHeadings[j])) throw Error(`Project ${p.slug} must contain the seven required sections, in order.`);
  const next=projects[(i+1)%projects.length];
  const body=`<main id="main" class="project-page"><div class="shell"><a href="/#work" class="back-link">← Selected work</a><div class="project-page-hero"><p class="eyebrow">${esc(p.category)}</p><h1>${esc(p.title)}</h1><p class="project-deck">${esc(p.headline)}</p><div class="project-meta"><span>${esc(p.context)}</span><span>${esc(p.status)}</span></div>${tags(p.tags)}</div><div class="research-reading"><aside><nav aria-label="Project sections">${chunks.map(m=>link(`#section-${m[1]}`,`${m[1]} ${m[2]}`)).join('')}</nav></aside><article class="research-body" aria-label="${esc(p.title)} research story">${p.image ? `<figure class="research-image"><img src="${safeURL(p.image)}" alt="${esc(p.image_alt)}"><figcaption>${esc(p.image_caption)}</figcaption></figure>` : ''}${chunks.map(m=>`<section id="section-${m[1]}" class="research-section"><h2><span>${m[1]}.</span> ${esc(m[2])}</h2><div class="prose">${marked.parse(m[3])}</div>${m[1]==='03'?diagram(p.diagram,p.headline):''}${m[1]==='07'?`<ul class="research-outputs">${(p.outputs??[]).filter(o=>o.url || !/to add/i.test(o.detail)).map(o=>`<li><div>${o.url?link(o.url,o.label,'text-link'):`<strong>${esc(o.label)}</strong>`}<p>${esc(o.detail)}</p></div>${o.url?arrow:''}</li>`).join('')}</ul>`:''}</section>`).join('')}</article></div><div class="next-project"><div><p class="eyebrow">Continue exploring</p><a href="/research/${next.slug}/">${esc(next.title)} ${arrow}</a><p>${esc(next.headline)}</p></div><a class="text-link" href="/#work">Back to selected work ↑</a></div></div></main>`;
  const dir=path.join(out,'research',p.slug);
  await mkdir(dir,{recursive:true});
  await writeFile(path.join(dir,'index.html'),page(`${p.title} — ${site.name}`,p.summary,body,'detail-page'));
}
await writeFile(path.join(out,'404.html'),page(`Page not found — ${site.name}`,'Return to Yizhuo Song’s research website.',`<main id="main" class="shell not-found"><p class="eyebrow">404</p><h1>That page isn't here.</h1><p>Continue with the research questions or selected work.</p><a class="text-link" href="/">Return home →</a></main>`));
console.log(`Built homepage, ${projects.length} research stories, and 404 page from content/.`);
