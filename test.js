// Test
const assert = require('assert');

// Libs
const commitsToObject = require("./lib/commitsToObjects");
const orderCommits = require("./lib/orderCommits");
const groupCommits = require("./lib/groupCommits");

const rawCommits = [
  "* **%_hScope:** %_hSubject ([4c18067](%_o/commit/4c18067)) @Aleksej Wesselbaum\n  * %_b\n  * %_f${B}feat(replacements): More consistent replacements\n\nA sting won't be converted to a RegExp\n\nBREAKING CHANGE: Test",
  "* **%_hScope:** %_hSubject ([db1770d](%_o/commit/db1770d)) @Aleksej Wesselbaum\n  * %_b\n  * %_f${B}docs(community): Created Contributing\n\nBody\nBody2",
  "* **%_hScope:** %_hSubject ([41f31dc](%_o/commit/41f31dc)) @Aleksej Wesselbaum\n  * %_b\n  * %_f${B}docs(community): Created Code of conduct\n\n",
  "* **%_hScope:** %_hSubject ([e55aabb](%_o/commit/e55aabb)) @Aleksej Wesselbaum\n  * %_b\n  * %_f${B}docs(readme): Replaced placeholder with module name\n\n",
  "* **%_hScope:** %_hSubject ([506cfca](%_o/commit/506cfca)) @Aleksej Wesselbaum\n  * %_b\n  * %_f${B}docs(package): Added missing attributes in package.json and readme\n\n",
  "* **%_hScope:** %_hSubject ([f05160b](%_o/commit/f05160b)) @Aleksej Wesselbaum\n  * %_b\n  * %_f${B}feat: Initial commit\n\n",
  "* **%_hScope:** %_hSubject ([4bec025](%_o/commit/4bec025)) @Aleksej Wesselbaum\n  * %_b\n  * %_f${B}Initial commit\n\nInvalid body"
];


