const fs = require('fs');
const path = 'src/app/admin/students/page.tsx';

let content = fs.readFileSync(path, 'utf-8');
const lines = content.split('\n');
const result = [];
let inConflict = false;
let keepCurrent = true;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.startsWith('<<<<<<< Updated upstream')) {
    inConflict = true;
    keepCurrent = true;
    continue;
  }
  
  if (line.startsWith('=======')) {
    keepCurrent = false;
    continue;
  }
  
  if (line.startsWith('>>>>>>> Stashed changes')) {
    inConflict = false;
    keepCurrent = true;
    continue;
  }
  
  if (!inConflict || keepCurrent) {
    result.push(line);
  }
}

fs.writeFileSync(path, result.join('\n'));
console.log('Conflicts resolved in', path);
