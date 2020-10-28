import {Queries, Detectors} from "../../lib/collections/collections";
import {
  WORKSPACE,
  createMultiVarAndOrBlock,
  createVariable,
  defaultToolbox,
  stringifyToolboxTree,
  wrapBlocksInCategory
} from "./blockly";

Template.searchBar.onCreated(function() {
  this.subscribe('Queries');
});

Template.searchBar.events({
  'submit form#blockSearch': function(e) {
    e.preventDefault();

    const queryText = $(e.target).find('[name=search]').val();

    // Directed Search
    Session.set("searchInputText", queryText);

    // Stretch Search
    const queryId = Queries.insert({ query: queryText, categories: [], excluded_categories: []});
    Session.set('yelpLoading', true);
    Session.set('currentQueryId', queryId);
    Meteor.call('updateYelpPlaceCategories',
      {
        _id: queryId,
        query: queryText
      }, function (error, data) {
        Session.set('yelpLoading', false);
        if (error) {
          return alert(error.reason)
        }
      });
  }
});

function resolveAllAndExcludedCats(allCats, excludeCats) {
  allCats = allCats.map(function(item) {
    if (item instanceof Array) {
      // item: [category-name, tfidf-weight]
      return item[0];  // grab only category-name
    } else if (item instanceof Object) {
      // item: {feature: category-name, weight: tfidif-weight}
      return item.feature;
    } else {
      // item: category-name
      return item;
    }
  });
  if (excludeCats) {
    return allCats.filter(function(item) {
      return !excludeCats.includes(item);
    });
  }
  else {
    return allCats;
  }
}

Template.featureDiscovery.onCreated(function() {
  this.subscribe('Queries');
});

Template.featureDiscovery.helpers({
  'yelpLoading': function() {
    return Session.get('yelpLoading');
  },

  'currentQueryId': function() {
    return Session.get('currentQueryId');
  },

  'searchInputText': function() {
    return Session.get('searchInputText');
  },

  'includedCategories': function(queryId) {
    if (queryId) {
      let obj = Queries.findOne(queryId);
      return resolveAllAndExcludedCats(obj.categories, obj.excluded_categories);
    }
  },

  'precision': function(queryId) {
    let obj = Queries.findOne(queryId);
    return (obj.categories.length - obj.excluded_categories.length) / obj.categories.length
  },
});

if (Meteor.isServer) {
  Detectors._ensureIndex({
    "description": "text"
  });
}
Template.featureDiscovery.events({
  'click .btn-remove-cat': function(e) {
    const cat2rm = e.target.closest('li').getAttribute('placeCategory');

    Queries.update(Session.get('currentQueryId'), {
      $addToSet: {excluded_categories: cat2rm}
    });
  },

  'click .btn-add-cat': function(e) {
    const cat2add = e.target.closest('li').getAttribute('placeCategory');

    let newTree = defaultToolbox();
    let detectorDescription = formatDetectorVarNames(cat2add);
    newTree["discoveries"] = wrapBlocksInCategory(detectorDescription,
      createVariable(detectorDescription));
    WORKSPACE.updateToolbox(stringifyToolboxTree(newTree));
  },

  'click .btn-use-block': function(e) {
    let newTree = defaultToolbox();
    // TODO(rlouie): turn detector rules into blocks again if not elementary
    // let detectorId = $(e.target).parent().attr('detectorId');
    let detectorDescription = $(e.target).parent().attr('detectorDescription');
    detectorDescription = formatDetectorVarNames(detectorDescription);
    newTree["discoveries"] = wrapBlocksInCategory(detectorDescription,
      createVariable(detectorDescription));
    WORKSPACE.updateToolbox(stringifyToolboxTree(newTree));
  },

  'click #convert-button': function(e) {
    let newTree = defaultToolbox();
    let obj = Queries.findOne(Session.get("currentQueryId"));
    let cats = resolveAllAndExcludedCats(obj.categories, obj.excluded_categories);
    cats = cats.map(function(elem) { return formatDetectorVarNames(elem); });
    newTree["placeCategories"] = wrapBlocksInCategory("Categories describing '" + obj.query +"'",
      createMultiVarAndOrBlock(cats));
    WORKSPACE.updateToolbox(stringifyToolboxTree(newTree));
  }

});

function formatDetectorVarNames(elem) {
  return elem.replace("&", "&amp;").toLowerCase();
}