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
  let mergedAffordancesWithRules = varDecl.concat(affordancesAsJavascriptVars)
    .concat(rules)
    .join('\n');

  try {
    return eval(mergedAffordancesWithRules);
  } catch (err) {
    log.debug(`userAffordances: ${JSON.stringify(userAffordances)}`);
    log.debug(`varDecl: ${JSON.stringify(varDecl)}`);
    log.debug(`rules: ${JSON.stringify(rules)}`);
    log.debug(`affordancesAsJavascriptVars: ${JSON.stringify(affordancesAsJavascriptVars)}`);
    log.debug(`mergedAffordancesWithRules: ${JSON.stringify(mergedAffordancesWithRules)}`);
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