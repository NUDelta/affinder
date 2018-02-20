Template.searchBar.events({
  'submit form#blockSearch': function(e) {
    e.preventDefault();

    const queryText = $(e.target).find('[name=search]').val();

    // Directed Search
    Session.set("searchInputText", queryText);

    // Stretch Search
    const queryId = Queries.insert({ query: queryText });
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
      obj = Queries.findOne(queryId);
      return resolveAllAndExcludedCats(obj.categories, obj.excluded_categories);
    }
  },

  'directedSearchResults': function() {
    if (Session.get("searchInputText")) {
      Meteor.subscribe("blockSearch", Session.get("searchInputText"));

      // We cannot re-use the query as MiniMongo does not support the $text operator!
      // Instead of resorting to a Meteor method we can hack around it by relying on an extra
      // ad-hoc collection containing the sorted ids ...
      const key = JSON.stringify(Session.get("searchInputText"));
      const result = Detectors.BlockSearchResults.findOne(key);
      if (result) {
        const idsInSortOrder = result.results;
        const blocksInSortedOrder = idsInSortOrder.map(id => Detectors.findOne(id));
        return blocksInSortedOrder;
      }
    }
  }

});

if (Meteor.isServer) {
  Detectors._ensureIndex({
    "description": "text"
  });
}
Template.featureDiscovery.events({
  'click .btn-remove': function(e) {
    const cat2rm = $(e.target).parent().attr('placeCategory');

    Queries.update(Session.get('currentQueryId'), {
      $addToSet: {excluded_categories: cat2rm}
    });
  },

  'click .btn-use-block': function(e) {
    newTree = defaultToolbox();
    // TODO(rlouie): turn detector rules into blocks again if not elementary
    // let detectorId = $(e.target).parent().attr('detectorId');
    let detectorDescription = $(e.target).parent().attr('detectorDescription');
    detectorDescription = formatDetectorVarNames(detectorDescription);
    newTree["discoveries"] = wrapBlocksInCategory(detectorDescription,
      createVariable(detectorDescription));
    WORKSPACE.updateToolbox(stringifyToolboxTree(newTree));
  },

  'click #convert-button': function(e) {
    newTree = defaultToolbox();
    obj = Queries.findOne(Session.get("currentQueryId"));
    cats = resolveAllAndExcludedCats(obj.categories, obj.excluded_categories);
    cats = cats.map(function(elem) { return formatDetectorVarNames(elem); });
    newTree["placeCategories"] = wrapBlocksInCategory("Categories describing '" + obj.query +"'",
      createMultiVarAndOrBlock(cats));
    WORKSPACE.updateToolbox(stringifyToolboxTree(newTree));
  }

});

function formatDetectorVarNames(elem) {
  return elem.replace("&", "&amp;").toLowerCase();
}