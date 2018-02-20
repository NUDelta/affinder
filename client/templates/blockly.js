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

    var splitJS = splitVarDeclarationAndRules(code);

    context = {'japanese': true, 'thursday': true};
    mockTestDetector(context, splitJS[0], splitJS[1]);
  });
};

splitVarDeclarationAndRules = function(code) {
  var lines = code.split('\n');
  var threshold = lines.findIndex(e => e == "");
  var varDecl = lines.slice(0, threshold);
  var rules = lines.splice(threshold + 1).filter(e => e != "");
  return [varDecl, rules];
};

mockTestDetector = function (elementaryContext, varDecl, rules) {
  // elementaryContext: key value pairs of (elementaryContext: values)
  // varDecl: list of strings of JS var declaration
  // rules: list of strings of JS context rules
  var contextAsJS = keyvalues2vardecl(elementaryContext);
  console.log(contextAsJS);
  editedCode = varDecl.concat(contextAsJS).concat(rules).join('\n');
  console.log(editedCode);
  console.log(eval(editedCode));
};

keyvalues2vardecl = function(obj) {
  vardecl = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      vardecl.push("var " + key + " = " + obj[key] + ";")      
    }
  }
  return vardecl;
};

defaultToolbox = function () {
  var toolbox = {};
  toolbox["placeCategories"] = defaultToolboxPlaceCategories();
  toolbox["weather"] = defaultToolboxWeather();
  toolbox["time"] = defaultToolboxTime();
  toolbox["operators"] = defaultToolboxOperators();
  toolbox["variables"] = defaultToolboxVariables();
  return toolbox;
};

stringifyToolboxTree = function(toolboxTree) {
  var string = '<xml id="toolbox" style="display: none">'
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

wrapBlocksInCategory = function(name, blocks) {
  category = '<category name="' + name + '">';
  category += blocks;
  category += '</category>';
  return category;
};

createVariable = function(name) {
  variable = `
  <block type="variables_get">
    <field name="VAR">`;
  variable += name;
  variable += `</field>
  </block>`;
  return variable;
};

createAndOrBlock = function(a, b) {
  block = `
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

createMultiVarAndOrBlock = function(abc) {
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

defaultToolboxPlaceCategories = function() {
  return wrapBlocksInCategory("Place Categories",
    createMultiVarAndOrBlock(["japanese", "chinese", "korean"]) +
    createMultiVarAndOrBlock(["beach", "lakes"])
    );
};

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

defaultToolboxTime = function() {
  return `
  <category name="Time">
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
      <field name="VAR">monday</field>
    </block>
    <block type="variables_get">
      <field name="VAR">tuesday</field>
    </block>
    <block type="variables_get">
      <field name="VAR">wednesday</field>
    </block>
    <block type="variables_get">
      <field name="VAR">thursday</field>
    </block>
    <block type="variables_get">
      <field name="VAR">friday</field>
    </block>
    <block type="variables_get">
      <field name="VAR">saturday</field>
    </block>
    <block type="variables_get">
      <field name="VAR">sunday</field>
    </block>
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
  </category>
  `;
};

defaultToolboxOperators = function() {
  return wrapBlocksInCategory("and or =",
    createAndOrBlock("", "") +
    '<block type="logic_compare"></block>' + 
    createAndOrBlock(createAndOrBlock("",""),
                     createAndOrBlock("","")));
};

defaultToolboxVariables = function() {
  return `
  <category name="Variables" custom="VARIABLE"></category>
  `
};
