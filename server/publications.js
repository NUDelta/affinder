import {Queries, Detectors, ExampleSituations} from "../lib/collections/collections";

Meteor.publish('Queries', function() {
  // TODO(rlouie): limit to just the summary contents
  return Queries.find();
});

Meteor.publish('Workspace', function() {
  return Workspace.find();
});

Meteor.publish("blockSearch", function(searchValue) {
  check(searchValue, String);
  const res = Detectors.find(
    {$text: {$search: searchValue} }
  );

  // This is a hack to work around the lack of $text support on the client side Minimongo lib
  // without which we would have trouble recreating the search results on the client
  const key = JSON.stringify(searchValue);
  const resultIds = res.map(e => e._id);
  Detectors.BlockSearchResults.upsert(key, {results: resultIds});

  // publish the results to the client side
  return Detectors.BlockSearchResults.find(key);
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
  "label": true,
  "prediction": true
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