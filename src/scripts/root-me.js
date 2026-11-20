const pageDataElement = document.getElementById('rootme-page-data');
const titleElement = document.getElementById('challenge-title');
const metaElement = document.getElementById('challenge-meta');
const contentElement = document.getElementById('challenge-content');

if (!pageDataElement || !titleElement || !metaElement || !contentElement) {
  throw new Error('Root-Me page initialization failed: missing required DOM elements.');
}

const pageData = JSON.parse(pageDataElement.textContent || '{}');
const challenges = Array.isArray(pageData.challenges) ? pageData.challenges : [];
const generalDescription = pageData.generalDescription || {};
const loadError = pageData.loadError || '';
let currentLang = localStorage.getItem('lang') || 'fr';

const challengeById = new Map(challenges.map((challenge) => [challenge.id, challenge]));

function setFolderExpanded(folderElement, expanded) {
  const toggle = folderElement.querySelector(':scope > .tree-toggle');
  const children = folderElement.querySelector(':scope > .tree-children');
  if (!(toggle instanceof HTMLButtonElement) || !(children instanceof HTMLElement)) {
    return;
  }

  folderElement.classList.toggle('is-collapsed', !expanded);
  toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  children.hidden = !expanded;
}

function openAncestorFolders(element) {
  let folder = element.closest('.tree-folder');
  while (folder instanceof HTMLElement) {
    setFolderExpanded(folder, true);
    folder = folder.parentElement?.closest('.tree-folder') || null;
  }
}

function initializeTreeToggles() {
  document.querySelectorAll('.tree-folder').forEach((folderElement) => {
    if (!(folderElement instanceof HTMLElement)) {
      return;
    }

    const toggle = folderElement.querySelector(':scope > .tree-toggle');
    if (!(toggle instanceof HTMLButtonElement)) {
      return;
    }

    const expanded = toggle.getAttribute('aria-expanded') !== 'false';
    setFolderExpanded(folderElement, expanded);

    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      setFolderExpanded(folderElement, !isExpanded);
    });
  });
}

function updateLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('.challenge-link').forEach((button) => {
    const challenge = challengeById.get(button.dataset.challengeId);
    if (!challenge) {
      return;
    }
    button.textContent = challenge[currentLang]?.title || challenge.fr?.title || challenge.en?.title || challenge.title;
  });

  const activeButton = document.querySelector('.challenge-link.active');
  if (activeButton?.dataset.challengeId) {
    showChallenge(activeButton.dataset.challengeId);
  } else {
    setDefaultContent();
  }
}

// Écouter les changements de langue depuis le composant LangToggle
window.addEventListener('langchange', (event) => {
  updateLanguage(event.detail.lang);
});

function setDefaultContent() {
  titleElement.textContent = currentLang === 'en' ? 'Root-Me challenge notes' : 'Notes de challenges Root-Me';
  metaElement.textContent = currentLang === 'en'
    ? `${challenges.length} challenge file(s) available`
    : `${challenges.length} fichier(s) de challenge disponible(s)`;
  contentElement.textContent = generalDescription[currentLang] || generalDescription.fr || '';

  if (loadError) {
    const errorText = currentLang === 'en'
      ? `\n\nLoading warning: ${loadError}`
      : `\n\nAvertissement de chargement : ${loadError}`;
    contentElement.textContent += errorText;
  }
}

function showChallenge(challengeId) {
  const challenge = challengeById.get(challengeId);
  if (!challenge) {
    return;
  }

  const languageContent = challenge[currentLang] || challenge.fr || challenge.en;
  if (!languageContent) {
    setDefaultContent();
    return;
  }

  titleElement.textContent = languageContent.title;
  metaElement.textContent = languageContent.relativePath;
  contentElement.innerHTML = languageContent.contentHtml || '';

  document.querySelectorAll('.challenge-link').forEach((button) => {
    const isActive = button.dataset.challengeId === challenge.id;
    button.classList.toggle('active', isActive);
    if (isActive) {
      openAncestorFolders(button);
    }
  });
}

document.querySelectorAll('.challenge-link').forEach((button) => {
  button.addEventListener('click', () => {
    const challengeId = button.dataset.challengeId;
    if (!challengeId) {
      return;
    }
    showChallenge(challengeId);
  });
});

initializeTreeToggles();
setDefaultContent();

const canvas = document.getElementById('matrix');
if (canvas instanceof HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (ctx) {
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
  }
}
