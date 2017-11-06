Template.weatherBlockBuilder.helpers({
  weatherFeatures: function() {
    return WeatherFeatures.find().fetch();
  },

  previousWeather: function() {
    return Queries.find().fetch();
  }
});

Template.weatherBlockBuilder.events({
  'click .btn-save': function(e) {
    debugger;
  },

  'input .def-rule': function(e) {
    element = $(e.target);

    var featureName = element.attr("id");
    var ruleDef = element.val();

    console.log(featureName)
    console.log(ruleDef)
    // fix: id is not coming through
    console.log(this._id)

    Queries.update(this._id, {
      $set: {"haha" : ruleDef}
    });

  }
})