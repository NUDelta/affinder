import {ExampleSituations} from "../../lib/collections/collections";
import {compiledBlocklyDep, splitVarDeclarationAndRules} from "./blockly";
import {applyDetector, extractAffordances} from "../../lib/detectors/detectors";

Template.exampleSituationSearch.onCreated(function() {
  this.autorun(() => {
    this.subscribe('ExampleSituations.HumanReadable.for.detectorId', Session.get('detectorId'));
  });
});

Template.exampleSituationSearch.events({
  'submit form#situationSearch': function(e, target) {
    e.preventDefault();

    let detectorId = Session.get('detectorId');
    if (!detectorId) {
      let detectorDescription = prompt('Provide a detector description before simulating this detector');
      $('input[name=detectorname]').val(detectorDescription);
      $('#saveDetectorForm').trigger('submit');
      return;
    }

    // TODO(rlouie): simulate the detector by
    // (1) automatically searching the place categories for location (city, search region).
    //     This would identify all "positives", and then we could see false positives
    //     It would be unaware of "negatives", where we might identify false negatives
    // (2) letting user search by term for location (city, search region)

    let [variables, rules] = splitVarDeclarationAndRules($('#compiledBlockly').val());

    const vardecl2placecategory = (var_placecat) => {
      // "var beaches;"
      let placecat = var_placecat.split(' ')[1];
      // "beaches;" or "beaches"
      placecat = placecat.slice(-1) == ';' ? placecat.slice(0,-1) : placecat;
      return placecat;
    };

    // TODO(rlouie): will this break if we create intermediate concepts, where variables are not place category aliases?
    let placecategories = variables.map(var_placecat => vardecl2placecategory(var_placecat));

    if (placecategories.length == 0) {
      alert('Update your context expression to include some place categories');
    } else {
      let searchByPlaceCategory = {
        term: '',
        categories: (placecategories.length > 1 ? placecategories.join(',') : placecategories[0]),
        location: 'Chicago, IL'
      };
      console.log(JSON.stringify(searchByPlaceCategory));
      Meteor.call('yelpFusionBusinessSearch', searchByPlaceCategory, detectorId);
    }
  },
});

Template.exampleSituationSearch.helpers({
  'exampleSituations'() {
    // TODO: Subscription not fast enough
    // Meteor.subscribe('ExampleSituations.HumanReadable', topK);

    let examples = ExampleSituations.find({}, {sort: {timeInserted: 1}}).fetch();
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

Template.exampleSituationIssues.onCreated(function() {
  this.autorun(() => {
    this.subscribe('ExampleSituations.HumanReadable.for.detectorId', Session.get('detectorId'));
  });
});

Template.exampleSituationIssues.helpers({
  'falsePositives'() {
    return ExampleSituations.find({
      'label': false,
      'prediction': true
    }).fetch();
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
  'situationCategoriesReadable'(situation) {
    return situation.categories.map(obj => obj["title"] );
  },

  'situationCategoriesAlias'(situation) {
    return situation.categories.map(obj => obj["alias"] );
  }
});

Template.situationIssueItem.helpers({
  'situationCategoriesReadable'(situation) {
    return situation.categories.map(obj => obj["title"] );
  },

  'situationCategoriesAlias'(situation) {
    return situation.categories.map(obj => obj["alias"] );
  }
});

Template.situationItemLabelEdit.helpers({
  'hasLabel'(situation) {
    return situation.label !== undefined;
  },
  'isLabelTrue'(situation) {
    return situation.label === true;
  }
});

Template.situationItemLabelEdit.events({
  'click input': function(e, target) {
    let selectFields = {
      '_id': target.data.situation._id,
      'alias': target.data.situation.alias,
      'detectorId': Session.get('detectorId'),
    };
    let label = $(`input[type='radio'][name=${target.data.situation.alias}]:checked`).val();
    console.log(JSON.stringify(selectFields));
    console.log(label);
    Meteor.call('updateExampleSituationLabel', selectFields, label);
  }
});

Template.situationItemLabelView.helpers({
  situationLabel(situation) {
    return situation.label ? 'true' : 'false';
  }
});

Template.situationItemPrediction.onCreated(function() {
  this.subscribe('ExampleSituation.HumanReadable.for.detectorId', Session.get('detectorId'));
});

Template.situationItemPrediction.helpers({
  'applyDetectorToSituation'(situation) {
    compiledBlocklyDep.depend();
    const detectorId = Session.get('detectorId');
    if (!detectorId) {
      return "n/a";
    }

    const affordances = extractAffordances(situation);
    let [variables, rules] = splitVarDeclarationAndRules($('#compiledBlockly').val());
    let prediction = applyDetector(affordances, variables, rules);
    prediction = prediction ? 'true' : 'false';

    const selectFields = {
      '_id': situation['_id'],
      'alias': situation['alias'],
      'detectorId': detectorId
    };
    Meteor.call('updateExampleSituationPrediction', selectFields, prediction);
    return prediction;
  }
});