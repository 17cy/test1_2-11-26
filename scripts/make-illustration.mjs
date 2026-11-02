// Generates public/empty-state.png with no dependencies (Node's zlib only).
// Shapes are drawn as signed distance fields for cheap anti-aliasing.
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const W = 640, H = 440
const px = new Float32Array(W * H * 4) // premultiplied RGBA, 0..1

const hex = (h, a = 1) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255, a]

function draw(sdf, color) {
  const [r, g, b, a] = color
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = sdf(x + 0.5, y + 0.5)
    if (d > 1) continue
    const cov = Math.min(1, Math.max(0, 0.5 - d)) * a
    const i = (y * W + x) * 4
    px[i] = r * cov + px[i] * (1 - cov)
    px[i + 1] = g * cov + px[i + 1] * (1 - cov)
    px[i + 2] = b * cov + px[i + 2] * (1 - cov)
    px[i + 3] = cov + px[i + 3] * (1 - cov)
  }
}

const circle = (cx, cy, r) => (x, y) => Math.hypot(x - cx, y - cy) - r
const ring = (cx, cy, r, t) => (x, y) => Math.abs(Math.hypot(x - cx, y - cy) - r) - t / 2
function rrect(x0, y0, w, h, r, rot = 0) {
  const cx = x0 + w / 2, cy = y0 + h / 2, c = Math.cos(-rot), s = Math.sin(-rot)
  return (x, y) => {
    const dx = x - cx, dy = y - cy
    const lx = dx * c - dy * s, ly = dx * s + dy * c
    const qx = Math.abs(lx) - w / 2 + r, qy = Math.abs(ly) - h / 2 + r
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r
  }
}
const stroke = (sdf, t) => (x, y) => Math.abs(sdf(x, y)) - t / 2
const intersect = (a, b) => (x, y) => Math.max(a(x, y), b(x, y))

// Backdrop blob
draw(circle(320, 230, 190), hex('#ececfd'))
draw(circle(470, 120, 46), hex('#e1e1fb'))
draw(circle(160, 340, 30), hex('#e1e1fb'))

// Board
draw(rrect(150, 92, 300, 250, 22), hex('#1d1d2c', 0.08)) // shadow
draw(rrect(144, 82, 300, 250, 22), hex('#ffffff'))
draw(stroke(rrect(144, 82, 300, 250, 22), 3), hex('#d9d9ec'))
draw(rrect(164, 102, 120, 14, 7), hex('#5b5bd6'))
draw(rrect(292, 102, 50, 14, 7), hex('#c9c9f3'))

// Sticky notes (tilted slightly)
const notes = [
  [168, 134, '#ffe08a', -0.05],
  [302, 134, '#b8f0dc', 0.04],
  [168, 232, '#ffd0c2', 0.03],
]
for (const [x, y, c, rot] of notes) {
  draw(rrect(x + 3, y + 5, 118, 82, 12, rot), hex('#1d1d2c', 0.07))
  draw(rrect(x, y, 118, 82, 12, rot), hex(c))
  for (let k = 0; k < 3; k++) draw(rrect(x + 14, y + 18 + k * 18, k === 2 ? 52 : 86, 8, 4, rot), hex('#1d1d2c', 0.18))
}
// Empty dashed slot for "your update"
for (let k = 0; k < 8; k++) draw(rrect(302 + k * 15, 232, 9, 3, 1.5), hex('#9a9ad8'))
for (let k = 0; k < 8; k++) draw(rrect(302 + k * 15, 311, 9, 3, 1.5), hex('#9a9ad8'))
for (let k = 0; k < 5; k++) draw(rrect(302, 238 + k * 15, 3, 9, 1.5), hex('#9a9ad8'))
for (let k = 0; k < 5; k++) draw(rrect(417, 238 + k * 15, 3, 9, 1.5), hex('#9a9ad8'))
draw(circle(361, 273, 16), hex('#5b5bd6'))
draw(rrect(353, 271, 16, 4, 2), hex('#ffffff'))
draw(rrect(359, 265, 4, 16, 2), hex('#ffffff'))

// Coffee mug
draw(ring(510, 318, 17, 8), hex('#5b5bd6'))
draw(rrect(456, 290, 56, 62, 12), hex('#5b5bd6'))
draw(rrect(466, 304, 36, 6, 3), hex('#ffffff', 0.35))
draw(intersect(stroke((x, y) => Math.abs(x - 476 - 5 * Math.sin((y - 250) / 7)) - 0.01, 4), (x, y) => Math.max(250 - y, y - 280)), hex('#9a9ad8'))
draw(intersect(stroke((x, y) => Math.abs(x - 492 - 5 * Math.sin((y - 245) / 7)) - 0.01, 4), (x, y) => Math.max(245 - y, y - 278)), hex('#9a9ad8'))

// Sparkles
for (const [x, y, r, c] of [[120, 150, 6, '#ffb648'], [520, 210, 5, '#0f9d8a'], [100, 260, 4, '#d6409f'], [540, 360, 4, '#ffb648'], [210, 60, 5, '#2f7de5']]) {
  draw(circle(x, y, r), hex(c))
}

// Encode PNG (un-premultiply, filter 0 per row)
const raw = Buffer.alloc((W * 4 + 1) * H)
for (let y = 0; y < H; y++) {
  raw[y * (W * 4 + 1)] = 0
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, o = y * (W * 4 + 1) + 1 + x * 4, a = px[i + 3]
    for (let k = 0; k < 3; k++) raw[o + k] = a > 0 ? Math.round(Math.min(1, px[i + k] / a) * 255) : 0
    raw[o + 3] = Math.round(a * 255)
  }
}
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8; ihdr[9] = 6 // 8-bit RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])
writeFileSync(new URL('../public/empty-state.png', import.meta.url), png)
console.log(`wrote public/empty-state.png (${png.length} bytes)`)
