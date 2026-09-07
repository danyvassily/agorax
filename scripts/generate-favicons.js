const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + entrySize * count;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4); // count

  const entries = [];
  for (const { width, height, buffer } of pngBuffers) {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(p => p.buffer)]);
}

async function main() {
  const sourcePath = path.join(__dirname, '../public/images/team/milo.png');
  const cropConfig = { left: 275, top: 0, width: 835, height: 835 };

  console.log('Cropping master Milo avatar...');
  const baseMaster = sharp(sourcePath).extract(cropConfig);

  // Generate master 512x512 buffer
  const buf512 = await baseMaster.clone().resize(512, 512).png().toBuffer();
  const buf192 = await baseMaster.clone().resize(192, 192).png().toBuffer();
  const buf180 = await baseMaster.clone().resize(180, 180).png().toBuffer();
  const buf48  = await baseMaster.clone().resize(48, 48).png().toBuffer();
  const buf32  = await baseMaster.clone().resize(32, 32).png().toBuffer();
  const buf16  = await baseMaster.clone().resize(16, 16).png().toBuffer();

  // Create multi-size ICO buffer (16, 32, 48)
  const icoBuf = createIco([
    { width: 16, height: 16, buffer: buf16 },
    { width: 32, height: 32, buffer: buf32 },
    { width: 48, height: 48, buffer: buf48 },
  ]);

  // SVG representation wrapping compressed 128x128 PNG (~35KB instead of 660KB)
  const buf128 = await baseMaster.clone().resize(128, 128).png({ compressionLevel: 9 }).toBuffer();
  const base64Png128 = buf128.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <image href="data:image/png;base64,${base64Png128}" width="128" height="128"/>
</svg>
`;

  // 1. Next.js App Router root icons
  fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), icoBuf);
  fs.writeFileSync(path.join(__dirname, '../src/app/icon.png'), buf512);
  fs.writeFileSync(path.join(__dirname, '../src/app/apple-icon.png'), buf180);

  // 2. Public folder static icons
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), icoBuf);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.png'), buf32);
  fs.writeFileSync(path.join(__dirname, '../public/favicon-16x16.png'), buf16);
  fs.writeFileSync(path.join(__dirname, '../public/favicon-32x32.png'), buf32);
  fs.writeFileSync(path.join(__dirname, '../public/apple-icon.png'), buf180);
  fs.writeFileSync(path.join(__dirname, '../public/icon-192.png'), buf192);
  fs.writeFileSync(path.join(__dirname, '../public/icon-512.png'), buf512);

  // 3. SVG fallbacks
  fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), svgContent);
  fs.writeFileSync(path.join(__dirname, '../public/icon.svg'), svgContent);
  fs.writeFileSync(path.join(__dirname, '../public/apple-icon.svg'), svgContent);

  console.log('All icons generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
