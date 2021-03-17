import {Tracker} from 'meteor/tracker'
import {ExampleSituations} from "../../lib/collections/collections";
import {compiledBlocklyDep, splitVarDeclarationAndRules, setOfContextFeaturesInBlockly,
  getConceptVariables, setOfVariableNames, conceptRulesToContextFeatures} from "./blockly";
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

  // perform inference automatically
  this.autorun(() => {
    compiledBlocklyDep.depend();
    const detectorId = Session.get('detectorId');
    if (!detectorId) {
      return;
    }
    const conceptVariableName = getSelectConceptVariableName();
    if (!conceptVariableName || !getSelectConceptVariableFeatures() ) {
      return;
    }
    ExampleSituations.find({}).forEach((situation) => {
      let prediction = true;
      // let [variables, rules] = splitVarDeclarationAndRules($('#compiledBlockly').val());
      // const affordances = extractAffordances(situation);
      // let prediction = applyDetector(affordances, variables, rules);
      // prediction = prediction ? 'true' : 'false';
      const selectFields = {
        '_id': situation['_id'],
        'alias': situation['alias'],
        'detectorId': detectorId
      };
      const newPrediction = {
        'conceptVariable': conceptVariableName,
        'prediction': prediction
      }
      Meteor.call('updateExampleSituationPrediction', selectFields, newPrediction)
    });
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

    let [varDecl, rules] = splitVarDeclarationAndRules(document.getElementById('compiledBlockly').value);
    return setOfContextFeaturesInBlockly(varDecl, rules);
  }
})

const getSelectConceptVariableFeatures = () => {
  return JSON.parse(document.getElementById('selectConceptVariableToAnalyze').value);
};

const getSelectConceptVariableName = () => {
  const e = document.getElementById('selectConceptVariableToAnalyze');
  if (!e) {
    console.log('concept variable selector does not exist yet')
    return;
  }
  return e.selectedOptions[0].text;
}

const getYelpPlaceInstancesPerConceptVariable = (detectorId) => {
  let conceptFeatures = getSelectConceptVariableFeatures();
  if (!Array.isArray(conceptFeatures)) {
    console.log('in function getYelpPlaceInstancesPerConceptVariable: \n context features is not an array')
    return;
  }
  for (i = 0; i < conceptFeatures.length; i++) {
    console.log('category to search: ', conceptFeatures[i])
    let searchByPlaceCategory = {
      term: '',
      categories: conceptFeatures[i],
      location: document.getElementById('cityname_sim').value
    }
    Meteor.call('yelpFusionBusinessSearch', searchByPlaceCategory, detectorId);
  }
}

Template.simulateAndLabelConceptExpression.events({
  'submit form#simulateConcepts': function(e, target) {
    e.preventDefault();

    getYelpPlaceInstancesPerConceptVariable(Session.get('detectorId'));
  },
});

Template.simulateAndLabelConceptExpression.helpers({
  'detectedSituations'() {
    // let conceptVariableName = getSelectConceptVariable();
    let conceptVariableName = getSelectConceptVariableName();
    console.log('zzzzzzzzzz: ', conceptVariableName);
    let examples = ExampleSituations.find({
      [`predictions.${conceptVariableName}`]: true
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

Template.selectConceptVariableDropdown.helpers({
  'conceptVariableList'() {
    compiledBlocklyDep.depend();

    let [varDecl, rules] = splitVarDeclarationAndRules(document.getElementById('compiledBlockly').value);
    let variableNames = setOfVariableNames(varDecl);
    let [conceptVariableNames, conceptRules] = getConceptVariables(rules);
    let concepts = [];
    for (i = 0; i < conceptVariableNames.length; i++) {
      let concept_contextfeatures = conceptRulesToContextFeatures(variableNames, conceptRules[i]);
      console.log("concept_contextfeatures: ", concept_contextfeatures);
      concepts.push({
        name: conceptVariableNames[i],
        features: JSON.stringify(concept_contextfeatures)
      });
    }
    return concepts;
  }
});

Template.exampleSituationIssues.onCreated(function() {
  this.autorun(() => {
    this.subscribe('ExampleSituations.HumanReadable.for.detectorId', Session.get('detectorId'));
  });
});

Template.exampleSituationIssues.helpers({
  'falsePositives'() {
    let conceptVariable = getSelectConceptVariable();
    if (!conceptVariable) {
      return;
    }
    return ExampleSituations.find({
      [`labels.${conceptVariable}`]: false,
      [`predictions.${conceptVariable}`]: true
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
    let conceptVariableName = getSelectConceptVariableName();
    if (!conceptVariableName) {
      return;
    }
    return situation.labels[conceptVariableName] !== undefined;
  },
  'isLabelTrue'(situation) {
    let conceptVariableName = getSelectConceptVariableName();
    if (!conceptVariableName) {
      return;
    }
    return situation.labels[conceptVariableName] === true;
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
    const labelObj = {
      'conceptVariable': getSelectConceptVariableName(),
      'label': label
    };
    Meteor.call('updateExampleSituationLabel', selectFields, labelObj);
  }
});

Template.situationItemLabelView.helpers({
  situationLabel(situation) {
    let conceptVariableName = getSelectConceptVariableName();
    return situation.labels[conceptVariableName] ? 'true' : 'false';
  }
});

Template.situationItemPrediction.onCreated(function() {
  this.subscribe('ExampleSituation.HumanReadable.for.detectorId', Session.get('detectorId'));
});