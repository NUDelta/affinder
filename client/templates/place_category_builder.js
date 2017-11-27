Template.placeCategoryBuilder.events({
  'click .x': function(e) {
    const cat2rm = $(e.target).parent().attr('placeCategory');

    Queries.update(this._id, {
      $addToSet: {excluded_categories: cat2rm}
    });

  }
});

Template.placeCategoryBuilder.helpers({
  'includedCategories': function(allCats, excludeCats) {
    if (excludeCats) {
      return allCats.filter(function(item) { 
        return !excludeCats.includes(item);
      });
    }
    else {
      return allCats;
    }
  }
})