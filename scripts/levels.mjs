// 离线挑关卡：每关生成一批候选打分，挑最贴近目标的种子写回 src/game.html
// 挑战模式：按开局可消对数、模拟玩家必须自己推的比例和「打开局面」次数打分
// 爽玩模式：只看开局宽松度和「推一下爆一串」的次数，越多越好
// 用法：node scripts/levels.mjs [最大关数=60] [模式=all|challenge|casual]
import { readFileSync, writeFileSync } from 'node:fs';
import { GAME, loadEngine } from './engine.mjs';

const MAX = Number(process.argv[2] || 60);
const ONLY = process.argv[3] || 'all';
const E = loadEngine([]);
const MARK = {
  challenge: [/\/\*SEEDS-START\*\/[\s\S]*?\/\*SEEDS-END\*\//, s => `/*SEEDS-START*/const LEVEL_SEEDS=${s};/*SEEDS-END*/`],
  casual: [/\/\*CASUAL-SEEDS-START\*\/[\s\S]*?\/\*CASUAL-SEEDS-END\*\//, s => `/*CASUAL-SEEDS-START*/const CASUAL_SEEDS=${s};/*CASUAL-SEEDS-END*/`],
};
const t0 = Date.now();
let html = readFileSync(GAME, 'utf8');
for (const mode of ['challenge', 'casual']) {
  if (ONLY !== 'all' && ONLY !== mode) continue;
  const seeds = [];
  const rows = [];
  for (let L = 1; L <= MAX; L++) {
    const P = E.levelParams(L, mode);
    const candidates = P.script ? 400 : mode === 'casual' ? 30 : L <= 10 ? 36 : 20;
    let best = null, bestScore = -Infinity;
    for (let s = 0; s < candidates; s++) {
      const g = E.generateSeed(L, s, mode);
      if (!g) continue;
      const quick = E.scoreLevel(g, 0);
      if (P.script || mode === 'casual') { if (quick > bestScore) { bestScore = quick; best = g; } if (P.script && quick > 0) break; continue; }
      // 先用便宜的开局指标筛掉明显不合格的，再跑模拟玩家
      if (quick < bestScore - 40) continue;
      const sc = E.scoreLevel(g, 16);
      if (sc > bestScore) { bestScore = sc; best = g; }
    }
    seeds[L] = best.seed;
    rows.push({ L, size: `${P.cols}x${P.rows}`, tiles: best.total, frozen: [...best.b.fz].filter(Boolean).length,
      open0: best.profile.open0, bursts: best.profile.bursts + '/' + (P.bursts ?? '-'), push: best.stats ? +best.stats.push.toFixed(2) : '-',
      target: P.push ? P.push.join('~') : P.script ? 'script' : '-', trap: best.stats ? +best.stats.trap.toFixed(2) : '-', score: +bestScore.toFixed(1), seed: best.seed });
  }
  console.log(`\n== ${mode === 'casual' ? '爽玩' : '挑战'}模式 ==`);
  console.table(rows);
  const [re, fill] = MARK[mode];
  html = html.replace(re, fill(JSON.stringify(seeds)));
}
writeFileSync(GAME, html);
console.log(`已写入种子，用时 ${((Date.now() - t0) / 1000).toFixed(1)} 秒`);
