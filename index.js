#!/usr/bin/env node

const commitsSince = require("./lib/commitsSince");
const commitsToObject = require("./lib/commitsToObjects");
const orderCommits = require("./lib/orderCommits").orderCommits;
const groupCommits = require("./lib/groupCommits").groupCommits;
const options = require("./lib/options").getOptions();
const gitRemote = require('git-remote-protocol');
const argv = require('yargs').argv;
const fs = require('fs');
const emoji = require('node-emoji');
const Githost = require('find-githost')
const githost = Githost.fromDir('.')


if (argv.v) {
  console.log(JSON.parse(fs.readFileSync('./package.json')));
  return;
}


commitsSince.commitsSince(options.since, options.format).then(function (rawCommits) {
  let origin = githost.https();
  let commitObjects = commitsToObject.commitsToObject(rawCommits, origin, options);

  commitObjects = orderCommits(commitObjects, options.order, options.orderBy);

  let groupedCommits = groupCommits(commitObjects, options.groupRegex);

  // Output
  for (let headline in groupedCommits) {
    if (groupedCommits[headline].length > 0 || options.outputEmptyGroup) {

      console.log(emoji.emojify(options.groupTemplate.replace("%_headline", headline)));

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