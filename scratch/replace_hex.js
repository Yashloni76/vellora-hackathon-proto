const fs = require('fs');
const path = require('path');

const directories = ['app', 'components'];

const replacements = [
  { regex: /bg-\[#0a0a0a\]/g, replacement: 'bg-primary' },
  { regex: /bg-\[#111311\]/g, replacement: 'bg-card' },
  { regex: /border-\[#1f2b1f\]/g, replacement: 'border-border-dark' },
  { regex: /bg-\[#1a1c1a\]/g, replacement: 'bg-card' },
  { regex: /text-\[#00ff88\]/g, replacement: 'text-green-accent' },
  { regex: /text-white/g, replacement: 'text-primary' },
  { regex: /bg-\[#00ff88\]/g, replacement: 'bg-green-accent' },
  { regex: /border-\[#00ff88\]/g, replacement: 'border-green-accent' },
  { regex: /text-\[#0a0a0a\]/g, replacement: 'text-primary' },
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Modified:', fullPath);
      }
    }
  }
}

directories.forEach(processDirectory);
console.log('Hex purge complete.');