// noinspection NodeModulesDependencies,ES6ModulesDependencies
describe('commitsToObjects', function () {

  it('validCommitToObject', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[0], "origin", true, [], [], [], []);
    assert.strictEqual(commitObject.parsedCommitMessage.header.type, "feat");
    assert.strictEqual(commitObject.hType, "feat");
    assert.strictEqual(commitObject.parsedCommitMessage.header.scope, "replacements");
    assert.strictEqual(commitObject.hScope, "replacements");
    assert.strictEqual(commitObject.parsedCommitMessage.header.subject, "More consistent replacements");
    assert.strictEqual(commitObject.hSubject, "More consistent replacements");
    assert.strictEqual(commitObject.parsedCommitMessage.body, "A sting won\'t be converted to a RegExp");
    assert.strictEqual(commitObject.b, "A sting won\'t be converted to a RegExp");
    assert.strictEqual(commitObject.parsedCommitMessage.footer, "BREAKING CHANGE: Test");
    assert.strictEqual(commitObject.f, "BREAKING CHANGE: Test");
    assert.strictEqual(commitObject.origin, "origin");
    assert.strictEqual(commitObject.o, "origin");

  });

  it('invalidCommitToObject', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[6], "origin", true, [], [], [], []);
    assert.strictEqual(commitObject.parsedCommitMessage.header.type, "");
    assert.strictEqual(commitObject.hType, "");
    assert.strictEqual(commitObject.parsedCommitMessage.header.scope, "");
    assert.strictEqual(commitObject.hScope, "");
    assert.strictEqual(commitObject.parsedCommitMessage.header.subject, "Initial commit");
    assert.strictEqual(commitObject.hSubject, "Initial commit");
    assert.strictEqual(commitObject.parsedCommitMessage.body, "Invalid body");
    assert.strictEqual(commitObject.b, "Invalid body");
    assert.strictEqual(commitObject.parsedCommitMessage.footer, null);
    assert.strictEqual(commitObject.f, null);
    assert.strictEqual(commitObject.origin, "origin");
    assert.strictEqual(commitObject.o, "origin");

  });
  it('commitsToObject', function () {
    let commitObjects = commitsToObject.commitsToObject(rawCommits, "origin", true, [], [], [], []);

    assert.strictEqual(commitObjects.length, 7);

    // First valid commit
    assert.strictEqual(commitObjects[0].parsedCommitMessage.header.type, "feat");
    assert.strictEqual(commitObjects[0].hType, "feat");
    assert.strictEqual(commitObjects[0].parsedCommitMessage.header.scope, "replacements");
    assert.strictEqual(commitObjects[0].hScope, "replacements");
    assert.strictEqual(commitObjects[0].parsedCommitMessage.header.subject, "More consistent replacements");
    assert.strictEqual(commitObjects[0].hSubject, "More consistent replacements");
    assert.strictEqual(commitObjects[0].parsedCommitMessage.body, "A sting won\'t be converted to a RegExp");
    assert.strictEqual(commitObjects[0].b, "A sting won\'t be converted to a RegExp");
    assert.strictEqual(commitObjects[0].parsedCommitMessage.footer, "BREAKING CHANGE: Test");
    assert.strictEqual(commitObjects[0].f, "BREAKING CHANGE: Test");
    assert.strictEqual(commitObjects[0].origin, "origin");
    assert.strictEqual(commitObjects[0].o, "origin");

    // Last invalid commit
    assert.strictEqual(commitObjects[6].parsedCommitMessage.header.type, "");
    assert.strictEqual(commitObjects[6].hType, "");
    assert.strictEqual(commitObjects[6].parsedCommitMessage.header.scope, "");
    assert.strictEqual(commitObjects[6].hScope, "");
    assert.strictEqual(commitObjects[6].parsedCommitMessage.header.subject, "Initial commit");
    assert.strictEqual(commitObjects[6].hSubject, "Initial commit");
    assert.strictEqual(commitObjects[6].parsedCommitMessage.body, "Invalid body");
    assert.strictEqual(commitObjects[6].b, "Invalid body");
    assert.strictEqual(commitObjects[6].parsedCommitMessage.footer, null);
    assert.strictEqual(commitObjects[6].f, null);
    assert.strictEqual(commitObjects[6].origin, "origin");
    assert.strictEqual(commitObjects[6].o, "origin");
  });

  // Interpolate
  it('interpolate', function () {
    assert.strictEqual(commitsToObject.interpolate("%_o", {o: "origin"}), "origin");
  });
  it('interpolate not found', function () {
    assert.strictEqual(commitsToObject.interpolate("%_ox", {o: "origin"}), "%_ox");
  });
  it('interpolate with fallback', function () {
    assert.strictEqual(commitsToObject.interpolate("%_o", {}, "fallback"), "fallback");
  });

  // Multiple replace
  it('multipleReplace simple string', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[0], "origin", true, [], [], [], []);
    let replacementArray = [
      {
        replace: "sting",
        substring: 'string'
      }
    ];

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, JSON.stringify(replacementArray));
    assert.strictEqual(replacedBody, "A string won\'t be converted to a RegExp");
  });
  it('multipleReplace simple string single letter', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[0], "origin", true, [], [], [], []);
    let replacementArray = [
      {
        replace: "o",
        substring: 'x'
      }
    ];

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, JSON.stringify(replacementArray));
    assert.strictEqual(replacedBody, "A sting wxn\'t be cxnverted tx a RegExp");
  });
  it('multipleReplace multiple simple string', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[0], "origin", true, [], [], [], []);
    let replacementArray = [
      {
        replace: "sting",
        substring: 'string'
      },
      {
        replace: "ring",
        substring: 'rung'
      },
      {
        replace: "a",
        substring: '_'
      },
      {
        replace: "e",
        substring: '_'
      },
      {
        replace: "i",
        substring: '_'
      },
      {
        replace: "o",
        substring: '_'
      }
    ];

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, JSON.stringify(replacementArray));
    assert.strictEqual(replacedBody, "A strung w_n't b_ c_nv_rt_d t_ _ R_gExp");
  });
  it('multipleReplace \\n string', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[1], "origin", true, [], [], [], []);
    let replacementArray = [
      {
        replace: "\n",
        substring: '\nNL'
      }
    ];

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, JSON.stringify(replacementArray));
    assert.strictEqual(replacedBody, "Body\nNLBody2");
  });
  it('multipleReplace simle RegExp', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[1], "origin", true, [], [], [], []);

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, "[{replace: /ody/g,substring:'acon'}]");
    assert.strictEqual(replacedBody, "Bacon\nBacon2");
  });
  it('multipleReplace single RegExp letter', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[1], "origin", true, [], [], [], []);

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, "[{replace: /o/g,substring:'x'}]");
    assert.strictEqual(replacedBody, "Bxdy\nBxdy2");
  });
  it('multipleReplace \\n RegExp', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[1], "origin", true, [], [], [], []);

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, "[{replace: /.*\\n/g,substring:'Firstline ->'}]");
    assert.strictEqual(replacedBody, "Firstline ->Body2");
  });
  it('multipleReplace \\n RegExp', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[1], "origin", true, [], [], [], []);

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, "[{replace: /(ody)/g,substring:'acon-b$1'}]");
    assert.strictEqual(replacedBody, "Bacon-body\nBacon-body2");
  });
});

