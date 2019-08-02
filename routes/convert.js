const xmlbuilder = require('xmlbuilder');
const rp = require('request-promise');
const fs = require('fs');
const readline = require('readline-sync');

const conf = {
    API_KEY: process.env.API_KEY || 'a0cf201cdd2e416b9e3b45c0f2ff5048',
    SOURCE_NAME: process.env.SOURCE_NAME || 'testspeech',
    REGION: process.env.REGION || 'southeastasia'
};

let token = null;
// 9min 刷新一次token, 失败直接结束应用
setInterval(() => {
    refreshToken();
}, 540000);

/***
 *
 data: {
    text: string, content,

    // 下面的看微软的API参数 https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support#text-to-speech
    lang: string, 对应微软的API的 "Locale"
    gender: string, 对应微软的API的 "Gender"
    name: string, 对应微软的API的 "Short voice name"
 }
 *
 */
async function convert (data) {
    // Prompts the user to input text.
    //const text = readline.question('您好？你是谁？');

    try {
        if (!token) {
            await refreshToken();
        }

        await textToSpeech(token, data);
    } catch (err) {
        console.log(`Something went wrong: ${err}`);
    }
}

async function refreshToken() {
    try {
        token = await getAccessToken(conf.API_KEY);
        if (!token) {
            process.exit(1);
        }

        return token;
    } catch (e) {
        console.error('refresh token error : ', e);
        process.exit(1);
    }
}
    // Gets an access token.
function getAccessToken(subscriptionKey) {
    const options = {
        method: 'POST',
        uri: `https://${conf.REGION}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`,
        headers: {
            'Ocp-Apim-Subscription-Key': conf.API_KEY
        }
    };

    return rp(options);
}

// Converts text to speech using the input from readline.
function textToSpeech(accessToken, data) {
    // Create the SSML request.
    const xml_body = xmlbuilder.create('speak')
        .att('version', '1.0')
        .att('xmlns', 'https://www.w3.org/2001/10/synthesis')
        .att('xmlns:mstts', 'https://www.w3.org/2001/mstts')
        .att('xml:lang', data.lang)
        .ele('voice')
        .att('xml:lang', data.lang)
        .att('xml:gender', data.gender)
        .att('name', data.name) // Short name for 'Microsoft Server Speech Text to Speech Voice (en-US, Guy24KRUS)'
        .ele('mstts:express-as')
        .att('type', data.type)
        .txt(data.text)
        .end();
    let body = xml_body.toString();

    // transfer encode character
    body = body.replace('&lt;', '<');
    body = body.replace('&gt;', '>');

    const options = {
        method: 'POST',
        baseUrl: `https://${conf.REGION}.tts.speech.microsoft.com/`,
        url: 'cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'User-Agent': conf.SOURCE_NAME,
            'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
            'Content-Type': 'application/ssml+xml'
        },
        body: body
    };

    const request = rp(options)
        .on('response', (response) => {
                if (response.statusCode === 200) {
                request.pipe(fs.createWriteStream(__dirname + '/../public/' + data.fileId + ".wav"));
                console.log('\nYour file is ready.\n')
            }
        });
    return request;
}

module.exports = convert;
