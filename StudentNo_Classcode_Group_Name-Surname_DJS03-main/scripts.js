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
};

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


/* addEventListeners() {
    document.querySelector('[data-search-cancel]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = false;
    })

    document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = false;
    })

    document.querySelector('[data-header-search]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = true;
        document.querySelector('[data-search-title]').focus();
    })

    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = true;
    })

    document.querySelector('[data-list-close]').addEventListener('click', () => {
        document.querySelector('[data-list-active]').open = false;
    })

    document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
        event.preventDefault()
        const formData = new FormData(event.target);
        const { theme } = Object.fromEntries(formData);


        document.querySelector('[data-settings-overlay]').open = false;
    });

    document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const filters = Object.fromEntries(formData);
        const result = [];

        for (const book of books) {
            let genreMatch = filters.genre === 'any'

            for (const singleGenre of book.genres) {
                if (genreMatch) break;
                if (singleGenre === filters.genre) { genreMatch = true; }
            }

            if (
                (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
                (filters.author === 'any' || book.author === filters.author) &&
                genreMatch
            ) {
                result.push(book);
            }
        }

        this.page = 1;
        this.matches = result;

        if (result.length < 1) {
            document.querySelector('[data-list-message]').classList.add('list__message_show')
        } else {
            document.querySelector('[data-list-message]').classList.remove('list__message_show')
        }

        document.querySelector('[data-list-items]').innerHTML = '';
        const newItems = document.createDocumentFragment()

        for (const { author, id, image, title } of this.matches.slice(this.page * this.booksPerPage, (this.page + 1) * this.booksPerPage)) {
            const element = document.createElement('button')
            element.classList = 'preview'
            element.setAttribute('data-preview', id)

            element.innerHTML = `
                <img
                    class="preview__image"
                    src="${image}"
                />
                
                <div class="preview__info">
                    <h3 class="preview__title">${title}</h3>
                    <div class="preview__author">${authors[author]}</div>
                </div>
            `

            newItems.appendChild(element)
        }
    }





    document.querySelector('[data-list-items]').appendChild(newItems)
    document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1

    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
    `

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]').open = false
}

document.querySelector('[data-list-button]').addEventListener('click', () => {
    const fragment = document.createDocumentFragment()

    for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)

        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        fragment.appendChild(element)
    }

    document.querySelector('[data-list-items]').appendChild(fragment)
    page += 1
})

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath())
    let active = null

    for (const node of pathArray) {
        if (active) break

        if (node?.dataset?.preview) {
            let result = null

            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook
            }

            active = result
        }
    }

    if (active) {
        document.querySelector('[data-list-active]').open = true
        document.querySelector('[data-list-blur]').src = active.image
        document.querySelector('[data-list-image]').src = active.image
        document.querySelector('[data-list-title]').innerText = active.title
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
        document.querySelector('[data-list-description]').innerText = active.description
    }
}) */