const sharp = require('sharp');
const path = require('path');

async function createCircularLogo() {
  const input = path.join(__dirname, '..', 'public', 'logo-slothflow.png');
  const output = path.join(__dirname, '..', 'public', 'logo-slothflow-circle.png');

  const size = 256;

  // Create circular mask SVG
  const circleSvg = `<svg width="${size}" height="${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
  </svg>`;

  await sharp(input)
    .resize(size, size, { fit: 'cover' })
    .composite([{
      input: Buffer.from(circleSvg),
      blend: 'dest-in'
    }])
    .png({ quality: 90 })
    .toFile(output);

  console.log('Logo circular creado:', output);
}

createCircularLogo().catch(console.error);
