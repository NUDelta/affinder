Template.naturalLanguageInput.helpers({
  submitButtonText() {
    return "Go to Editor";
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

});

Template.naturalLanguageInput.events({
  'submit form': function(e, template) {
    e.preventDefault();

    var situation = {
      who: $(e.target).find('[name=who]').val(),
      what: $(e.target).find('[name=what]').val(),
      where: $(e.target).find('[name=where]').val(),
      when: $(e.target).find('[name=when]').val(),
    };

    if (template.data) {
      Queries.update(template.data._id, {$set: situation});
    } else {
      const queryId = Queries.insert(situation);
      Router.go('queryBuilderPage', {_id: queryId});
    }
  }
})