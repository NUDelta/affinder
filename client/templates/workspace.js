WORKSPACE = "";

Template.blockly.rendered = function() {
  var toolBoxTree = defaultToolbox();

  WORKSPACE = Blockly.inject('blocklyDiv',
    {toolbox: stringifyToolboxTree(toolBoxTree),
     zoom:
         {controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2},
     trashcan: true});

  WORKSPACE.addChangeListener(function (event) {
    var code = Blockly.JavaScript.workspaceToCode(WORKSPACE);
    document.getElementById('compiledBlockly').value = code;
  });

  // document.getElementById("foo-button").addClickListener(function (event) {
  //   console.log("WE IN");
  //   var newTree = defaultToolbox();
  //   newTree["placeCategories"] = "";
  //   workspace.updateToolbox(newTree);
  // })
};

defaultToolbox = function () {
  var toolbox = {};
  toolbox["placeCategories"] = defaultToolboxPlaceCategories();
  toolbox["weather"] = defaultToolboxWeather();
  toolbox["time"] = defaultToolboxTime();
  toolbox["operators"] = defaultToolboxOperators();
  return toolbox;
}

stringifyToolboxTree = function(toolboxTree) {
  var string = '<xml id="toolbox" style="display: none">'
  string += toolboxTree["placeCategories"];
  string += '<sep gap="48"></sep>';
  string += toolboxTree["weather"];
  string += toolboxTree["time"];
  string += toolboxTree["operators"];
  string += "</xml>";
  return string;
}

defaultToolboxPlaceCategories = function() {
  return `
  <category name="Place Categories">
    <block type="logic_operation">
      <value name="A">
        <block type="variables_get">
          <field name="VAR">Japanese</field>
        </block>
      </value>
      <value name="B">
        <block type="variables_get">
          <field name="VAR">Chinese</field>
        </block>
      </value>
    </block>
  </category>
  `;
}

defaultToolboxWeather = function() {
  return `
  <category name="Weather" color="210">
    <!-- from https://openweathermap.org/weather-conditions -->
    <block type="variables_get">
      <field name="VAR">thunderstorm</field>
    </block>
    <block type="variables_get">
      <field name="VAR">drizzle</field>
    </block>
    <block type="variables_get">
      <field name="VAR">rain</field>
    </block>
    <block type="variables_get">
      <field name="VAR">snow</field>
    </block>
    <block type="variables_get">
      <field name="VAR">fog</field>
    </block>
    <block type="variables_get">
      <field name="VAR">smoke</field>
    </block>
    <block type="variables_get">
      <field name="VAR">clear</field>
    </block>
    <block type="variables_get">
      <field name="VAR">clouds</field>
    </block>
    <block type="variables_get">
      <field name="VAR">windy</field>
    </block>
    <block type="variables_get">
      <field name="VAR">hot</field>
    </block>
    <block type="variables_get">
      <field name="VAR">cold</field>
    </block>
  </category>
  `;
}

defaultToolboxTime = function() {
  return `
  <category name="Time">
    <block type="variables_get">
      <field name="VAR">sunrise</field>
    </block>
    <block type="variables_get">
      <field name="VAR">sunset</field>
    </block>
    <block type="variables_get">
      <field name="VAR">hour</field>
    </block>
    <block type="variables_get">
      <field name="VAR">minute</field>
    </block>
    <block type="logic_compare">
      <value name="A">
        <block type="variables_get">
          <field name="VAR">hour</field>
        </block>
      </value>
      <value name="B">
        <block type="math_number">
          <field name="NUM">13</field>
        </block>
      </value>
    </block>

    <!-- x < hour < y -->
    <block type="logic_operation">
      <value name="A">
        <block type="logic_compare">
          <value name="A">
            <block type="variables_get">
              <field name="VAR">hour</field>
            </block>
          </value>
          <field name="OP">GT</field>
          <value name="B">
            <block type="math_number">
              <field name="NUM">11</field>
            </block>
          </value>
        </block>
      </value>
      <value name="B">
        <block type="logic_compare">
          <value name="A">
            <block type="variables_get">
              <field name="VAR">hour</field>
            </block>
          </value>
          <field name="OP">LT</field>
          <value name="B">
            <block type="math_number">
              <field name="NUM">13</field>
            </block>
          </value>
        </block>
      </value>
    </block>
  </category>
  `;
}

defaultToolboxOperators = function() {
  return `
  <category name="Operators">
    <block type="logic_operation"></block>
    <block type="logic_compare"></block>
  </category>
  `;
}

