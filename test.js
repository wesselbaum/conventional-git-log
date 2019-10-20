// Test
const assert = require('assert');

// Libs
// const opt = require("./lib/options");
const opt = require("./lib/options");
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
const options = opt.getOptions();


// noinspection NodeModulesDependencies,ES6ModulesDependencies
describe('commitsToObjects', function () {

  it('validCommitToObject', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[0], "origin", options);
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
    let commitObject = commitsToObject.commitToObject(rawCommits[6], "origin", options);
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
    let commitObjects = commitsToObject.commitsToObject(rawCommits, "origin", options);

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
    let commitObject = commitsToObject.commitToObject(rawCommits[0], "origin", options);
    let replacementArray = [
      {
        searchValue: "sting",
        replaceValue: 'string'
      }
    ];

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, replacementArray, true);
    assert.strictEqual(replacedBody, "A string won\'t be converted to a RegExp");
  });
  it('multipleReplace simple string single letter', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[0], "origin", options);
    let replacementArray = [
      {
        searchValue: "o",
        replaceValue: 'x'
      }
    ];

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, replacementArray, true);
    assert.strictEqual(replacedBody, "A sting wxn\'t be cxnverted tx a RegExp");
  });
  it('multipleReplace multiple simple string', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[0], "origin", options);
    let replacementArray = [
      {
        searchValue: "sting",
        replaceValue: 'string'
      },
      {
        searchValue: "ring",
        replaceValue: 'rung'
      },
      {
        searchValue: "a",
        replaceValue: '_'
      },
      {
        searchValue: "e",
        replaceValue: '_'
      },
      {
        searchValue: "i",
        replaceValue: '_'
      },
      {
        searchValue: "o",
        replaceValue: '_'
      }
    ];

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, replacementArray, true);
    assert.strictEqual(replacedBody, "A strung w_n't b_ c_nv_rt_d t_ _ R_gExp");
  });
  it('multipleReplace \\n string', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[1], "origin", options);
    let replacementArray = [
      {
        searchValue: "\n",
        replaceValue: '\nNL'
      }
    ];

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, replacementArray, true);
    assert.strictEqual(replacedBody, "Body\nNLBody2");
  });
  it('multipleReplace simple RegExp', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[1], "origin", options);
    let replacementArray = [
      {
        searchValue: /ody/g,
        replaceValue: 'acon'
      }
    ];

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, replacementArray, true);
    assert.strictEqual(replacedBody, "Bacon\nBacon2");
  });
  it('multipleReplace single RegExp letter', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[1], "origin", options);
    let replacementArray = [
      {
        searchValue: /o/g,
        replaceValue: 'x'
      }
    ];

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, replacementArray, true);
    assert.strictEqual(replacedBody, "Bxdy\nBxdy2");
  });
  it('multipleReplace \\n RegExp', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[1], "origin", options);
    let replacementArray = [
      {
        searchValue: /.*\n/g,
        replaceValue: 'Firstline ->'
      }
    ];

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, replacementArray, true);
    assert.strictEqual(replacedBody, "Firstline ->Body2");
  });
  it('multipleReplace \\n RegExp 2', function () {
    let commitObject = commitsToObject.commitToObject(rawCommits[1], "origin", options);
    let replacementArray = [
      {
        searchValue: /(ody)/g,
        replaceValue: 'acon-b$1'
      }
    ];

    let replacedBody = commitsToObject.multipleReplace(commitObject.b, replacementArray, true);
    assert.strictEqual(replacedBody, "Bacon-body\nBacon-body2");
  });
});

// noinspection NodeModulesDependencies,ES6ModulesDependencies
describe('groupCommits', function () {

  let commitObjects = commitsToObject.commitsToObject(rawCommits, "origin", options);

  it('groupBySubject', function () {
    let groupRegex = [
      {
        searchValue: /BREAKING CHANGE/,
        headline: 'Breaking changes'
      },
      {
        searchValue: /^feat/,
        headline: 'Features'
      },
      {
        searchValue: /^fix/,
        headline: 'Fixes'
      }
    ];
    let groupedCommits = groupCommits.groupCommits(commitObjects, groupRegex);

    assert.strictEqual(Object.keys(groupedCommits).length, 3);
    assert.strictEqual(groupedCommits['Breaking changes'].length, 1);
    assert.strictEqual(groupedCommits['Features'].length, 1);
    assert.strictEqual(groupedCommits['Fixes'].length, 0);

  });


  it('groupBySubject including others', function () {
    let groupRegex = [
      {
        searchValue: /BREAKING CHANGE/,
        headline: 'Breaking changes'
      },
      {
        searchValue: /^feat/,
        headline: 'Features'
      },
      {
        searchValue: /^fix/,
        headline: 'Fixes'
      },
      {
        searchValue: /.*/,
        headline: 'Others'
      }];
    let groupedCommits = groupCommits.groupCommits(commitObjects, groupRegex);

    assert.strictEqual(Object.keys(groupedCommits).length, 4);
    assert.strictEqual(groupedCommits['Breaking changes'].length, 1);
    assert.strictEqual(groupedCommits['Features'].length, 1);
    assert.strictEqual(groupedCommits['Others'].length, 5);
  });

});

