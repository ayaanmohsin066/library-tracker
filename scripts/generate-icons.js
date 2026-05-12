#!/usr/bin/env node
// Generates public/icon-192.png and public/icon-512.png using only Node.js
// built-in modules (no canvas/sharp/external deps).
// Design: navy #0A0F1C background, indigo #6366F1 "LC" text, centered.
"use strict";

const zlib = require("zlib");
const fs   = require("fs");
const path = require("path");

// ── 5 wide × 7 tall pixel glyphs ──────────────────────────────────────
const GLYPHS = {
  L: [
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
  ],
  C: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
};

// ── CRC-32 (required by PNG spec) ─────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ── PNG chunk builder ──────────────────────────────────────────────────
function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf  = Buffer.allocUnsafe(4);
  const crcBuf  = Buffer.allocUnsafe(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const payload = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(payload), 0);
  return Buffer.concat([lenBuf, payload, crcBuf]);
}

// ── Icon generator ─────────────────────────────────────────────────────
function generatePNG(size) {
  const BG = [0x0A, 0x0F, 0x1C]; // #0A0F1C navy
  const FG = [0x63, 0x66, 0xF1]; // #6366F1 indigo

  // RGB pixel buffer, filled with background
  const pixels = Buffer.alloc(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    pixels[i * 3]     = BG[0];
    pixels[i * 3 + 1] = BG[1];
    pixels[i * 3 + 2] = BG[2];
  }

  // Scale: "LC" with gap fits within 80% of width
  // totalW = 2*(5*scale) + 1.5*scale = 11.5*scale  ≤  size * 0.80
  const scale  = Math.max(1, Math.floor((size * 0.80) / 11.5));
  const charW  = 5 * scale;
  const charH  = 7 * scale;
  const gap    = Math.max(scale, Math.floor(scale * 1.5));
  const totalW = charW * 2 + gap;
  const startX = Math.floor((size - totalW) / 2);
  const startY = Math.floor((size - charH) / 2);

  function drawGlyph(char, baseX) {
    const rows = GLYPHS[char];
    for (let row = 0; row < rows.length; row++) {
      for (let col = 0; col < rows[row].length; col++) {
        if (!rows[row][col]) continue;
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const px = baseX + col * scale + dx;
            const py = startY + row * scale + dy;
            if (px < 0 || px >= size || py < 0 || py >= size) continue;
            const idx = (py * size + px) * 3;
            pixels[idx]     = FG[0];
            pixels[idx + 1] = FG[1];
            pixels[idx + 2] = FG[2];
          }
        }
      }
    }
  }

  drawGlyph("L", startX);
  drawGlyph("C", startX + charW + gap);

  // Build scanlines: filter byte 0 (None) + row pixels
  const rowBytes = size * 3;
  const raw = Buffer.allocUnsafe(size * (rowBytes + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (rowBytes + 1)] = 0; // filter: None
    pixels.copy(raw, y * (rowBytes + 1) + 1, y * rowBytes, (y + 1) * rowBytes);
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  const ihdrData = Buffer.allocUnsafe(13);
  ihdrData.writeUInt32BE(size, 0); // width
  ihdrData.writeUInt32BE(size, 4); // height
  ihdrData[8]  = 8; // bit depth: 8
  ihdrData[9]  = 2; // color type: RGB truecolor
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace: none

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    makeChunk("IHDR", ihdrData),
    makeChunk("IDAT", compressed),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Write files ────────────────────────────────────────────────────────
const outDir = path.join(__dirname, "..", "public");
fs.writeFileSync(path.join(outDir, "icon-192.png"), generatePNG(192));
fs.writeFileSync(path.join(outDir, "icon-512.png"), generatePNG(512));
console.log("✓ public/icon-192.png  (192×192)");
console.log("✓ public/icon-512.png  (512×512)");
