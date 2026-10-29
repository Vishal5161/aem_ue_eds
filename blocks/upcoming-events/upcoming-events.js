/*
 * Upcoming Events block
 *
 * Row 1: Section heading | See all events link
 * Rows 2+: Image | Category | Date | Title | Event link
 */

function getCellText(cell) {
  return cell?.textContent?.trim() || '';
}

function getCellLink(cell) {
  return cell?.querySelector('a') || null;
}

function getCellImage(cell) {
  return cell?.querySelector('picture') || null;
}

export default function decorate(block) {
  const rows = [...block.children];

  if (!rows.length) return;

  // Read the heading and CTA from the first row.
  const headerCells = [...rows[0].children];
  const heading = getCellText(headerCells[0]) || 'Upcoming events';
  const headerLink = getCellLink(headerCells[1]);

  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'upcoming-events-header';

  const headingElement = document.createElement('h2');
  headingElement.textContent = heading;
  sectionHeader.append(headingElement);

  if (headerLink) {
    const cta = document.createElement('a');
    cta.className = 'upcoming-events-all-link';
    cta.href = headerLink.href;
    cta.textContent = getCellText(headerCells[1]) || 'See all events';
    cta.setAttribute('aria-label', cta.textContent);
    cta.innerHTML = '';

    const label = document.createElement('span');
    label.textContent = getCellText(headerCells[1]) || 'See all events';

    const arrow = document.createElement('span');
    arrow.className = 'upcoming-events-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';

    cta.append(label, arrow);
    sectionHeader.append(cta);
  }

  const cards = document.createElement('div');
  cards.className = 'upcoming-events-cards';

  // Convert each remaining row into an event card.
  rows.slice(1).forEach((row) => {
    const cells = [...row.children];

    if (!cells.length) return;

    const [imageCell, categoryCell, dateCell, titleCell, linkCell] = cells;

    const card = document.createElement('article');
    card.className = 'upcoming-event-card';

    const imageArea = document.createElement('div');
    imageArea.className = 'upcoming-event-image';

    const picture = getCellImage(imageCell);
    if (picture) {
      imageArea.append(picture.cloneNode(true));
    }

    const category = getCellText(categoryCell);
    if (category) {
      const badge = document.createElement('span');
      badge.className = 'upcoming-event-category';
      badge.textContent = category;
      imageArea.append(badge);
    }

    card.append(imageArea);

    const date = getCellText(dateCell);
    if (date) {
      const dateElement = document.createElement('p');
      dateElement.className = 'upcoming-event-date';

      const calendar = document.createElement('span');
      calendar.className = 'upcoming-event-calendar';
      calendar.setAttribute('aria-hidden', 'true');
      calendar.textContent = '▦';

      const dateText = document.createElement('span');
      dateText.textContent = date;

      dateElement.append(calendar, dateText);
      card.append(dateElement);
    }

    const title = getCellText(titleCell);
    if (title) {
      const titleElement = document.createElement('h3');
      titleElement.className = 'upcoming-event-title';
      titleElement.textContent = title;
      card.append(titleElement);
    }

    const eventLink = getCellLink(linkCell);
    if (eventLink) {
      const link = document.createElement('a');
      link.className = 'upcoming-event-link';
      link.href = eventLink.href;
      link.textContent = getCellText(linkCell) || 'View event';
      card.append(link);
    }

    cards.append(card);
  });

  block.replaceChildren(sectionHeader, cards);
}
