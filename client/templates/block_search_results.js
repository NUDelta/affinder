Template.blockSearchResults.helpers({
  searchResults: function(searchQuery) {
    // TODO: use searchQuery to filter down all the existing blocks
    return Queries.find().fetch();
  }
})