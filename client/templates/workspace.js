import { WORKSPACE } from "./blockly";
Template.workspace.helpers({
  baseline() {
    const baseline = Router.current().params.query.variant == 'B';
    return baseline;
  }
})