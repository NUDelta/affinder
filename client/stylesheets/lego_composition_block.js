Template.legoCompositionBlock.events({
	'click .x': function(e) {
    const query_id = $(e.target).parent().attr('queryId');
    const lego_id = $(e.target).parent().attr('sublegoId');

    Queries.update(query_id, {
      $pull: {"subLegos": lego_id}
    });
  }
})