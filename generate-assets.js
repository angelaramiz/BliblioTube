const sharp = require('sharp');
const fs = require('fs');

// Crear un SVG simple con la letra B para BiblioTube
const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Fondo gradiente -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#grad)"/>
  
  <!-- Play button con película -->
  <g transform="translate(512, 512)">
    <!-- Película/carrete -->
    <circle cx="0" cy="0" r="280" fill="white" opacity="0.9"/>
    
    <!-- Círculos del carrete de película -->
    <circle cx="-150" cy="-150" r="40" fill="url(#grad)"/>
    <circle cx="150" cy="-150" r="40" fill="url(#grad)"/>
    <circle cx="-150" cy="150" r="40" fill="url(#grad)"/>
    <circle cx="150" cy="150" r="40" fill="url(#grad)"/>
    
    <!-- Play button al centro -->
    <polygon points="-60,-100 -60,100 80,0" fill="url(#grad)"/>
  </g>
</svg>
`;

// Crear un SVG para adaptive icon (solo la parte visible)
const adaptiveIconSvg = `
<svg width="108" height="108" viewBox="0 0 108 108" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="54" cy="54" r="54" fill="url(#grad)"/>
  
  <!-- Play button con película -->
  <g transform="translate(54, 54)">
    <circle cx="0" cy="0" r="28" fill="white"/>
    <polygon points="-8,-12 -8,12 10,0" fill="url(#grad)"/>
  </g>
</svg>
`;

// Crear un splash screen
const splashSvg = `
<svg width="1080" height="2340" viewBox="0 0 1080 2340" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="splashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1080" height="2340" fill="url(#splashGrad)"/>
  
  <!-- Logo al centro -->
  <g transform="translate(540, 900)">
    <circle cx="0" cy="0" r="200" fill="white" opacity="0.9"/>
    
    <!-- Play button -->
    <polygon points="-50,-80 -50,80 70,0" fill="#6366f1"/>
  </g>
  
  <!-- Texto BiblioTube -->
  <text x="540" y="1400" font-size="80" font-family="Arial, sans-serif" text-anchor="middle" fill="white" font-weight="bold">BiblioTube</text>
  <text x="540" y="1500" font-size="40" font-family="Arial, sans-serif" text-anchor="middle" fill="white" opacity="0.8">Tu biblioteca de videos</text>
</svg>
`;

const generateAssets = async () => {
  try {
    console.log('Generando assets...');

    // Generar icon.png (1024x1024)
    await sharp(Buffer.from(iconSvg))
      .png()
      .toFile('assets/icon.png');
    console.log('✓ icon.png generado');

    // Generar icon.png en 192x192 para Android
    await sharp(Buffer.from(iconSvg))
      .resize(192, 192)
      .png()
      .toFile('assets/icon-192.png');
    console.log('✓ icon-192.png generado');

    // Generar adaptive-icon.png (108x108)
    await sharp(Buffer.from(adaptiveIconSvg))
      .png()
      .toFile('assets/adaptive-icon.png');
    console.log('✓ adaptive-icon.png generado');

    // Generar splash.png (1080x2340)
    await sharp(Buffer.from(splashSvg))
      .png()
      .toFile('assets/splash.png');
    console.log('✓ splash.png generado');

    // Generar favicon.png (192x192)
    await sharp(Buffer.from(iconSvg))
      .resize(192, 192)
      .png()
      .toFile('assets/favicon.png');
    console.log('✓ favicon.png generado');

    console.log('\n✓ Todos los assets han sido generados correctamente');
  } catch (error) {
    console.error('Error generando assets:', error);
  }
};

generateAssets();
