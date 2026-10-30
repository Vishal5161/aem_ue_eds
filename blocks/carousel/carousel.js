export default function decorate(block) {
  const originalChildren = [...block.children];

  // Build slides from the authored block content.
  const slides = [];

  originalChildren.forEach((row) => {
    const images = [...row.querySelectorAll('picture, img')];
    const uniqueImages = images.filter(
      (element) => element.tagName === 'IMG',
    );

    if (uniqueImages.length > 1) {
      uniqueImages.forEach((img) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';

        const picture = img.closest('picture');
        slide.append(picture || img);

        slides.push(slide);
      });
    } else if (row.querySelector('img')) {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.append(...row.childNodes);
      slides.push(slide);
    }
  });

  if (!slides.length) return;

  block.replaceChildren();

  const viewport = document.createElement('div');
  viewport.className = 'carousel-viewport';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  slides.forEach((slide) => {
    track.append(slide);
  });

  viewport.append(track);

  const createArrow = (direction, label) => {
    const button = document.createElement('button');
    button.className = `carousel-arrow carousel-arrow-${direction}`;
    button.type = 'button';
    button.setAttribute('aria-label', label);

    button.innerHTML = direction === 'prev'
      ? '<svg viewBox="0 0 40 24" aria-hidden="true"><path d="M38 12H4m0 0 11-9M4 12l11 9"/></svg>'
      : '<svg viewBox="0 0 40 24" aria-hidden="true"><path d="M2 12h34m0 0L25 3m11 9-11 9"/></svg>';

    return button;
  };

  const prev = createArrow('prev', 'Previous slide');
  const next = createArrow('next', 'Next slide');

  block.classList.add('carousel');
  block.append(viewport, prev, next);

  let currentIndex = 0;

  const update = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    prev.disabled = currentIndex === 0;
    next.disabled = currentIndex === slides.length - 1;

    slides.forEach((slide, index) => {
      slide.setAttribute(
        'aria-hidden',
        index === currentIndex ? 'false' : 'true',
      );
    });
  };

  prev.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      update();
    }
  });

  next.addEventListener('click', () => {
    if (currentIndex < slides.length - 1) {
      currentIndex += 1;
      update();
    }
  });

  if (slides.length < 2) {
    prev.hidden = true;
    next.hidden = true;
  }

  update();
}
