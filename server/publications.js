Meteor.publish('categories', function() {
	return Categories.find();
});

Meteor.publish('querySummaries', function() {
  // TODO(rlouie): limit to just the summary contents
  return Queries.find();
});

Meteor.publish('Workspace', function() {
  return Workspace.find();
})

Meteor.publish('weatherFeatures', function() {
  return WeatherFeatures.find();
})

Meteor.publish('movementFeatures', function() {
  return MovementFeatures.find();
})

Meteor.publish("blockSearch", function(searchValue) {
  check(searchValue, String);
  const res = Queries.find(
    {$text: {$search: searchValue} }
  );

  // This is a hack to work around the lack of $text support on the client side Minimongo lib
  // without which we would have trouble recreating the search results on the client
  const key = JSON.stringify(searchValue);
  const resultIds = res.map(e => e._id);
  Queries.BlockSearchResults.upsert(key, {results: resultIds});

  // publish the results to the client side
  return Queries.BlockSearchResults.find(key);
});

Meteor.publish('Detectors', function() {
  return Detectors.find();
})