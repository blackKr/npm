'use strict';
const merge = require('webpack-merge');
const devEnv = require('./dev.env');

module.exports = merge(devEnv, {
  NODE_ENV: '"production"'
  ,ENV_CONFIG: '"sit"'
  ,BASE_API: '"http://api.2.1.dev.grdoc.org"'
  ,XMAP_URL: '"http://xmap.oss-cn-shenzhen.aliyuncs.com"'
  ,END_POINT: '"oss-cn-qingdao.aliyuncs.com"'
  ,OSS_LOCK_BUCKET: '"homedoctor"'
  ,OSS_FOLDER: '"images"'
});
