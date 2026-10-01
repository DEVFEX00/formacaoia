// A JORNADA — the student rows an open book across a calm sea; each island
// holds one family of tools from the curriculum. Illustrated (ink + flat
// fills), with a horizontal track driven by the scroll.

const INK = '#141414', PAPER = '#fbf8f1', BEIGE = '#e3dccd', STONE = '#d6cdb9', STONE_D = '#b9ad94', GREEN = '#00D84F', LEATHER = '#16452c';
const S = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

function wave(color, amp, y, len = 2400) {
  let d = `M0,${y}`;
  for (let x = 0; x <= len; x += 100) d += ` Q${x + 50},${y - amp} ${x + 100},${y}`;
  return `<path d="${d} L${len},400 L0,400 Z" fill="${color}"/>`;
}

export function boatSVG() {
  return `
<svg class="boat" viewBox="0 0 520 380" aria-hidden="true">
  <g class="boat__rock">
    <!-- mast + FEX flag (official logo file, not redrawn) -->
    <line x1="150" y1="292" x2="150" y2="96" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="150" cy="92" r="6" fill="${GREEN}" ${S}/>
    <g class="flag">
      <path d="M150,104 Q96,96 20,108 L26,160 Q98,150 150,156 Z" fill="${PAPER}" ${S}/>
      <path d="M26,150 Q98,140 150,146 L150,156 Q98,150 26,160 Z" fill="${GREEN}"/>
      <image href="/brand/fex-logo-black.png" x="36" y="112" width="104" height="26" preserveAspectRatio="xMidYMid meet"/>
    </g>
    <!-- the open book -->
    <path d="M40,300 L250,318 L250,336 L40,316 Z" fill="${LEATHER}" ${S}/>
    <path d="M480,300 L270,318 L270,336 L480,316 Z" fill="${LEATHER}" ${S}/>
    <path d="M250,318 Q260,346 270,318 L270,336 Q260,356 250,336 Z" fill="${LEATHER}" ${S}/>
    <path d="M52,296 L252,312 L252,282 Q160,258 60,270 Z" fill="${PAPER}" ${S}/>
    <path d="M468,296 L268,312 L268,282 Q360,258 460,270 Z" fill="${PAPER}" ${S}/>
    <path d="M252,312 Q260,300 268,312 L268,282 Q260,272 252,282 Z" fill="${BEIGE}" ${S}/>
    <g stroke="rgba(20,20,20,.28)" stroke-width="2"><line x1="90" y1="276" x2="220" y2="284"/><line x1="92" y1="286" x2="210" y2="294"/><line x1="300" y1="284" x2="430" y2="276"/><line x1="310" y1="294" x2="426" y2="287"/></g>
    <path d="M300,312 L306,352 L316,344 L322,354 L318,312" fill="${GREEN}" ${S}/>
    <line x1="60" y1="318" x2="462" y2="318" stroke="${GREEN}" stroke-width="3" opacity=".9"/>
    <!-- the student -->
    <g class="stu">
      <path d="M232,282 L230,236 Q232,210 262,208 L292,210 Q318,214 318,240 L316,282 Z" fill="#1f2a25" ${S}/>
      <path d="M232,282 L340,284 L336,300 L230,298 Z" fill="#2c3934" ${S}/>
      <circle cx="275" cy="182" r="26" fill="#d9ae8a" ${S}/>
      <path d="M249,180 Q248,152 276,152 Q302,154 301,176 Q286,166 268,168 Q256,170 249,180 Z" fill="${INK}"/>
      <g class="stu__cap"><path d="M232,150 L276,132 L322,150 L276,168 Z" fill="${INK}" ${S}/><rect x="258" y="152" width="36" height="14" rx="3" fill="${INK}"/>
        <path d="M318,152 L324,186" stroke="${GREEN}" stroke-width="4"/><circle cx="324" cy="190" r="6" fill="${GREEN}"/></g>
      <g class="stu__oar">
        <path d="M296,228 L372,330" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
        <path d="M296,228 L372,330" stroke="${PAPER}" stroke-width="10" stroke-linecap="round"/>
        <path d="M312,250 L318,258" stroke="${GREEN}" stroke-width="6"/><path d="M346,296 L352,304" stroke="${GREEN}" stroke-width="6"/>
        <path d="M362,318 L396,366 L380,376 L350,330 Z" fill="${PAPER}" ${S}/>
        <path d="M290,222 Q300,216 312,236" fill="none" stroke="#1f2a25" stroke-width="14" stroke-linecap="round"/>
        <circle cx="314" cy="238" r="8" fill="#d9ae8a" ${S}/>
      </g>
    </g>
  </g>
</svg>`;
}

