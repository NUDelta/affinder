Template.weatherBlockBuilder.helpers({
  rawFeatures: function() {
    // data context for rawFeatureBuilder
    return WeatherFeatures.find().fetch();
  },

  existingWeatherBlocks: function() {
    return Queries.find({hasWeatherRules: true}).fetch();
  }

});

Template.weatherBlockBuilder.events({
  'submit form': function(e) {
    e.preventDefault();

    const ruleDefs = $(e.target).find(".def-rule");

    for (var i = ruleDefs.length - 1; i >= 0; i--) {
      var featureName = ruleDefs[i].id;
      var ruleText = ruleDefs[i].value;
      
      var obj = {};
      obj[featureName] = ruleText;
      obj["hasWeatherRules"] = true;

      if (ruleText)
        Queries.update(this._id, {$set: obj});

    }
  }
})