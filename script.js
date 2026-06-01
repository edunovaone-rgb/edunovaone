document.querySelectorAll('.accordion').forEach((button, index) => {
  const panel = button.nextElementSibling;
  const panelId = panel.id || `accordion-panel-${index + 1}`;

  panel.id = panelId;
  button.setAttribute('aria-controls', panelId);
  button.setAttribute('aria-expanded', 'false');

  button.addEventListener('click', () => {
    const isOpen = panel.classList.contains('open');
    panel.classList.toggle('open', !isOpen);
    button.classList.toggle('active', !isOpen);
    button.setAttribute('aria-expanded', String(!isOpen));
    panel.setAttribute('aria-hidden', String(isOpen));
  });
});