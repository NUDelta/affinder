Template.naturalLanguageInput.helpers({
  'submitButtonText': function() {
    return Session.get("submitNaturalLanguageInputButtonText") || "Submit";
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
  }
})