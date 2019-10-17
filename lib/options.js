#!/usr/bin/env node
const findup = require('findup-sync');
const argv = require('yargs').argv;
const fs = require('fs');

/**
 * Takes the default options, merges it with config and then the parameter options.
 * @returns {Options} Merged options
 */
function getOptions() {

  let options;

  let parameterOptions;

  let defaultOptions = getDefaultOptions();

  let configPath;
  let configOptions;

  if (argv.config !== undefined) { // TODO Docs for config file in readme.md

    if (fs.existsSync(argv.config)) {
      configPath = argv.config;
    } else {
      console.warn("No config could be found at the given path: " + argv.config);
    }


  } else {
    configPath = findup('cglconfig.json');
  }

  if (configPath) {
    configOptions = JSON.parse(fs.readFileSync(configPath));
  }

  if (configOptions !== undefined) {
    configOptions = basicParseSearchObjects(configOptions);
  }

  parameterOptions = {

    format: argv.format,
    since: argv.since,
    orderBy: argv.orderBy,
    order: argv.order,
    groupRegex: argv.groupRegex,
    groupTemplate: argv.groupTemplate,
    outputEmptyGroup: argv.outputEmptyGroup,

    replaceSubject: parseStringToArray(argv.replaceSubject),
    replaceBody: parseStringToArray(argv.replaceBody),
    replaceFooter: parseStringToArray(argv.replaceFooter),
    replaceInterpolated: parseStringToArray(argv.replaceInterpolated),

    q: argv.q

  };

  options = extendOptions(defaultOptions, configOptions);
  options = extendOptions(options, parameterOptions);


  options.replaceSubject = standardizeReplaceArray(options.replaceSubject);
  options.replaceBody = standardizeReplaceArray(options.replaceBody);
  options.replaceFooter = standardizeReplaceArray(options.replaceFooter);
  options.replaceInterpolated = standardizeReplaceArray(options.replaceInterpolated);

  options.groupRegex = standardizeGroupRegex(options.groupRegex);

  options.format += "${B}%B";

  return options;
}

/**
 * Iterates over all keys in the options object.
 * If there is an searchObject it will be translated to the replaceObject.
 * @param options Object to be iterated
 * @returns {*} Options with basically parsed searchObjects
 */
function basicParseSearchObjects(options) {

  for (let key in options) {
    // noinspection JSUnfilteredForInLoop
    let tmpOption = options[key];
    if (Array.isArray(tmpOption)) {
      for (let i = 0; i < tmpOption.length; i++) {
        let optionProperty = tmpOption[i];
        if (optionProperty.hasOwnProperty('searchValue')) {
          let replaceObject = optionProperty['searchValue'];
          if (replaceObject.hasOwnProperty('regexBody')) {
            let regexBody = replaceObject['regexBody'];
            let regexFlags;

            if (replaceObject.hasOwnProperty('regexFlags')) {
              regexFlags = replaceObject['regexFlags'];
            }
            // noinspection JSUnfilteredForInLoop
            options[key][i]['searchValue'] = RegExp(regexBody, regexFlags);
          }
        }
      }
    }
  }

  return options;

}

/**
 * Returns the default options object
 * @returns {{q: boolean, replaceSubject: null, format: string, replaceInterpolated: null, orderBy: string, groupTemplate: string, groupRegex: *[], outputEmptyGroup: boolean, replaceFooter: null, replaceBody: null, since: string, order: string}}
 */
function getDefaultOptions() {
  return {
    format: "* **%_hScope:** %_hSubject ([%h](%_o/commit/%h)) @%an%n  * %_b%n  * %_f",
    since: "package",
    orderBy: "%_hSubject",
    order: "ASC",
    groupRegex: [
      {searchValue: {regexBody: "BREAKING CHANGE"}, headline: "Breaking changes"},
      {searchValue: {regexBody: "^feat"}, headline: "Features"},
      {searchValue: {regexBody: "^fix"}, headline: "Fixes"}
    ],
    groupTemplate: "## %_headline",
    outputEmptyGroup: true,
    replaceSubject: null,
    replaceBody: null,
    replaceFooter: null,
    replaceInterpolated: null,

    q: false
  };
}

/**
 * Extends the baseOptions with options from extendingOptions. Options which are not given in baseOptions won't come into the result
 * @param baseOptions All options which schould be extended. Options which are not in this object wont come into the result.
 * @param extendingOptions Options which are extending the baseOptions
 * @returns Options object
 */
function extendOptions(baseOptions, extendingOptions) {
  if (!extendingOptions) {
    return baseOptions;
  }
  // noinspection JSUnfilteredForInLoop
  for (let key in baseOptions) {
    // noinspection JSUnfilteredForInLoop
    if (extendingOptions.hasOwnProperty(key) && extendingOptions[key] !== undefined) {
      // noinspection JSUnfilteredForInLoop
      baseOptions[key] = extendingOptions[key];
    }
  }

  return baseOptions;
}

