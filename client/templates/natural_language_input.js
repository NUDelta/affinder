Template.naturalLanguageInput.helpers({
  header() {
    // if inside editor expr1, else expr2
    return (this.hasOwnProperty("_id")) ? "" : "New Situation";
  },
  explanation() {
    return "IF person can do {WHAT/ACTIVITY} AND located at {WHERE/LOCATION} AND during {WHEN/TIME}";
  },
  instructions() {
    // if inside editor expr1, else expr2
    if (this.hasOwnProperty("_id")) {
      return "Describe the WHAT/WHERE/WHEN of the Situation";
    } else {
      return "Describe the WHAT/WHERE/WHEN of the Situation";
    }
  },
  whatPrompt() {
    return "WHAT/ACTIVITY";
  },
  whatPlaceholder() {
    return "";
  },
  wherePrompt() {
    return "WHERE/LOCATION";
  },
  wherePlaceholder() {
    return "";
  },
  whenPrompt() {
    return "WHEN/TIME";
  },
  whenPlaceholder() {
    return "";
  },
  readyText() {
    if (this.hasOwnProperty("_id")) {
      return ""
    } else {
      return "When ready, continue constructing a situational trigger a mobile phone can sense.";
    }
  },
  submitButtonText() {
    // if inside editor expr1, else expr2
    return (this.hasOwnProperty("_id")) ? "Update" : "Go to Editor";
  }
});

Template.naturalLanguageInput.events({
  'submit form': function(e, template) {
    // e is an event
    // template is a blaze template object
    e.preventDefault();

    const what = $(e.target).find('[name=what]').val();
    const where = $(e.target).find('[name=where]').val();
    const when = $(e.target).find('[name=when]').val();

    var situation = {
      what: what,
      where: where,
      when: when,
      query: ([what, where, when].join(" "))
    };

    if (template.data) {  // If word brainstorm is being updated in the editor
      Queries.update(template.data._id, {$set: situation});
      input = {
        _id: template.data._id,
        query: ([what, where, when].join(" "))
      };
      Session.set('yelpLoading', true);
      Meteor.call('updateYelpPlaceCategories', input, function (error, data) {
        Session.set('yelpLoading', false);
        if (error) {
          return alert(error.reason)
        }
      });
    } else {  // Starting a new query / situation
      const queryId = Queries.insert(situation);
      Router.go('queryBuilderPage', {_id: queryId});
      input = {
        _id: queryId,
        query: ([what, where, when].join(" "))
      };
      Session.set('yelpLoading', true);
      Meteor.call('updateYelpPlaceCategories', input, function (error, data) {
        Session.set('yelpLoading', false);
        if (error) {
          return alert(error.reason)
        }
      });
    }
  }
})