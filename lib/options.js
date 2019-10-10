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

  let parameterOptions = {};

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

  options = extendOptions(defaultOptions, configOptions);


  // Overwrite collected options til now with parameters //TODO
  parameterOptions = {

    format: argv.format,
    since: argv.since,
    orderBy: argv.orderBy,
    order: argv.order,
    groupRegex: argv.groupRegex !== undefined, // TODO Check if the regex could be more like the replace regex for more clarity
    groupTemplate: argv.groupTemplate,
    outputEmptyGroup: argv.outputEmptyGroup !== undefined,

    replaceSubject: argv.replaceSubject,
    replaceBody: replaceStringToArray(argv.replaceBody),
    replaceFooter: argv.replaceFooter,
    replaceInterpolated: argv.replaceInterpolated,

    q: argv.q !== undefined

    // TODO Regex etc. to Regex Object
  };


  parameterOptions.format += "${B}%B";

  console.log(parameterOptions.since);

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

            let regex = RegExp(regexBody, regexFlags);
            options[key][i]['replace'] = regex;
          }
        }
      }
    }
  }

  return options;

}

/**
 * Returns the default options object
 * @returns {{q: boolean, replaceSubject: string, format: string, replaceInterpolated: string, orderBy: string, groupTemplate: string, groupRegex: string, outputEmptyGroup: boolean, replaceFooter: string, replaceBody: string, since: string, order: string}}
 */
function getDefaultOptions() {
  return {
    format: "* **%_hScope:** %_hSubject ([%h](%_o/commit/%h)) @%an%n  * %_b%n  * %_f",
    since: "package",
    orderBy: "%_hSubject",
    order: "ASC",
    groupRegex: "[{regex: 'BREAKING CHANGE',headline: 'Breaking changes'},{regex: '^feat',headline: 'Features'},{regex: '^fix',headline:'Fixes'}]",
    groupTemplate: "## %_headline",
    outputEmptyGroup: true,
    replaceSubject: "",
    replaceBody: '',
    replaceFooter: "[{replace: /(BREAKING CHANGE)/,substring:'**$1**'}]",
    replaceInterpolated: "",

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
  if (replaceString) {
    let object;
    try {
      object = eval(replaceString);
    } catch (e) {
      console.warn("Failed reading replace " + replaceString);
      console.warn(e);
      return result;
    }

    result = [];

    for (let i = 0; i < object.length; i++) {
      const standardizedReplaceObject = standardizeReplaceObject(object[i]);
      if (standardizedReplaceObject) {
        result.push(standardizedReplaceObject);
      }
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
  if (typeof replaceObject.replace === "string" || replaceObject.replace instanceof RegExp) {
    newReplaceObject.replace = replaceObject.replace;

  } else if (typeof replaceObject.replace === "object") {
    try {
      let flags = replaceObject.replace.regexFlags;
      if (flags === undefined) {
        flags = "";
      }

      newReplaceObject.replace = RegExp(replaceObject.replace.regexBody, flags);

    } catch (e) {
      console.warn("Failed parsing following replace object. Will continue without. " + replaceObject);
      return null;
    }

  } else {
    // Can't be read
    return null;

  }

  newReplaceObject.substring = replaceObject.substring;

  return newReplaceObject;


}
