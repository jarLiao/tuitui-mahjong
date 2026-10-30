// 从 src/game.html 里取出规则引擎，供离线脚本使用，保证脚本和游戏跑的是同一份代码
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const GAME = join(ROOT, 'src', 'game.html');

export function loadEngine(seedsOverride) {
  let code = readFileSync(GAME, 'utf8').split('/*ENGINE-START*/')[1].split('/*ENGINE-END*/')[0];
  if (seedsOverride) code = code.replace(/\/\*SEEDS-START\*\/[\s\S]*?\/\*SEEDS-END\*\//, `const LEVEL_SEEDS=${JSON.stringify(seedsOverride)};`);
  const names = ['EMPTY', 'cp', 'tilesLeft', 'tapMoves', 'listMoves', 'applyMove', 'solve', 'planShuffle', 'levelParams',
    'generateSeed', 'generate', 'profile', 'playStats', 'scoreLevel', 'rngOf', 'LEVEL_SEEDS'];
  return new Function(`${code};return{${names.join(',')}};`)();
}
