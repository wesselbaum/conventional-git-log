#!/usr/bin/env node
const findup = require('findup-sync');
const argv = require('yargs').argv;
const fs = require('fs');


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
    configOptions = replaceJsonRegexWithRegexObject(configOptions);
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

  return "bla";
};

function replaceJsonRegexWithRegexObject(options) {

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
