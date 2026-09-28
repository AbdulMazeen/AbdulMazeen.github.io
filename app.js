(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const closeMenu = () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); };
  menu.addEventListener('click', () => { const open = nav.classList.toggle('is-open'); menu.setAttribute('aria-expanded', String(open)); });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menu.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
  const data = window.PORTFOLIO || { contact: {}, projects: [] };
  const element = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; };
  const safeUrl = (value, local = false) => {
    if (typeof value !== 'string' || !value.trim()) return null;
    if (local && /^assets\/[a-zA-Z0-9_./ -]+$/.test(value) && !value.includes('..')) return value;
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
  };
  const link = (label, url, className = 'text-link') => { const node = element('a', className, label + ' ↗'); node.href = url; node.target = '_blank'; node.rel = 'noopener noreferrer'; return node; };
  const contact = data.contact || {};
  const contacts = [];
  if (typeof contact.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) && !/[?&#]/.test(contact.email)) {
    const email = element('a', '', contact.email + ' ↗'); email.href = 'mailto:' + contact.email; contacts.push(email);
  }
  for (const [key, label] of [['github', 'GitHub'], ['linkedin', 'LinkedIn'], ['cv', 'Download CV']]) {
    const url = safeUrl(contact[key], key === 'cv'); if (url) contacts.push(link(label, url, ''));
  }
  if (contacts.length) document.querySelector('#contact-links').replaceChildren(...contacts);
  const projects = Array.isArray(data.projects) ? data.projects.filter(p => p && typeof p.title === 'string' && p.title.trim()) : [];
  const grid = document.querySelector('#project-grid');
  const empty = document.querySelector('#project-empty');
  const filters = document.querySelector('#project-filters');
  if (!projects.length) { grid.hidden = true; return; }
  empty.hidden = true;
  const render = category => {
    const selected = projects.filter(p => category === 'All' || p.category === category);
    grid.replaceChildren();
    selected.forEach(project => {
      const card = element('article', 'project-card');
      const imageUrl = safeUrl(project.image, true);
      if (imageUrl) { const image = element('img'); image.src = imageUrl; image.alt = project.title + ' project preview'; image.loading = 'lazy'; card.append(image); }
      const body = element('div', 'project-body');
      body.append(element('span', 'status-label', project.category || 'PROJECT'), element('h3', '', project.title));
      if (project.description) body.append(element('p', '', project.description));
      const tags = element('div', 'tags');
      (Array.isArray(project.technologies) ? project.technologies : []).forEach(tool => tags.append(element('span', '', tool)));
      body.append(tags);
      const fields = [['Problem', project.problem], ['Dataset / input', project.input], ['What I built', project.approach], ['Key features', Array.isArray(project.features) ? project.features.join(' · ') : null]];
      if (fields.some(([, value]) => value)) {
        const details = element('details'); details.append(element('summary', '', 'Project details'));
        const list = element('dl'); fields.forEach(([label, value]) => { if (value) list.append(element('dt', '', label), element('dd', '', value)); });
        details.append(list); body.append(details);
      }
      if (project.result) body.append(element('p', 'project-result', project.result));
      const links = element('div', 'actions');
      for (const [key, label] of [['githubUrl', 'GitHub'], ['demoUrl', 'View demo / report'], ['downloadUrl', 'Download']]) { const url = safeUrl(project[key], key === 'downloadUrl'); if (url) links.append(link(label, url)); }
      if (links.children.length) body.append(links);
      card.append(body); grid.append(card);
    });
    filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.textContent === category)));
  };
  const categories = [...new Set(projects.map(p => p.category).filter(Boolean))];
  if (categories.length > 1) {
    filters.hidden = false;
    ['All', ...categories].forEach(category => { const button = element('button', '', category); button.type = 'button'; button.setAttribute('aria-pressed', String(category === 'All')); button.addEventListener('click', () => render(category)); filters.append(button); });
  }
  render('All');
})();
