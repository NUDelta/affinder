import { Meteor } from 'meteor/meteor';

import { exec } from 'child_process';

Meteor.methods({

  updateYelpPlaceCategories: function(queryAttributes) {
    check(queryAttributes, {
      _id: String,
      query: String
    });

    var queryString = queryAttributes.query;
    SEARCH_YELP_SCRIPT = "/Users/ryan/NUDelta/affordanceaware/search_yelp_places.py"
    const cmd = `/Users/ryan/NUDelta/affordanceaware/aae/bin/python ${ SEARCH_YELP_SCRIPT } '${ queryString }'`;
    console.log(queryString);
    console.log(cmd);
    const categories = JSON.parse(Meteor.wrapAsync(exec)(cmd));
    console.log(categories);

    var queryId = Queries.update(queryAttributes._id, {
      $addToSet: {"categories": {$each: Array.from(categories) } }
    });
  }
});