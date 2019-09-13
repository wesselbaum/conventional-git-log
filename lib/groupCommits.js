#!/usr/bin/env node

exports.groupCommits = function (commitObjects, groupRegex) {

  let groupRegexObject;
  let fallbackGroupRegex = "[{regex: /.*/,headline: 'All commits'}]";

  try {
    groupRegexObject = eval(groupRegex);
  } catch (e) {
  }

  if (groupRegexObject === undefined) {
    console.warn("Failed reading groupRegex " + groupRegex + ". Will be replaced with [{regex: /.*/,headline: 'All commits'}]");
    groupRegexObject = eval(fallbackGroupRegex);
  }

  let commitObjectGroups = {};
  for (let i = 0; i < groupRegexObject.length; i++) {
    commitObjectGroups[groupRegexObject[i].headline] = [];
  }
  for (let i = 0; i < commitObjects.length; i++) {
    for (let j = 0; j < groupRegexObject.length; j++) {
      let regex = new RegExp(groupRegexObject[j].regex);
      if (regex.test(commitObjects[i].commitBody)) {
        commitObjectGroups[groupRegexObject[j].headline].push(commitObjects[i]);
        break;
      }
    }
  }

  return commitObjectGroups;
};