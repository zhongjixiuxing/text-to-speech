const config = require('../config');
const Minio = require('minio');

class MinioClient {
    constructor() {
    }

    init () {
        this._minio = new Minio.Client({
            endPoint: config.s3.MINIO_END_POINT,
            port: config.s3.MINIO_PORT,
            useSSL: config.s3.MINIO_USE_SSL,
            accessKey: config.s3.MINIO_ACCESS_KEY,
            secretKey: config.s3.MINIO_SECRET_KEY,
        });
    }

    /***
     *
     * @package {String} source
     * @package {String} target, notice: this s3 full path, include file name
     * @package {Function} cb upload callback
     */
    async upload(source, target) {
        if (!this._minio) {
            this.init();
        }
        return await this.uploadWithBucket(config.s3.MINIO_SAVE_BUCKET, source, target);
    }

    async uploadWithBucket(bucket, source, target) {
        if (!this._minio) {
            this.init();
        }

        return await new Promise((resolve, reject) => {
            this._minio.fPutObject(bucket, target, source, {}, function (err, etag) {
            if (!err) {
                return resolve(etag);
            }

            return reject(err);
        });
    });
    }
}

const minio = new MinioClient();
module.exports = minio;