// noinspection NodeModulesDependencies,ES6ModulesDependencies
describe('orderCommits', function () {

  let commitObjects = commitsToObject.commitsToObject(rawCommits, "origin", options);

  it('order commits by Subject ASC', function () {
    let orderedCommits = orderCommits.orderCommits(commitObjects, "ASC", "%_hSubject");

    assert.strictEqual(orderedCommits[0].hSubject, "Added missing attributes in package.json and readme");
    assert.strictEqual(orderedCommits[1].hSubject, "Created Code of conduct");
    assert.strictEqual(orderedCommits[2].hSubject, "Created Contributing");
    assert.strictEqual(orderedCommits[3].hSubject, "Initial commit");
    assert.strictEqual(orderedCommits[4].hSubject, "Initial commit");
    assert.strictEqual(orderedCommits[5].hSubject, "More consistent replacements");
    assert.strictEqual(orderedCommits[6].hSubject, "Replaced placeholder with module name");
  });

  it('order commits by Subject DESC', function () {
    let orderedCommits = orderCommits.orderCommits(commitObjects, "DESC", "%_hSubject");

    assert.strictEqual(orderedCommits[0].hSubject, "Replaced placeholder with module name");
    assert.strictEqual(orderedCommits[1].hSubject, "More consistent replacements");
    assert.strictEqual(orderedCommits[2].hSubject, "Initial commit");
    assert.strictEqual(orderedCommits[3].hSubject, "Initial commit");
    assert.strictEqual(orderedCommits[4].hSubject, "Created Contributing");
    assert.strictEqual(orderedCommits[5].hSubject, "Created Code of conduct");
    assert.strictEqual(orderedCommits[6].hSubject, "Added missing attributes in package.json and readme");
  });

  it('order commits by Scope ASC', function () {
    let orderedCommits = orderCommits.orderCommits(commitObjects, "ASC", "%_hScope");

    assert.strictEqual(orderedCommits[0].hScope, "community");
    assert.strictEqual(orderedCommits[1].hScope, "community");
    assert.strictEqual(orderedCommits[2].hScope, "package");
    assert.strictEqual(orderedCommits[3].hScope, "readme");
    assert.strictEqual(orderedCommits[4].hScope, "replacements");
    assert.strictEqual(orderedCommits[5].hScope, null);
    assert.strictEqual(orderedCommits[6].hScope, "");
  });


});

