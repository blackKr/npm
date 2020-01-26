'use strict';
const merge = require('webpack-merge');
const prodEnv = require('./prod.env');

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"'
  ,BASE_API: '"http://api.2.1.dev.grdoc.org"'
  ,ENV_CONFIG: '"dev"'
  ,XMAP_URL: '"http://xmap.oss-cn-shenzhen.aliyuncs.com"'
  ,END_POINT: '"oss-cn-qingdao.aliyuncs.com"'
  ,OSS_LOCK_BUCKET: '"homedoctor"'
  ,OSS_FOLDER: '"images"'
});

// module.exports = {
//   NODE_ENV: '"development"'
//   ,BASE_API: '"http://api.2.1.beta.grdoc.org"'
//   ,ENV_CONFIG: '"prod"'
//   ,XMAP_URL: '"http://xmap.oss-cn-shenzhen.aliyuncs.com"'
//   ,END_POINT: '"oss-cn-qingdao.aliyuncs.com"'
//   ,OSS_LOCK_BUCKET: '"homedoctor"'
//   ,OSS_FOLDER: '"images"'
// };
