import $ from 'jquery';

import store from './store';
import api from './api';

$.fn.extend({
  serializeJson: function() {
    const formData = new FormData(this[0]);
    const inputObject = {};
    formData.forEach((val, name) => inputObject[name] = val);
    return JSON.stringify(inputObject);
  }
})

function generateBookmarkElement(bookmark) {
  console.log('bookmark from generateBookmarkElement');
  if (bookmark.rating >= store.filter) {
    if (bookmark.isExpanded) {
      return `<li class="bookmark" data-bookmark-id="${bookmark.id}">
        <h3>${bookmark.title}</h3>
        <p>${bookmark.rating} Stars</p>
      </li>
      <div>
        <h4>Description</h4>
        ${(bookmark.desc.length === 0) ? '<p>No description.</p>' : `<p>${bookmark.desc}</p>`}
      </div>
      <button onclick="window.open(href='${bookmark.url}')" type="button">Visit Website</button>
      <button class="delete-btn js-delete" type="button">Delete</button>`;
    } else {
      return `<li class="bookmark" data-bookmark-id="${bookmark.id}">
        <h3>${bookmark.title}</h3>
        <p>${bookmark.rating} Stars</p>
      </li>`;
    }
  }    
}

function generateBookmarks(bookmarkList) {
  console.log('bookmarks from generateBookmarksString', bookmarkList);
  let bookmarks = bookmarkList.map(bookmark => generateBookmarkElement(bookmark));
  console.log('store.filter', typeof store.filter);
  
  return `<section class="my-bookmarks">
  <div class="bookmark-controls">
    <button type="button" class="add-bookmark-btn js-add-new-bookmark">Add Bookmark</button>
    <select class="filter">
      <option value="" ${(store.filter === "0") ? 'selected' : ''}>Filter By</option>
      <option value="0">Clear Filter</option>
      <option value="1" ${(store.filter === "1") ? 'selected' : ''}>1 Star</option>
      <option value="2" ${(store.filter === "2") ? 'selected' : ''}>2 Stars</option>
      <option value="3" ${(store.filter === "3") ? 'selected' : ''}>3 Stars</option>
      <option value="4" ${(store.filter === "4") ? 'selected' : ''}>4 Stars</option>
      <option value="5" ${(store.filter === "5") ? 'selected' : ''}>5 Stars</option>
    </select>
  </div>
  
  <section>
    <ul class="bookmark-list">
      ${bookmarks.join('')}
    </ul>
  </section>
</section>`;
}

function generateNewBookmarkForm() {
  
  return `<section class="my-bookmarks">
    <h2>Add New Bookmark</h2>
    <section class="error-container">
    </section>
    <form action="" class="new-bookmark-form">
      <label for="bookmark-title">Title</label>
      <input id="bookmark-title" name="title" type="text" placeholder="e.g. Google" required>
      <label for="bookmark-url">URL</label>
      <input id="bookmark-url" name="url" type="url" placeholder="e.g http://google.com" required>
      <label for="bookmark-rating">Rating</label>
      <input id="bookmark-rating" name="rating" type="number" min="1" max="5" placeholder="1">
      <label for="bookmark-desc">Description</label>
      <textarea id="bookmark-desc" name="desc" placeholder="Enter a description for your bookmark!"></textarea>
      <button type="button" class="cancel-btn js-cancel-new-bookmark">Cancel</button>
      <button type="submit" class="submit-btn js-add-bookmark">Add Bookmark</button>
    </form>
  </section>`;
}

function generateError(message) {
  return `
      <section class="error-message">
        <button id="close-error">Close</button>
        <p>${message}</p>
      </section>
    `;
}

function renderError() {
  if (store.error) {
    const errorElement = generateError(store.errorMessage);
    $('.error-container').html(errorElement);
  } else {
    $('.error-container').empty();
  }
}

function handleCloseError() {
  $('main').on('click', '#close-error', () => {
    store.setError(false);
    renderError();
  });
}

function handleAddNewBookmarkClicked() {
  $('main').on('click', '.js-add-new-bookmark', function(event) {
    store.adding = !store.adding;
    render();
  })
}

function handleCancelNewBookmarkClicked() {
  $('main').on('click', '.js-cancel-new-bookmark', (event) => {
    store.adding = !store.adding;
    render();
  })
}

function evaluateBookmarkSubmission(dataObject) {
  let data = JSON.parse(dataObject);
  
  if (data.title.length === 0 || data.title === " " || data.url.length === 0 || data.rating.length === 0) {
    store.errorMessage = 'Title, URL or Rating cannot be blank.';
  } else if (data.title.length === 1) {
    store.errorMessage = 'Title must be longer than one character.';
  } else if (!data.url.includes('http')) {
    store.errorMessage = 'URL must begin with http(s)://.';
  } else if (data.url.length <= 5) {
    store.errorMessage = 'URL must be longer than 5 characters.';
  } else {
    store.errorMessage = '';
  }
}

function handleAddBookmarkClicked() {
  $('main').on('click', '.js-add-bookmark', (event) => {
    event.preventDefault();
    let newBookmark = $('.new-bookmark-form').serializeJson();
    console.log('newBookmark', newBookmark);
    evaluateBookmarkSubmission(newBookmark);
    api.addBookmark(newBookmark)
      .then((bookmark) => {
        store.createBookmark(bookmark);
        store.adding = !store.adding;
        render();
      })
      .catch(error => {
        renderError();
      });
  });
}

function handleBookmarkClicked() {
  $('main').on('click', '.bookmark', (event) => {
    let bookmarkId = $(event.currentTarget).data('bookmark-id');
    store.toggleIsExpanded(bookmarkId);
    render();
  })
}

function handleFilterSelected() {
  $('main').on('change', '.filter', (event) => {
    let filter = $('.filter').val();
    store.filter = filter;
    render();
  })
}

function handleDeleteClicked() {
  $('main').on('click', '.js-delete', (event) => {
    console.log('You are trying to delete a bookmark.');
    let bookmarkId = $(event.target).siblings('.bookmark').data('bookmark-id');
    console.log('store.bookmarks', store.bookmarks);
    console.log('deletedId', bookmarkId);
    api.deleteBookmark(bookmarkId)
      .then(() => {
        store.deleteBookmark(bookmarkId);
        render();
        console.log('store after deletion', store.bookmarks);
      })
      .catch(error => {
        renderError();
      });
  });
}

function eventHandlers() {
  handleAddNewBookmarkClicked();
  handleCancelNewBookmarkClicked();
  handleAddBookmarkClicked();
  handleBookmarkClicked();
  handleFilterSelected();
  handleDeleteClicked();
  handleCloseError();
}

function render() {
  // This page should render the page to the user, based on the state of the store.
  renderError();
  
  const bookmarks = [...store.bookmarks];
  let bookmarksPage = '';
  
  if (!store.adding) {
    bookmarksPage = generateBookmarks(bookmarks);
    $('main').html(bookmarksPage);
  } else {
    bookmarksPage = generateNewBookmarkForm();
    $('main').html(bookmarksPage);
  }   
}

export default {
  render,
  eventHandlers
};

