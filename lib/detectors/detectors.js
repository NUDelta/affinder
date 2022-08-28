import {Detectors} from "../collections/collections";

/**
 * Turns Yelp API JSON return into affordance dictionary
 * @param situation {Object}
 * @return affordances {Object} with keys as place category aliases, and values as true
 */
export const extractAffordances = function (situation) {
  let affordanceKeys = situation['categories'].map(obj => obj['alias']);
  const affordances = {};
  for (const key of affordanceKeys) {
    affordances[key] = true;
  }
  return affordances;
};

/**
 * Attempts to match affordances with a detector
 * @param {Object} affordances  key value pairs of { userAffordances: values }
 * @param {String} detectorId detector to attempt matching for
 * @returns {Boolean} whether affordances match detector
 */
export const matchAffordancesWithDetector = function (affordances, detectorId) {
  const detector = Detectors.findOne({ _id: detectorId });

  // check if no detector for detectorId exists, otherwise attempt to match affordances to detector
  if (typeof detector === 'undefined') {
    return false;
  }

  return applyDetector(affordances, detector.variables, detector.rules);
};

/**
 * Evaluates given the affordances of a user, if they match the definition given
 * by the detector.
 * @param {Object} userAffordances: key value pairs of (userAffordances: values)
 * @param {[String]} varDecl - variable declarations of the affordance keys used
 * @param {[String]} rules - context rules as Javascript logical operations
 * @return {Boolean} doesUserMatchSituation
 */
export const applyDetector = function (userAffordances, varDecl, rules) {
  let affordancesAsJavascriptVars = keyvalues2vardecl(userAffordances);
  // console.log("affordancesAsJavascriptVars: ", affordancesAsJavascriptVars);

  if (!Array.isArray(varDecl)) {
    varDecl = [varDecl];
  }
  let mergedAffordancesWithRules = varDecl.concat(affordancesAsJavascriptVars)
    .concat(rules)
    .join('\n');

  // console.log("mergedAffordancesWithRules: ", mergedAffordancesWithRules);
  try {
    return eval(mergedAffordancesWithRules);
  } catch (err) {
    console.debug(`userAffordances: ${JSON.stringify(userAffordances)}`);
    console.debug(`varDecl: ${JSON.stringify(varDecl)}`);
    console.debug(`rules: ${JSON.stringify(rules)}`);
    console.debug(`affordancesAsJavascriptVars: ${JSON.stringify(affordancesAsJavascriptVars)}`);
    console.debug(`mergedAffordancesWithRules: ${JSON.stringify(mergedAffordancesWithRules)}`);
    throw (err);
  }
};

/**
 * Takes a keyvalues object (i.e. JSON) and converts it to a javascript variable declaration.
 * For example,
 * If the keyvalues were
 * {daytime: true, hour: 13, sunset_predicted_weather: "rain"}
 * The function would output
 * ['var daytime = true', 'var hour = 13', 'var sunset_predicted_weather = "rain"']
 * @param {Object} obj - key values that come from /location_keyvalues/{lat}/{lng}
 * @return {[String]} vardecl - each element has the form "var key = value;"
 */
export const keyvalues2vardecl = function (obj) {
  let vardecl = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // ensures that a value of type string will remain that type in the javascript variable declaration
      // i.e. sunset_predicted_weather: "rain" will convert to 'var sunset_predicted_weather = "rain"']
      let value = (typeof obj[key] === 'string' || obj[key] instanceof String) ? `"${obj[key]}"` : obj[key];

      vardecl.push(`var ${key} = ${value};`);
    }
  }
  return vardecl;
};

export const isolateConceptVariableDetector = function(varDecl, rules, conceptVariable) {
  let variableNames = setOfVariableNames(varDecl);
  let rulesToExecute = isolateRecursiveHelper(variableNames, rules, conceptVariable, [`${conceptVariable};`]).reverse();

  return [varDecl, rulesToExecute]
};

export const isolateRecursiveHelper = function(variableNames, rules, conceptVariable, ruleStack) {
  let [conceptVariableNames, conceptVariableDefinitions] = getConceptVariables(rules);
  let idx = conceptVariableNames.indexOf(conceptVariable);

  let currentRule = conceptVariableNames[idx] + " =" + conceptVariableDefinitions[idx]
  ruleStack.push(currentRule);

  let varsInRule = variablesInRule(conceptVariableDefinitions[idx])
  varsInRule.forEach(variable => {
    let newIdx = conceptVariableNames.indexOf(variable)
    // if variable is a concept variable (w/ nested definitions)
    if (newIdx >= 0) {
      return isolateRecursiveHelper(variableNames, rules, conceptVariableNames[newIdx], ruleStack)
    }
  });
  return ruleStack
}

