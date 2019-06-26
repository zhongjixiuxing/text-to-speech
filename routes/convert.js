const xmlbuilder = require('xmlbuilder');
const rp = require('request-promise');
const fs = require('fs');
const readline = require('readline-sync');

const conf = {
    API_KEY: process.env.API_KEY || '86be3a6be74a4a2da063cc43ad0840a5',
    BASE_URL: process.env.BASE_URL || 'https://westus.tts.speech.microsoft.com/',
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
        uri: 'https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken',
        headers: {
            'Ocp-Apim-Subscription-Key': conf.API_KEY
        }
    }
    return rp(options);
}

// Converts text to speech using the input from readline.
function textToSpeech(accessToken, data) {
    // Create the SSML request.
    const xml_body = xmlbuilder.create('speak')
        .att('version', '1.0')
        .att('xml:lang', data.lang)
        .ele('voice')
        .att('xml:lang', data.lang)
        .att('xml:gender', data.gender)
        .att('name', 'zh-CN-Kangkang-Apollo') // Short name for 'Microsoft Server Speech Text to Speech Voice (en-US, Guy24KRUS)'
        .txt(data.text)
        .end();
    // Convert the XML into a string to send in the TTS request.
    const body = xml_body.toString();

    const options = {
        method: 'POST',
        baseUrl: conf.BASE_URL,
        url: 'cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'User-Agent': 'YOUR_RESOURCE_NAME',
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