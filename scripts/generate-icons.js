const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgPath = path.join(__dirname, '..', 'assets', 'icon.svg');
const assetsDir = path.join(__dirname, '..', 'assets');

async function generateIcons() {
  const svg = fs.readFileSync(svgPath);

  // Generate icon.png (512x512)
  await sharp(svg)
    .resize(512, 512)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('✓ icon.png generated');

  // Generate tray.png (32x32)
  await sharp(svg)
    .resize(32, 32)
    .png()
    .toFile(path.join(assetsDir, 'tray.png'));
  console.log('✓ tray.png generated');

  // Generate icon.ico (multi-size)
  // electron-builder can use png as ico on Windows
  await sharp(svg)
    .resize(256, 256)
    .png()
    .toFile(path.join(assetsDir, 'icon.ico'));
  console.log('✓ icon.ico generated');

  console.log('All icons generated successfully.');
}

generateIcons().catch(console.error);