export const dependentContextFeatures = (varDecl, rules, conceptVariable) => {
  let variableNames = setOfVariableNames(varDecl);
  return recusiveFeatures(variableNames, rules, conceptVariable);
}

export const recusiveFeatures = (variableNames, rules, conceptVariable) => {
  let [conceptVariableNames, conceptVariableDefinitions] = getConceptVariables(rules);
  let idx = conceptVariableNames.indexOf(conceptVariable);

  let varsInRule = variablesInRule(conceptVariableDefinitions[idx])

  const reducer = (accumulator, currentVar) => {
    let newIdx = conceptVariableNames.indexOf(currentVar)
    // if variable is a concept variable (w/ nested context features)
    if (newIdx >= 0) {
      return accumulator.concat(recusiveFeatures(variableNames, rules, conceptVariableNames[newIdx]));
    } else {
      return accumulator.concat([currentVar]);
    }
  }
  return varsInRule.reduce(reducer, []);
}

export const splitVarDeclarationAndRules = function(code) {
  let lines_w_comment = code.split('\n');
  let lines = filterFunctionalLines(lines_w_comment);
  let rules = lines.slice(1, lines.length);
  // let singleLineVarDecl = lines[0];
  let varDecl = lines[0];
  return [varDecl, rules];
};

const filterFunctionalLines = (lines_w_comment) => {
  // filter to functional code lines
  let lines = lines_w_comment.filter((line) => {
    return ((line.slice(0,2) != "//" ) && // remove comments
            (line != "")) // remove new lines
  });
  return lines
}

export const getConceptVariables = (rules) => {
  // console.log("rules: ", rules);
  if (!Array.isArray(rules)) {
    // console.log("rules is not an array");
    return [[], []];
  }

  if (rules.length < 1) {
    // console.log("rules is empty array");
    return [[], []];
  }

  let conceptVariableNames = [];
  let conceptVariableRules = [];
  rules.forEach(function(rule) {
    let split_rule = rule.split("=");

    // a concept variable rule looks like
    // "concept_variable = feature1 || feature2"
    // it follows this format
    if (split_rule.length == 2) {
      let conceptVariableName = split_rule[0].trim();
      let conceptRule = split_rule[1];
      conceptVariableNames.push(conceptVariableName);
      conceptVariableRules.push(conceptRule);
    }
  });
  return [conceptVariableNames, conceptVariableRules];
}

/**
 *
 * @param {*} rule String
 *     "concept_variable = feature1 || feature2"
 *     "feature1 || (feature2 && feature3)"
 *     "(feature1 || (feature2 && !(feature3)))"
 * @returns {*} context_features List of Strings
 *
 */
export const variablesInRule = (rule) => {
  return rule.match(/(\w+)/g);
}

/* must read the full set of context features in the blockly workspace */
export const setOfContextFeaturesInBlockly = (varDecl, rules) => {
  let variableNames = setOfVariableNames(varDecl);
  // console.log("variableNames: ", variableNames);

  let [conceptVariableNames, conceptVariableRules] = getConceptVariables(rules);
  // console.log("concept variables: ", conceptVariableNames);

  let contextFeatures = variableNames.filter((variable) => {
    return !conceptVariableNames.includes(variable)
  });

  // console.log("contextFeatures: ", contextFeatures);
  return contextFeatures;
}

export const setOfVariableNames = (varDecl) => {
  // console.log("varDecl: ", varDecl);
  if (!varDecl) {
    return [];
  }

  if (typeof(varDecl, String) && (varDecl.length > 0)) {
    let varDeclClean = varDecl.slice(
        4, // skip "var "
        varDecl.length - 1 // skip ending ";"
      );
    let variablesSplit = varDeclClean.split(', ');
    // console.log('variablesSplit: ', variablesSplit);
    return variablesSplit;
    // if (variablesSplit.length == 1) {
      // return variablesSplit;
    // }
    // return variablesSplit.map(variable => { variable.trim() });
  }
  return [];
}

export const vardecl2placecategory = (var_placecat) => {
  // "var beaches;"
  let placecat = var_placecat.split(' ')[1];
  // "beaches;" or "beaches"
  placecat = placecat.slice(-1) == ';' ? placecat.slice(0,-1) : placecat;
  return placecat;
};