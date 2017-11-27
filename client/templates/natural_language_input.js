Template.naturalLanguageInput.events({
  'submit form': function(e, template) {
    e.preventDefault();
    
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

      Router.go('queryBuilderPage', {_id: data._id});

    });
  }
})