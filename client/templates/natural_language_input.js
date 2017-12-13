Template.naturalLanguageInput.helpers({
  submitButtonText() {
    return Session.get("submitNaturalLanguageInputButtonText") || "Go to Editor";
  },
  whoPrompt() {
    return "Ping who?";
  },
  whoPlaceholder() {
    return "e.g. Loved ones that if they were physically closer, you would talk to everyday";
  },
  whatPrompt() {
    return "What are they doing?";
  },
  whatPlaceholder() {
    return "e.g. Commuting by walking, train, or car";
  },
  wherePrompt() {
    return "Where are they located?";
  },
  wherePlaceholder() {
    return "e.g. The loved ones are living in different cities";
  },
  whenPrompt() {
    return "When is this occuring?";
  },
  whenPlaceholder() {
    return "e.g. Before Work, After Work";
  },
  readyText() {
    return "When ready, continue constructing a situational trigger a mobile phone can sense.";
  }

})

Template.naturalLanguageInput.events({
  'submit form': function(e, template) {
    e.preventDefault();
    
    Session.set("submitNaturalLanguageInputButtonText", "Loading...");

    parentQueryId = "";
    if (template.data) {
      parentQueryId = template.data._id;
    }

    const queryString = $(e.target).find('[name=queryString]').val()

    var query = {
      query: queryString
    };

    Router.go('wordBrainstorm', {_id: data._id});
    /*
    Meteor.call('affordanceLanguageProcess', query, function (error, data) {
      if (error)
        return alert(error.reason);

      if (parentQueryId) {
        // If creating a sublego / situation helper within the parent block interface,
        // add this block implicitly to the lego composition
        Queries.update(parentQueryId, {
          $addToSet: { "subLegos": data._id }
        });
      }

      Session.set("submitNaturalLanguageInputButtonText", "Submit");

      Router.go('queryBuilderPage', {_id: data._id});

    });
    */
  }
})