// A projected SVG helix: no canvas, WebGL, filters, or animation dependency.
// The build and browser share the same geometry, so the static mark is complete.
const TAU = Math.PI * 2;
const TURN_MS = 10000;
const RADIUS = 16;
const ELEVATION = .1;
const fixed = value => value.toFixed(3);

function point(t, phase) {
  const angle = t * TAU + phase;
  const z = RADIUS * Math.sin(angle);
  return {x:40 - RADIUS * Math.cos(angle), y:6 + 70 * t - z * ELEVATION, z};
}

function strand(phase) {
  // Split precisely at the depth plane; cubic tangents keep every join smooth.
  const cuts = [0, 1];
  for (let k = Math.ceil(phase / Math.PI); k <= Math.floor((phase + TAU) / Math.PI); k++) {
    const t = (k * Math.PI - phase) / TAU;
    if (t > .000001 && t < .999999) cuts.push(t);
  }
  cuts.sort((a, b) => a - b);
  let rear = '', front = '';
  for (let i = 1; i < cuts.length; i++) {
    const start = cuts[i - 1], end = cuts[i];
    const count = Math.ceil((end - start) * 24);
    const first = point(start, phase);
    let d = `M${fixed(first.x)} ${fixed(first.y)}`;
    for (let j = 0; j < count; j++) {
      const a = start + (end - start) * j / count;
      const b = start + (end - start) * (j + 1) / count;
      const p = point(a, phase), q = point(b, phase), step = (b - a) / 3;
      const dx = t => RADIUS * TAU * Math.sin(t * TAU + phase);
      const dy = t => 70 - RADIUS * TAU * Math.cos(t * TAU + phase) * ELEVATION;
      d += `C${fixed(p.x + dx(a) * step)} ${fixed(p.y + dy(a) * step)} ${fixed(q.x - dx(b) * step)} ${fixed(q.y - dy(b) * step)} ${fixed(q.x)} ${fixed(q.y)}`;
    }
    if (point((start + end) / 2, phase).z >= 0) front += d;
    else rear += d;
  }
  return {rear, front};
}

function frameAt(phase = 0) {
  const strands = [strand(phase), strand(phase + Math.PI)];
  const rungs = Array.from({length:9}, (_, i) => {
    const t = (i + .5) / 9, a = point(t, phase), b = point(t, phase + Math.PI);
    return `M${fixed(a.x)} ${fixed(a.y)}L${fixed(b.x)} ${fixed(b.y)}`;
  });
  const shades = [0, 1].map(side => Array.from({length:9}, (_, i) => {
    const depth = (Math.sin(i / 8 * TAU + phase + side * Math.PI) + 1) / 2;
    const far = side ? [130, 160, 164] : [120, 161, 154];
    const near = side ? [63, 116, 124] : [30, 105, 98];
    return `rgb(${far.map((v, c) => Math.round(v + (near[c] - v) * depth)).join(',')})`;
  }));
  return {strands, rungs, shades, node:point(.5, phase)};
}

export function geneMark() {
  const frame = frameAt();
  const paths = (depth, highlight = false) => frame.strands.map((s, i) => `<path data-strand="${i}" data-depth="${depth}" d="${s[depth]}"${highlight ? '' : ` stroke="url(#gene-tone-${i})"`}/>`).join('');
  return `<span class="gene-space" aria-hidden="true"><svg class="gene-mark" viewBox="0 0 80 80" focusable="false">
    <defs>${frame.shades.map((colors, i) => `<linearGradient id="gene-tone-${i}" gradientUnits="userSpaceOnUse" x1="0" y1="6" x2="0" y2="76">${colors.map((color, j) => `<stop offset="${j / 8}" stop-color="${color}"/>`).join('')}</linearGradient>`).join('')}
      <linearGradient id="gene-rung-tone" gradientUnits="userSpaceOnUse" x1="24" y1="0" x2="56" y2="0"><stop stop-color="#669991"/><stop offset=".45" stop-color="#aac6c0"/><stop offset="1" stop-color="#789fa4"/></linearGradient>
      <radialGradient id="gene-node-tone" cx="32%" cy="25%" r="75%"><stop stop-color="#b8d6cc"/><stop offset=".38" stop-color="#5a9990"/><stop offset="1" stop-color="#276a64"/></radialGradient>
    </defs>
    <g class="gene-rear">${paths('rear')}</g>
    <g class="gene-rungs">${frame.rungs.map(d => `<path d="${d}"/>`).join('')}</g>
    <g class="gene-front">${paths('front')}<circle class="gene-node" cx="${frame.node.x}" cy="${frame.node.y}" r="2.6" fill="url(#gene-node-tone)"/></g>
    <g class="gene-highlight">${paths('front', true)}</g>
  </svg></span>`;
}

export function animateGeneMark(svg, reduced) {
  const paths = [...svg.querySelectorAll('[data-strand]')];
  const rungs = [...svg.querySelectorAll('.gene-rungs path')];
  const stops = [0, 1].map(i => [...svg.querySelectorAll(`#gene-tone-${i} stop`)]);
  const node = svg.querySelector('.gene-node');
  const layers = {rear:svg.querySelector('.gene-rear'), front:svg.querySelector('.gene-front')};
  let frame = 0, previous = null, elapsed = 0, visible = false;

  function paint(phase) {
    const state = frameAt(phase);
    paths.forEach(path => path.setAttribute('d', state.strands[path.dataset.strand][path.dataset.depth]));
    rungs.forEach((path, i) => path.setAttribute('d', state.rungs[i]));
    stops.forEach((colors, i) => colors.forEach((stop, j) => stop.setAttribute('stop-color', state.shades[i][j])));
    node.setAttribute('cx', fixed(state.node.x));
    node.setAttribute('cy', fixed(state.node.y));
    const layer = state.node.z < 0 ? layers.rear : layers.front;
    if (node.parentNode !== layer) layer.append(node);
    // Keep the original single accent point, with soft shading as it turns away.
    node.setAttribute('opacity', fixed(.72 + .28 * (state.node.z / RADIUS + 1) / 2));
  }
  function tick(time) {
    // 30 fps is ample for a tiny, slow mark; no layout reads in the frame loop.
    if (previous === null) previous = time;
    const delta = time - previous;
    if (delta >= 1000 / 30) {
      elapsed = (elapsed + delta) % TURN_MS;
      previous = time;
      paint(elapsed / TURN_MS * TAU);
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = null;
    if (reduced.matches) {elapsed = 0; paint(0);}
    else if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }).observe(svg);
  }
  // Without an observer, keep the complete static SVG instead of wasting frames.
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => {cancelAnimationFrame(frame); frame = 0; previous = null;});
  window.addEventListener('pageshow', sync);
  sync();
}
