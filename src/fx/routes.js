// Where the green line travels. Each anchor is [selector, x, y, only?] with
// x/y as fractions of the element's box (values outside 0–1 sit beside it);
// `only` = 'm' (phones) or 'd' (desktop) for layout-specific detours.
// Rule: the line never crosses running text — it uses the margins and the
// gaps between opaque cards, and disappears behind them.
export const ROUTES = [
  // A TESE → O CENÁRIO
  [
    ['.punch', 1.04, 0.0, 'd'],
    ['.punch', 0.965, 0.35, 'd'],
    ['.punch', 0.975, 0.85, 'd'],
    ['#cenario', 0.97, 0.12, 'd'],
    ['.stats', 1.08, -0.04, 'm'],
    ['.stat:nth-child(2)', 0.75, 0.3],
    ['.stat:nth-child(1)', 0.3, 0.7],
    ['.stat:nth-child(3)', 0.3, 0.35],
    ['.stat:nth-child(4)', 0.75, 0.7],
    ['.stats', 1.08, 1.04],
    ['#cenario', 1.12, 0.96],
  ],
  // GRADE → TRILHAS → ATUALIZAÇÃO → DIFERENCIAIS → CONVERSÃO
  [
    ['#grade', 1.08, 0.0],
    ['.grade__nums', 1.03, -0.3],
    ['.gnum:nth-child(3)', 0.6, 0.4],
    ['.gnum:nth-child(1)', 0.4, 0.6],
    ['.grade__nums', -0.03, 1.4],
    ['.modules', -0.03, 0.5],
    ['.modules', -0.03, 1.0],
    ['.track:nth-child(1)', 0.4, 0.3],
    ['.track:nth-child(2)', 0.6, 0.7],
    ['.split__bar', 0.5, 0.5],
    ['.update', 1.08, 0.2],
    ['.upd-item:nth-child(4)', 0.5, 0.3],
    ['.upd-item:nth-child(1)', 0.5, 0.7],
    ['.update', -0.06, 0.98],
    ['.certz', -0.03, 0.05],
    ['.cert', 0.25, 0.35],
    ['.cert', 0.75, 0.7],
    ['.certz__copy', 1.08, 0.15, 'm'],
    ['.certz__copy', 1.08, 0.9, 'm'],
    ['.why__item:nth-child(1)', 0.5, 0.5],
    ['.why__item:nth-child(3)', 0.5, 0.5],
    ['.why__item:nth-child(6)', 0.5, 0.5],
    ['.format', 1.04, 0.1],
    ['.format', 1.04, 1.0],
    ['.final__cta', -0.6, 1.6],
    ['.final__note', 1.15, 1.6],
    ['.final', 1.1, 0.9],
  ],
];
