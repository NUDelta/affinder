import { WORKSPACE } from "./blockly";

Template.workspace.onCreated(function() {
  Session.set('cityForSimulation')
});

Template.workspace.helpers({
  baseline() {
    const baseline = Router.current().params.query.variant == 'B';
    return baseline;
  }
})