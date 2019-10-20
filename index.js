#!/usr/bin/env node

//./index.js  --since "v0.0.2" --outputEmptyGroup 1 --replaceBody "[{replace: '\n',substring:'\n  * '}]" --replaceInterpolated "[{replace: /  \* \\n/, substring: ''},{replace: /\\n  \* $/, substring: ''}]"

const commitsSince = require("./lib/commitsSince");
const commitsToObject = require("./lib/commitsToObjects");
const orderCommits = require("./lib/orderCommits").orderCommits;
const groupCommits = require("./lib/groupCommits").groupCommits;
const options = require("./lib/options").getOptions();
const origin = require('remote-origin-url');
const gitRemote = require('git-remote-protocol');
const argv = require('yargs').argv;
const fs = require('fs');

if (argv.v) {
  console.log(JSON.parse(fs.readFileSync('./package.json')));
  return;
}


commitsSince.commitsSince(options.since, options.format).then(function (rawCommits) {
  let origin = getOrigin();
  let commitObjects = commitsToObject.commitsToObject(rawCommits, origin, options);

  commitObjects = orderCommits(commitObjects, options.order, options.orderBy);

  let groupedCommits = groupCommits(commitObjects, options.groupRegex);

  // Output
  for (let headline in groupedCommits) {
    if (groupedCommits[headline].length > 0 || options.outputEmptyGroup) {

      for (let i = 0; i < groupedCommits[headline].length; i++) {
        console.log(groupedCommits[headline][i].interpolatedCommitMessage);
      }
    }
  }
});

function getOrigin() {
  let httpsOrigin = origin.sync().toString();
  if (httpsOrigin.indexOf("git@") > -1) {
    httpsOrigin = gitRemote.toHTTPS(httpsOrigin);
  }

  httpsOrigin = httpsOrigin.substr(0, httpsOrigin.indexOf(".git"));

  return httpsOrigin;
}