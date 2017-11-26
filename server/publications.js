Meteor.publish('categories', function() {
	return Categories.find();
});

Meteor.publish('querySummaries', function() {
  // TODO(rlouie): limit to just the summary contents
  return Queries.find();
});

Meteor.publish('weatherFeatures', function() {
  return WeatherFeatures.find();
})

Meteor.publish('movementFeatures', function() {
  return MovementFeatures.find();
})

Meteor.publish("blockSearch", function(searchValue) {
  check(searchValue, String)  // Incredibly important for this callback
  const logResults = Queries.find(
    {$text: {$search: searchValue} }
  );

  // This is a hack to work around the lack of $text support on the client side Minimongo lib
  // without which we would have trouble recreating the search results on the client
  const key = JSON.stringify(searchValue); // key that is unique per user and query
  const resultIds = logResults.map(e => e._id);
  Queries.BlockSearchResults.upsert(key, {results: resultIds});
  console.log("key", key)

  // check(Queries.BlockSearchResults.find({_id: key}))
  // publish the results to the client side
  return Queries.BlockSearchResults.find(key); // ensures the client side can get the indices in the right sort order

});
 // on the server
// Meteor.publish('posts', function() {return Posts.find({flagged: false});
// });

 // on the server
// Meteor.publish('posts', function(author) {
// return Posts.find({flagged: false, author: author});
// });