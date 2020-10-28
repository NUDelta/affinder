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
  "categories.$": Object,
  "categories.$.feature": String,
  "categories.$.weight": Number,
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
