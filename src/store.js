
const bookmarks = [];
let adding = false;
let error = null;
let errorMessage = '';
let filter = 0;


function findBookmarkById(id) {
   // Takes an id, looks through the array of bookmarks and returns the bookmark with the matching id.
   let foundItem = bookmarks.find(bookmark => bookmark.id === id);
   return foundItem;
}

function createBookmark(formData) {
  // Takes data in the shape of an object, and creates a new bookmark with that data and then pushes that new item to the store.
  const newBookmark = {
    isExpanded: false,
    inEditMode: false
  };
  bookmarks.push(Object.assign(formData, newBookmark));
  console.log('createBookmark function', bookmarks);
}

function findAndUpdateBookmark(id, updateData) {
  let parsedData = JSON.parse(updateData);

  let foundItem = findBookmarkById(id);
  let index = bookmarks.findIndex(bookmark => bookmark.id === id);
  let mergedData = Object.assign(foundItem, parsedData);
  bookmarks.splice(index, 1, mergedData);
} 

function toggleIsExpanded(id) {
  let foundItem = findBookmarkById(id);
  foundItem.isExpanded = !foundItem.isExpanded;
}

function toggleInEditMode(id) {
  let foundItem = findBookmarkById(id);
  foundItem.inEditMode = !foundItem.inEditMode;
}

function deleteBookmark(id) {
  // Takes an id, looks through the array of bookmarks and deletes the bookmark with the matching id.
  let index = bookmarks.findIndex(bookmark => bookmark.id === id);
  bookmarks.splice(index, 1);
}

function setError(value) {
  this.error = value;
}

export default {
  bookmarks,
  adding,
  error,
  errorMessage,
  filter,
  setError,
  createBookmark,
  deleteBookmark,
  toggleIsExpanded,
  toggleInEditMode,
  findAndUpdateBookmark
};