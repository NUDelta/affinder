Template.weatherBlockBuilder.helpers({
  weatherFeatures: function() {
    return WeatherFeatures.find().fetch();
  },

  existingWeatherBlocks: function() {
    return Queries.find({hasWeatherRules: true}).fetch();
  },

  ruleForWeatherFeature: function(featureName) {
    // TODO: if rules are already defined, place the rule
    // in the form input.
  }

});

Template.weatherBlockBuilder.events({
  'submit form': function(e) {
    e.preventDefault();

    const ruleDefs = $(e.target).find(".def-rule");

    for (var i = ruleDefs.length - 1; i >= 0; i--) {
      var featureName = ruleDefs[i].id;
      var ruleText = ruleDefs[i].value;
      // FIXME: featureName isn't being saved as
      // variable value, just 'featureName' itself
      var weatherRule = {
        featureName : ruleText        
      }

      if (ruleText) {
        Queries.update(this._id, {
          $set: {"hasWeatherRules": true}, 
          $addToSet : {
            "weatherRules": weatherRule
          }
        });
      }

    }
  },

  'click .btn-redirect': function(e) {
    const url = $(e.target).attr('href')
    const id = url.split('/').pop()
    Router.go('queryBuilderPage', {_id: id});
  }

})