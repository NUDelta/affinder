import { Meteor } from 'meteor/meteor';

import { exec } from 'child_process';

Meteor.methods({

  updateYelpPlaceCategories: function(queryAttributes) {
    check(queryAttributes, {
      _id: String,
      query: String
    });

    let queryString = queryAttributes.query;
    let request = require('request');
    let url = 'http://localhost:8000/categories/' + queryString;
    request(url, Meteor.bindEnvironment(function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let res = JSON.parse(body);
        if (res !== Object(res)) {
          console.warn("Locations/methods expected type Object but did not receive an Object")
        } else {
          console.log(res);
          let queryId = Queries.update(queryAttributes._id, {
            $addToSet: {"categories": {$each: Array.from(res) } }
          });
        }
      } else {
        console.warn("Yelp Category Search is not returning 200 status code");
      }
    }));
  }
});