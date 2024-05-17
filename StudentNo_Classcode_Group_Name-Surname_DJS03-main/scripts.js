import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

class BookStore {
    constructor(books, authors, genres, booksPerPage) {
        this.books = books;
        this.authors = authors;
        this.genres = genres;
        this.booksPerPage = booksPerPage;
        this.page = 1;
        this.matches = books;
    }

    init() {
        this.renderBooks(this.getBooksToRender());
        this.populateGenres('[data-search-genres]', 'All Genres');
        this.populateAuthors('[data-search-authors]', 'All Authors');
        this.setTheme();
        this.updateShowMoreButton();
        this.addEventListeners();
    }

    getBooksToRender() {
        return this.matches.slice(0, this.booksPerPage);
    }

    renderBooks(books) {
        const fragment = document.createDocumentFragment();
        books.forEach((book) => {
            const element = this.createBookElement(book);
            fragment.appendChild(element);
        });

        document.querySelector('[data-list-items]').appendChild(fragment);
        this.updateShowMoreButton();
    }

    createBookElement({ author, id, image, title }) {
        const element = document.createElement('button');
        element.classList = 'preview';
        element.setAttribute('data-preview', id);

        element.innerHTML = `
            <img class="preview__image" src="${image}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${this.authors[author]}</div>
            </div>
        `;
        return element;
    }

    populateGenres(selector, defaultOptionText) {
        const genreHtml = document.createDocumentFragment();
        const firstGenreElement = this.createOptionElement(defaultOptionText, "any");
        genreHtml.appendChild(firstGenreElement);

        for (const [id, name] of Object.entries(this.genres)) {
            const element = this.createOptionElement(name, id);
            genreHtml.appendChild(element);
        }

        document.querySelector(selector).appendChild(genreHtml);
    }

    populateAuthors(selector, defaultOptionText) {
        const authorsHtml = document.createDocumentFragment();
        const firstAuthorElement = this.createOptionElement(defaultOptionText, "any");
        authorsHtml.appendChild(firstAuthorElement);

        for (const [id, name] of Object.entries(this.authors)) {
            const element = this.createOptionElement(name, id);
            authorsHtml.appendChild(element);
        }

        document.querySelector(selector).appendChild(authorsHtml);
    }

    createOptionElement(text, value) {
        const element = document.createElement("option");
        element.value = value;
        element.innerText = text;
        return element;
    }

    setTheme() {
        const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
        this.updateTheme(theme);
        document.querySelector('[data-settings-theme]').value = theme;
    }

    updateTheme(theme) {
        const darkMode = theme === "night";
        document.documentElement.style.setProperty("--color-dark", darkMode ? "255, 255, 255" : "10, 10, 20");
        document.documentElement.style.setProperty("--color-light", darkMode ? "10, 10, 20" : "255, 255, 255");
    }

    updateShowMoreButton() {
        const showMoreButton = document.querySelector('[data-list-button]');
        showMoreButton.innerText = `Show more (${this.books.length - this.booksPerPage})`;
        showMoreButton.disabled = (this.matches.length - (this.page * this.booksPerPage)) < 1;

        showMoreButton.innerHTML = `
            <span>Show more</span>
            <span class="list__remaining"> (${(this.matches.length - (this.page * this.booksPerPage)) > 0 ? (this.matches.length - (this.page * this.booksPerPage)) : 0})</span>`;
    }

    addEventListeners() {
        document.querySelector("[data-search-cancel]").addEventListener("click", () => {
            document.querySelector("[data-search-overlay]").open = false;
        });

        document.querySelector("[data-settings-cancel]").addEventListener("click", () => {
            document.querySelector("[data-settings-overlay]").open = false;
        });

        document.querySelector("[data-header-search]").addEventListener("click", () => {
            document.querySelector("[data-search-overlay]").open = true;
            document.querySelector("[data-search-title]").focus();
        });

        document.querySelector("[data-header-settings]").addEventListener("click", () => {
            document.querySelector("[data-settings-overlay]").open = true;
        });

        document.querySelector("[data-settings-form]").addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const { theme } = Object.fromEntries(formData);
            this.updateTheme(theme);
            document.querySelector('[data-settings-overlay]').open = false;
        });

        document.querySelector("[data-search-form]").addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            this.matches = this.applyFilters(formData);
            this.page = 1;
            this.renderFilteredBooks();
        });

        document.querySelector('[data-list-button]').addEventListener("click", () => {
            this.page += 1;
            this.renderBooks(this.matches.slice((this.page - 1) * this.booksPerPage, this.page * this.booksPerPage));
        });

        document.querySelector("[data-list-items]").addEventListener("click", (event) => {
            const pathArray = Array.from(event.composedPath());
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
        });
    }

    applyFilters(formData) {
        const filters = Object.fromEntries(formData);
        return this.books.filter((book) => {
            let genreMatch = filters.genre === "any";

            for (const singleGenre of book.genres) {
                if (genreMatch) break;
                if (singleGenre === filters.genre) {
                    genreMatch = true;
                }
            }

            return (
                (filters.title.trim() === "" ||
                    book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
                (filters.author === "any" || book.author === filters.author) &&
                genreMatch
            );
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

    openBookDetail(book) {
        // Implement this method to handle the display of book details
        const detailElement = document.querySelector('[data-list-active]');
        const isOpen = detailElement.open;

        if (isOpen) {
            detailElement.open = false;
        } else {
            detailElement.open = true;
            document.querySelector('[data-list-blur]').src = book.image;
            document.querySelector('[data-list-image]').src = book.image;
            document.querySelector('[data-list-title]').innerText = book.title;
            document.querySelector('[data-list-subtitle]').innerText = `${this.authors[book.author]} (${new Date(book.published).getFullYear()})`;
            document.querySelector('[data-list-description]').innerText = book.description;
        };

    }
}

// User preferred theme according to device settings
if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.style.setProperty("--color-dark", "255, 255, 255");
    document.documentElement.style.setProperty("--color-light", "10, 10, 20");
} else {
    document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
    document.documentElement.style.setProperty("--color-light", "255, 255, 255");
}

// Function call to display the preview
const bookstore = new BookStore(books, authors, genres, BOOKS_PER_PAGE);
bookstore.init();
