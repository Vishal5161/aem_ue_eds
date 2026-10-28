import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function getNavSections(nav) {
  return nav.querySelector('.nav-sections');
}

function closeAllDropdowns(navSections, except = null) {
  if (!navSections) return;

  navSections.querySelectorAll('.nav-drop').forEach((item) => {
    if (item !== except) {
      item.setAttribute('aria-expanded', 'false');
    }
  });
}

function toggleDropdown(item, forceState = null) {
  const expanded = forceState !== null
    ? forceState
    : item.getAttribute('aria-expanded') !== 'true';

  const navSections = item.closest('.nav-sections');
  closeAllDropdowns(navSections, expanded ? item : null);
  item.setAttribute('aria-expanded', String(expanded));
}

function handleDocumentKeydown(event) {
  if (event.key !== 'Escape') return;

  const nav = document.getElementById('nav');
  if (!nav) return;

  const navSections = getNavSections(nav);
  const expandedItem = navSections?.querySelector(
    '.nav-drop[aria-expanded="true"]',
  );

  if (expandedItem) {
    toggleDropdown(expandedItem, false);
    expandedItem.focus();
    return;
  }

  if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
    toggleMenu(nav, false);
    nav.querySelector('.nav-hamburger button')?.focus();
  }
}

function toggleMenu(nav, forceState = null) {
  const currentlyExpanded = nav.getAttribute('aria-expanded') === 'true';
  const expanded = forceState !== null ? forceState : !currentlyExpanded;
  const button = nav.querySelector('.nav-hamburger button');
  const navSections = getNavSections(nav);

  nav.setAttribute('aria-expanded', String(expanded));

  if (button) {
    button.setAttribute('aria-expanded', String(expanded));
    button.setAttribute(
      'aria-label',
      expanded ? 'Close navigation' : 'Open navigation',
    );
  }

  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';

  if (!expanded) closeAllDropdowns(navSections);
}

function decorateTopBar(nav) {
  const topBar = nav.querySelector('.nav-top-bar');
  if (!topBar) return;

  const wrapper = topBar.querySelector('.default-content-wrapper') || topBar;

  // Add semantic classes to the existing authored components by their order.
  const children = [...wrapper.children].filter((child) => {
    return child.textContent.trim() || child.querySelector('img, a, input');
  });

  if (children[0]) children[0].classList.add('top-bar-logo');
  if (children[1]) children[1].classList.add('top-bar-search');
  if (children[2]) children[2].classList.add('top-bar-estore');
  if (children[3]) children[3].classList.add('top-bar-quote');

  // Make the logo link accessible and preserve its authored destination.
  const logo = topBar.querySelector('.top-bar-logo');
  const logoImage = logo?.querySelector('img');
  const logoLink = logo?.querySelector('a');

  if (logoImage && logoLink) {
    logoLink.setAttribute('aria-label', 'Beckman Coulter Life Sciences home');
  }
}

function decorateMainNavigation(nav) {
  const navSections = getNavSections(nav);
  if (!navSections) return;

  const menuItems = navSections.querySelectorAll(
    ':scope .default-content-wrapper > ul > li',
  );

  menuItems.forEach((item) => {
    const submenu = item.querySelector(':scope > ul');
    if (!submenu) return;

    item.classList.add('nav-drop');
    item.setAttribute('aria-expanded', 'false');
    item.setAttribute('tabindex', '0');

    const link = item.querySelector(':scope > a');
    if (link) {
      link.setAttribute('aria-haspopup', 'true');
      link.setAttribute('aria-expanded', 'false');
    }

    // Clicking a parent toggles its submenu on desktop and mobile.
    item.addEventListener('click', (event) => {
      const clickedLink = event.target.closest('a');

      if (clickedLink && clickedLink.parentElement === item) {
        // Allow normal navigation for a real destination URL.
        // Use a button or a non-navigating parent for menu-only controls.
        if (clickedLink.getAttribute('href') !== '#') return;
        event.preventDefault();
      }

      if (!isDesktop.matches || event.target === item || event.target.closest(':scope > a')) {
        if (event.target.closest('a')?.getAttribute('href') === '#') {
          event.preventDefault();
        }
        toggleDropdown(item);
      }
    });

    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        const link = event.target.closest('a');

        if (event.target === item || link?.getAttribute('href') === '#') {
          event.preventDefault();
          toggleDropdown(item);
        }
      }

      if (event.key === 'ArrowDown' && item.getAttribute('aria-expanded') !== 'true') {
        event.preventDefault();
        toggleDropdown(item, true);
        submenu.querySelector('a')?.focus();
      }
    });

    // Keep the link and parent ARIA state synchronized.
    const observer = new MutationObserver(() => {
      const expanded = item.getAttribute('aria-expanded') === 'true';
      if (link) link.setAttribute('aria-expanded', String(expanded));
    });

    observer.observe(item, {
      attributes: true,
      attributeFilter: ['aria-expanded'],
    });
  });
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta
    ? new URL(navMeta, window.location).pathname
    : '/nav';

  const fragment = await loadFragment(navPath);

  block.textContent = '';

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  while (fragment.firstElementChild) {
    nav.append(fragment.firstElementChild);
  }

  // Two-section authoring structure.
  const sectionClasses = ['top-bar', 'sections'];

  sectionClasses.forEach((className, index) => {
    const section = nav.children[index];
    if (section) section.classList.add(`nav-${className}`);
  });

  // Prevent errors if the fragment has not yet been authored correctly.
  if (!nav.querySelector('.nav-top-bar') || !nav.querySelector('.nav-sections')) {
    console.error(
      'Header: expected two sections in /nav — top bar and main navigation.',
    );
  }

  decorateTopBar(nav);
  decorateMainNavigation(nav);

  // Hamburger button for smaller screens.
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `
    <button type="button"
      aria-controls="nav"
      aria-expanded="false"
      aria-label="Open navigation">
      <span class="nav-hamburger-icon" aria-hidden="true"></span>
    </button>
  `;

  hamburger.querySelector('button').addEventListener('click', () => {
    toggleMenu(nav);
  });

  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, false);
    document.body.style.overflowY = '';
  });

  document.addEventListener('keydown', handleDocumentKeydown);

  // Close menus when clicking outside the header.
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) {
      closeAllDropdowns(getNavSections(nav));

      if (!isDesktop.matches) toggleMenu(nav, false);
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
