import { Meteor } from 'meteor/meteor';

import { exec } from 'child_process';

Meteor.methods({

  affordanceLanguageProcess: function(queryAttributes) {
    check(queryAttributes, {
      query: String
    });

    var queryString = queryAttributes.query;
    SEARCH_YELP_SCRIPT = "/Users/ryan/NUDelta/affordanceaware/search_yelp_places.py"
    const cmd = `/Users/ryan/NUDelta/affordanceaware/aae/bin/python ${ SEARCH_YELP_SCRIPT } '${ queryString }'`;
    console.log(queryString);
    console.log(cmd);
    const categories = JSON.parse(Meteor.wrapAsync(exec)(cmd));
    console.log(categories);

    var query = _.extend(queryAttributes, {
      submitted: new Date(),
      categories: Array.from(categories)
    });

    var queryId = Queries.insert(query);

    return {
      _id: queryId
    };
  }
});