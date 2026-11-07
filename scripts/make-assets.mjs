import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const assets = path.join(root, 'assets');
await mkdir(assets, { recursive: true });

const logo = `
  <circle cx="690" cy="370" r="178" fill="url(#sunGlow)" opacity="0.55"/>
  <circle cx="690" cy="370" r="152" fill="url(#sun)"/>
  <g stroke="#FFD98B" stroke-width="14" stroke-linecap="round" opacity="0.62">
    <line x1="690" y1="150" x2="690" y2="112"/>
    <line x1="850" y1="210" x2="877" y2="183"/>
    <line x1="910" y1="370" x2="948" y2="370"/>
    <line x1="850" y1="530" x2="877" y2="557"/>
    <line x1="690" y1="590" x2="690" y2="628" opacity="0"/>
    <line x1="530" y1="530" x2="503" y2="557"/>
    <line x1="470" y1="370" x2="432" y2="370"/>
    <line x1="530" y1="210" x2="503" y2="183"/>
  </g>
  <path d="M 248 700 C 182 700 138 648 138 584 C 138 512 196 464 265 470 C 298 366 398 302 508 322 C 604 339 682 407 708 496 C 738 470 780 455 820 460 C 898 470 948 530 948 602 C 948 664 896 706 832 706 Z" fill="url(#cloud)"/>
  <path d="M 218 618 C 278 554 366 530 448 553 C 534 577 594 638 622 712" fill="none" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round" opacity="0.34"/>
  <path d="M 150 790 C 300 738 420 760 520 792 C 646 832 770 822 904 762" fill="none" stroke="#8FE7EE" stroke-width="4" opacity="0.22"/>
`;

const background = `
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <circle cx="760" cy="270" r="450" fill="url(#glow)"/>
  <circle cx="120" cy="860" r="380" fill="url(#glow2)"/>
`;

const defs = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#06121F"/>
      <stop offset="0.48" stop-color="#082A3D"/>
      <stop offset="1" stop-color="#0A5869"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#25C8D2" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#25C8D2" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#F6C96D" stop-opacity="0.13"/>
      <stop offset="1" stop-color="#F6C96D" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#FFD37D" stop-opacity="0.50"/>
      <stop offset="1" stop-color="#FFD37D" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sun" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#FFF9E5"/>
      <stop offset="0.45" stop-color="#FFE4A6"/>
      <stop offset="1" stop-color="#FFB95F"/>
    </linearGradient>
    <linearGradient id="cloud" x1="0.1" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="0.55" stop-color="#EAF9FE"/>
      <stop offset="1" stop-color="#AED6E4"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>
`;

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${defs}
  ${background}
  <g filter="url(#soft)" opacity="0.3">
    <ellipse cx="520" cy="746" rx="410" ry="58" fill="#020A10"/>
  </g>
  ${logo}
</svg>`;

const markSvg = (scale, y = 0) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${defs}
  <g transform="translate(512 512) scale(${scale}) translate(-512 ${-512 + y})">
    ${logo}
  </g>
</svg>`;

await sharp(Buffer.from(iconSvg)).png().resize(1024, 1024).toFile(path.join(assets, 'icon.png'));
await sharp(Buffer.from(markSvg(0.76))).png().resize(1024, 1024).toFile(path.join(assets, 'adaptive-icon.png'));
await sharp(Buffer.from(markSvg(0.82))).png().resize(1024, 1024).toFile(path.join(assets, 'splash-icon.png'));
await sharp(Buffer.from(iconSvg)).png().resize(64, 64).toFile(path.join(assets, 'favicon.png'));
await sharp(Buffer.from(iconSvg)).png().resize(512, 512).toFile(path.join(assets, 'icon-512.png'));

console.log('assets generated');
