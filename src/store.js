
const bookmarks = [];
let adding = false;
let error = null;
let filter = 0;


function findBookmarkById(id) {
   // Takes an id, looks through the array of bookmarks and returns the bookmark with the matching id.
   let foundItem = bookmarks.find(bookmark => bookmark.id === id);
   return foundItem;
}

function createBookmark(bookmark) {
  // Takes data in the shape of an object, and creates a new bookmark with that data and then pushes that new item to the store.
  const newBookmark = {
    isExpanded: false
  };
  bookmarks.push(Object.assign(bookmark, newBookmark));
  console.log('createBookmark function', bookmarks);
}

function toggleIsExpanded(id) {
  let foundItem = findBookmarkById(id);
  foundItem.isExpanded = !foundItem.isExpanded;
}

function deleteBookmark(id) {
  // Takes an id, looks through the array of bookmarks and deletes the bookmark with the matching id.
}

export default {
  bookmarks,
  adding,
  error,
  filter,
  createBookmark,
  deleteBookmark,
  toggleIsExpanded
};