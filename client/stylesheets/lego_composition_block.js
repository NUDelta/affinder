Template.legoCompositionBlock.events({
  'click .x': function(e) {
    // if user clicks x button on the sublego, lego is removed from composition

    const query_id = $(e.target).parent().attr('queryId');
    const lego_id = $(e.target).parent().attr('sublegoId');

    // remove this lego from subLegos field
    Queries.update(query_id, {
      $pull: {"subLegos": lego_id}
    });
  }
})