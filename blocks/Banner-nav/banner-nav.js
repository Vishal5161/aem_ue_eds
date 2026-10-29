import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Banner Nav block
 *   Config rows (1 cell each): image | title | description
 *   Link rows   (2 cells):     label | target
 */

const slugify = (s) => (s || '').trim().replace(/^#/, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

// Resolved on click because later blocks decorate lazily.
function findTarget(slug) {
  if (!slug) return null;
  const byId = document.getElementById(slug);
  if (byId) return byId;
  const heading = [...document.querySelectorAll('main h1, main h2, main h3')]
    .find((h) => slugify(h.textContent) === slug);
  if (heading) return heading.closest('.section') || heading;
  return document.querySelector(`main .${slug}`);
}

export default function decorate(block) {
  const rows = [...block.children];
  const configRows = rows.filter((r) => r.children.length === 1);
  const linkRows = rows.filter((r) => r.children.length > 1);

  const imageRow = configRows.find((r) => r.querySelector('picture'));
  const textRows = configRows.filter((r) => r !== imageRow);
  const [titleRow, descRow] = textRows;

  const media = document.createElement('div');
  media.className = 'banner-nav-media';
  const pic = imageRow?.querySelector('picture img');
  if (pic) {
    const optimized = createOptimizedPicture(pic.src, pic.alt, true, [{ width: '1600' }]);
    moveInstrumentation(pic, optimized.querySelector('img'));
    media.append(optimized);
  }

  const panel = document.createElement('div');
  panel.className = 'banner-nav-panel';
  const content = document.createElement('div');
  content.className = 'banner-nav-content';
  const title = document.createElement('h1');
  title.textContent = titleRow?.textContent.trim() || '';
  if (titleRow) moveInstrumentation(titleRow, title);
  content.append(title);
  if (descRow) {
    const desc = document.createElement('div');
    desc.className = 'banner-nav-description';
    moveInstrumentation(descRow, desc);
    desc.append(...descRow.firstElementChild.childNodes);
    content.append(desc);
  }
  panel.append(content);

  const nav = document.createElement('nav');
  nav.className = 'banner-nav-links';
  nav.setAttribute('aria-label', 'Page sections');
  const ul = document.createElement('ul');
  linkRows.forEach((row) => {
    const [labelCell, targetCell] = [...row.children];
    const label = labelCell.textContent.trim();
    const slug = slugify(targetCell.textContent);
    if (!label) return;
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    const a = document.createElement('a');
    a.href = `#${slug}`;
    const icon = document.createElement('span');
    icon.className = 'banner-nav-icon';
    icon.setAttribute('aria-hidden', 'true');
    a.append(icon, label);
    a.addEventListener('click', (e) => {
      const target = findTarget(slug);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    li.append(a);
    ul.append(li);
  });
  nav.append(ul);

  block.replaceChildren(media, panel, nav);
}
