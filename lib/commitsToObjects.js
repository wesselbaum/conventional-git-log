#!/usr/bin/env node

const check = require("parse-commit-message");
const replaceString = require("replace-string");

function commitsToObject(rawCommits, origin, quiet, replaceSubject, replaceBody, replaceFooter, replaceInterpolated) {

  let commitObjects = [];
  for (let i = 0; i < rawCommits.length; i++) {
    commitObjects.push(commitToObject(rawCommits[i], origin, quiet, replaceSubject, replaceBody, replaceFooter, replaceInterpolated));
  }

  return commitObjects;
};

function commitToObject(rawCommit, origin, quiet, replaceSubject, replaceBody, replaceFooter, replaceInterpolated) {

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

    parsedCommitMessage.header.subject = multipleReplace(parsedCommitMessage.header.subject, replaceSubject, quiet);
    parsedCommitMessage.body = multipleReplace(parsedCommitMessage.body, replaceBody, quiet);
    parsedCommitMessage.footer = multipleReplace(parsedCommitMessage.footer, replaceFooter, quiet);
    commitObject.parsedCommitMessage = parsedCommitMessage;
  } catch (err) {
    if (!quiet) {
      console.warn(`Not a valid conventional commit:
${commitBody}`);
    }

    let dirtyCommitHead = commitBody.substr(0, commitBody.indexOf("\n"));
    let dirtyCommitBody = commitBody.substr(commitBody.indexOf("\n") + 2, commitBody.length);

    commitObject.parsedCommitMessage = {
      header: {
        type: "",
        scope: "",
        subject: multipleReplace(dirtyCommitHead, replaceSubject, quiet),
      },
      body: multipleReplace(dirtyCommitBody, replaceBody, quiet),
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
  commitObject.interpolatedCommitMessage = multipleReplace(interpolatedCommitMessage, replaceInterpolated, quiet);

  return commitObject;
}

function interpolate(template, variables, fallback) {
  const regex = /%_([a-zA-Z]+)/g; // TODO Maybe replace this regex with all possible mathces.

  return template.replace(regex, (match) => {
    const path = match.slice(2).trim();
    let replacement = getObjPath(path, variables, fallback);
    
    return replacement === "" ? match : replacement;
  });
}

function getObjPath(path, obj, fallback = '') {
  return path.split('.').reduce((res, key) => res[key] || fallback, obj);
}

function multipleReplace(string, replaceArrayString, quiet) {
  if (replaceArrayString === "" || !string) {
    return string;
  }
  let replaceArray;

  try {

    replaceArray = eval(replaceArrayString);

    for (let i = 0; i < replaceArray.length; i++) {
      if (typeof replaceArray[i].replace === "string") {
        string = replaceString(string, replaceArray[i].replace, replaceArray[i].substring);
      } else {
        string = string.replace(replaceArray[i].replace, replaceArray[i].substring, "\\$&");
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
}