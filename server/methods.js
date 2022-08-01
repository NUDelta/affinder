'use strict';
import { Meteor } from 'meteor/meteor';
const yelp = require('yelp-fusion');

import { exec } from 'child_process';
import {Cooccurances, ExampleSituations, Queries} from "../lib/collections/collections";
import {AUTH, CONFIG} from "../lib/config";
const request = require('request');

Meteor.methods({

  updateYelpPlaceCategories: function(queryAttributes) {
    check(queryAttributes, {
      _id: String,
      query: String
    });

    let queryString = queryAttributes.query;
    let request = require('request');
    let url = CONFIG.AFFINDER_SEARCH_URL + '/categories/' + queryString;
    request(url, Meteor.bindEnvironment(function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let res = JSON.parse(body);
        if (res !== Object(res)) {
          console.warn("Locations/methods expected type Object but did not receive an Object")
        } else {
          console.log(res);
          let arrayOfObjects = res.map((tup) => {
            return {'feature': tup[0], 'weight': tup[1]}
          });
          console.log(arrayOfObjects);
          let queryId = Queries.update(queryAttributes._id, {
            $push: {"categories": {$each: Array.from(arrayOfObjects) } }
          });
        }
      } else {
        console.warn("Yelp Category Search is not returning 200 status code");
        console.warn(response);
      }
    }));
  },

  searchCooccurances: function(params) {
    check(params, {
      category: String,
    })
    // check Cache
    const category = params.category;
    let cachedRes = Cooccurances.findOne({'category': category})
    if (cachedRes) {
      return cachedRes;
    }
    let url = 'http://localhost:8001/cooccurances/' + category;
    request(url, Meteor.bindEnvironment(function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let res = JSON.parse(body);
        let arrayOfObjects = res.map(tup => {
          return {'feature': tup[0], 'frequency': tup[1]}
        });
        console.log(arrayOfObjects);
        Cooccurances.insert({
          'category': category,
          'cooccurances': arrayOfObjects
        });
      }
    }));
  },

  sampleRandomUsers: function(params) {
    check(params, {
      limit: Number,
    })
    const limit = params.limit;
    let url = `${CONFIG.AFFINDER_VISITATION_URL}/random_users/?limit=${limit}`;
    console.log(url);
    request(url, Meteor.bindEnvironment(function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let res = JSON.parse(body);
        console.log(res)
      }
      else {
        console.warn(error)
        console.warn(response)
      }
    }));
  },

  yelpFusionBusinessSearch: function(searchParams, detectorId) {
    check(searchParams, {
      // https://www.yelp.com/developers/documentation/v3/business_search
      term: String,
      location: String,
      categories: Match.Optional(String)
    });
    check(detectorId, String);

    const client = yelp.client(AUTH.YELP_API_KEY);

    client.search(searchParams).then(response => {
      console.log(`We found ${response.jsonBody.businesses.length} place examples`);
      response.jsonBody.businesses.forEach(business => {
        let uniqueIdentifiers = {
          'id': business['id'],
          'alias': business['alias'],
          'detectorId': detectorId
        };
        const oneExample = ExampleSituations.findOne(uniqueIdentifiers);
        if (!oneExample) {
          let document = Object.assign(business, {
            'timeInserted': Date.now(),
            'detectorId': detectorId,
            'categoriesKey': searchParams.categories,
            'locationKey': searchParams.location,
            'numCategories': business['categories'].length,
            'reviewCount': business['review_count']
          });
          ExampleSituations.insert(document);

          const prettyJson = JSON.stringify(document, null, 4);
          console.log(prettyJson);
        } else {
          ExampleSituations.update(uniqueIdentifiers, {
            $set: { timeInserted: Date.now() }
          });
        }
      });
    }).catch(e => {
      console.log(e);
    });
  },

  'updateExampleSituationLabel'(selectFields, label) {
    check(selectFields, {
      '_id': String,
      'detectorId': String,
      'alias': String
    });
    check(label, {
      'conceptVariable': String,
      'label': String
    });

    let booleanLabel;
    if (label.label == 'true') {
      booleanLabel = true;
    } else if (label.label == 'false') {
      booleanLabel = false;
    }
    if (booleanLabel !== null) {
      ExampleSituations.upsert(selectFields, {
        $set: {
          [`labels.${label.conceptVariable}`]: booleanLabel
        }
      });
    } else {
      console.error(`Was not passed a true or false string, instead got ${label.label}`);
    }
  },

  'updateExampleSituationPrediction'(selectFields, prediction) {
    check(selectFields, {
      '_id': String,
      'detectorId': String,
      'alias': String
    });
    check(prediction, {
      'conceptVariable': String,
      'prediction': Boolean
    });
    ExampleSituations.upsert(selectFields, {
      $set: {
        [`predictions.${prediction.conceptVariable}`]: prediction.prediction
      }
    });
  }
});
