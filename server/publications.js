import {Queries, Detectors, ExampleSituations, LowLevelDetectors} from "../lib/collections/collections";

Meteor.publish('Queries', function() {
  // TODO(rlouie): limit to just the summary contents
  return Queries.find();
});

Meteor.publish('Workspace', function() {
  return Workspace.find();
});

Meteor.publish("simpleTextSearch", function(searchValue) {
  check(searchValue, String);
  const res = LowLevelDetectors.find(
    {$text: {$search: searchValue} }
  );

  // This is a hack to work around the lack of $text support on the client side Minimongo lib
  // without which we would have trouble recreating the search results on the client
  const key = JSON.stringify(searchValue);
  const resultIds = res.map(e => e._id);
  LowLevelDetectors.SimpleTextSearchResults.upsert(key, {results: resultIds});

  // publish the results to the client side
  return LowLevelDetectors.SimpleTextSearchResults.find(key);
});

Meteor.publish('LowLevelDetectors', function() {
  return LowLevelDetectors.find();
});

Meteor.publish('Detectors', function() {
  return Detectors.find();
});

const situationHumanReadableFields = {
  "_id": true,
  "categoriesKey": true,
  "timeInserted": true,
  "alias": true,
  "detectorId": true,
  "name": true,
  "image_url": true,
  "url": true,
  "coordinates": true,
  "categories": true,
  "numCategories": true,
  "labels": true,
  "predictions": true
};
Meteor.publish('ExampleSituations.HumanReadable.topK', function(topK) {
  check(topK, Number);
  return ExampleSituations.find({}, {
    limit: topK,
    fields: situationHumanReadableFields
  });
});
Meteor.publish('ExampleSituations.HumanReadable', function() {
  return ExampleSituations.find({}, {
    fields: situationHumanReadableFields
  });
});
Meteor.publish('ExampleSituations.HumanReadable.for.detectorId', function(detectorId) {
  check(detectorId, String);
  return ExampleSituations.find({'detectorId': detectorId}, {
    fields: situationHumanReadableFields
  });
});
Meteor.publish('ExampleSituations.HumanReadable.for.detectorId.and.categoriesKey', function(detectorId, categoriesKey) {
  check(detectorId, String);
  check(categoriesKey, String);
  if (categoriesKey) {
    return ExampleSituations.find({
      'detectorId': detectorId,
      'categoriesKey': categoriesKey
    }, {
      fields: situationHumanReadableFields
    });
  } else {
    return ExampleSituations.find({
      'detectorId': detectorId,
    }, {
      fields: situationHumanReadableFields
    });
  }
});