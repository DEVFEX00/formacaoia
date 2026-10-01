import { thesis, scenario, modules, tracks, update, whyUs, format, institution, cta, certificate } from '../content.js';

// Fills the flowing (non-pinned) sections from content.js. Motion comes from
// reveal.js (words, counters, highlighter), ui/cards.js (cards with
// data-tilt / data-float) and the page-anchored ribbon.
const $ = (s) => document.querySelector(s);
const pad = (n) => String(n).padStart(2, '0');

// the certificate as a rolled diploma tied with the green ribbon (FEX seal on the knot)
function diplomaSVG(cd) {
  return `
<svg class="diploma" viewBox="40 34 565 270" role="img" aria-label="${cd.kind} — ${cd.course}, ${cd.issuer}">
  <defs>
    <linearGradient id="dpPaper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf7"/><stop offset=".38" stop-color="#f6eedb"/><stop offset=".72" stop-color="#e4d6b8"/><stop offset="1" stop-color="#c7b58e"/></linearGradient>
    <radialGradient id="dpEnd" cx=".45" cy=".5" r=".6"><stop offset="0" stop-color="#f4ead6"/><stop offset="1" stop-color="#d2c09a"/></radialGradient>
    <linearGradient id="dpRib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4cf58a"/><stop offset=".45" stop-color="#00D84F"/><stop offset="1" stop-color="#077a33"/></linearGradient>
    <linearGradient id="dpRibD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0aa944"/><stop offset="1" stop-color="#05561f"/></linearGradient>
  </defs>
  <ellipse class="diploma__shadow" cx="320" cy="292" rx="230" ry="14" fill="rgba(11,30,20,.16)"/>
  <g transform="rotate(-9 320 165)">
    <path d="M78,112 L560,112 A22,52 0 0 1 560,216 L78,216 Z" fill="url(#dpPaper)" stroke="rgba(60,45,20,.22)" stroke-width="1.5"/>
    <rect x="82" y="124" width="476" height="7" rx="3.5" fill="#fff" opacity=".55"/>
    <path d="M560,112 A22,52 0 0 1 560,216" fill="none" stroke="rgba(60,45,20,.18)" stroke-width="1.5"/>
    <image href="/brand/fex-logo-black.png" x="120" y="150" width="130" height="26" opacity=".55" preserveAspectRatio="xMinYMid meet"/>
    <text x="392" y="168" font-family="Montserrat, sans-serif" font-size="13" font-weight="800" letter-spacing="4" fill="rgba(11,11,10,.38)">CERTIFICADO</text>
    <text x="392" y="186" font-family="Montserrat, sans-serif" font-size="8.5" font-weight="600" letter-spacing="1.5" fill="rgba(11,11,10,.32)">CAPACITAÇÃO PROFISSIONAL EM IA</text>
    <ellipse cx="78" cy="164" rx="22" ry="52" fill="url(#dpEnd)" stroke="rgba(60,45,20,.25)" stroke-width="1.5"/>
    <g fill="none" stroke="#c4af83" stroke-width="1.6"><ellipse cx="80" cy="164" rx="15" ry="37"/><ellipse cx="81" cy="164" rx="9" ry="23"/><ellipse cx="82" cy="164" rx="3.5" ry="9"/></g>
    <rect x="300" y="110" width="34" height="108" fill="url(#dpRib)"/>
    <rect x="300" y="110" width="4" height="108" fill="#067a33" opacity=".5"/><rect x="330" y="110" width="4" height="108" fill="#067a33" opacity=".5"/>
    <g class="diploma__tails">
      <path d="M309,124 L270,262 L285,250 L295,268 L322,128 Z" fill="url(#dpRibD)"/>
      <path d="M325,124 L362,264 L347,253 L338,270 L312,128 Z" fill="url(#dpRib)"/>
    </g>
    <g class="diploma__bow">
      <path d="M317,114 C268,58 222,88 247,116 C261,132 297,126 317,114 Z" fill="url(#dpRib)" stroke="#067a33" stroke-width="1.5"/>
      <path d="M317,114 C366,58 412,88 387,116 C373,132 337,126 317,114 Z" fill="url(#dpRib)" stroke="#067a33" stroke-width="1.5"/>
      <path d="M262,102 C276,92 296,102 308,112" fill="none" stroke="#067a33" stroke-width="2" opacity=".55"/>
      <path d="M372,102 C358,92 338,102 326,112" fill="none" stroke="#067a33" stroke-width="2" opacity=".55"/>
      <circle cx="317" cy="114" r="19" fill="#0b0b0a" stroke="#00D84F" stroke-width="2.5"/>
      <text x="317" y="118" text-anchor="middle" font-family="Montserrat, sans-serif" font-size="11" font-weight="900" fill="#00D84F" letter-spacing=".5">FEX</text>
    </g>
  </g>
</svg>`;
}

