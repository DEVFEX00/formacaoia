// A MULETA — editorial illustration (ink outlines, flat fills, FEX palette).
// The old way of working at a desk; a giant crutch swings in like a pendulum
// and knocks the scene apart. Every object is its own <g> so the scroll can
// throw it (translate + rotate + gravity), reversibly.

const INK = '#141414', PAPER = '#ffffff', BEIGE = '#e3dccd', GREY = '#bdb6a8', DARK = '#2b2b2b', GREEN = '#00D84F', SKIN = '#d9ae8a';
const S = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

export const PIVOT = { x: 1330, y: -330 };
export const CRUTCH_LEN = 1150;

function sheets(x, y, n) {
  let o = '';
  for (let k = 0; k < n; k++) o += `<rect x="${x + (k % 2) * 3}" y="${y - k * 7}" width="96" height="7" rx="1" fill="${PAPER}" ${S}/>`;
  return o;
}

export function buildMuleta(root) {
  root.innerHTML = `
<svg class="mul" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax meet">
  <defs>
    <linearGradient id="alu" x1="0" x2="1"><stop offset="0" stop-color="#9aa1a4"/><stop offset=".45" stop-color="#eef1f2"/><stop offset="1" stop-color="#8c9396"/></linearGradient>
  </defs>
  <line x1="120" y1="800" x2="1480" y2="800" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="760" cy="806" rx="430" ry="16" fill="rgba(0,0,0,.07)"/>

  <g class="obj" data-x="300" data-kind="light">  <!-- wall clock -->
    <circle cx="300" cy="250" r="62" fill="${PAPER}" ${S}/>
    <circle cx="300" cy="250" r="4" fill="${INK}"/>
    <line class="clock-m" x1="300" y1="250" x2="300" y2="205" ${S}/>
    <line class="clock-h" x1="300" y1="250" x2="330" y2="250" ${S}/>
  </g>
  <g class="obj" data-x="520" data-kind="light">  <!-- sticky notes -->
    <rect x="470" y="200" width="54" height="54" fill="#fff2a8" ${S} transform="rotate(-4 497 227)"/>
    <rect x="535" y="215" width="54" height="54" fill="#cfeedd" ${S} transform="rotate(5 562 242)"/>
  </g>

  <g class="obj" data-x="1230" data-kind="heavy">  <!-- file cabinet -->
    <rect x="1170" y="520" width="150" height="280" rx="6" fill="${GREY}" ${S}/>
    <line x1="1170" y1="613" x2="1320" y2="613" ${S}/><line x1="1170" y1="706" x2="1320" y2="706" ${S}/>
    <rect x="1225" y="560" width="40" height="10" rx="4" fill="${DARK}"/><rect x="1225" y="653" width="40" height="10" rx="4" fill="${DARK}"/><rect x="1225" y="746" width="40" height="10" rx="4" fill="${DARK}"/>
    ${sheets(1190, 512, 5)}
  </g>

  <g class="obj" data-x="760" data-kind="heavy">  <!-- desk -->
    <rect x="360" y="600" width="780" height="24" rx="4" fill="${BEIGE}" ${S}/>
    <rect x="390" y="624" width="18" height="176" fill="${DARK}"/>
    <rect x="980" y="624" width="140" height="176" rx="4" fill="${BEIGE}" ${S}/>
    <line x1="980" y1="686" x2="1120" y2="686" ${S}/><line x1="980" y1="742" x2="1120" y2="742" ${S}/>
  </g>

  <g class="obj" data-x="610" data-kind="mid">  <!-- old monitor -->
    <rect x="520" y="430" width="200" height="160" rx="12" fill="${BEIGE}" ${S}/>
    <rect x="540" y="448" width="160" height="112" rx="6" fill="#20303a" ${S}/>
    <g stroke="rgba(200,220,225,.55)" stroke-width="2">
      <line x1="548" y1="470" x2="692" y2="470"/><line x1="548" y1="488" x2="692" y2="488"/><line x1="548" y1="506" x2="692" y2="506"/><line x1="548" y1="524" x2="692" y2="524"/><line x1="548" y1="542" x2="692" y2="542"/>
      <line x1="590" y1="456" x2="590" y2="556"/><line x1="640" y1="456" x2="640" y2="556"/>
    </g>
    <rect x="596" y="590" width="48" height="12" fill="${GREY}" ${S}/>
  </g>
  <g class="obj" data-x="620" data-kind="light"><rect x="560" y="590" width="130" height="12" rx="3" fill="${PAPER}" ${S}/></g>  <!-- keyboard -->

  <g class="obj" data-x="880" data-kind="mid">  <!-- paper stacks -->
    ${sheets(830, 592, 14)}${sheets(930, 592, 9)}
  </g>
  <g class="obj" data-x="1060" data-kind="light">  <!-- mug -->
    <rect x="1040" y="556" width="40" height="44" rx="6" fill="${PAPER}" ${S}/><path d="M1080,566 q18,4 0,24" fill="none" ${S}/>
  </g>
  <g class="obj" data-x="440" data-kind="mid">  <!-- plant -->
    <rect x="410" y="540" width="60" height="60" rx="8" fill="${DARK}" ${S}/>
    <path d="M440,540 C420,480 380,470 370,450 C410,452 436,480 440,520 C444,470 470,440 500,432 C492,470 460,500 440,540 Z" fill="#2f7d4a" ${S}/>
  </g>

  <g class="obj person" data-x="470" data-kind="person">  <!-- the person, typing -->
    <rect x="300" y="640" width="120" height="16" rx="4" fill="${DARK}"/>
    <rect x="352" y="656" width="12" height="130" fill="${DARK}"/><rect x="310" y="786" width="96" height="10" rx="4" fill="${DARK}"/>
    <rect x="286" y="480" width="22" height="170" rx="8" fill="${DARK}"/>
    <path d="M330,640 L318,520 Q322,480 368,476 L400,478 Q432,486 436,530 L440,640 Z" fill="#1f4a33" ${S}/>
    <path d="M430,640 L520,640 L520,690 L500,690 L496,660 L430,660 Z" fill="#2c3e35" ${S}/>
    <circle cx="378" cy="430" r="40" fill="${SKIN}" ${S}/>
    <path d="M338,428 Q336,382 380,382 Q420,384 418,420 Q400,404 370,408 Q350,412 338,428 Z" fill="${INK}"/>
    <g class="arm"><path d="M400,500 Q450,540 540,586" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M400,500 Q450,540 540,586" fill="none" stroke="#1f4a33" stroke-width="16" stroke-linecap="round"/><circle cx="546" cy="588" r="10" fill="${SKIN}" ${S}/></g>
  </g>

  <g class="flying-sheets">${Array.from({ length: 12 }, (_, i) => `<rect class="fly" x="-48" y="-7" width="96" height="14" rx="1" fill="${PAPER}" ${S} data-i="${i}"/>`).join('')}</g>

  <circle class="impact-ring" cx="700" cy="560" r="10" fill="none" stroke="${GREEN}" stroke-width="6" opacity="0"/>

  <g class="crutch" transform="translate(${PIVOT.x} ${PIVOT.y}) rotate(-40)">
    <g class="crutch-body">
      <rect x="-120" y="0" width="240" height="46" rx="23" fill="#1f1f1f" ${S}/>
      <path d="M-90,40 C-110,300 -40,640 -18,760" fill="none" stroke="${INK}" stroke-width="30" stroke-linecap="round"/>
      <path d="M90,40 C110,300 40,640 18,760" fill="none" stroke="${INK}" stroke-width="30" stroke-linecap="round"/>
      <path d="M-90,40 C-110,300 -40,640 -18,760" fill="none" stroke="url(#alu)" stroke-width="22" stroke-linecap="round"/>
      <path d="M90,40 C110,300 40,640 18,760" fill="none" stroke="url(#alu)" stroke-width="22" stroke-linecap="round"/>
      <rect x="-95" y="392" width="190" height="36" rx="18" fill="${GREEN}" ${S}/>
      <rect x="-34" y="740" width="68" height="60" rx="10" fill="#6e7478" ${S}/>
      <rect x="-18" y="796" width="36" height="300" fill="url(#alu)" ${S}/>
      ${[0, 1, 2, 3, 4].map((k) => `<circle cx="0" cy="${840 + k * 48}" r="6" fill="${INK}"/>`).join('')}
      <rect x="-30" y="1090" width="60" height="70" rx="18" fill="#1f1f1f" ${S}/>
    </g>
  </g>
</svg>`;
  const svg = root.querySelector('svg');
  return {
    svg,
    crutch: svg.querySelector('.crutch'),
    ring: svg.querySelector('.impact-ring'),
    objs: [...svg.querySelectorAll('.obj')].map((g, i) => ({ g, x: parseFloat(g.dataset.x), kind: g.dataset.kind, i })),
    flyers: [...svg.querySelectorAll('.fly')],
    clockM: svg.querySelector('.clock-m'), clockH: svg.querySelector('.clock-h'),
    arm: svg.querySelector('.arm'),
  };
}
