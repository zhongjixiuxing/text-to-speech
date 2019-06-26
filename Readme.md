# Text To Speech 





## 说明

* 此应用是基于微软的 [Text To Speech](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/text-to-speech) api





### 重要环境ENV

```bash
API_KEY:  微软Text To Speech 服务secret key
BASE_URL: 微软的API 路径
```



### 调用API

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






Maintainer: [anxing](anxing131@gmail.com)