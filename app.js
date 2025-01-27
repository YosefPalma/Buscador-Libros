const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchType = document.getElementById('search-type');
const resultsDiv = document.getElementById('results');
const loadMoreBtn = document.getElementById('load-more');
const modal = document.getElementById('book-modal');
const modalDetails = document.getElementById('modal-details');
const closeModalBtn = document.getElementById('close-modal');

let books = [];
let currentPage = 1;
let currentQuery = '';
let currentSearchType = 'title';
let isLoading = false;

// Evento para manejar la búsqueda
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  currentQuery = searchInput.value.trim();
  currentSearchType = searchType.value;
  if (!currentQuery) return;

  currentPage = 1;
  await fetchBooks();
});

// Evento para cargar más resultados
loadMoreBtn.addEventListener('click', async () => {
  if (isLoading) return;
  isLoading = true;
  loadMoreBtn.classList.add('loading');

  currentPage++;
  await fetchBooks(true);

  isLoading = false;
  loadMoreBtn.classList.remove('loading');
});

// Evento para cerrar el modal
closeModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Función para buscar libros
async function fetchBooks(append = false) {
  const url = `https://openlibrary.org/search.json?${currentSearchType}=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    books = append ? [...books, ...data.docs] : data.docs;

    displayResults(books);
    toggleLoadMore(data.num_found > books.length);
  } catch (error) {
    resultsDiv.innerHTML = '<p>Ocurrió un error al buscar. Por favor, intenta de nuevo.</p>';
    console.error(error);
  }
}

// Función para mostrar los resultados
function displayResults(books) {
  if (!books.length) {
    resultsDiv.innerHTML = '<p>No se encontraron libros.</p>';
    return;
  }

  if (currentPage === 1) {
    resultsDiv.innerHTML = ''; // Limpiar resultados previos solo en la primera página
  }

  books.forEach((book) => {
    const bookElement = document.createElement('div');
    bookElement.classList.add('book');

    const coverUrl = book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : 'https://via.placeholder.com/128x192?text=Sin+Imagen';

    bookElement.innerHTML = `
      <img src="${coverUrl}" alt="Portada del libro ${book.title}">
      <div class="book-content">
        <h3>${book.title}</h3>
        <p><strong>Autor:</strong> ${book.author_name ? book.author_name.join(', ') : 'Desconocido'}</p>
      </div>
    `;

    // Evento para mostrar el modal al hacer clic
    bookElement.addEventListener('click', () => {
      showBookModal(book);
    });

    resultsDiv.appendChild(bookElement);
  });
}

// Función para mostrar/ocultar el botón de cargar más
function toggleLoadMore(show) {
  loadMoreBtn.style.display = show ? 'block' : 'none';
}

// Función para mostrar el modal con detalles del libro
function showBookModal(book) {
    const coverUrl = book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
      : 'https://via.placeholder.com/200x300?text=Sin+Imagen';
  
    const isbn = book.isbn ? book.isbn[0] : 'No disponible';
  
    modalDetails.innerHTML = `
      <img src="${coverUrl}" alt="Portada del libro ${book.title}">
      <h3>${book.title}</h3>
      <p><strong>Autor:</strong> ${book.author_name ? book.author_name.join(', ') : 'Desconocido'}</p>
      <p><strong>Año:</strong> ${book.first_publish_year || 'Desconocido'}</p>
      <p><strong>ISBN:</strong> ${isbn}</p>
    `;
    modal.classList.remove('hidden');
  }
  