describe('options', function () {

  it('StandardizeSearchValue String', function () {
    const input = "Search";
    const result = opt.standardizeSearchValue(input);

    assert.strictEqual(result, input);
  });

  it('StandardizeSearchValue RegExp', function () {
    const input = /Search\w/g;
    const result = opt.standardizeSearchValue(input);

    assert.strictEqual(result, input);
  });

  it('StandardizeSearchValue Object', function () {
    const input = {
      regexBody: "Search\\w",
      regexFlags: "gi"
    };

    const result = opt.standardizeSearchValue(input);

    assert.deepStrictEqual(result, /Search\w/gi);
  });

  it('StandardizeSearchValue Invalid Object', function () {
    const input1 = {
      regexBod: "Search\\w",
      regexFlags: "gi"
    };

    const input2 = {
      regexBody: /Search\w/g,
      regexFlags: "gi"
    };

    const input3 = {
      regexBody: {
        hello: "world"
      },
      regexFlags: "gi"
    };

    const result1 = opt.standardizeSearchValue(input1);
    const result2 = opt.standardizeSearchValue(input2);
    const result3 = opt.standardizeSearchValue(input3);
    const result4 = opt.standardizeSearchValue(null);

    assert.strictEqual(null, result1);
    assert.strictEqual(null, result2);
    assert.strictEqual(null, result3);
    assert.strictEqual(null, result4);

  });

  it('standardizeReplaceObject String', function () {
    const input = {
      searchValue: "Search",
      replaceValue: "search"
    };

    const result = opt.standardizeReplaceObject(input);

    assert.deepStrictEqual(result, input);
  });

  it('standardizeReplaceObject RegExp', function () {
    const input = {
      searchValue: "/Search\\w/g",
      replaceValue: "search"
    };

    const result = opt.standardizeReplaceObject(input);

    assert.deepStrictEqual(result, input);
  });

  it('standardizeReplaceObject Object', function () {
    const input = {
      searchValue: {
        regexBody: "Search\\w",
        regexFlags: "gi"
      },
      substring: "search"
    };

    const result = opt.standardizeReplaceObject(input);

    assert.deepStrictEqual(result.searchValue, /Search\w/gi);
  });

  it('standardizeReplaceObject Invalid', function () {
    const input1 = {
      searchValue: {
        regexBod: "Search\\w",
        regexFlags: "gi"
      },
      substring: "x"
    };

    const input2 = {
      searchValue: {
        regexBody: /Search\w/g,
        regexFlags: "gi"
      },
      substring: "x"
    };

    const input3 = {
      searchValue: {
        regexBody: {
          hello: "world"
        },
        regexFlags: "gi"
      },
      substring: "x"
    };

    const result1 = opt.standardizeReplaceObject(input1);
    const result2 = opt.standardizeSearchValue(input2);
    const result3 = opt.standardizeSearchValue(input3);
    const result4 = opt.standardizeSearchValue(null);

    assert.strictEqual(null, result1);
    assert.strictEqual(null, result2);
    assert.strictEqual(null, result3);
    assert.strictEqual(null, result4);
  });


  it('standardizeReplaceObjectArray ', function () {
    const input0 = {
      searchValue: {
        regexBod: "Search\\w",
        regexFlags: "gi"
      },
      replaceValue: "x"
    };

    const input1 = {
      searchValue: {
        regexBody: /Search\w/g,
        regexFlags: "gi"
      },
      replaceValue: "x"
    };

    const input2 = {
      searchValue: {
        regexBody: {
          hello: "world"
        },
        regexFlags: "gi"
      },
      replaceValue: "x"
    };

    const input3 = null;

    const input4 = {
      searchValue: {
        regexBody: "Search\\w",
        regexFlags: "gi"
      },
      replaceValue: "search"
    };

    const input5 = {
      searchValue: "/Search\\w/g",
      replaceValue: "search"
    };

    const input6 = {
      searchValue: "Search",
      replaceValue: "search"
    };

    const inputArray = [input0, input1, input2, input3, input4, input5, input6];

    const result = opt.standardizeReplaceArray(inputArray);

    assert.deepStrictEqual(result.length, 3);
    assert.deepStrictEqual(result[0].searchValue, /Search\w/gi);
    assert.deepStrictEqual(result[0].replaceValue, "search");
    assert.deepStrictEqual(result[1], input5);
    assert.deepStrictEqual(result[2], input6);
  });


  it('standardizeGroupRegex undefined', function () {
    assert.strictEqual(opt.standardizeGroupRegex(undefined), null)
  });

  it('standardizeGroupRegex null', function () {
    assert.strictEqual(opt.standardizeGroupRegex(null), null)
  });

  it('standardizeGroupRegex empty object', function () {
    assert.strictEqual(opt.standardizeGroupRegex({}), null)
  });

  it('standardizeGroupRegex invalid object', function () {
    assert.deepStrictEqual(opt.standardizeGroupRegex([{object: "invalid"}]), [])
  });


  it('standardizeGroupRegex valid', function () {
    const validGroupRegex = [
      {
        searchValue: {
          "regexBody": "BREAKING CHANGE"
        }
      },
      {
        searchValue: {
          "regexBody": "^fix",
          "regexFlags": "gi"
        }
      }
    ];


    assert.strictEqual(opt.standardizeGroupRegex(validGroupRegex).length, 2);
    assert.deepStrictEqual(opt.standardizeGroupRegex(validGroupRegex)[0].searchValue, /BREAKING CHANGE/);
    assert.deepStrictEqual(opt.standardizeGroupRegex(validGroupRegex)[1].searchValue, /^fix/gi);
  });


  it('isReplaceObject valid', function () {
    const validObject1 = {searchValue: "searchMe", substring: "insertMe"};
    const validObject2 = {searchValue: /searchMe/, substring: "insertMe"};
    const validObject3 = {searchValue: {regexBody: "(BREAKING CHANGE)", regexFlags: "g"}, substring: "insertMe"};

    assert.strictEqual(true, opt.isReplaceObject(validObject1));
    assert.strictEqual(true, opt.isReplaceObject(validObject2));
    assert.strictEqual(true, opt.isReplaceObject(validObject3));


  });

  it('isReplaceObject invalid', function () {
    const validObject1 = {searchValue: null, substring: "insertMe"};
    const validObject2 = {searchValue: undefined, substring: "insertMe"};
    const validObject3 = {searchValue: {regexBody: "(BREAKING CHANGE)", regexFlags: "hello"}, substring: "insertMe"};
    const validObject4 = {searchValue: "searchMe", substring: null};
    const validObject5 = {searchValue: /searchMe/, substring: undefined};
    const validObject6 = {searchValue: /searchMe/, substring: {}};
    const validObject7 = {searchValue: /searchMe/, substring: []};

    assert.strictEqual(false, opt.isReplaceObject(validObject1));
    assert.strictEqual(false, opt.isReplaceObject(validObject2));
    assert.strictEqual(false, opt.isReplaceObject(validObject3));
    assert.strictEqual(false, opt.isReplaceObject(validObject4));
    assert.strictEqual(false, opt.isReplaceObject(validObject5));
    assert.strictEqual(false, opt.isReplaceObject(validObject6));
    assert.strictEqual(false, opt.isReplaceObject(validObject7));

  });


  it('parseStringToArray valid', function () {
    const validString = "[{searchValue:'\\n', substring:'\\n  * '},{searchValue: {regexBody: '.* %_\w.*', regexFlags: 'g'}, substring: ''},{searchValue: {regexBody:'Change', regexFlags:'g'}, substring: 'Modification'}]";

    const result = opt.parseStringToArray(validString);

    assert.strictEqual(3, result.length);
    assert.deepStrictEqual('\n', result[0].searchValue);
    assert.deepStrictEqual('\n  * ', result[0].substring);
    assert.deepStrictEqual({regexBody: '.* %_w.*', regexFlags: 'g'}, result[1].searchValue);
    assert.deepStrictEqual('', result[1].substring);
    assert.deepStrictEqual({regexBody: 'Change', regexFlags: 'g'}, result[2].searchValue);
    assert.deepStrictEqual('Modification', result[2].substring);
  });


  it('extendOptions valid', function () {
    const baseObject = {
      a: "a",
      b: "b",
      c: "c"
    };

    const extendObject = {
      a: "new a",
      b: "new b",
      d: "new d"
    };

    const expectedResult = {
      a: "new a",
      b: "new b",
      c: "c"
    };

    const result = opt.extendOptions(baseObject, extendObject);

    assert.deepStrictEqual(expectedResult, result);
  });

  it('extendOptions null', function () {
    const baseObject = {
      a: "a",
      b: "b",
      c: null
    };

    const extendObject = {
      a: "new a",
      b: "new b",
      c: "new c",
    };

    const expectedResult = {
      a: "new a",
      b: "new b",
      c: "new c"
    };

    const result1 = opt.extendOptions(baseObject, extendObject);
    const result2 = opt.extendOptions(null, extendObject);
    const result3 = opt.extendOptions(baseObject, null);

    assert.deepStrictEqual(expectedResult, result1);
    assert.deepStrictEqual(null, result2);
    assert.deepStrictEqual(result3, result3);

  });

  it('extendOptions undefined', function () {
    const baseObject = {
      a: "a",
      b: "b",
      c: undefined
    };

    const extendObject = {
      a: "new a",
      b: "new b",
      c: "new c",
    };

    const expectedResult = {
      a: "new a",
      b: "new b",
      c: "new c"
    };

    const result1 = opt.extendOptions(baseObject, extendObject);
    const result2 = opt.extendOptions(undefined, extendObject);
    const result3 = opt.extendOptions(baseObject, undefined);

    assert.deepStrictEqual(expectedResult, result1);
    assert.deepStrictEqual(undefined, result2);
    assert.deepStrictEqual(result3, result3);
  });


  it('basicParseSearchObjects ', function () {

    const input = {
      "groupRegex": [
        {
          "searchValue": {
            "regexBody": "BREAKING CHANGE"
          },
          "headline": "Breaking changes"
        },
        {
          "searchValue": {
            "regexBody": "^feat"
          },
          "headline": "Features"
        },
        {
          "searchValue": {
            "regexBody": "^fix"
          },
          "headline": "Fixes"
        }
      ],
      "replaceBody": "",
      "replaceFooter": [
        {
          "searchValue": {
            "regexBody": "(BREAKING CHANGE)",
            "regexFlags": "g"
          },
          "replaceValue": "**$1**"
        }
      ],
    };

    const result = opt.basicParseSearchObjects(input);

    assert.strictEqual(3, result.groupRegex.length);
    assert.deepStrictEqual(/BREAKING CHANGE/, result.groupRegex[0].searchValue);
    assert.deepStrictEqual(/^feat/, result.groupRegex[1].searchValue);

  });


  it('standardizeReplaceObject ', function () {

  });


  it('standardizeReplaceObject ', function () {

  });

  // it('standardizeReplaceObject ', function () {
  //
  // });

});