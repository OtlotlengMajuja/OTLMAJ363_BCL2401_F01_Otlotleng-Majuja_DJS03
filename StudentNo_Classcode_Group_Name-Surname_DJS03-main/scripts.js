import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

/**
 * Class representing bookstore application
 * 
 * Create a bookstore.
 * @param {Array} books - List of books
 * @param {Object} authors - Authors
 * @param {Object} genres - Genres
 * @param {number} booksPerPage - Number of books to display per page
 */
class BookStore {
    constructor(books, authors, genres, booksPerPage) {
        this.books = books;
        this.authors = authors;
        this.genres = genres;
        this.booksPerPage = booksPerPage;
        this.page = 1;
        this.matches = books;
    };
};

/**
 * Initialize bookstore application
 */
init() {
    this.renderBooks(this.getBooksToRender());
    this.populateSelectOptions('[data-search-genres]', this.genres, 'All Genres');
    this.populateSelectOptions('[data-search-authors]', this.authors, 'All Authors');
    this.setTheme();
    this.updateShowMoreButton();
    this.addEventListener();
};


getBooksToRender() {
    return this.matches.slice(0, this.booksPerPage);
}

renderBooks(books) {
    const fragment = document.createDocumentFragment();
    books.forEach(book => fragment.appendChild(this.createBookElement(book)));
    document.querySelector('[data-list-items]').appendChild(fragment);
};

createBookElement({ authors, id, image, title }) { // Iterates over books and creates button elements for each book.
    const element = document.createElement('button')
    element.classList = 'preview'
    element.setAttribute('data-preview', id)
    // Set innerHTML of button to display book's image, title and author
    element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${this.authors[author]}</div>
        </div>
    `;
    return element;
};

populateSelectOptions(selector, options, defaultOptionText) {
    const fragment = document.createDocumentFragment();
    const defaultOption = document.createElement('option');
    defaultOption.value = 'any';
    defaultOption.innerText = defaultOptionText;
    fragment.appendChild(defaultOption);

    Object.entries(options).forEach(([id, name]) => {
        const option = document.createElement('option');
        option.value = id;
        option.innerText = name;
        fragment.appendChild(option);
    });

    document.querySelector(selector).appendChild(fragment)
}


setTheme() {
    const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
    this.updateTheme(theme);
    document.querySelector('[data-settings-theme]').value = theme;
};

updateTheme(theme) {
    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
}

updateShowMoreButton() {
    const showMoreButton = document.querySelector('[data-list-button]');
    showMoreButton.innerText = `Show more (${this.books.length - this.booksPerPage})`;
    showMoreButton.disabled = (this.matches.length - (this.page * this.booksPerPage)) <= 0;

    showMoreButton.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${this.getRemainingBooksCount()})</span>
`;
};

getRemainingBooksCount() {
    return Math.max(this.matches.length - (this.page * this.booksPerPage), 0);
}

addEventListeners() {
    document.querySelector('[data-search-cancel]').addEventListener('click', this.closeSearchOverlay.bind(this));
    document.querySelector('[data-settings-cancel]').addEventListener('click', this.closeSettingsOverlay.bind(this));
    document.querySelector('[data-header-search]').addEventListener('click', this.openSearchOverlay.bind(this));
    document.querySelector('[data-header-settings]').addEventListener('click', this.openSettingsOverlay.bind(this));
    document.querySelector('[data-list-close]').addEventListener('click', this.closeActiveOverlay.bind(this));
    document.querySelector('[data-settings-form]').addEventListener('submit', this.handleSettingsFormSubmit.bind(this));
    document.querySelector('[data-search-form]').addEventListener('submit', this.handleSearchFormSubmit.bind(this));
    document.querySelector('[data-list-button]').addEventListener('click', this.handleShowMoreClick.bind(this));
    document.querySelector('[data-list-items]').addEventListener('click', this.handleBookClick.bind(this));
}

closeSearchOverlay() {
    document.querySelector('[data-search-overlay]').open = false;
}

closeSettingsOverlay() {
    document.querySelector('[data-settings-overlay]').open = false;
}

openSearchOverlay() {
    document.querySelector('[data-search-overlay]').open = true;
    document.querySelector('[data-search-title]').focus();
}

openSettingsOverlay() {
    document.querySelector('[data-settings-overlay]').open = true;
}

closeActiveOverlay() {
    document.querySelector('[data-list-active]').open = false;
}


handleSettingsFormSubmit(Event) {
    Event.preventDefault();
    const formData = new FormData(Event.target);
    const { theme } = Object.fromEntries(formData);
    this.updateTheme(theme);
    document.querySelector('[data-settings-overlay]').open = false;
}

handleSearchFormSubmit(Event) {
    Event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    this.applyFilters(filters);
    this.renderFilteredBooks();
}

applyFilters(filters) {
    this.page = 1;
    this.matches = this.books.filter(book => {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;
        return genreMatch && titleMatch && authorMatch;
    });
}

renderFilteredBooks() {
    const messageElement = document.querySelector('[data-list-message]');
    const listItemsElement = document.querySelector('[data-list-items]');

    if (this.matches.length < 1) {
        messageElement.classList.add('list__message_show');
    } else {
        messageElement.classList.remove('list__message_show');
    }

    listItemsElement.innerHTML = '';
    this.renderBooks(this.getBooksToRender());
    this.updateShowMoreButton();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]').open = false;
}

handleShowMoreClick() {
    const newItems = this.matches.slice(this.page * this.booksPerPage, (this.page + 1) * this.booksPerPage);
    this.renderBooks(newItems);
    this.page += 1;
    this.updateShowMoreButton();
}

handleBookClick(Event) {
    const pathArray = Array.from(Event.composedPath());
    let activeBook = null;

    for (const node of pathArray) {
        if (node.dataset?.preview) {
            activeBook = this.books.find(book => book.id === node.dataset.preview);
            if (activeBook) break;
        }
    }
    if (activeBook) {
        this.openBookDetail(activeBook);
    }
}

openBookDetail(book) {
    document.querySelector('[data-list-active]').open = true;
    document.querySelector('[data-list-blur]').src = books.image;
    document.querySelector('[data-list-image]').src = books.image;
    document.querySelector('[data-list-title]').innerText = books.title;
    document.querySelector('[data-list-subtitle]').innerText = `${this.authors[books.author]} (${new Date(books.published).getFullYear()})`;
    document.querySelector('[data-list-description]').innerText = books.description;
}

const bookStore = new BookStore(books, authors, genres, BOOKS_PER_PAGE);
bookStore.init();
