// Test
const assert = require('assert');

// Libs
const commitsToObject = require("./lib/commitsToObjects");
const orderCommits = require("./lib/orderCommits");
const groupCommits = require("./lib/groupCommits");


describe('commitsToObjects', function() {

    const rawCommits = [
        "* **%_hScope:** %_hSubject ([4c18067](%_o/commit/4c18067)) @Aleksej Wesselbaum\n  * %_b\n  * %_f${B}feat(replacements): More consistent replacements\n\nA sting won't be converted to a RegExp\n\nBREAKING CHANGE: Test",
        "* **%_hScope:** %_hSubject ([db1770d](%_o/commit/db1770d)) @Aleksej Wesselbaum\n  * %_b\n  * %_f${B}docs(community): Created Contributing\n\nBody\nBody2",
        "* **%_hScope:** %_hSubject ([41f31dc](%_o/commit/41f31dc)) @Aleksej Wesselbaum\n  * %_b\n  * %_f${B}docs(community): Created Code of conduct\n\n",
        "* **%_hScope:** %_hSubject ([e55aabb](%_o/commit/e55aabb)) @Aleksej Wesselbaum\n  * %_b\n  * %_f${B}docs(readme): Replaced placeholder with module name\n\n",
        "* **%_hScope:** %_hSubject ([506cfca](%_o/commit/506cfca)) @Aleksej Wesselbaum\n  * %_b\n  * %_f${B}docs(package): Added missing attributes in package.json and readme\n\n",
        "* **%_hScope:** %_hSubject ([f05160b](%_o/commit/f05160b)) @Aleksej Wesselbaum\n  * %_b\n  * %_f${B}feat: Initial commit\n\n",
        "* **%_hScope:** %_hSubject ([4bec025](%_o/commit/4bec025)) @Aleksej Wesselbaum\n  * %_b\n  * %_f${B}Initial commit\n\nInvalid body"
    ];


    it('validCommitToObject', function(){
        let commitObject = commitsToObject.commitToObject(rawCommits[0], "origin", true);
        assert.equal(commitObject.parsedCommitMessage.header.type, "feat");
        assert.equal(commitObject.hType, "feat");
        assert.equal(commitObject.parsedCommitMessage.header.scope, "replacements");
        assert.equal(commitObject.hScope, "replacements");
        assert.equal(commitObject.parsedCommitMessage.header.subject, "More consistent replacements");
        assert.equal(commitObject.hSubject, "More consistent replacements");
        assert.equal(commitObject.parsedCommitMessage.body, "A sting won\'t be converted to a RegExp");
        assert.equal(commitObject.b, "A sting won\'t be converted to a RegExp");
        assert.equal(commitObject.parsedCommitMessage.footer, "BREAKING CHANGE: Test");
        assert.equal(commitObject.f, "BREAKING CHANGE: Test");
        assert.equal(commitObject.origin, "origin");
        assert.equal(commitObject.o, "origin");

    });

    it('invalidCommitToObject', function(){
        let commitObject = commitsToObject.commitToObject(rawCommits[6], "origin", true);
        assert.equal(commitObject.parsedCommitMessage.header.type, "");
        assert.equal(commitObject.hType, "");
        assert.equal(commitObject.parsedCommitMessage.header.scope, "");
        assert.equal(commitObject.hScope, "");
        assert.equal(commitObject.parsedCommitMessage.header.subject, "Initial commit");
        assert.equal(commitObject.hSubject, "Initial commit");
        assert.equal(commitObject.parsedCommitMessage.body, "Invalid body");
        assert.equal(commitObject.b, "Invalid body");
        assert.equal(commitObject.parsedCommitMessage.footer, null);
        assert.equal(commitObject.f, null);
        assert.equal(commitObject.origin, "origin");
        assert.equal(commitObject.o, "origin");

    });
    it('commitsToObject', function(){
        let commitObjects  = commitsToObject.commitsToObject(rawCommits, "origin", true);

        assert.equal(commitObjects.length, 7);

        // First valid commit
        assert.equal(commitObjects[0].parsedCommitMessage.header.type, "feat");
        assert.equal(commitObjects[0].hType, "feat");
        assert.equal(commitObjects[0].parsedCommitMessage.header.scope, "replacements");
        assert.equal(commitObjects[0].hScope, "replacements");
        assert.equal(commitObjects[0].parsedCommitMessage.header.subject, "More consistent replacements");
        assert.equal(commitObjects[0].hSubject, "More consistent replacements");
        assert.equal(commitObjects[0].parsedCommitMessage.body, "A sting won\'t be converted to a RegExp");
        assert.equal(commitObjects[0].b, "A sting won\'t be converted to a RegExp");
        assert.equal(commitObjects[0].parsedCommitMessage.footer, "BREAKING CHANGE: Test");
        assert.equal(commitObjects[0].f, "BREAKING CHANGE: Test");
        assert.equal(commitObjects[0].origin, "origin");
        assert.equal(commitObjects[0].o, "origin");

        // Last invalid commit
        assert.equal(commitObjects[6].parsedCommitMessage.header.type, "");
        assert.equal(commitObjects[6].hType, "");
        assert.equal(commitObjects[6].parsedCommitMessage.header.scope, "");
        assert.equal(commitObjects[6].hScope, "");
        assert.equal(commitObjects[6].parsedCommitMessage.header.subject, "Initial commit");
        assert.equal(commitObjects[6].hSubject, "Initial commit");
        assert.equal(commitObjects[6].parsedCommitMessage.body, "Invalid body");
        assert.equal(commitObjects[6].b, "Invalid body");
        assert.equal(commitObjects[6].parsedCommitMessage.footer, null);
        assert.equal(commitObjects[6].f, null);
        assert.equal(commitObjects[6].origin, "origin");
        assert.equal(commitObjects[6].o, "origin");
    });

    // Interpolate 
    it('interpolate', function(){
        assert.equal(commitsToObject.interpolate("%_o", {o: "origin"}), "origin");
    });
    it('interpolate not found', function(){
        assert.equal(commitsToObject.interpolate("%_ox", {o: "origin"}), "%_ox");
    });
    it('interpolate with fallback', function(){
        assert.equal(commitsToObject.interpolate("%_o", {}, "fallback"), "fallback");
    });

    // Multiple replace
    it('multipleReplace simple string', function(){
        let commitObject = commitsToObject.commitToObject(rawCommits[0], "origin", true);
        let replacementArray = [
            {
                replace: "sting",
                substring:'string'
            }
        ]

        let replacedBody = commitsToObject.multipleReplace(commitObject.b, JSON.stringify(replacementArray));
        assert.equal(replacedBody, "A string won\'t be converted to a RegExp");
    });
    it('multipleReplace multiple simple string', function(){
        let commitObject = commitsToObject.commitToObject(rawCommits[0], "origin", true);
        let replacementArray = [
            {
                replace: "sting",
                substring:'string'
            },
            {
                replace: "ring",
                substring:'rung'
            },
            {
                replace: "a",
                substring:'_'
            },
            {
                replace: "e",
                substring:'_'
            },
            {
                replace: "i",
                substring:'_'
            },
            {
                replace: "o",
                substring:'_'
            }
        ]

        let replacedBody = commitsToObject.multipleReplace(commitObject.b, JSON.stringify(replacementArray));
        assert.equal(replacedBody, "A strung w_n't b_ c_nv_rt_d t_ _ R_gExp");
    });
    it('multipleReplace \\n string', function(){
        let commitObject = commitsToObject.commitToObject(rawCommits[1], "origin", true);
        let replacementArray = [
            {
                replace: "\n",
                substring:'\nNL'
            }
        ]

        let replacedBody = commitsToObject.multipleReplace(commitObject.b, JSON.stringify(replacementArray));
        assert.equal(replacedBody, "Body\nNLBody2");
    });
    it('multipleReplace simle RegExp', function(){
        let commitObject = commitsToObject.commitToObject(rawCommits[1], "origin", true);
        
        let replacedBody = commitsToObject.multipleReplace(commitObject.b, "[{replace: /ody/g,substring:'acon'}]");
        assert.equal(replacedBody, "Bacon\nBacon2");
    });
    it('multipleReplace \\n RegExp', function(){
        let commitObject = commitsToObject.commitToObject(rawCommits[1], "origin", true);

        let replacedBody = commitsToObject.multipleReplace(commitObject.b, "[{replace: /.*\\n/g,substring:'Firstline ->'}]");
        assert.equal(replacedBody, "Firstline ->Body2");
    });
    it('multipleReplace group replace RegExp', function(){
        let commitObject = commitsToObject.commitToObject(rawCommits[1], "origin", true);
        
        let replacedBody = commitsToObject.multipleReplace(commitObject.b, "[{replace: /(ody)/g,substring:'acon-b$1'}]");
        assert.equal(replacedBody, "Bacon-body\nBacon-body2");
    });
});

// describe('', function() {
//     it('', function(){
//         assert.equal("a", "a");
//     })
// });