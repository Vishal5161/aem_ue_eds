import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Upcoming Events block (Universal Editor / xwalk)
 *
 * Authored structure (seeAll + seeAllText collapse into one link cell):
 *   Row 1:   heading                         (1 cell)
 *   Row 2:   see-all link (<a> with text)    (1 cell)
 *   Rows 3+: image | date | title | link     (4 cells, one row per event)
 */

const text = (cell) => cell?.textContent?.trim() || '';

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // Event rows have several cells; container-level config rows have one.
  const isEventRow = (row) => row.children.length > 1;
  const configRows = rows.filter((row) => !isEventRow(row));
  const eventRows = rows.filter(isEventRow);

  const [headingRow, linkRow] = configRows;
  const heading = text(headingRow) || 'Upcoming events';
  const headerLink = linkRow?.querySelector('a');
  const linkLabel = headerLink?.textContent.trim() || 'See all events';

  const header = document.createElement('div');
  header.className = 'upcoming-events-header';
  const h2 = document.createElement('h2');
  h2.textContent = heading;
  if (headingRow) moveInstrumentation(headingRow, h2);
  header.append(h2);

  if (headerLink) {
    const cta = document.createElement('a');
    cta.className = 'upcoming-events-all-link';
    cta.href = headerLink.href;
    cta.setAttribute('aria-label', linkLabel);
    const label = document.createElement('span');
    label.textContent = linkLabel;
    const arrow = document.createElement('span');
    arrow.className = 'upcoming-events-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    cta.append(label, arrow);
    header.append(cta);
  }

  const cards = document.createElement('div');
  cards.className = 'upcoming-events-cards';

  eventRows.forEach((row) => {
    const [imageCell, dateCell, titleCell, linkCell] = [...row.children];

    // Keep data-aue-* on the card so each event stays selectable/movable in the editor.
    const card = document.createElement('article');
    card.className = 'upcoming-event-card';
    moveInstrumentation(row, card);

    const imageArea = document.createElement('div');
    imageArea.className = 'upcoming-event-image';
    const picture = imageCell?.querySelector('picture');
    if (picture) imageArea.append(picture);
    card.append(imageArea);

    const date = text(dateCell);
    if (date) {
      const p = document.createElement('p');
      p.className = 'upcoming-event-date';
      const cal = document.createElement('span');
      cal.className = 'upcoming-event-calendar';
      cal.setAttribute('aria-hidden', 'true');
      cal.textContent = '▦';
      const span = document.createElement('span');
      span.textContent = date;
      p.append(cal, span);
      card.append(p);
    }

    const title = text(titleCell);
    if (title) {
      const h3 = document.createElement('h3');
      h3.className = 'upcoming-event-title';
      h3.textContent = title;
      card.append(h3);
    }

    const eventLink = linkCell?.querySelector('a');
    if (eventLink) {
      const a = document.createElement('a');
      a.className = 'upcoming-event-link';
      a.href = eventLink.href;
      a.textContent = 'View event';
      card.append(a);
    }

    cards.append(card);
  });

  block.replaceChildren(header, cards);
}
