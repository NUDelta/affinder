Template.naturalLanguageInput.events({
  'submit form': function(e) {
    e.preventDefault();

    const queryString = $(e.target).find('[name=queryString]').val()

    var query = {
      query: queryString
    };

    Meteor.call('affordanceLanguageProcess', query, function (error, data) {
      if (error)
        return alert(error.reason);

      Router.go('queryBuilderPage', {_id: data._id});

    });
  }
})