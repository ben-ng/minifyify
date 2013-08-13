var envoy = require('envoy')
  , s3options = {
      key: process.env.S3_KEY
    , secret: process.env.S3_SECRET
    , bucket: 'travisci'
    , region: 'us-east-1'
    };

try {
  s3options = require('./secrets.json');
}
catch (e) {}

module.exports = function (folder, cb) {
  envoy.deployFolder(folder, 's3', s3options, cb);
};
