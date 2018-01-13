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

Template.newBlockDef.events({
  'click #addNewBlock': function(e) {
    // get query info from frontend
    newBlock = $("#newBlock");
    const input_text = newBlock[0].value;
    situation = {
      query: input_text,
    }
    // update model
    const childQueryId = Queries.insert(situation);
    const parentQueryId = $(e.target)[0].baseURI.split('/').slice(-1)[0];
    Queries.update(parentQueryId, {
      $addToSet: {"subLegos": childQueryId}
    })
  }
})