import {Tracker} from 'meteor/tracker'
import {ExampleSituations} from "../../lib/collections/collections";
import {compiledBlocklyDep, splitVarDeclarationAndRules, setOfContextFeaturesInBlockly} from "./blockly";
import {applyDetector, extractAffordances} from "../../lib/detectors/detectors";

Template.viewExamplePlaces.onCreated(function() {
  this.autorun(() => {
    this.subscribe('ExampleSituations.HumanReadable.for.detectorId', Session.get('detectorId'));
  });
});

Template.simulateAndLabelConceptExpression.onCreated(function() {
  this.autorun(() => {
    this.subscribe('ExampleSituations.HumanReadable.for.detectorId', Session.get('detectorId'));
  });
});

const getYelpPlaceInstancesForCurrentCategories = (detectorId) => {
  // TODO(rlouie): simulate the detector by
  // (1) automatically searching the place categories for location (city, search region).
  //     This would identify all "positives", and then we could see false positives
  //     It would be unaware of "negatives", where we might identify false negatives
  // (2) letting user search by term for location (city, search region)

  let [varDecl, rules] = splitVarDeclarationAndRules($('#compiledBlockly').val());
  let placecategories = setOfContextFeaturesInBlockly(varDecl, rules);
  if (placecategories.length == 0) {
    alert('Update your context expression to include some place categories');
  } else {
    let searchByPlaceCategory = {
      term: '',
      categories: (placecategories.length > 1 ? placecategories.join(',') : placecategories[0]),
      location: document.getElementById('cityname').value
    };
    console.log(JSON.stringify(searchByPlaceCategory));
    Meteor.call('yelpFusionBusinessSearch', searchByPlaceCategory, detectorId);
  }
}

const getSelectPlaceTag = () => {
  let placeTag = document.getElementById('selectPlaceToAnalyze').value;
  console.log("placeTag selection: ", placeTag);
  return placeTag;
};

const getYelpPlaceInstancesPerPlaceTag = (detectorId) => {
  let searchByPlaceCategory = {
    term: '',
    categories: getSelectPlaceTag(),
    location: document.getElementById('cityname').value
  }
  console.log(JSON.stringify(searchByPlaceCategory));
  Meteor.call('yelpFusionBusinessSearch', searchByPlaceCategory, detectorId);
}

Template.viewExamplePlaces.events({
  'submit form#viewExamplePlaces': function(e, target) {
    e.preventDefault();
    Session.set('placeTagToAnalyze', getSelectPlaceTag()) // form input can get lost
    getYelpPlaceInstancesPerPlaceTag(Session.get('detectorId'));
  },
});

Template.viewExamplePlaces.helpers({
  'exampleSituations'() {
    let examples = ExampleSituations.find({
      categoriesKey: Session.get('placeTagToAnalyze')
    }, {
      // show places that have most number of categories, posing the greatest risk for breaking mental model of a category
      sort: { numCategories: -1 }
    }).fetch();
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

Template.selectPlaceDropdown.helpers({
  'placeTagList'() {
    compiledBlocklyDep.depend();

    let [varDecl, rules] = splitVarDeclarationAndRules($('#compiledBlockly').val());
    return setOfContextFeaturesInBlockly(varDecl, rules);
  }
})

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

Template.situationItemImageNameCats.helpers({
  'situationCategoriesReadable'(situation) {
    return situation.categories.map(obj => obj["title"] );
  },

  'situationCategoriesAlias'(situation) {
    return situation.categories.map(obj => obj["alias"] );
  }
})

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