const fs = require('fs');
const path = require('path');

const targetDirs = ['app', 'components', 'lib'];
const basePath = path.resolve(__dirname);

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Lakukan beberapa penggantian cerdas
  let newContent = content
    .replace(/Jawa Tengah/g, 'Lampung')
    .replace(/Purworejo/g, 'Pringsewu')
    .replace(/https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/2\/2c\/LOGO_KABUPATEN_PURWOREJO\.png\/220px-LOGO_KABUPATEN_PURWOREJO\.png/g, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Lambang_Kabupaten_Pringsewu.png/220px-Lambang_Kabupaten_Pringsewu.png')
    .replace(/Logo Purworejo/g, 'Logo Pringsewu');

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