export function fillContent() {
  // A TESE
  $('[data-punch]').innerHTML = `${thesis.punch[0]}<br>${thesis.punch[1]} <span class="hl">${thesis.punch[2]}</span>`;
  $('.punch__body').textContent = thesis.body;

  // O CENÁRIO
  $('[data-scenario]').innerHTML = `${scenario.title[0]}<br>${scenario.title[1]} <span class="hl">${scenario.title[2]}</span>`;
  $('.scenario .stats').innerHTML = scenario.stats.map((s, i) => `
    <article class="stat" data-tilt data-float="${[0.03, 0.09, 0.03, 0.09][i]}">
      <p class="stat__v">${s.prefix ? `<small>${s.prefix}</small>` : ''}<span data-count="${s.value}">0</span>${s.suffix}</p>
      <p class="stat__t">${s.text}</p>
      <p class="stat__s">${s.source}</p>
    </article>`).join('');
  $('.scenario__closer').innerHTML = scenario.closer.replace('é exatamente aí que está o prêmio', '<strong>é exatamente aí que está o prêmio</strong>');

  // GRADE
  const total = modules.reduce((s, m) => s + m.lessons.length, 0);
  $('.grade__nums').innerHTML = [['10', 'mini módulos'], [String(total), 'aulas estruturadas'], ['25', 'ferramentas ensinadas', '+']]
    .map(([v, l, suf]) => `<div class="gnum reveal" data-tilt><strong><span data-count="${v}">0</span>${suf || ''}</strong><span>${l}</span></div>`).join('');
  $('.modules').innerHTML = modules.map((m) => `
    <details class="module">
      <summary>
        <span class="module__code">Módulo ${m.code}</span>
        <span class="module__t">${m.title}${m.tag ? ` <em>· ${m.tag}</em>` : ''}</span>
        <span class="module__n">${m.lessons.length} aulas</span>
        <i class="module__plus" aria-hidden="true"></i>
      </summary>
      <ol>${m.lessons.map((l, i) => `<li><span>${m.code}.${pad(i + 1)}</span>${l}</li>`).join('')}</ol>
    </details>`).join('');

  // TRILHAS — each card carries its specialisation lessons (modules 07A/07B)
  $('.tracks__grid').innerHTML = tracks.map((t, i) => {
    const m = modules.find((x) => x.code === `07${t.id}`);
    return `
    <article class="track" data-tilt data-float="${[0.03, 0.08][i]}">
      <span class="track__pill">Trilha ${t.id}</span>
      <h3>${t.title}</h3>
      <p>${t.text}</p>
      ${m ? `<p class="track__k">Na especialização</p><ol class="track__list">${m.lessons.map((l) => `<li>${l}</li>`).join('')}</ol>` : ''}
      <p class="track__focus">${t.focus}</p>
      <span class="track__big" aria-hidden="true">${t.id}</span>
    </article>`;
  }).join('');

  // ATUALIZAÇÃO
  $('.update .kicker').textContent = update.kicker;
  $('.update__title').innerHTML = `${update.title[0]}<br>${update.title[1]} <span class="accent">${update.title[2]}</span>`;
  $('.update__lede').textContent = update.lede;
  $('.update__grid').innerHTML = update.items.map((u, i) => `
    <article class="upd-item" data-tilt data-float="${[0.02, 0.07, 0.12, 0.07][i]}"><span class="upd-item__n">${pad(i + 1)}</span><h3>${u.title}</h3><p>${u.text}</p><i class="live"></i></article>`).join('');
  const tick = update.ticker.map((x) => `<span>${x}</span><i></i>`).join('');
  $('.ticker__track').innerHTML = tick + tick + tick;

  // POR QUE + FORMATO
  $('.why__grid').innerHTML = whyUs.map((w, i) => `<article class="why__item" data-tilt data-float="${[0.02, 0.06, 0.1][i % 3]}"><span>${pad(i + 1)}</span><h3>${w.title}</h3><p>${w.text}</p></article>`).join('');
  // CERTIFICADO — o diploma enrolado com laço
  const cd = certificate.doc;
  $('.certz__copy .kicker').textContent = certificate.kicker;
  $('.certz__title').innerHTML = certificate.title;
  $('.certz__text').textContent = certificate.text;
  $('.cert').innerHTML = diplomaSVG(cd);
  $('.format').innerHTML = format.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');

  // CONVERSÃO + rodapé
  $('.final__closer').textContent = cta.closer;
  $('.foot__inst').innerHTML = institution.lines.join('<br>');
  document.querySelectorAll('a[href="#conversao"]').forEach((a) => {
    a.href = cta.href;
    if (cta.onClick) a.addEventListener('click', (e) => cta.onClick(e, a.className));
  });
}