// noinspection NodeModulesDependencies,ES6ModulesDependencies
describe('groupCommits', function () {

  let commitObjects = commitsToObject.commitsToObject(rawCommits, "origin", true, [], [], [], []);

  it('groupBySubject by regex string', function () {
    let groupedCommits = groupCommits.groupCommits(commitObjects, "[{regex: 'BREAKING CHANGE',headline: 'Breaking changes'},{regex: '^feat',headline: 'Features'},{regex: '^fix',headline:'Fixes'}]");

    assert.strictEqual(Object.keys(groupedCommits).length, 3);
    assert.strictEqual(groupedCommits['Breaking changes'].length, 1);
    assert.strictEqual(groupedCommits['Features'].length, 1);
    assert.strictEqual(groupedCommits['Fixes'].length, 0);

  });

  it('groupBySubject by regex objects', function () {
    let groupedCommits = groupCommits.groupCommits(commitObjects, "[{regex: /BREAKING CHANGE/,headline: 'Breaking changes'},{regex: /^feat/,headline: 'Features'},{regex: /^fix/,headline:'Fixes'}]");

    assert.strictEqual(Object.keys(groupedCommits).length, 3);
    assert.strictEqual(groupedCommits['Breaking changes'].length, 1);
    assert.strictEqual(groupedCommits['Features'].length, 1);
    assert.strictEqual(groupedCommits['Fixes'].length, 0);

  });

  it('groupBySubject including others', function () {
    let groupedCommits = groupCommits.groupCommits(commitObjects, "[{regex: /BREAKING CHANGE/,headline: 'Breaking changes'},{regex: /^feat/,headline: 'Features'},{regex: /^fix/,headline:'Fixes'},{regex: /.*/,headline:'Others'}]");

    assert.strictEqual(Object.keys(groupedCommits).length, 4);
    assert.strictEqual(groupedCommits['Breaking changes'].length, 1);
    assert.strictEqual(groupedCommits['Features'].length, 1);
    assert.strictEqual(groupedCommits['Others'].length, 5);
  });

});

// noinspection NodeModulesDependencies,ES6ModulesDependencies
describe('orderCommits', function () {

  let commitObjects = commitsToObject.commitsToObject(rawCommits, "origin", true, [], [], [], []);

  it('order commits by Subject ASC', function () {
    let orderedCommits = orderCommits.orderCommits(commitObjects, "ASC", "%_hSubject");

    assert.strictEqual(orderedCommits[0].hSubject, "Added missing attributes in package.json and readme");
    assert.strictEqual(orderedCommits[3].hSubject, "Initial commit");
    assert.strictEqual(orderedCommits[6].hSubject, "Replaced placeholder with module name");
  });

  it('order commits by Subject DESC', function () {
    let orderedCommits = orderCommits.orderCommits(commitObjects, "DESC", "%_hSubject");

    assert.strictEqual(orderedCommits[6].hSubject, "Added missing attributes in package.json and readme");
    assert.strictEqual(orderedCommits[3].hSubject, "Initial commit");
    assert.strictEqual(orderedCommits[0].hSubject, "Replaced placeholder with module name");
  });

  it('order commits by Scope ASC', function () {
    let orderedCommits = orderCommits.orderCommits(commitObjects, "ASC", "%_hScope");


    assert.strictEqual(orderedCommits[0].hScope, "");
    assert.strictEqual(orderedCommits[3].hScope, null);
    assert.strictEqual(orderedCommits[6].hScope, "package");
  });


});