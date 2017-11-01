Meteor.publish('categories', function() {
	return Categories.find();
});

 // on the server
// Meteor.publish('posts', function() {return Posts.find({flagged: false});
// });

 // on the server
// Meteor.publish('posts', function(author) {
// return Posts.find({flagged: false, author: author});
// });