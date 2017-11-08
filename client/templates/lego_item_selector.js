Template.legoItemSelector.events({

  'click .btn-redirect': function(e) {
    const url = $(e.target).attr('href')
    const id = url.split('/').pop()
    Router.go('queryBuilderPage', {_id: id});
  },

  'click .btn-use-lego': function(e) {
    lego_id = $(e.target).parent().attr('id');
    query_id = $(e.target).attr('queryId')

    // TODO: not sure about ands/ors
    Queries.update(query_id, {
      $addToSet: {"subLegos": lego_id}
    });
  }
});