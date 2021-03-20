import {Tracker} from 'meteor/tracker'
import {ExampleSituations} from "../../lib/collections/collections";
import {WORKSPACE, compiledBlocklyDep, wrapBlocksInXml, createGetVariable} from "./blockly";
import Blockly from 'blockly';
import {applyDetector, extractAffordances, isolateConceptVariableDetector, splitVarDeclarationAndRules, setOfContextFeaturesInBlockly,
  getConceptVariables, setOfVariableNames, variablesInRule, dependentContextFeatures} from "../../lib/detectors/detectors";

Template.viewExamplePlaces.onCreated(function() {
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
    Session.set('locationToViewExamplePlaces', document.getElementById('cityname').value);
    getYelpPlaceInstancesPerPlaceTag(Session.get('detectorId'));
  },
});

Template.viewExamplePlaces.helpers({
  'exampleSituations'() {
    let examples = ExampleSituations.find({
      categoriesKey: Session.get('placeTagToAnalyze'),
      locationKey: Session.get('locationToViewExamplePlaces')
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

Template.simulateAndLabelConceptExpression.onCreated(function() {
  this.autorun(() => {
    this.subscribe('ExampleSituations.HumanReadable.for.detectorId', Session.get('detectorId'));
  });

  const exampleSituationsCursor = ExampleSituations.find({});
  const exampleSituationsHandle = exampleSituationsCursor.observe({
    added(situation) {
      runPrediction(situation);
    },
    changed(situation) {
      runPrediction(situation);
    }
  });
});

const runPrediction = (situation) => {
  const detectorId = Session.get('detectorId');
  if (!detectorId) {
    return;
  }
  const conceptVariableName = Session.get('selectedConceptVariableName');
  if (!conceptVariableName || !Session.get('selectedConceptVariableFeatures')) {
    return;
  }
  let [varDecl, rules] = splitVarDeclarationAndRules($('#compiledBlockly').val());
  let [isolatedVarDecl, isolatedRules] = isolateConceptVariableDetector(varDecl, rules, conceptVariableName);
  const affordances = extractAffordances(situation);
  const prediction = applyDetector(affordances, isolatedVarDecl, isolatedRules);
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
}

Template.simulateAndLabelConceptExpression.events({
  'submit form#simulateConcepts': function(e, target) {
    e.preventDefault();
    Session.set('selectedConceptVariableName', getSelectConceptVariableName());
    Session.set('selectedConceptVariableFeatures', getSelectConceptVariableFeatures());
    Session.set('locationToSimulateConceptExpression', document.getElementById('cityname_sim').value)
    getYelpPlaceInstancesPerConceptVariable(Session.get('detectorId'));
  },
});

Template.simulateAndLabelConceptExpression.helpers({
  'detectedSituations'() {
    let conceptVariableName = Session.get('selectedConceptVariableName');
    let examples = ExampleSituations.find({
      [`predictions.${conceptVariableName}`]: true,
      locationKey: Session.get('locationToSimulateConceptExpression')
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
      let concept_contextfeatures = dependentContextFeatures(varDecl, rules, conceptVariableNames[i]);
      console.log("concept_contextfeatures: ", concept_contextfeatures);
      concepts.push({
        name: conceptVariableNames[i],
        features: JSON.stringify(concept_contextfeatures)
      });
    }
    return concepts;
  }
});

Template.repairShop.events({
  'click button#resimulate'(e, target) {
    let conceptVariableName = Session.get('selectedConceptVariableName');
    if (!conceptVariableName) {
      return;
    }
    let labeledPlaces = ExampleSituations.find({
      [`labels.${conceptVariableName}`]: {$exists: true }
    });
    labeledPlaces.forEach((situation) => {
      runPrediction(situation);
    });
  }
})

Template.exampleSituationIssues.onCreated(function() {
  this.autorun(() => {
    this.subscribe('ExampleSituations.HumanReadable.for.detectorId', Session.get('detectorId'));
  });
});

Template.exampleSituationIssues.helpers({
  'falsePositives'() {
    let conceptVariableName = Session.get('selectedConceptVariableName');
    if (!conceptVariableName) {
      return;
    }
    return ExampleSituations.find({
      [`labels.${conceptVariableName}`]: false,
      [`predictions.${conceptVariableName}`]: true
    }).fetch();
  },
  'trueNegatives'() {
    let conceptVariableName = Session.get('selectedConceptVariableName');
    if (!conceptVariableName) {
      return;
    }
    return ExampleSituations.find({
      [`labels.${conceptVariableName}`]: false,
      [`predictions.${conceptVariableName}`]: false
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

Template.situationItemImageNameCats.events({
  'click .context-feature-link': function(e, target) {
    e.preventDefault();

    const contextFeature = e.target.innerText.match(/(\w+)/g)[0];

    let conceptVariable = wrapBlocksInXml(createGetVariable(contextFeature));
    let conceptVariableXml = Blockly.Xml.textToDom(conceptVariable)
    if (conceptVariableXml.firstElementChild) {
      Blockly.Xml.appendDomToWorkspace(conceptVariableXml, WORKSPACE);
    }
  }
});

Template.situationItemImageNameCats.helpers({
  'baseline'(){
    const baseline = Router.current().params.query.variant == 'B';
    return baseline;
  },
  'situationCategoriesReadable'(situation) {
    return situation.categories.map(obj => obj["title"] );
  },

  'situationCategoriesAlias'(situation) {
    return situation.categories.map(obj => obj["alias"] );
  }
})

Template.situationItemLabelEdit.helpers({
  'hasLabel'(situation) {
    let conceptVariableName = Session.get('selectedConceptVariableName');
    if (!conceptVariableName) {
      return;
    }
    if (!situation.labels) {
      return false;
    }
    return situation.labels[conceptVariableName] !== undefined;
  },
  'isLabelTrue'(situation) {
    let conceptVariableName = Session.get('selectedConceptVariableName');
    if (!conceptVariableName) {
      return;
    }
    if (!situation.labels) {
      return false;
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
    let conceptVariableName = Session.get('selectedConceptVariableName');
    if (!conceptVariableName) {
      return;
    }
    const labelObj = {
      'conceptVariable': conceptVariableName,
      'label': label
    };
    Meteor.call('updateExampleSituationLabel', selectFields, labelObj);
  }
});

Template.situationItemLabelView.helpers({
  situationLabel(situation) {
    let conceptVariableName = Session.get('selectedConceptVariableName');
    if (!situation.labels) {
      return;
    }
    return situation.labels[conceptVariableName] ? 'true' : 'false';
  }
});

Template.situationItemPrediction.onCreated(function() {
  this.subscribe('ExampleSituation.HumanReadable.for.detectorId', Session.get('detectorId'));
});

Template.situationItemPrediction.helpers({
  situationPrediction(situation) {
    let conceptVariableName = Session.get('selectedConceptVariableName');
    if (!situation.labels) {
      return;
    }
    return situation.predictions[conceptVariableName];
  }
});