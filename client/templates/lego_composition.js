Template.legoComposition.helpers({
  legoNames: function(legoIds) {
    if (legoIds) {
      const res = Queries.find(
        {"_id": {$in: legoIds}},
        {fields: {query: true}}).fetch();
      return res;      
    }
  }
})