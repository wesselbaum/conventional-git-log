exports.groupCommits = function (commitObjects, groupRegex) {


  if (groupRegex === undefined) {
    console.warn("Failed reading groupRegex " + groupRegex + ". Will be replaced with [{regex: /.*/,headline: 'All commits'}]");
    return commitObjects;
  }

  let commitObjectGroups = {};
  for (let i = 0; i < groupRegex.length; i++) {
    commitObjectGroups[groupRegex[i].headline] = [];
  }
  for (let i = 0; i < commitObjects.length; i++) {
    for (let j = 0; j < groupRegex.length; j++) {

      if (groupRegex[j].searchValue.test(commitObjects[i].commitBody)) {
        commitObjectGroups[groupRegex[j].headline].push(commitObjects[i]);
        break;
      }
    }
  }

  return commitObjectGroups;
};