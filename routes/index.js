var express = require('express');
var router = express.Router();
const convert = require('./convert');
const subtitlesSoundExec = require('./subtitles_sounds');
const uuid = require('uuid/v4');
const minio = require('./minio');
const config = require('../config');

/* GET home page. */
router.post('/', async function(req, res, next) {
  try {
      console.log('req.body : ', req.body);
      const data = {
        text: req.body.text,
        lang: req.body.lang || 'zh-CN',
        gender: req.body.gender || 'Male',
        name: req.body.name || 'zh-CN-Kangkang-Apollo',
        fileId: uuid()
      };

      await convert(data);
      res.json({ err: null, data: '/' + data.fileId + '.wav' });
  } catch (e) {
      console.error('Unknow Error : ', e);
      res.json({ err: 'ServerError' });
  }
});

router.post('/dub', async function(req, res, next) {
  try {
    console.log('req.body : ', req.body);
    const result = await subtitlesSoundExec(req.body.video, req.body.subtitles);
    if (config.s3.SEND_TO_CLOUD || true) {
      const uploadFile = `dub/${result.workspaceId}.mp4`;
      await minio.upload(`${result.workspaceDir}/output.mp4`, uploadFile);
      result.url = `${config.s3.MINIO_SAVE_BUCKET}/${uploadFile}`;
    }

    res.json({ err: null, data: result });
  } catch (e) {
      console.error('Unknow Error : ', e);
      res.json({ err: 'ServerError' });
  }
})

module.exports = router;
