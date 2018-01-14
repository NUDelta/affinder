Template.placeCategoryBuilder.events({
  'click .x': function(e) {
    const cat2rm = $(e.target).parent().attr('placeCategory');

    Queries.update(this._id, {
      $addToSet: {excluded_categories: cat2rm}
    });

  },

  'change #toggleYelp': function(e) {
    Queries.update(this._id, {
      $set: {disable_categories: e.target.checked}
    });
  }
});

Template.placeCategoryBuilder.helpers({
  'includedCategories': function(allCats, excludeCats) {
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
  },

  'yelpLoading': function() {
    return Session.get('yelpLoading');
  }
})
