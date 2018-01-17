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

function averageTfidfWeights(allCats, excludeCats) {
  weights = includedTfidfWeights(allCats, excludeCats);
  sum = weights.reduce(function(a, b) { return a + b; });
  avg = sum / weights.length;
  return avg;
}

function minTfidf(allCats) {
  // citing "JavaScript: Finding Minimum and Maximum values in an Array of Objects" by Brandon Morelli
  return allCats.reduce((min, b) => Math.min(min, b[1]), allCats[0][1]);
}

function maxTfidf(allCats) {
  // citing "JavaScript: Finding Minimum and Maximum values in an Array of Objects" by Brandon Morelli
  return allCats.reduce((max, b) => Math.max(max, b[1])), allCats[0][1];
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

  'proxyPrecision': function(allCats, excludeCats) {
    avg = averageTfidfWeights(allCats, excludeCats)
    return avg.toFixed(4);
  },

  'minProgressBar': function(allCats) {
    return minTfidf(allCats).toFixed(4);
  },

  'maxProgressBar': function(allCats) {
    return maxTfidf(allCats).toFixed(4);
  },

  'percentProgress': function(allCats, excludeCats) {
    avg = averageTfidfWeights(allCats, excludeCats);
    min = minTfidf(allCats);
    max = maxTfidf(allCats);

    return 100 * (avg - min) / (max - min);
  },

  'yelpLoading': function() {
    return Session.get('yelpLoading');
  }
})
