import { WORKSPACE } from "./blockly";
import { ReactMeteorData } from 'meteor/react-meteor-data';
import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatReact from './ChatReact.js';
Template.workspace.helpers({
  baseline() {
    const baseline = Router.current().params.query.variant == 'B';
    return baseline;
  }
})
Template.workspace.onRendered(function () {
  this.autorun(() => {
    // Render your React component into the 'react-container' div
    const reactContainer = this.find('#assistant');
    const root = createRoot(reactContainer);
    root.render (<ChatReact />);
    
  });
});
