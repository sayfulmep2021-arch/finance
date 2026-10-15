// generate-pngs.cjs
const fs = require('fs');
const path = require('path');

// Simple PNG generator with blue gradient and ৳
// Or standard valid PNG header & chunks
function createSimplePng(size, r, g, b) {
  const width = size;
  const height = size;
  // Use zlib from node built-in
  const zlib = require('zlib');
  
  // Construct raw RGBA bitmap
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      // Rounded corner radius calculation
      const dx = Math.min(x, width - 1 - x);
      const dy = Math.min(y, height - 1 - y);
      const cornerR = size * 0.22;
      let alpha = 255;
      if (dx < cornerR && dy < cornerR) {
        const dist = Math.hypot(cornerR - dx, cornerR - dy);
        if (dist > cornerR) alpha = 0;
      }
      
      rawData[pixelOffset] = r;     // R
      rawData[pixelOffset + 1] = g; // G
      rawData[pixelOffset + 2] = b; // B
      rawData[pixelOffset + 3] = alpha; // A
    }
  }

  const compressed = zlib.deflateSync(rawData);
  
  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  
  // Calculate CRC32
  const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// Standard CRC32
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crc32Table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

const crc32Table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crc32Table[i] = c;
}

const publicDir = path.join(__dirname, 'public');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createSimplePng(192, 37, 99, 235));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createSimplePng(512, 37, 99, 235));
console.log('PNG icons generated successfully!');
