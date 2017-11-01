Meteor.publish('categories', function() {
	return Categories.find();
});

Meteor.publish('querySummaries', function() {
  // TODO(rlouie): limit to just the summary contents
  return Queries.find();
});


 // on the server
// Meteor.publish('posts', function() {return Posts.find({flagged: false});
// });

 // on the server
// Meteor.publish('posts', function(author) {
// return Posts.find({flagged: false, author: author});
// });