// 回归检查：1) 每关按标准解逐步回放，每一步都必须是玩家能走的合法步且最终清空；
// 2) 随机乱走到任意局面（包括卡死）后洗牌，洗出的盘面必须能被求解器解完。
// 用法：node scripts/check.mjs [最大关数=60]
import { loadEngine } from './engine.mjs';

const MAX = Number(process.argv[2] || 60);
const E = loadEngine();
const same = (a, b) => a.t === b.t && a.a === b.a && a.b === b.b && (a.t === 0 || (a.d === b.d && a.k === b.k));
const legal = (b, m) => E.listMoves(b, false).some(x => same(x, m) || (m.t === 0 && x.t === 0 && x.a === m.b && x.b === m.a));
let fail = 0, shuffles = 0, shuffleFail = 0, slowest = 0;
for (let L = 1; L <= MAX; L++) {
  const g = E.generate(L);
  let b = E.cp(g.b);
  for (const m of g.ops) {
    if (!legal(b, m)) { console.log(`第 ${L} 关：标准解第 ${g.ops.indexOf(m) + 1} 步不合法`, m); fail++; break; }
    b = E.applyMove(b, m);
  }
  if (E.tilesLeft(b)) { console.log(`第 ${L} 关：回放后剩 ${E.tilesLeft(b)} 张`); fail++; }
  for (let trial = 0; trial < 3; trial++) {
    const rng = E.rngOf(L * 131 + trial);
    let s = E.cp(g.b);
    const steps = Math.floor(rng() * g.total / 2);
    for (let k = 0; k < steps; k++) { const ms = E.listMoves(s, false); if (!ms.length) break; s = E.applyMove(s, ms[Math.floor(rng() * ms.length)]); }
    if (!E.tilesLeft(s)) continue;
    const t0 = performance.now();
    const plan = E.planShuffle(s, E.rngOf(L * 7 + trial));
    slowest = Math.max(slowest, performance.now() - t0);
    shuffles++;
    if (!plan || !E.solve(plan.b, 20000, 6).ok) { shuffleFail++; console.log(`第 ${L} 关：洗牌后无解`); }
  }
}
console.log(`标准解回放失败 ${fail} 关；洗牌 ${shuffles} 次，洗后无解 ${shuffleFail} 次，单次洗牌最慢 ${slowest.toFixed(0)} 毫秒`);
process.exit(fail || shuffleFail ? 1 : 0);
