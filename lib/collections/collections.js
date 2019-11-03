import SimpleSchema from 'simpl-schema';

export const Schema = {};

Schema.Queries = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Id,
  },
  query: {
    type: String,
  },
  categories: {
    type: Array,
    defaultValue: []
  },
  "categories.$": {
    type: String
  },
  excluded_categories: {
    type: Array,
    defaultValue: []
  },
  "excluded_categories.$": {
    type: String
  }
});
export const Queries = new Mongo.Collection('queries');
Queries.attachSchema(Schema.Queries);


export const Detectors = new Mongo.Collection('Detectors');
Detectors.BlockSearchResults = new Mongo.Collection('BlockSearchResults');

export const ExampleSituations = new Mongo.Collection('ExampleSituations');

Schema.LabeledExamples = new SimpleSchema({
  situationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  situationAlias: {
    type: String,
    optional: true
  },
  detectorId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  detectorDescription: {
    type: String,
    optional: true
  },
  label: {
    type: Boolean,
    optional: true
  },
  prediction: {
    type: Boolean,
    optional: true
  },
});
export const LabeledExamples = new Mongo.Collection('LabeledExamples');
LabeledExamples.attachSchema(Schema.LabeledExamples);
