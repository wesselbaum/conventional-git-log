#!/usr/bin/env node
const findup = require('findup-sync');
const argv = require('yargs').argv;
const fs = require('fs');

/**
 * Takes the default options, merges it with config and then the parameter options.
 * @returns {Options} Merged options
 */
exports.getOptions = function () {

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

    replaceSubject: replaceStringToArray(argv.replaceSubject),
    replaceBody: replaceStringToArray(argv.replaceBody),
    replaceFooter: replaceStringToArray(argv.replaceFooter),
    replaceInterpolated: replaceStringToArray(argv.replaceInterpolated),

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
};

/**
 * Iterates over all keys in the options object.
 * If there is an searchObject it will be translated to the replaceObject.
 * @param options Object to be iterated
 * @returns {*} Options with basically parsed searchObjects
 */
function basicParseSearchObjects(options) {

  for (let key in options) {
    let tmpOption = options[key];
    if (Array.isArray(tmpOption)) {
      for (let i = 0; i < tmpOption.length; i++) {
        let optionProperty = tmpOption[i];
        if (optionProperty.hasOwnProperty('searchObject')) {
          let replaceObject = optionProperty['searchObject'];
          if (replaceObject.hasOwnProperty('regexBody')) {
            let regexBody = replaceObject['regexBody'];
            let regexFlags;

            if (replaceObject.hasOwnProperty('regexFlags')) {
              regexFlags = replaceObject['regexFlags'];
            }

            options[key][i]['replace'] = RegExp(regexBody, regexFlags);
          }
        }
      }
    }
  }

  return options;

}

/**
 * Returns the default options object
 * @returns {{q: boolean, replaceSubject: string, format: string, replaceInterpolated: string, orderBy: string, groupTemplate: string, groupRegex: *[], outputEmptyGroup: boolean, replaceFooter: string, replaceBody: string, since: string, order: string}}
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
  for (key in baseOptions) {
    if (extendingOptions.hasOwnProperty(key) && extendingOptions[key] !== undefined) {
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
function replaceStringToArray(replaceString) {
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
 * Checks if the given object has a substring and a search value. If there is a valid searchValue and substring given.
 * @param replaceObject Object to be checked
 * @returns {boolean} True if valid
 */
function isReplaceObject(replaceObject) {
  const hasSearchValue = replaceObject.searchValue !== undefined,
      hasSubstring = replaceObject.substring !== undefined;

  let hasValidSearchValue;
  let hasValidSubstring;
  if (hasSearchValue) {
    hasValidSearchValue = (typeof replaceObject.searchValue === "string" || replaceObject.searchValue instanceof RegExp || typeof replaceObject.searchValue === "object")
  }
  if (hasSubstring) {
    hasValidSubstring = (typeof replaceObject.substring === "string");
  }

  return hasSearchValue && hasValidSearchValue && hasSubstring && hasValidSubstring;
}

function standardizeGroupRegex(groupRegex) {
  if (!groupRegex) {
    return null;
  }

  for (let i = 0; i < groupRegex.length; i++) {
    groupRegex[i].searchValue = standardizeSearchValue(groupRegex[i].searchValue);
  }

  return groupRegex;

}

/**
 * Iterates over the array, passes each object to standardizeReplaceObject and adds all valid results to the result
 * @param replaceArray Array of replaceObjects which should be standardized
 * @returns {Array} Array of standardized replaceObjects
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

  newReplaceObject.substring = replaceObject.substring;

  return newReplaceObject;


}


/**
 * Turns an prepared searchValue into an string or RegExp object
 * @param searchValue String or RegExp object to be standardized
 * @returns {null|RegExp|string} Standardized search value
 */
function standardizeSearchValue(searchValue) {
  if (typeof searchValue === "string" || searchValue instanceof RegExp) {
    return searchValue;

  } else if (typeof searchValue === "object") {
    try {
      let flags = searchValue.regexFlags;
      if (flags === undefined) {
        flags = "";
      }

      return RegExp(searchValue.regexBody, flags);

    } catch (e) {
      console.warn("Failed parsing following replace object. Will continue without. " + replaceObject);
      return null;
    }
  }
}
