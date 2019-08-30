const uuid = require('uuid/v4');
const path = require('path');
const fs = require('fs');
const process = require('child_process');
const execSync = process.execSync;
const config = require('../config');
const download = require('download');

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

const exec = async (body) => {
  const workspaceId = uuid();
  const workspaceDir = path.resolve(config.cache, workspaceId);
  try {
    execSync(`mkdir -p ${workspaceDir}`);

    downloadAssets = [];
    downloadAssets.push({
      url: body.video,
      savePath: `${workspaceDir}/video.mp4`
    });

    const headerImgType = body.header.split('.').pop();
    const headerImg = `header.${headerImgType}`;
    downloadAssets.push({
      url: body.header,
      savePath: `${workspaceDir}/${headerImg}`
    });

    const footerImgType = body.footer.split('.').pop();
    const footerImg = `footer.${footerImgType}`;
    downloadAssets.push({
      url: body.footer,
      savePath: `${workspaceDir}/${footerImg}`
    });

    await downloadFun(downloadAssets);

    // generate blank background image
    let command = `convert -size 480x854 xc:"#fff" ${workspaceDir}/bg.png`;
    execSync(command);

    // combine header image
    command = `convert ${workspaceDir}/bg.png -compose over ${workspaceDir}/${headerImg} -geometry 480x124+0+0 -composite ${workspaceDir}/temp.png`;
    execSync(command);

    // combine footer image
    command = `convert ${workspaceDir}/temp.png -compose over ${workspaceDir}/${footerImg} -geometry 480x250+0+604 -composite ${workspaceDir}/video-bg.png`;
    execSync(command);


    // render video
    command = `// ffmpeg -i ${workspaceDir}/video-bg.png -i ${workspaceDir}/video.mp4 -filter_complex "[1:v]scale=480:-1[fg];[0:v][fg]overlay=0:124" ${workspaceDir}/output.mp4`;
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
