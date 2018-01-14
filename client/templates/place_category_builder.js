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

function includedCatWeightTuple(allCats, excludeCats) {
  if (excludeCats) {
    return allCats.filter(function(item) {
      if (item instanceof Array) {
        return !excludeCats.includes(item[0]);
      } else {
        return false;   // since no tfidf values are associated, we wont return any
      }
    });
  } else {
    return allCats;
  }
}

function includedTfidfWeights(allCats, excludeCats) {
  included = includedCatWeightTuple(allCats, excludeCats);
  return included.map(function(item) { return item[1]; });
}

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

  'correlatedPrecision': function(allCats, excludeCats) {
    weights = includedTfidfWeights(allCats, excludeCats);
    sum = weights.reduce(function(a, b) { return a + b; });
    avg = sum / weights.length;
    return avg.toFixed(4);
  },

  'yelpLoading': function() {
    return Session.get('yelpLoading');
  }
})