/**
 * Parses the replaceString to an Array of replace string or regex objects
 * @param replaceString String which will be parsed via eval function and then parsed
 * @returns {Array|*} Undefined if parsing failed or an Array of replace string or regex objects
 */
function parseStringToArray(replaceString) {
  let result;
  let replaceArray;
  if (replaceString) {
    try {
      replaceArray = eval(replaceString);
    } catch (e) {
      console.warn("Failed reading replace " + replaceString);
      console.warn(e);
      return null;
    }

    result = [];

    for (let i = 0; i < replaceArray.length; i++) {
      if (isReplaceObject(replaceArray[i])) {
        result.push(replaceArray[i]);
      }
    }
  }
  return result;
}

/**
 * Checks if the given object has a substring and a search value. Also checks if the searchValue is a String, RegExp or Object and substring is a string.
 * @param replaceObject Object to be checked
 * @returns {boolean} True if valid
 */
function isReplaceObject(replaceObject) {
  const hasSearchValue = replaceObject.searchValue !== undefined,
      hasSubstring = replaceObject.substring !== undefined;

  let hasValidSearchValue;
  let hasValidSubstring;
  if (hasSearchValue) {
    hasValidSearchValue = (typeof replaceObject.searchValue === "string" || replaceObject.searchValue instanceof RegExp || typeof replaceObject.searchValue === "object" && standardizeSearchValue(replaceObject.searchValue) !== null)
  }
  if (hasSubstring) {
    hasValidSubstring = (typeof replaceObject.substring === "string");
  }

  return (hasSearchValue && hasValidSearchValue && hasSubstring && hasValidSubstring);
}

/**
 * Standardizes the groupRegex array searchValues
 * @param groupRegex Array of Objects containing searchValue for each entry
 * @returns {null|*} Returns null if failed, array with standardized searchValues if successful
 */
function standardizeGroupRegex(groupRegex) {
  if (!groupRegex || !Array.isArray(groupRegex)) {
    return null;
  }

  let result = [];
  for (let i = 0; i < groupRegex.length; i++) {
    const standardizedSearchValue = standardizeSearchValue(groupRegex[i].searchValue);
    if (standardizedSearchValue) {
      groupRegex[i].searchValue = standardizedSearchValue;
      result.push(groupRegex[i]);
    } else {
      console.warn("Could not parse search value " + groupRegex[i].searchValue);
    }
  }

  return result;

}

/**
 * Iterates over the array, passes each object to standardizeReplaceObject and adds all valid results to the result
 * @param replaceArray Array of replaceObjects which should be standardized
 * @returns {null|Array} Array of standardized replaceObjects
 */
function standardizeReplaceArray(replaceArray) {
  result = [];

  if (!replaceArray) {
    return null;
  }

  for (let i = 0; i < replaceArray.length; i++) {
    const standardizedReplaceObject = standardizeReplaceObject(replaceArray[i]);
    if (standardizedReplaceObject) {
      result.push(standardizedReplaceObject);
    }
  }

  return result;
}

/**
 * Turns an prepared replace object into an standardized replace object.
 * If the given replace object is a string it will be returned mostly unchanged.
 * If the given replace object is an replace object it will be parsed to RegExp.
 * @param replaceObject Object to be pasrsed
 * @returns null if failed reading null will be returned. If successfull object with replace and substring
 */
function standardizeReplaceObject(replaceObject) {
  let newReplaceObject = {};


  if (!replaceObject || !replaceObject.searchValue) {
    return null;
  }

  newReplaceObject.searchValue = standardizeSearchValue(replaceObject.searchValue);

  if (!newReplaceObject.searchValue) {
    return null;
  }

  newReplaceObject.replaceValue = replaceObject.replaceValue;

  return newReplaceObject;


}


/**
 * Turns an prepared searchValue into an string or RegExp object
 * @param searchValue String or RegExp object to be standardized
 * @returns {null|RegExp|string} Standardized search value
 */
function standardizeSearchValue(searchValue) {
  if (!searchValue) {
    return null;
  }
  if (typeof searchValue === "string" || searchValue instanceof RegExp) {
    return searchValue;

  } else if (typeof searchValue === "object") {
    if (typeof searchValue.regexBody !== "string") {
      console.warn("Failed parsing following replace object. Will continue without. " + JSON.stringify(searchValue));
      return null;
    }
    try {
      let flags = searchValue.regexFlags;
      if (flags === undefined) {
        flags = "";
      }

      return RegExp(searchValue.regexBody, flags);

    } catch (e) {
      console.warn("Failed parsing following replace object. Will continue without. " + JSON.stringify(searchValue));
      return null;
    }
  }
}

module.exports = {
  getOptions: getOptions,
  basicParseSearchObjects: basicParseSearchObjects,
  getDefaultOptions: getDefaultOptions,
  extendOptions: extendOptions,
  parseStringToArray: parseStringToArray,
  isReplaceObject: isReplaceObject,
  standardizeGroupRegex: standardizeGroupRegex,
  standardizeReplaceArray: standardizeReplaceArray,
  standardizeReplaceObject: standardizeReplaceObject,
  standardizeSearchValue: standardizeSearchValue
};
