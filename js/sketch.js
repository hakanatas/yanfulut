// Çizim motoru: SVG parçalarını tahtaya ekler ve elle çiziliyormuş gibi canlandırır.

const NS = 'http://www.w3.org/2000/svg';
const DRAWABLE = 'path, line, circle, ellipse, rect, polyline, polygon';
const PX_PER_SEC = 700;

export function svgFragment(markup) {
  const wrap = document.createElementNS(NS, 'svg');
  wrap.innerHTML = markup;
  const g = document.createElementNS(NS, 'g');
  while (wrap.firstChild) g.appendChild(wrap.firstChild);
  return g;
}

/**
 * Bir SVG grubunu çizgi çizgi canlandırır.
 * @returns {{animations: Animation[], duration: number}}
 */
export function animateDraw(g, { maxDuration = 4000, startDelay = 0 } = {}) {
  const items = [...g.querySelectorAll(`${DRAWABLE}, text`)];
  const plan = items.map((node) => {
    const cs = getComputedStyle(node);
    const hasStroke = cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0;
    const hasFill = cs.fill !== 'none' && parseFloat(cs.fillOpacity) > 0;
    let len = 0;
    if (hasStroke && node.getTotalLength) {
      try {
        len = node.getTotalLength();
      } catch {
        len = 0;
      }
    }
    return { node, len, hasStroke: hasStroke && len > 0, hasFill, isText: node.tagName === 'text' };
  });

  const raw = plan.map((p) => (p.hasStroke ? Math.max(120, (p.len / PX_PER_SEC) * 1000) : 180));
  const total = raw.reduce((a, b) => a + b, 0);
  const scale = total > maxDuration ? maxDuration / total : 1;

  const animations = [];
  let t = startDelay;
  plan.forEach((p, i) => {
    const d = raw[i] * scale;
    const { node } = p;
    if (p.isText) {
      animations.push(
        node.animate(
          [
            { opacity: 0, transform: 'translateY(6px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: Math.max(200, d), delay: t, fill: 'both', easing: 'ease-out' },
        ),
      );
    } else if (p.hasStroke) {
      node.style.strokeDasharray = `${p.len} ${p.len}`;
      animations.push(
        node.animate([{ strokeDashoffset: p.len }, { strokeDashoffset: 0 }], {
          duration: d,
          delay: t,
          fill: 'both',
          easing: 'ease-in-out',
        }),
      );
      if (p.hasFill) {
        const fo = getComputedStyle(node).fillOpacity;
        animations.push(node.animate([{ fillOpacity: 0 }, { fillOpacity: fo }], { duration: 250, delay: t + d * 0.7, fill: 'both' }));
      }
    } else {
      animations.push(node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: d, delay: t, fill: 'both' }));
    }
    t += d * 0.85;
  });
  return { animations, duration: t - startDelay };
}

/** Tahta: sahnelerin üst üste çizildiği SVG yüzeyi */
export class Board {
  constructor(svg) {
    this.svg = svg;
    this.layer = document.createElementNS(NS, 'g');
    this.layer.setAttribute('filter', 'url(#sketchy)');
    svg.appendChild(this.layer);
    this.animations = [];
  }

  clear() {
    this.finish();
    this.layer.replaceChildren();
    this.animations = [];
  }

  /** Bir parçayı ekler. instant=true ise animasyonsuz gösterir. */
  draw(markup, { instant = false, maxDuration } = {}) {
    if (!markup) return 0;
    const g = svgFragment(markup);
    this.layer.appendChild(g);
    if (instant) return 0;
    const { animations, duration } = animateDraw(g, { maxDuration });
    this.animations.push(...animations);
    return duration;
  }

  pause() {
    this.animations.forEach((a) => a.playState === 'running' && a.pause());
  }

  resume() {
    this.animations.forEach((a) => a.playState === 'paused' && a.play());
  }

  finish() {
    this.animations.forEach((a) => {
      try {
        a.finish();
      } catch {
        /* sonsuz değil, yoksay */
      }
    });
  }
}
