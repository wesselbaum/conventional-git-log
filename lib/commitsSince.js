const fs = require('fs');
const gitRawCommits = require('git-raw-commits');

exports.commitsSince = async function (since, format) {
  const packageJson = JSON.parse(fs.readFileSync('./package.json'));
  const lastVersionTag = 'v' + (packageJson.version);

  since = since === "package" ? lastVersionTag : since;

  let rawCommits = [];
  let stream = gitRawCommits({

    format: format,
    from: since
  });


  return new Promise(function (resolve) {
    stream.on('data', function (chunk) {
      rawCommits.push(chunk.toString());
    });

    stream.on('end', function () {
      resolve(rawCommits);
    });


  });

};

