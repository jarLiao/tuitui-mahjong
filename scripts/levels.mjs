// 离线挑关卡：每关生成一批候选，按开局可消对数、模拟玩家被卡比例和「打开局面」次数打分，挑最贴近目标的种子写回 src/game.html
// 用法：node scripts/levels.mjs [最大关数=60]
import { readFileSync, writeFileSync } from 'node:fs';
import { GAME, loadEngine } from './engine.mjs';

const MAX = Number(process.argv[2] || 60);
const E = loadEngine([]);
const seeds = [];
const rows = [];
const t0 = Date.now();
for (let L = 1; L <= MAX; L++) {
  const P = E.levelParams(L);
  const candidates = P.script ? 400 : L <= 10 ? 36 : 20;
  let best = null, bestScore = -Infinity;
  for (let s = 0; s < candidates; s++) {
    const g = E.generateSeed(L, s);
    if (!g) continue;
    if (P.script) { const sc = E.scoreLevel(g, 0); if (sc > bestScore) { bestScore = sc; best = g; } if (sc > 0) break; continue; }
    // 先用便宜的开局指标筛掉明显不合格的，再跑模拟玩家
    const quick = E.scoreLevel(g, 0);
    if (quick < bestScore - 40) continue;
    const sc = E.scoreLevel(g, 16);
    if (sc > bestScore) { bestScore = sc; best = g; }
  }
  seeds[L] = best.seed;
  rows.push({ L, size: `${P.cols}x${P.rows}`, tiles: best.total, frozen: [...best.b.fz].filter(Boolean).length,
    open0: best.profile.open0, bursts: best.profile.bursts + '/' + (P.bursts ?? '-'), push: best.stats ? +best.stats.push.toFixed(2) : '-', target: P.push ? P.push.join('~') : 'script', burst: best.stats ? +best.stats.burst.toFixed(1) : '-', trap: best.stats ? +best.stats.trap.toFixed(2) : '-', score: +bestScore.toFixed(1), seed: best.seed });
}
console.table(rows);
const html = readFileSync(GAME, 'utf8').replace(/\/\*SEEDS-START\*\/[\s\S]*?\/\*SEEDS-END\*\//,
  `/*SEEDS-START*/const LEVEL_SEEDS=${JSON.stringify(seeds)};/*SEEDS-END*/`);
writeFileSync(GAME, html);
console.log(`已写入 ${MAX} 关种子，用时 ${((Date.now() - t0) / 1000).toFixed(1)} 秒`);
