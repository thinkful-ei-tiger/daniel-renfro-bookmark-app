import $ from 'jquery';

import store from './store';
import api from './api';

const generateStarRating = function (bookmark) {
  let starRating;
  let starChecked = bookmark.rating;
  let starUnchecked = 5 - starChecked;
  const starCheckedHtml = `<i class="fa fa-star"></i>`;
  const starUncheckedHtml = `<i class="fa fa-star-o"></i>`;
  starRating = starCheckedHtml.repeat(starChecked) + starUncheckedHtml.repeat(starUnchecked);
  return starRating;
};

$.fn.extend({
  serializeJson: function() {
    const formData = new FormData(this[0]);
    const inputObject = {};
    formData.forEach((val, name) => inputObject[name] = val);
    return JSON.stringify(inputObject);
  }
})

// ---------- Templates for Bookmark Views -----------

function simpleView(bookmark) {
  let bookmarkRating = generateStarRating(bookmark);
  
  return `<li class="bookmark" data-bookmark-id="${bookmark.id}">
        <div class="bookmark-title">
          <h3>${bookmark.title}</h3>
          <p>${bookmarkRating}</p>
        </div>
      </li>`;
}

function editMode(bookmark) {
  let bookmarkRating = generateStarRating(bookmark);
  
  return `<li class="edit-bookmark" data-bookmark-id="${bookmark.id}">
        <div class="bookmark-title">
          <h3>${bookmark.title}</h3>
          <p>${bookmarkRating}</p>
        </div>

        <form class="edit-bookmark-form">
          <label for="bookmark-title">Edit Title</label>
          <input id="bookmark-title" name="title" type="text" value="${bookmark.title}" required>
          <label for="bookmark-url">Edit Url</label>
          <input id="bookmark-url" name="url" type="url" value="${bookmark.url}" required>
          <label for="bookmark-rating">Edit Rating</label>
          <input id="bookmark-rating" name="rating" type="number" min="1" max="5" value="${bookmark.rating}">
          <label for="bookmark-desc">Edit Description</label>
          <textarea id="bookmark-desc" name="desc">${bookmark.desc}</textarea>
          <div class="form-buttons">
            <button type="button" class="btn cancel-btn js-cancel-edit">Cancel</button>
            <button type="submit" class="btn js-save">Save</button>
          </div>
        </form>
      </li>`;
}

function expandedView(bookmark) {
  let bookmarkRating = generateStarRating(bookmark);
  
  return `<li class="bookmark" data-bookmark-id="${bookmark.id}">
        <div class="bookmark-title">
          <h3>${bookmark.title}</h3>
          <p>${bookmarkRating}</p>
        </div>
        <div class="bookmark-description">
          <h4>Description</h4>
          ${(bookmark.desc.length === 0) ? '<p>No description.</p>' : `<p>${bookmark.desc}</p>`}
        </div>
        <div class="bookmark-buttons">
          <button class="btn" onclick="window.open(href='${bookmark.url}')" type="button">Visit Website</button>
          <button class="btn edit-btn js-edit">Edit</button>
          <button class="btn delete-btn js-delete" type="button">Delete</button>
        </div>
      </li>`;
}

// --------------------------------------------------------

function generateBookmarkElement(bookmark) {
  console.log('bookmark from generateBookmarkElement');
  if (bookmark.rating >= store.filter) {
    if (bookmark.inEditMode) {
      return editMode(bookmark);
    } else if (bookmark.isExpanded) {
      return expandedView(bookmark);
    } else {
      return simpleView(bookmark);
    }
  }    
}

function generateBookmarks(bookmarkList) {
  console.log('bookmarks from generateBookmarksString', bookmarkList);
  let bookmarks = bookmarkList.map(bookmark => generateBookmarkElement(bookmark));
  console.log('store.filter', typeof store.filter);
  
  return `<section class="my-bookmarks">
  <div class="bookmark-controls">
    <button type="button" class="btn add-bookmark-btn js-add-new-bookmark">Add Bookmark</button>
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
      <input id="bookmark-title" name="title" type="text" placeholder="Title" required>
      <label for="bookmark-url">Url</label>
      <input id="bookmark-url" name="url" type="url" placeholder="http://google.com" required>
      <label for="bookmark-rating">Rating</label>
      <input id="bookmark-rating" name="rating" type="number" min="1" max="5" placeholder="1">
      <label for="bookmark-desc">Description</label>
      <textarea id="bookmark-desc" name="desc" placeholder="Description"></textarea>
      <div class="form-buttons">
        <button type="button" class="btn cancel-btn js-cancel-new-bookmark">Cancel</button>
        <button type="submit" class="btn submit-btn js-add-bookmark">Add Bookmark</button>
      </div>
    </form>
  </section>`;
}

function generateError(message) {
  return `
      <section class="error-message">
        <p>${message}</p>
        <button class="btn" id="close-error">Close</button>
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
  
  if ((data.title.length === 0 || data.title === ' ') && data.url.length === 0 && data.rating.length === 0) {
    store.errorMessage = 'Title, URL and Rating cannot be blank.';
  } else if (data.title === ' ' || data.title.length <= 1) {
    store.errorMessage = 'Title cannot be blank and must be longer than one character.';
  } else if (!data.url.includes('http') || data.url.length <= 5) {
    store.errorMessage = 'URL must be longer than 5 characters and include http(s)://.';
  } else if (data.rating.length === 0) {
    store.errorMessage = 'Rating cannot be empty and must have a value between 1 and 5.';
  } else {
    store.errorMessage = '';
  }
}

function handleAddBookmarkClicked() {
  $('main').on('submit', '.new-bookmark-form', (event) => {
    event.preventDefault();
    let newBookmark = $('.new-bookmark-form').serializeJson();
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
    let bookmarkId = $(event.target).closest('.bookmark').data('bookmark-id');
    api.deleteBookmark(bookmarkId)
      .then(() => {
        store.deleteBookmark(bookmarkId);
        render();
      })
      .catch(error => {
        renderError();
      });
  });
}

function handleEditClicked() {
  $('main').on('click', '.js-edit', (event) => {
    let bookmarkId = $(event.target).closest('.bookmark').data('bookmark-id');
    store.toggleInEditMode(bookmarkId);
    render();
  })
}

function handleCancelEditClicked() {
  $('main').on('click', '.js-cancel-edit', (event) => {
    let bookmarkId = $(event.target).closest('.edit-bookmark').data('bookmark-id');
    store.toggleInEditMode(bookmarkId);
    render();
  })
}

function handleSaveClicked() {
 $('main').on('submit', '.edit-bookmark-form', (event) => {
   event.preventDefault();
   let id = $(event.target).closest('.edit-bookmark').data('bookmark-id');
   let editData = $('.edit-bookmark-form').serializeJson();
   evaluateBookmarkSubmission(editData);
   api.updateBookmark(id, editData)
    .then(() => {
      store.findAndUpdateBookmark(id, editData);
      store.toggleInEditMode(id);
      render();
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
  handleEditClicked();
  handleCancelEditClicked();
  handleSaveClicked();
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

