export default function decorate(block) {
  const rows = [...block.children];

  const placeholder = rows[0]?.textContent.trim() || 'Search products...';

  const buttonText = rows[1]?.textContent.trim() || 'Search';

  block.innerHTML = `
    <form class="product-search-form" role="search">
      <input
        class="product-search-input"
        type="search"
        placeholder="${placeholder.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')}"
        aria-label="Search products"
      />
      <button class="product-search-button" type="submit">
        ${buttonText.replace(/&/g, '&amp;').replace(/</g, '&lt;')}
      </button>
    </form>
  `;

  block.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();

    const query = block.querySelector('input').value.trim();

    if (query) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  });
}
