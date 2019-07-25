# Text To Speech 





## 说明

* 此应用是基于微软的 [Text To Speech](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/text-to-speech) api





### 重要环境ENV

```bash
API_KEY:  微软Text To Speech 服务secret key
SOURCE_NAME: 在portal.azure.com 里面All resources 名称
REGION: 使用地区

# MINIO configures
SEND_TO_CLOUD: process.env.SEND_TO_CLOUD || false,
MINIO_END_POINT:  process.env.MINIO_END_POINT || '',
MINIO_PORT:  process.env.MINIO_END_POINT || 9000,
MINIO_ACCESS_KEY:  process.env.MINIO_ACCESS_KEY || '',
MINIO_SECRET_KEY:  process.env.MINIO_SECRET_KEY || '',
MINIO_SAVE_BUCKET:  process.env.MINIO_SAVE_BUCKET || 'xieluntest',
MINIO_USE_SSL: process.env.MINIO_USE_SSL ? process.env.MINIO_USE_SSL : false
```



### 调用[API]()

```bash
POST http://hostname:3000/

parameters: 
	{
		text: string, content,

    // 下面的看微软的API参数 https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support#text-to-speech
    lang: string, 对应微软的API的 "Locale", eg/default: "zh-CN"
    gender: string, 对应微软的API的 "Gender", eg/defalt: "Male"
    name: string, 对应微软的API的 "Short voice name", eg/defalt: "zh-CN-Kangkang-Apollo"
	}

```





### video添加音频、字幕API

```bash
POST http://hostname:3000/dub

parameters: 
	video: string, video url,
	subtitles: [{
		ts: int, 字幕开始时间(毫秒／ms),
		lts: int 字幕结束时间(毫秒／ms),
		text: string 字幕内容
	}]

```
#### 请求事例
```json
{
	"video":"https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4", 		"subtitles": [{
    "ts": "100",
    "lts": "2000",
    "text": "新的一天开始了"
}, {
		"ts": "3500",
    "lts": "4600",
    "text": "好困呀"
}, {
		"ts": "5000",
		"lts": "7000",
    "text": "出去走走看"
}, {
		"ts": "8000",
		"lts": "11000",
    "text": "今天的天气不错呦"
}, {
		"ts": "13000",
    "lts": "14500",
    "text": "什么东西那么好闻"
}, {
		"ts": "15000",
		"lts": "17000",
    "text": "咦, 好漂亮的花朵, 过去瞧瞧"
}, {
		"ts": "19000",
    "lts": "22000",
    "text": "嗯, 好香"
}, {
		"ts": "24000",
    "lts": "26000",
    "text": "爽~嗨翻天了"
}]}
```



Maintainer: [anxing](anxing131@gmail.com)
