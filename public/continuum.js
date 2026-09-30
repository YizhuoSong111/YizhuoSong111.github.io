// An illustrative model, shared by the static renderer and its interactive enhancement.
// These curves explain state dependence; they do not encode research measurements.
const xAt = t => 42 + t * 416;
const effects = [
  t => 204 - 145 * (t * t * (3 - 2 * t)),
  t => 75 + 122 * (t * t * (3 - 2 * t)),
  () => 139,
];
const curve = fn => Array.from({length:81}, (_, i) => {
  const t = i / 80;
  return `${i ? 'L' : 'M'}${xAt(t).toFixed(2)},${fn(t).toFixed(2)}`;
}).join(' ');

export function continuumFigure(id) {
  return `<figure class="continuum" data-continuum>
    <div class="figure-heading"><span class="eyebrow">State-dependent regulation</span><span class="figure-symbol" aria-hidden="true">↗</span></div>
    <svg viewBox="0 0 500 280" role="img" aria-label="Illustrative genetic effects across a continuous cellular state: one increases, one decreases, and one remains constant.">
      <text x="42" y="25">Genetic effect</text>
      <path class="guide" d="M42 59H458M42 139H458M42 219H458"/>
      <path class="axis" d="M42 44V235H458"/>
      ${effects.map((fn,i)=>`<path class="effect-curve effect-${i}" d="${curve(fn)}"/>`).join('')}
      <g class="state-marker" aria-hidden="true"><path class="state-line" d="M${xAt(.35)} 44V235"/>${effects.map((fn,i)=>`<circle class="effect-dot effect-${i}" cx="${xAt(.35)}" cy="${fn(.35)}" r="5"/>`).join('')}</g>
      <text x="42" y="261">0</text><text x="250" y="261" text-anchor="middle">Continuous cellular state</text><text x="458" y="261" text-anchor="end">1</text>
    </svg>
    <div class="continuum-controls" hidden>
      <div class="range-label"><label for="${id}">Explore cellular state</label><output for="${id}" aria-live="off">0.35</output></div>
      <input id="${id}" type="range" min="0" max="100" value="35" step="1" aria-describedby="${id}-note">
    </div>
    <div class="figure-legend" aria-label="Curve types"><span><i class="legend-dynamic" aria-hidden="true"></i>State-dependent effects</span><span><i class="legend-static" aria-hidden="true"></i>Shared effect</span></div>
    <figcaption id="${id}-note">Conceptual illustration · not empirical data</figcaption>
  </figure>`;
}

export function enhanceContinuums() {
  document.querySelectorAll('[data-continuum]').forEach(figure => {
    const input = figure.querySelector('input');
    const output = figure.querySelector('output');
    const line = figure.querySelector('.state-line');
    const dots = [...figure.querySelectorAll('.effect-dot')];
    const update = () => {
      const t = Number(input.value) / 100;
      const x = xAt(t);
      output.value = t.toFixed(2);
      input.setAttribute('aria-valuetext', `Cellular state ${t.toFixed(2)}`);
      input.style.setProperty('--range-progress', `${input.value}%`);
      line.setAttribute('d', `M${x} 44V235`);
      dots.forEach((dot, i) => {
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', effects[i](t));
      });
    };
    input.addEventListener('input', update);
    update();
    figure.querySelector('.continuum-controls').hidden = false;
  });
}
