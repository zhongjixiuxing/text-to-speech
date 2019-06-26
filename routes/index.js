var express = require('express');
var router = express.Router();
const convert = require('./convert');
const uuid = require('uuid/v4');

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

module.exports = router;
