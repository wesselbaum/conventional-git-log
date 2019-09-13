#!/usr/bin/env node

//./index.js  --since "v0.0.2" --outputEmptyGroup 1 --replaceBody "[{replace: '\n',substring:'\n  * '}]" --replaceInterpolated "[{replace: /  \* \\n/, substring: ''},{replace: /\\n  \* $/, substring: ''}]"

const commitsSince = require("./lib/commitsSince");
const commitsToObject = require("./lib/commitsToObjects");
const orderCommits = require("./lib/orderCommits");
const groupCommits = require("./lib/groupCommits");
const argv = require('yargs').argv;
const origin = require('remote-origin-url');
const gitRemote = require('git-remote-protocol');


let format = argv.format ? argv.format : "* **%_hScope:** %_hSubject ([%h](%_o/commit/%h)) @%an%n  * %_b%n  * %_f";
let since = argv.since !== undefined ? argv.since : "package";
let orderBy = argv.orderBy ? argv.orderBy : "%_hSubject";
let order = argv.order ? argv.order : "ASC";
let groupRegex = argv.groupRegex !== undefined ? argv.groupRegex : "[{regex: 'BREAKING CHANGE',headline: 'Breaking changes'},{regex: '^feat',headline: 'Features'},{regex: '^fix',headline:'Fixes'}]";
let groupTemplate = argv.groupTemplate ? argv.groupTemplate : "## %_headline";
let outputEmptyGroup = argv.outputEmptyGroup !== undefined ? JSON.parse(argv.outputEmptyGroup.toString().toLowerCase()) : true;

let replaceSubject = argv.replaceSubject ? argv.replaceSubject : "";
let replaceBody = argv.replaceBody ? argv.replaceBody : '';
let replaceFooter = argv.replaceFooter ? argv.replaceFooter : "[{replace: /(BREAKING CHANGE)/,substring:'**$1**'}]";
let replaceInterpolated = argv.replaceInterpolated ? argv.replaceInterpolated : "";

let q = argv.q !== undefined ? JSON.parse(argv.q.toString().toLowerCase()) : false;


format += "${B}%B";

commitsSince.commitsSince(since, format).then(function (rawCommits) {
  let origin = getOrigin();
  let commitObjects = commitsToObject.commitsToObject(rawCommits, origin, q, replaceSubject, replaceBody, replaceFooter, replaceInterpolated);

  commitObjects = orderCommits.orderCommits(commitObjects, order, orderBy);

  let groupedCommtis = groupCommits.groupCommits(commitObjects, groupRegex);

  // Output
  for (let headline in groupedCommtis) {
    if (groupedCommtis[headline].length > 0 || outputEmptyGroup) {

      console.log(groupTemplate.replace("%_headline", headline));
      for (let i = 0; i < groupedCommtis[headline].length; i++) {
        console.log(groupedCommtis[headline][i].interpolatedCommitMessage);
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