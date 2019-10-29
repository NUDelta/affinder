import {ExampleSituations} from "../../lib/collections/collections";

Template.exampleSituationSearch.events({
  'submit form#situationSearch': function(e, target) {
    e.preventDefault();
    Meteor.call('yelpFusionBusinessSearch',{
      term: 'Parks',
      location: 'Chicago, IL',
    });
  }
});

Template.exampleSituationSearch.helpers({
  'exampleSituations'() {
    // TODO: Subscription not fast enough
    // Meteor.subscribe('ExampleSituations.HumanReadable', topK);

    let examples = ExampleSituations.find({}).fetch();
    return examples;
  },
  'situationArgs'(situation) {
    // const instance = Template.instance();
    return {
      situation,
      placeCategories: situation.categories.map(obj => obj["alias"]),
    }
  }
});

Template.situationItem.helpers({
  'situationName'(situation) {
    return situation.name;
  },

  'situationImageUrl'(situation) {
    return situation.image_url;
  },

  'situationCategoriesReadable'(situation) {
    return situation.categories.map(obj => { return obj.title });
  }

});