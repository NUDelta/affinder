Template.blockSearchResults.helpers({
  searchResults: function(queryId, searchQuery) {
    // TODO: use searchQuery to filter down all the existing blocks
    return Queries.find({_id: { $not: queryId }}).fetch();
  }
})