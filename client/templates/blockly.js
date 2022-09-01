import Blockly from 'blockly';
import { Concept } from 'pos/lexicon';
import {applyDetector, setOfContextFeaturesInBlockly, splitVarDeclarationAndRules} from "../../lib/detectors/detectors";

export let WORKSPACE;

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

    let conceptExpressionDefinition = new ConceptExpressionDefinition();
    conceptExpressionDefinition.update(code);
    console.log('after update: ', conceptExpressionDefinition.variableDeclaration);

    compiledBlocklyDep.changed();

    if (event.element == "comment") {
      // oldValue == null means the comment was just created programmatically
      // thus we are interested in only when user manually changes the comment
      if (event.oldValue != null) {
        strSplit = event.newValue.split('\n\n');

        // answered the first prompt, have not added the second prompt.
        if (strSplit.length == 2) {
          let abstractConcept = ReflectAndExpand.parseReflect(event.newValue)
          let block = WORKSPACE.getBlockById(event.blockId);
          ReflectAndExpand.activateExpander(block, event.newValue);
        }
      }
    }
  });

  // Initialize a top-level concept variable for the concept expression
  let detectorDescription = $('input[name=detectorname]').val() || 'SITUATION'
  ReflectAndExpand.createConceptVariable(detectorDescription);
};

export class ConceptExpressionDefinition {
  // Singleton-method
  constructor() {
    if (ConceptExpressionDefinition._instance) {
      return ConceptExpressionDefinition._instance;
    }
    ConceptExpressionDefinition._instance = this;
    this.variableDeclaration = null;
    this.rules = null;
  }

  update(compiledBlocklyValue) {
    [this.variableDeclaration, this.rules] = splitVarDeclarationAndRules(compiledBlocklyValue);

  }
  allFeatures() {
    return setOfContextFeaturesInBlockly(this.variableDeclaration, this.rules);
  }
}

export class ReflectAndExpand {
  static showReflectPrompt(block) {
    let blockName = ReflectAndExpand.parseBlockName(block);
    if (blockName) {
      let detectorDescription = $('input[name=detectorname]').val()
      block.setCommentText(ReflectAndExpand.reflectPromptText(blockName, detectorDescription));
      block.comment.setBubbleSize(300, 300); // wider and taller so we can create a reflection and expansion prompt
    }
  }
  static reflectPromptText(blockName, situation) {
    return `Why is "${blockName}" appropriate for the experience "${situation}"? \n\n (press TAB) > `
  }
  static parseBlockName(block) {
    if (block.getField('VAR')) {
      let blockName = block.getField('VAR').textContent_.data
      return blockName;
    }
  }
  static parseReflect(commentText) {
    let [prompt, endText] = commentText.split('>');
    let abstractConcept = endText.trim().split('\n')[0];
    return abstractConcept;
  }
  static activateExpander(block, commentText) {
    let abstractConcept = ReflectAndExpand.parseReflect(commentText);
    block.setCommentText(commentText + ReflectAndExpand.expandPromptText(abstractConcept));
    ReflectAndExpand.createConceptVariable(abstractConcept);
  }
  static expandPromptText(abstractConcept) {
    return `\n\nGreat! Creating concept variable for "${abstractConcept}".\nNow, search using this. Rephrase as 1-2 terms as needed.\n`
  }
  static createConceptVariable(abstractConcept) {
    let conceptVariable = wrapBlocksInXml(createSetVariable(abstractConcept));
    let conceptVariableXml = Blockly.Xml.textToDom(conceptVariable)
    if (conceptVariableXml.firstElementChild) {
      Blockly.Xml.appendDomToWorkspace(conceptVariableXml, WORKSPACE);
    }
  }
}

export const addReflectionPromptToBlocks = () => {
  let blocks = WORKSPACE.getAllBlocks(false);
  for (let i = 0, block; block = blocks[i]; i++) {
    if (!block.getCommentText()) {
      ReflectAndExpand.showReflectPrompt(block);
    }
  }
}

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
  // toolbox["weather"] = defaultToolboxWeather();
  // toolbox["time"] = defaultToolboxTimeOfDay() + defaultToolboxTimeOfWeek() + defaultToolboxTimeZone();
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
  if (toolboxTree.hasOwnProperty("weather")) {
    string += toolboxTree["weather"];
    string += '<sep gap="48"></sep>';
  }
  if (toolboxTree.hasOwnProperty("time")) {
    string += toolboxTree["time"];
    string += '<sep gap="48"></sep>';
  }
  // string += toolboxTree["placeCategories"];
  string += toolboxTree["operators"];
  string += toolboxTree["variables"];
  string += "</xml>";
  return string;
};

export const wrapBlocksInXml = function(blocks) {
  let string = '<xml style="display: none">';
  string += blocks
  string += '</xml>';
  return string;
}

export const wrapBlocksInCategory = function(name, blocks) {
  let category = '<category name="' + name + '">';
  category += blocks;
  category += '</category>';
  return category;
};

export const createSetVariable = function(name) {
  let variable = `
  <block type="variables_set">
    <field name="VAR">`;
  variable += name;
  variable += `</field>
  </block>`;
  return variable;
};

export const createGetVariable = function(name) {
  let variable = `
  <block type="variables_get">
    <field name="VAR">`;
  variable += name;
  variable += `</field>
  </block>`;
  return variable;
};

export const createLogicOperationBlock = function(operation, a, b) {
  if ((operation == 'AND') || (operation == 'OR')) {
    let block = `
    <block type="logic_operation">
      <field name="OP">${operation}</field>
      <value name="A">`;
    block += a;
    block += `</value>
          <value name="B">`;
    block += b;
    block += `</value>
      </block>`;
    return block;
  }
}

export const createOrBlock = function(a, b) {
  return createLogicOperationBlock('OR', a, b);
};

export const createAndBlock = function(a, b) {
  return createLogicOperationBlock('AND', a, b);
}

export const createMultiVarOrBlock = function(abc) {
  if (abc.length === 1) {
    return createGetVariable(abc[0]);
  }
  else if (abc.length === 2) {
    return createOrBlock(createGetVariable(abc[0]), createGetVariable(abc[1]));
  } else {
    return createOrBlock(
      createOrBlock(createGetVariable(abc[0]), createGetVariable(abc[1])),
      createMultiVarOrBlock(abc.slice(2, abc.length)));
  }
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
      createMultiVarOrBlock(["monday", "tuesday", "wednesday", "thursday", "friday"]) +
      createMultiVarOrBlock(["saturday", "sunday"]) +
      createGetVariable("monday") +
      createGetVariable("tuesday")+
      createGetVariable("wednesday")+
      createGetVariable("thursday")+
      createGetVariable("friday")+
      createGetVariable("saturday")+
      createGetVariable("sunday"));
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
    createAndBlock("", "") +
    createOrBlock("", "") +
    '<block type="logic_negate"></block>' +
    '<block type="logic_compare"></block>' +
    createOrBlock(createOrBlock("",""), "") +
    createOrBlock(createOrBlock("",""),
                     createOrBlock("","")));
};

const defaultToolboxVariables = function() {
  return `
  <category name="Variables" custom="VARIABLE"></category>
  `
};
