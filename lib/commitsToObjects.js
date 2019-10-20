#!/usr/bin/env node

const check = require("parse-commit-message");
const replaceString = require("replace-string");

function commitsToObject(rawCommits, origin, options) {

  let commitObjects = [];
  for (let i = 0; i < rawCommits.length; i++) {
    commitObjects.push(commitToObject(rawCommits[i], origin, options));
  }

  return commitObjects;
}

function commitToObject(rawCommit, origin, options) {

  let commitTemplate = rawCommit.split("${B}")[0];
  let commitBody = rawCommit.split("${B}")[1];

  let commitObject = {
    commitBody: commitBody,
    commitTemplate: commitTemplate,
    origin: origin
  };


  let parsedCommitMessage;
  try {
    parsedCommitMessage = check.check(commitBody, true);

    parsedCommitMessage.header.subject = multipleReplace(parsedCommitMessage.header.subject, options.replaceSubject, options.q);
    parsedCommitMessage.body = multipleReplace(parsedCommitMessage.body, options.replaceBody, options.q);
    parsedCommitMessage.footer = multipleReplace(parsedCommitMessage.footer, options.replaceFooter, options.q);
    commitObject.parsedCommitMessage = parsedCommitMessage;
  } catch (err) {
    if (!options.q) {
      console.warn(`Not a valid conventional commit:
${commitBody}`);
    }

    let dirtyCommitHead = commitBody.substr(0, commitBody.indexOf("\n"));
    let dirtyCommitBody = commitBody.substr(commitBody.indexOf("\n") + 2, commitBody.length);

    commitObject.parsedCommitMessage = {
      header: {
        type: "",
        scope: "",
        subject: multipleReplace(dirtyCommitHead, options.replaceSubject, options.q),
      },
      body: multipleReplace(dirtyCommitBody, options.replaceBody, options.q),
      footer: null
    };
  }


  //interpolate
  const replacements = {
    hScope: commitObject.parsedCommitMessage.header.scope,
    hSubject: commitObject.parsedCommitMessage.header.subject,
    hType: commitObject.parsedCommitMessage.header.type,
    b: commitObject.parsedCommitMessage.body,
    f: commitObject.parsedCommitMessage.footer,
    o: origin
  };

  commitObject = {...commitObject, ...replacements};

  let interpolatedCommitMessage = interpolate(commitTemplate, replacements);
  commitObject.interpolatedCommitMessage = multipleReplace(interpolatedCommitMessage, options.replaceInterpolated, options.q);

  return commitObject;
}

function interpolate(template, variables, fallback) {
  const regex = /%_([a-zA-Z]+)/g;

  return template.replace(regex, (match) => {
    const path = match.slice(2).trim();
    let replacement = getObjPath(path, variables, fallback);

    return replacement === "" ? match : replacement;
  });
}

function getObjPath(path, obj, fallback = '') {
  return path.split('.').reduce((res, key) => res[key] || fallback, obj);
}

function multipleReplace(string, replaceArray, quiet) {
  if (!replaceArray) {
    return string;
  }

  try {

    for (let i = 0; i < replaceArray.length; i++) {
      if (typeof replaceArray[i].searchValue === "string") {
        string = replaceString(string, replaceArray[i].searchValue, replaceArray[i].replaceValue);
      } else {
        string = string.replace(replaceArray[i].searchValue, replaceArray[i].replaceValue);
      }
    }

    return string;

  } catch (e) {
    if (!quiet) {
      console.warn("Failed reading replace " + JSON.stringify(replaceArray));
    }
    return string;
  }

}

module.exports = {
  commitsToObject: commitsToObject,
  commitToObject: commitToObject,
  interpolate: interpolate,
  multipleReplace: multipleReplace
};
