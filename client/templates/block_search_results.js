Template.simpleTextSearchResults.onCreated(function() {
  // by default, use the current parent block query
  // as input to the prebuilt block search
  Session.set("searchInputText", this.data.query);
});

Template.simpleTextSearchResults.helpers({
  searchInputText: function() {
    Session.get("searchInputText");
  },

  searchResults: function(queryId) {
    Meteor.subscribe("simpleTextSearch", Session.get("searchInputText"));

    // We cannot re-use the query as MiniMongo does not support the $text operator!
    // Instead of resorting to a Meteor method we can hack around it by relying on an extra
    // ad-hoc collection containing the sorted ids ...
    const key = JSON.stringify(Session.get("searchInputText"));
    const result = LowLevelDetectors.SimpleTextSearchResults.findOne(key);
    if (result) {
      const idsInSortOrder = result.results.filter(id => queryId !== id);
      const blocksInSortedOrder = idsInSortOrder.map(id => LowLevelDetectors.findOne(id));
      return blocksInSortedOrder;
    }
  }
});

Template.simpleTextSearchResults.events({
  'input #searchResultsInput': function(e, template) {
    Session.set("searchInputText", e.target.value);
  }
});

if (Meteor.isServer) {
  Queries._ensureIndex({
    "query": "text"
  });
}