const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk('./src/app', (filepath) => {
  if (filepath.endsWith('.jsx') || filepath.endsWith('.js')) {
    let content = fs.readFileSync(filepath, 'utf8');
    let changed = false;

    // Fix: export async function <Name>Page({ params }) { const { ID } = params; ... }
    // Replace: const { XXX } = params; ---> const { XXX } = await params;
    if (content.match(/const\s+\{[^}]+\}\s*=\s*params;?/g)) {
      content = content.replace(/(const\s+\{[^}]+\}\s*)=\s*(params;?)/g, '$1 = await $2');
      changed = true;
    }

    // Fix: export default async function Page({ params }) { const id = params.id; ... }
    if (content.match(/const\s+\w+\s*=\s*params\.\w+;?/g)) {
      content = content.replace(/(const\s+\w+\s*)=\s*(params\.\w+;?)/g, '$1 = await $2');
      // Wait, params.id is trickier: (await params).id
      content = content.replace(/await params\.(\w+)/g, '(await params).$1');
      changed = true;
    }
    
    // Fix: export async function GET(request, { params }) { const id = params.id; }
    if (content.match(/const\s+\w+\s*=\s*params\.\w+;?/g)) {
      content = content.replace(/(const\s+\w+\s*)=\s*(params\.\w+;?)/g, '$1 = (await params).$2');
      changed = true;
    }

    // Also look for direct usage like `await getSerieDetails(params.id...`
    if (content.includes('params.id') && !content.includes('(await params).id') && filepath.includes('page.jsx')) {
      content = content.replace(/params\.id/g, '(await params).id');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filepath, content);
      console.log('Fixed params in:', filepath);
    }
  }
});
