const path = require('path');
const process = require('process');
const child_process = require('child_process');
const execSync = child_process.execSync;

// confirm cache dir exists before application runtime 
execSync(`mkdir -p ${path.resolve(__dirname, 'cache')}`);

module.exports = {
  cache: process.env.CACHE_DIR || path.resolve(__dirname, 'cache'), 
  s3: {
    SEND_TO_CLOUD: process.env.SEND_TO_CLOUD || false,
    MINIO_END_POINT:  process.env.MINIO_END_POINT || '',
    MINIO_PORT:  process.env.MINIO_PORT || 9000,
    MINIO_ACCESS_KEY:  process.env.MINIO_ACCESS_KEY || '',
    MINIO_SECRET_KEY:  process.env.MINIO_SECRET_KEY || '',
    MINIO_SAVE_BUCKET:  process.env.MINIO_SAVE_BUCKET || 'xieluntest',
    MINIO_USE_SSL: process.env.MINIO_USE_SSL ? process.env.MINIO_USE_SSL : false
  }
}
