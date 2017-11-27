Template.blockSearchResults.onCreated(function() {
  // by default, use the current parent block query
  // as input to the prebuilt block search
  Session.set("searchInputText", this.data.query);
});

Template.blockSearchResults.helpers({
  searchInputText: function() {
    Session.get("searchInputText");
  },

  searchResults: function(queryId) {
    Meteor.subscribe("blockSearch", Session.get("searchInputText"));

    // We cannot re-use the query as MiniMongo does not support the $text operator!
    // Instead of resorting to a Meteor method we can hack around it by relying on an extra
    // ad-hoc collection containing the sorted ids ...
    const key = JSON.stringify(Session.get("searchInputText"));
    const result = Queries.BlockSearchResults.findOne(key);
    if (result) {
      const idsInSortOrder = result.results.filter(id => queryId !== id);
      const blocksInSortedOrder = idsInSortOrder.map(id => Queries.findOne(id));
      return blocksInSortedOrder;      
    }
  }
})

Template.blockSearchResults.events({
  'input #searchResultsInput': function(e, template) {
    Session.set("searchInputText", e.target.value);
  }
})

if (Meteor.isServer) {
  Queries._ensureIndex({
    "query": "text"
  });
}