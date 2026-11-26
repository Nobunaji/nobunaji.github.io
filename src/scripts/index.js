const output = document.getElementById('output');
const input = document.getElementById('cmd');
const projectList = ['AweLaMachine'];

document.getElementById('year').textContent = new Date().getFullYear();

let currentLang = localStorage.getItem('lang') || 'fr';

const translations = {
  en: {
    help: 'help\ncontact\nclear',
    contact: 'mail: nicolas.brion.pro@gmail.com\ngithub: https://github.com/Nobunaji',
    unknown: 'unknown command'
  },
  fr: {
    help: 'help\ncontact\nclear',
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
    output.innerHTML = '';
    input.value = '';
    return;
  }

  const commands = getCommands();
  const response = commands[command] || `${translations[currentLang].unknown}: ${command}`;
  output.innerHTML += `<span class="prompt-output">root@portfolio:~#</span> ${escapeHtml(command)}\n${escapeHtml(response)}\n`;
  output.scrollTop = output.scrollHeight;
  input.value = '';
});

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

input.focus();

initLanguage();