import {Queries, Detectors} from "../lib/collections/collections";

Meteor.publish('Queries', function() {
  // TODO(rlouie): limit to just the summary contents
  return Queries.find();
});

Meteor.publish('Workspace', function() {
  return Workspace.find();
});

Meteor.publish("blockSearch", function(searchValue) {
  check(searchValue, String);
  const res = Detectors.find(
    {$text: {$search: searchValue} }
  );

  // This is a hack to work around the lack of $text support on the client side Minimongo lib
  // without which we would have trouble recreating the search results on the client
  const key = JSON.stringify(searchValue);
  const resultIds = res.map(e => e._id);
  Detectors.BlockSearchResults.upsert(key, {results: resultIds});

  // publish the results to the client side
  return Detectors.BlockSearchResults.find(key);
});

Meteor.publish('Detectors', function() {
  return Detectors.find();
});