const STRUCT = {
  monolith: `<rect x="150" y="40" width="70" height="150" rx="4" fill="${INK}" ${S}/><rect x="160" y="60" width="50" height="4" fill="${GREEN}"/><rect x="160" y="72" width="34" height="3" fill="#6b6b6b"/>`,
  lighthouse: `<path d="M160,190 L172,60 L206,60 L218,190 Z" fill="${PAPER}" ${S}/><path d="M166,130 L212,130 L214,150 L164,150 Z" fill="${GREEN}"/><path d="M169,95 L209,95 L210,110 L168,110 Z" fill="${GREEN}"/><rect x="168" y="36" width="42" height="26" fill="#fff6c4" ${S}/><path d="M164,36 L189,18 L214,36 Z" fill="${INK}"/><path class="beam" d="M210,48 L330,20 L330,76 Z" fill="${GREEN}" opacity=".18"/>`,
  arch: `<rect x="110" y="80" width="34" height="110" fill="${STONE}" ${S}/><rect x="234" y="80" width="34" height="110" fill="${STONE}" ${S}/><path d="M104,84 Q189,-4 274,84 L274,96 L104,96 Z" fill="${STONE}" ${S}/><rect x="160" y="104" width="58" height="70" rx="4" fill="${INK}" ${S}/><rect x="168" y="114" width="42" height="4" fill="${GREEN}"/>`,
  studio: `<path d="M120,190 L120,100 L189,56 L258,100 L258,190 Z" fill="${PAPER}" ${S}/><rect x="146" y="112" width="86" height="56" rx="4" fill="${INK}" ${S}/><circle cx="189" cy="140" r="12" fill="${GREEN}"/><path d="M185,134 L197,140 L185,146 Z" fill="${INK}"/>`,
  workshop: `<rect x="120" y="140" width="56" height="50" fill="${BEIGE}" ${S}/><rect x="176" y="112" width="56" height="78" fill="${PAPER}" ${S}/><rect x="148" y="94" width="40" height="46" fill="${GREEN}" ${S}/><path d="M250,190 L250,40 L330,40" fill="none" ${S}/><path d="M330,40 L330,70" ${S}/><rect x="318" y="70" width="24" height="16" fill="${INK}"/>`,
  observatory: `<rect x="130" y="120" width="120" height="70" fill="${PAPER}" ${S}/><path d="M124,122 Q190,40 256,122 Z" fill="${BEIGE}" ${S}/><path d="M190,86 L250,54" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><circle cx="190" cy="150" r="12" fill="${GREEN}" ${S}/>`,
};

export function islandSVG(kind) {
  return `
<svg class="isle" viewBox="0 0 380 260" aria-hidden="true">
  <path d="M40,200 Q70,160 130,170 Q190,150 250,168 Q320,158 350,200 Q300,236 190,238 Q80,236 40,200 Z" fill="${STONE}" ${S}/>
  <path d="M60,212 Q190,250 330,212" fill="none" stroke="${STONE_D}" stroke-width="10" stroke-linecap="round"/>
  ${STRUCT[kind] || STRUCT.monolith}
  <circle cx="300" cy="170" r="7" fill="${GREEN}" ${S}/><line x1="300" y1="177" x2="300" y2="196" ${S}/>
</svg>`;
}

// far islands (horizon) and near things (buoys, rocks, reeds) for depth
const FAR = (x, w, h, tone) => `<path d="M${x},100 Q${x + w * 0.2},${100 - h} ${x + w * 0.45},${100 - h * 0.8} Q${x + w * 0.7},${100 - h * 1.05} ${x + w},100 Z" fill="${tone}"/>`;
const NEAR = {
  buoy: `<svg viewBox="0 0 80 140" class="nr nr--buoy"><path d="M20,120 L26,50 L54,50 L60,120 Z" fill="${GREEN}" ${S}/><rect x="24" y="72" width="32" height="14" fill="${PAPER}" ${S}/><path d="M34,50 L40,22 L46,50" fill="none" ${S}/><circle class="blink" cx="40" cy="18" r="7" fill="#eaffef" ${S}/><path d="M6,122 Q40,112 74,122" fill="none" stroke="#eaffef" stroke-width="4" stroke-linecap="round" opacity=".7"/></svg>`,
  rock: `<svg viewBox="0 0 200 110" class="nr nr--rock"><path d="M10,100 Q30,40 80,46 Q110,20 150,50 Q190,60 194,100 Z" fill="${STONE}" ${S}/><path d="M60,70 Q90,58 120,72" fill="none" stroke="${STONE_D}" stroke-width="6" stroke-linecap="round"/></svg>`,
  reeds: `<svg viewBox="0 0 120 150" class="nr nr--reeds"><g ${S} fill="none"><path d="M30,150 Q26,90 12,40"/><path d="M50,150 Q52,80 44,20"/><path d="M70,150 Q76,90 92,46"/><path d="M88,150 Q96,110 112,84"/></g><g fill="#2a7a5b" ${S}><ellipse cx="12" cy="40" rx="6" ry="16"/><ellipse cx="44" cy="20" rx="6" ry="16"/><ellipse cx="92" cy="46" rx="6" ry="16"/></g></svg>`,
};

