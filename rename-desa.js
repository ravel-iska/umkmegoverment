const fs = require('fs');
const path = require('path');

const targetDirs = ['app', 'components', 'lib', 'seed-umkm.js', 'seed-admin.js'];
const basePath = path.resolve(__dirname);

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Lakukan beberapa penggantian cerdas
  let newContent = content
    .replace(/Desa Kutoarjo/g, 'Desa Podosari')
    .replace(/Pasar Kutoarjo/g, 'Pasar Podosari')
    .replace(/Kutoarjo, Purworejo/g, 'Podosari, Pringsewu')
    .replace(/Kutoarjo, Jawa Tengah/g, 'Podosari, Pringsewu, Lampung')
    .replace(/Kutoarjo/g, 'Podosari')
    .replace(/pasarkutoarjo/g, 'pasarpodosari');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const stats = fs.statSync(dirPath);
  if (stats.isFile()) {
    if (dirPath.match(/\.(ts|tsx|js|jsx)$/)) {
      replaceInFile(dirPath);
    }
    return;
  }

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    processDirectory(path.join(dirPath, file));
  }
}

targetDirs.forEach(dir => processDirectory(path.join(basePath, dir)));
console.log('Replacement complete!');
