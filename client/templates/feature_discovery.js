Template.searchBar.events({
  'click #foo-button': function(e) {
    alert("button was clicked");

    var newTree = defaultToolbox();
    newTree["placeCategories"] = "";
    WORKSPACE.updateToolbox(stringifyToolboxTree(newTree));
  },

  'submit form#blockSearch': function(e) {
    e.preventDefault();

    const queryText = $(e.target).find('[name=search]').val();
    alert(queryText);

    const queryId = Queries.insert({ query: queryText });
    alert(queryId);
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

  'includedCategories': function(queryId) {
    obj = Queries.findOne(queryId);
    return resolveAllAndExcludedCats(obj.categories, obj.excluded_categories);
  }
});

Template.featureDiscovery.events({
  'click .x': function(e) {
    const cat2rm = $(e.target).parent().attr('placeCategory');

    Queries.update(Session.get('currentQueryId'), {
      $addToSet: {excluded_categories: cat2rm}
    });
  },

})


