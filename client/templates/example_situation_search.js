import {ExampleSituations, LabeledExamples} from "../../lib/collections/collections";
import {compiledBlocklyDep, splitVarDeclarationAndRules} from "./blockly";
import {applyDetector, extractAffordances, matchAffordancesWithDetector} from "../../lib/detectors/detectors";


Template.exampleSituationSearch.events({
  'submit form#situationSearch': function(e, target) {
    e.preventDefault();

    // TODO(rlouie): simulate the detector by
    // (1) automatically searching the place categories for location (city, search region).
    //     This would identify all "positives", and then we could see false positives
    //     It would be unaware of "negatives", where we might identify false negatives
    // (2) letting user search by term for location (city, search region)

    let [variables, rules] = splitVarDeclarationAndRules($('#compiledBlockly').val());

    const vardecl2placecategory = (var_placecat) => {
      // "var beach;"
      let placecat = var_placecat.split(' ')[1];
      // "beach;" or "beach"
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
      Meteor.call('yelpFusionBusinessSearch', searchByPlaceCategory);
    }
  },
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
  'situationCategoriesReadable'(situation) {
    return situation.categories.map(obj => obj["title"] );
  },

  'situationCategoriesAlias'(situation) {
    return situation.categories.map(obj => obj["alias"] );
  }
});

Template.situationItemLabel.events({
  'click input': function(e, target) {
    let selectFields = {
      'detectorId': Session.get('detectorId'),
      'situationId': target.data.situation._id,
      'situationAlias': target.data.situation.alias,
    };
    let label = $(`input[type='radio'][name=${target.data.situation.alias}]:checked`).val();
    console.log(JSON.stringify(selectFields));
    console.log(label);
    Meteor.call('updateSituationExampleLabel', selectFields, label);
  }
});

Template.situationItemPrediction.helpers({
  'applyDetectorToSituation'(situation) {
    // TODO(rlouie): make this reactive or trigger upon a simulation update
    compiledBlocklyDep.depend();
    const detectorId = Session.get('detectorId');
    // check if no detector for detectorId exists, otherwise attempt to match affordances to detector
    if (!detectorId) {
      return "n/a";
    }
    const affordances = extractAffordances(situation);
    let [variables, rules] = splitVarDeclarationAndRules($('#compiledBlockly').val());
    const prediction = applyDetector(affordances, variables, rules);
    return prediction ? 'true' : 'false';
  }
});