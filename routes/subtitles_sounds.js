const uuid = require('uuid/v4');
const convert = require('./convert');
const WavFileInfo = require('wav-file-info');
const path = require('path');
const fs = require('fs');
const process = require('child_process');
const execSync = process.execSync;
const config = require('../config');
const download = require('download');

const textToSpeechTemplate = {
  text: '',
  lang: 'zh-CN',
  gender: 'Female',
  name: 'zh-CN-XiaoxiaoNeural',
  fileId: uuid()
};

function downloadFun (assets)  {
    let downloadPromises = [];

    assets.forEach(a => {
        const promise = new Promise((resolve, reject) => {
            let stream = download(a.url).pipe(fs.createWriteStream(a.savePath));
            stream.on('finish', () => {
                    resolve(true);
            });
            stream.on('error', (err) => {
                reject(err);
            });
        });

        downloadPromises.push(promise);
    });

    return Promise.all(downloadPromises);
}

const getWavDetail = (file) => {
  return new Promise((resolve, reject) => {
     file = path.resolve(file);
     WavFileInfo.infoByFilename(file, function(err, info){
       if (err) {
          return reject(err);
       }
       return resolve(info);
     });
  });
}

const transferTs = (ts) => {
  const time = new Date(parseInt(ts));

  return `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()},${time.getMilliseconds()}`;
  //return time.format('hh:mm:ss.S');
}

const generateSrt = (list, file) => {
  for (let i=0; i<list.length; i++) {
    const subtitle = list[i];
    const startTime = transferTs(subtitle.ts);
    const endTime = transferTs(subtitle.lts);
  
    if ( i !== 0 ) {
      fs.appendFileSync(file, '\n');
    } 
    fs.appendFileSync(file, i + 1);
    fs.appendFileSync(file, '\n');
    fs.appendFileSync(file, `${startTime} --> ${endTime}`);
    fs.appendFileSync(file, '\n');
    fs.appendFileSync(file, subtitle.text);
    fs.appendFileSync(file, '\n');
  }

  return file; 
}

const generateSound = async (list, file, workspaceDir) => {
  let lastSubtitle = {
    text: '',
    lang: 'zh-CN',
    gender: 'Female',
    name: 'zh-CN-XiaoxiaoNeural',
    fileId: '',
    duration: 0,
    ts: '01',
    lts: '0'
  }

  let command = `sox -n -r 24000 -b 16 -c 1 -L ${file} trim 0.0 00.001`;
  execSync(command)
  const tempWavFile = workspaceDir + '/tempWavFile.wav';
  const tempNewWavFile = workspaceDir + '/tempNewWavFile.wav';
  for (let i=0; i<list.length; i++) {
    const subtitle = list[i];
    const lastTime = parseInt(lastSubtitle.duration * 1000) + parseInt(lastSubtitle.ts);
    const startTime = parseInt(subtitle.ts);
    const differTime = startTime - lastTime;
    if (differTime > 0) {
      const tempTime = new Date(differTime);

      const tempTimeStr = `${tempTime.getSeconds()}.${tempTime.getMilliseconds()}`;
      command = `sox -n -r 24000 -b 16 -c 1 -L ${tempWavFile} trim 0.0 ${tempTimeStr}`;
      execSync(command);
    
      command = `sox ${file} ${tempWavFile} ${tempNewWavFile}`;
      execSync(command);
      execSync(`rm -rf ${tempWavFile}`);

      command = `rm -rf ${file} && mv ${tempNewWavFile} ${file}`;
      execSync(command);
    }
    
    const subtitleSound = `${workspaceDir}/${subtitle.fileId}.wav`
    command = `sox ${file} ${subtitleSound} ${tempNewWavFile}`;
    execSync(command);
    command = `rm -rf ${file} && mv ${tempNewWavFile} ${file}`;
    execSync(command);
    lastSubtitle = subtitle;
  }
}

const wait = (ts) => {
  return new Promise((resolve) => {
    setTimeout(() => {resolve(true)}, ts);
  });
}

const exec = async (videoUrl, subtitlesBody) => {
  const subtitles = [];
  const workspaceId = uuid();
  const workspaceDir = path.resolve(config.cache, workspaceId);
  const inputVideo = `${workspaceDir}/input.mp4`;
  try {	 
    execSync(`mkdir -p ${workspaceDir}`);
    const downloadBody = {
      url: videoUrl,
      savePath: inputVideo,
    };
    await downloadFun([downloadBody]);
  
    for (let i=0; i<subtitlesBody.length; i++) {
      const body = {...textToSpeechTemplate};
      const data = subtitlesBody[i];
      body.fileId = uuid();
      body.text = data.text;
      await convert(body);

      // mv wav file to workspace dir
      const tempWavFile = path.resolve(__dirname, '../public/' + body.fileId + '.wav');
      execSync(`mv ${tempWavFile} ${workspaceDir}`);

      await wait(100); // wait 100ms for flush video stream buffer to disk
      const wavInfos = await getWavDetail(`${workspaceDir}/${body.fileId}.wav`);
      body.duration = wavInfos.duration;
      subtitles.push({...body, ...data});
    }
    const srtFile = `${workspaceDir}/output.srt`;
    const wavFile = `${workspaceDir}/output.wav`;
    generateSrt(subtitles, srtFile);
    generateSound(subtitles, wavFile, workspaceDir);
    const outputVideo = `${workspaceDir}/output_temp.mp4`;
    let command = `ffmpeg -i ${inputVideo} -vf subtitles=${srtFile} ${outputVideo}`;
    execSync(command);

    // delete original volume/sound track
    const muteVideo = `${workspaceDir}/tempMuteVideo.mp4`;
    command = `ffmpeg -i ${outputVideo} -c copy -an ${muteVideo}`;
    execSync(command);
    command = `rm -rf ${outputVideo} && mv ${muteVideo} ${outputVideo}`;
    execSync(command);

    // mix person sounds
    const finalVideo = `${workspaceDir}/output.mp4`;
    command = `ffmpeg -i ${outputVideo} -i ${wavFile} ${finalVideo}`;
    execSync(command);
    return {
      workspaceId,
      workspaceDir
    };
  } catch (e) {
    throw e;
  } finally {
    //execSync(`rm -rf ${workspaceDir}`);
  }
} 

module.exports = exec;
