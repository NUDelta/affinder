import {applyDetector} from "../../lib/detectors/detectors";

export let WORKSPACE = "";

export const compiledBlocklyDep = new Tracker.Dependency;
Template.blockly.rendered = function() {
  let toolBoxTree = defaultToolbox();

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
    let code = Blockly.JavaScript.workspaceToCode(WORKSPACE);
    document.getElementById('compiledBlockly').value = code;
    compiledBlocklyDep.changed();

    let splitJS = splitVarDeclarationAndRules(code);

    let context = {'japanese': true, 'thursday': true};
    mockTestDetector(context, splitJS[0], splitJS[1]);
  });
};

export const splitVarDeclarationAndRules = function(code) {
  let lines = code.split('\n');
  let threshold = lines.findIndex(e => e == "");
  let varDecl = lines.slice(0, threshold);
  let rules = lines.splice(threshold + 1).filter(e => e != "");
  return [varDecl, rules];
};

export const mockTestDetector = function (userAffordances, varDecl, rules) {
  // userAffordances: key value pairs of (elementaryContext: values)
  // varDecl: list of strings of JS let declaration
  // rules: list of strings of JS context rules
  let prediction = applyDetector(userAffordances, varDecl, rules);
  console.log(`userAffordances: ${JSON.stringify(userAffordances)}`);
  console.log(`varDecl: ${JSON.stringify(varDecl)}`);
  console.log(`rules: ${JSON.stringify(rules)}`);
  console.log(`prediction: ${prediction}`);
};

export const defaultToolbox = function () {
  let toolbox = {};
  toolbox["placeCategories"] = defaultToolboxPlaceCategories();
  toolbox["weather"] = defaultToolboxWeather();
  toolbox["time"] = defaultToolboxTimeOfDay() + defaultToolboxTimeOfWeek() + defaultToolboxTimeZone();
  toolbox["operators"] = defaultToolboxOperators();
  toolbox["variables"] = defaultToolboxVariables();
  return toolbox;
};

export const stringifyToolboxTree = function(toolboxTree) {
  let string = '<xml id="toolbox" style="display: none">'
  if (toolboxTree.hasOwnProperty("discoveries")) {
    string += toolboxTree["discoveries"];
    string += '<sep gap="48"></sep>';
  }
  string += toolboxTree["placeCategories"];
  string += '<sep gap="48"></sep>';
  string += toolboxTree["weather"];
  string += toolboxTree["time"];
  string += '<sep gap="48"></sep>';
  string += toolboxTree["operators"];
  string += toolboxTree["variables"];
  string += "</xml>";
  return string;
};

export const wrapBlocksInCategory = function(name, blocks) {
  let category = '<category name="' + name + '">';
  category += blocks;
  category += '</category>';
  return category;
};

export const createVariable = function(name) {
  let variable = `
  <block type="variables_get">
    <field name="VAR">`;
  variable += name;
  variable += `</field>
  </block>`;
  return variable;
};

export const createAndOrBlock = function(a, b) {
  let block = `
  <block type="logic_operation">
    <field name="OP">OR</field>
    <value name="A">`;
  block += a;
  block += `</value>
        <value name="B">`;
  block += b;
  block += `</value>
    </block>`;
  return block;
};

export const createMultiVarAndOrBlock = function(abc) {
  if (abc.length === 1) {
    return createVariable(abc[0]);
  }
  else if (abc.length === 2) {
    return createAndOrBlock(createVariable(abc[0]), createVariable(abc[1]));
  } else {
    return createAndOrBlock(
      createAndOrBlock(createVariable(abc[0]), createVariable(abc[1])),
      createMultiVarAndOrBlock(abc.slice(2, abc.length)));
  }
};

const defaultToolboxPlaceCategories = function() {
  return wrapBlocksInCategory("Place Categories",
    createMultiVarAndOrBlock(["japanese", "chinese", "korean"]) +
    createMultiVarAndOrBlock(["beaches", "lakes"])
    );
};

const defaultToolboxWeather = function() {
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
      <field name="VAR">haze</field>
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
};

const defaultToolboxTimeOfDay = function() {
    return `
  <category name="Time of Day">
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

    <block type="variables_get">
      <field name="VAR">sunrise</field>
    </block>
    <block type="variables_get">
      <field name="VAR">sunset</field>
    </block>
    <block type="variables_get">
      <field name="VAR">daytime</field>
    </block>
    <block type="variables_get">
      <field name="VAR">nighttime</field>
    </block>
    <block type="variables_get">
      <field name="VAR">hour</field>
    </block>
    <block type="variables_get">
      <field name="VAR">minute</field>
    </block>
    <block type="variables_get">
      <field name="VAR">sunset_time_minutes</field>
    </block>
  </category>
  `;
};

const defaultToolboxTimeOfWeek = function() {
    return wrapBlocksInCategory("Time of Week",
      createMultiVarAndOrBlock(["monday", "tuesday", "wednesday", "thursday", "friday"]) +
      createMultiVarAndOrBlock(["saturday", "sunday"]) +
      createVariable("monday") +
      createVariable("tuesday")+
      createVariable("wednesday")+
      createVariable("thursday")+
      createVariable("friday")+
      createVariable("saturday")+
      createVariable("sunday"));
};

const defaultToolboxTimeZone = function() {
  return `
  <category name="Time Zone">
    <block type="variables_get">
      <field name="VAR">america_los_angeles</field>
    </block>
    <block type="variables_get">
      <field name="VAR">america_denver</field>
    </block>
    <block type="variables_get">
      <field name="VAR">america_chicago</field>
    </block>
    <block type="variables_get">
      <field name="VAR">america_new_york</field>
    </block>
  </category>
  `;
};

const defaultToolboxOperators = function() {
  return wrapBlocksInCategory("and, or, not, =",
    createAndOrBlock("", "") +
    '<block type="logic_negate"></block>' +
    '<block type="logic_compare"></block>' +
    createAndOrBlock(createAndOrBlock("",""), "") +
    createAndOrBlock(createAndOrBlock("",""),
                     createAndOrBlock("","")));
};

const defaultToolboxVariables = function() {
  return `
  <category name="Variables" custom="VARIABLE"></category>
  `
};
