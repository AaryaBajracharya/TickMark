const fs = require('fs');
const path = require('path');

const workspaceRoot = path.join(__dirname, '..');
const srcDir = path.join(workspaceRoot, 'frontend', 'public', 'img', 'products');
const destDir = path.join(workspaceRoot, 'backend', 'Uploads', 'products');

function copyImages() {
  if (!fs.existsSync(srcDir)) {
    console.warn(`Source images directory not found: ${srcDir}`);
    process.exit(0);
  }

  fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter((f) => f && !f.startsWith('.'));
  if (!files.length) {
    console.warn('No image files found to copy.');
    return;
  }

  files.forEach((file) => {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    fs.copyFileSync(srcFile, destFile);
  });

  console.log(`Copied ${files.length} images from ${srcDir} to ${destDir}`);
}

copyImages();