function toolIcon(t) {
  return t.logo ? `<img class="tool__ico" src="${t.logo}" alt="" loading="lazy">` : `<span class="tool__ico" aria-hidden="true">${t.mono || t.name[0]}</span>`;
}

export function buildVoyage(root, groups) {
  let far = '';
  for (let i = 0; i < 16; i++) { const x = i * 260 + (i % 3) * 70; far += FAR(x, 180 + (i % 4) * 60, 26 + (i % 5) * 9, i % 2 ? '#cdd6ca' : '#d8ded2'); }
  let near = '';
  const kinds = ['buoy', 'reeds', 'rock', 'buoy', 'rock', 'reeds'];
  for (let i = 0; i < 14; i++) near += `<div class="near__it" style="--x:${i * 58 + 30 + (i % 3) * 14}vw">${NEAR[kinds[i % kinds.length]]}</div>`;
  root.innerHTML = `
  <div class="sky"><div class="sun"></div><svg class="hills" viewBox="0 0 1600 200" preserveAspectRatio="none"><path d="M0,200 L0,130 Q200,70 420,120 Q640,160 860,100 Q1100,40 1320,110 Q1480,150 1600,120 L1600,200 Z" fill="#d7dccf"/><path d="M0,200 L0,160 Q300,120 600,150 Q900,176 1200,140 Q1420,118 1600,150 L1600,200 Z" fill="#c9d3c4"/></svg></div>
  <svg class="far" viewBox="0 0 4400 100" preserveAspectRatio="none" aria-hidden="true">${far}</svg>
  <div class="vtrack"></div>
  <div class="sea">
    <svg class="wave wave1" viewBox="0 0 2400 400" preserveAspectRatio="none">${wave('#2a7a5b', 18, 60)}</svg>
    <div class="boat-wrap">
      <svg class="wake" viewBox="0 0 400 60" aria-hidden="true"><path d="M400,30 Q300,20 200,34 T0,28" /><path d="M400,40 Q280,46 160,40 T0,46" /><path d="M380,22 Q300,12 220,20" /></svg>
      ${boatSVG()}
    </div>
    <svg class="wave wave2" viewBox="0 0 2400 400" preserveAspectRatio="none">${wave('#1c6549', 22, 110)}</svg>
    <div class="near">${near}</div>
    <svg class="wave wave3" viewBox="0 0 2400 400" preserveAspectRatio="none">${wave('#114d37', 26, 170)}</svg>
  </div>`;
  const track = root.querySelector('.vtrack');
  groups.forEach((g, i) => {
    const stop = document.createElement('article');
    stop.className = 'stop';
    stop.innerHTML = `
      <div class="stop__card${g.tools.length > 4 ? ' is-wide' : ''}">
        <header class="stop__head"><span class="stop__num">${String(i + 1).padStart(2, '0')}</span><span class="stop__name">${g.name}</span></header>
        <ul class="tools">${g.tools.map((t) => `<li class="tool">${toolIcon(t)}<div><strong>${t.name}</strong><span>${t.does}</span></div></li>`).join('')}</ul>
      </div>
      <div class="stop__isle">${islandSVG(g.island)}</div>`;
    track.appendChild(stop);
  });
  const end = document.createElement('div');
  end.className = 'stop stop--end';
  end.innerHTML = `<p class="stop__end">Do primeiro login ao <span class="hl">entregável concluído</span>.</p>`;
  track.appendChild(end);
  return {
    track, stops: [...track.querySelectorAll('.stop')], isles: [...track.querySelectorAll('.stop__isle')],
    boat: root.querySelector('.boat-wrap'), far: root.querySelector('.far'), near: root.querySelector('.near'),
  };
}