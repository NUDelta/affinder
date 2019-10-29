'use strict';
import { Meteor } from 'meteor/meteor';
const yelp = require('yelp-fusion');

import { exec } from 'child_process';
import {ExampleSituations, Queries} from "../lib/collections/collections";
import {AUTH} from "../lib/config";

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
  },

  yelpFusionBusinessSearch: function(searchParams) {
    check(searchParams, {
      // https://www.yelp.com/developers/documentation/v3/business_search
      term: String,
      location: String,
      categories: Match.Optional(String)
    });

    const client = yelp.client(AUTH.YELP_API_KEY);

    client.search(searchParams).then(response => {
      console.log(`We found ${response.jsonBody.businesses.length} place examples`);
      response.jsonBody.businesses.forEach(business => {
        ExampleSituations.insert(business);
        const prettyJson = JSON.stringify(business, null, 4);
        console.log(prettyJson);
      });
    }).catch(e => {
      console.log(e);
    });
  }
});