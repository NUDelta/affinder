Template.placeCategoryBuilder.events({
  'click .remove-category': function(e) {
    const cat2rm = $(e.target)
                   .parent()[0]
                   .firstChild
                   .textContent;

    Queries.update(this._id, {
      $addToSet: {excluded_categories : cat2rm}
    });

  }
});

Template.placeCategoryBuilder.helpers({
  'includedCategories': function(allCats, excludeCats) {
    return allCats.filter(function(item) { 
      return !excludeCats.includes(item);
    });
  }
})