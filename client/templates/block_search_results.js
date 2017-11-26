Template.blockSearchResults.helpers({
  searchResults: function(queryId, searchQuery) {
    Meteor.subscribe("blockSearch", searchQuery);

    // We cannot re-use the query as MiniMongo does not support the $text operator!
    // Instead of resorting to a Meteor method we can hack around it by relying on an extra
    // ad-hoc collection containing the sorted ids ...
    const key = JSON.stringify(searchQuery);
    const result = Queries.BlockSearchResults.findOne(key);
    const idsInSortOrder = result.results.filter(id => queryId !== id);
    const blocksInSortedOrder = idsInSortOrder.map(id => Queries.findOne(id));
    return blocksInSortedOrder;
  }
})

if (Meteor.isServer) {
  Queries._ensureIndex({
    "query": "text"
  });
}