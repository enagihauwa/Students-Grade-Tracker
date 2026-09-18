import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, 'src', 'pages');
const componentsDir = path.join(__dirname, 'src', 'components');

const replacements = [
  { regex: /\bbg-white\b(?! dark:bg-navy-800)/g, replace: 'bg-white dark:bg-navy-800' },
  { regex: /\btext-navy-900\b(?! dark:text-white)/g, replace: 'text-navy-900 dark:text-white' },
  { regex: /\btext-navy-800\b(?! dark:text-navy-100)/g, replace: 'text-navy-800 dark:text-navy-100' },
  { regex: /\btext-navy-700\b(?! dark:text-navy-200)/g, replace: 'text-navy-700 dark:text-navy-200' },
  { regex: /\btext-navy-600\b(?! dark:text-navy-300)/g, replace: 'text-navy-600 dark:text-navy-300' },
  { regex: /\bborder-navy-100\b(?! dark:border-navy-700)/g, replace: 'border-navy-100 dark:border-navy-700' },
  { regex: /\bborder-navy-200\b(?! dark:border-navy-700)/g, replace: 'border-navy-200 dark:border-navy-700' },
  { regex: /\bbg-navy-50\b(?! dark:bg-navy-900)/g, replace: 'bg-navy-50 dark:bg-navy-900/50' },
  { regex: /\bdivide-navy-100\b(?! dark:divide-navy-700)/g, replace: 'divide-navy-100 dark:divide-navy-700' },
  { regex: /\btext-gray-900\b(?! dark:text-white)/g, replace: 'text-gray-900 dark:text-white' },
  { regex: /\btext-gray-700\b(?! dark:text-gray-300)/g, replace: 'text-gray-700 dark:text-gray-300' },
  { regex: /\btext-gray-500\b(?! dark:text-gray-400)/g, replace: 'text-gray-500 dark:text-gray-400' },
  { regex: /\bbg-gray-50\b(?! dark:bg-navy-900)/g, replace: 'bg-gray-50 dark:bg-navy-900' },
  { regex: /\bborder-gray-100\b(?! dark:border-navy-700)/g, replace: 'border-gray-100 dark:border-navy-700' },
  { regex: /\bborder-gray-200\b(?! dark:border-navy-700)/g, replace: 'border-gray-200 dark:border-navy-700' },
  { regex: /\bborder-gray-300\b(?! dark:border-navy-600)/g, replace: 'border-gray-300 dark:border-navy-600' },
  { regex: /\bbg-navy-100\b(?! dark:bg-navy-700)/g, replace: 'bg-navy-100 dark:bg-navy-700' },
  { regex: /\bbg-navy-900\b(?! shadow-lg)(?! dark:bg-navy-950)/g, replace: 'bg-navy-900 dark:bg-navy-950' },
  { regex: /\btext-navy-500\b(?! dark:text-navy-400)/g, replace: 'text-navy-500 dark:text-navy-400' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  for (const { regex, replace } of replacements) {
    content = content.replace(regex, replace);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

processDir(pagesDir);
processDir(componentsDir);
console.log('Done!');
