
Template.blockly.rendered = function() {
  var workspace = Blockly.inject('blocklyDiv',
    {toolbox: document.getElementById('toolbox')});
  function myUpdateFunction(event) {
    var code = Blockly.JavaScript.workspaceToCode(workspace);
    document.getElementById('compiledBlockly').value = code;
  }
  workspace.addChangeListener(myUpdateFunction);
};



