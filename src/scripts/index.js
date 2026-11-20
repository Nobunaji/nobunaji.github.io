const output = document.getElementById('output');
const input = document.getElementById('cmd');
const projectList = ['AweLaMachine'];

document.getElementById('year').textContent = new Date().getFullYear();

let currentLang = localStorage.getItem('lang') || 'fr';

const translations = {
  en: {
    help: 'help\nls\ncat skills.md\ncontact\nclear',
    ls: `projects/\n${projectList.join('\n')}\n`,
    'cat skills.md': '- Astro\n- TypeScript\n- CSS / UI cyber\n- Performance web',
    contact: 'mail: nicolas.brion.pro@gmail.com\ngithub: https://github.com/Nobunaji',
    unknown: 'unknown command'
  },
  fr: {
    help: 'help\nls\ncat skills.md\ncontact\nclear',
    ls: `projects/\n${projectList.join('\n')}\n`,
    'cat skills.md': '- Astro\n- TypeScript\n- CSS / UI cyber\n- Performance web',
    contact: 'mail: nicolas.brion.pro@gmail.com\ngithub: https://github.com/Nobunaji',
    unknown: 'commande inconnue'
  }
};

function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  
  document.documentElement.lang = lang;
  
  document.querySelectorAll('[data-en][data-fr]').forEach(el => {
    el.textContent = lang === 'en' ? el.dataset.en : el.dataset.fr;
  });
  
  document.querySelectorAll('[data-en-placeholder][data-fr-placeholder]').forEach(el => {
    const placeholder = lang === 'en' ? el.dataset.enPlaceholder : el.dataset.frPlaceholder;
    if (el.id === 'output' && output.textContent.trim() === '') {
      el.textContent = placeholder;
    }
  });
}

function initLanguage() {
  switchLanguage(currentLang);
  
  // Écouter les changements de langue depuis le composant LangToggle
  window.addEventListener('langchange', (event) => {
    switchLanguage(event.detail.lang);
  });
}

function getCommands() {
  return translations[currentLang];
}

input.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  const command = input.value.trim();
  if (!command) return;

  if (command === 'clear') {
    output.textContent = '';
    input.value = '';
    return;
  }

  const commands = getCommands();
  const response = commands[command] || `${translations[currentLang].unknown}: ${command}`;
  output.textContent += `\nroot@portfolio:~# ${command}\n${response}`;
  output.scrollTop = output.scrollHeight;
  input.value = '';
});

const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
const glyphs = '01アカサタナハマヤラワ'.split('');
let columns = [];

const resize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colCount = Math.floor(canvas.width / 16);
  columns = Array(colCount).fill(1);
};

const draw = () => {
  ctx.fillStyle = 'rgba(10,10,12,0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00ff41';
  ctx.font = '14px Fira Code';

  columns.forEach((y, x) => {
    const text = glyphs[Math.floor(Math.random() * glyphs.length)];
    ctx.fillText(text, x * 16, y * 16);
    columns[x] = y * 16 > canvas.height && Math.random() > 0.98 ? 0 : y + 1;
  });
};

resize();
setInterval(draw, 70);
window.addEventListener('resize', resize);
input.focus();

initLanguage();

