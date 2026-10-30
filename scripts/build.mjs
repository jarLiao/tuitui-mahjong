// 把 src/game.html 包成可独立打开的 index.html（GitHub Pages 用）
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, GAME } from './engine.mjs';

const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 80'%3E%3Crect x='2' y='2' width='56' height='70' rx='9' fill='%232f9a70'/%3E%3Crect x='2' y='2' width='56' height='64' rx='9' fill='%23fbf6e8'/%3E%3Ctext x='30' y='50' text-anchor='middle' font-size='40' font-weight='900' fill='%23c8352b' font-family='serif'%3E中%3C/text%3E%3C/svg%3E";
const head = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#1d5641">
<meta name="description" content="推推麻将：点一点、推一推的麻将消除小游戏，关卡保证有解。">
<link rel="icon" href="${ICON}">
<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px/1.4 system-ui,-apple-system,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
`;
writeFileSync(join(ROOT, 'index.html'), head + readFileSync(GAME, 'utf8') + '\n</body>\n</html>\n');
console.log('已生成 index.html');
