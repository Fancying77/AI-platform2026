1. 调用tapd接口
OA封装了一层TAPD接口，使调用方不需要关注TAPD鉴权信息封装，可以按需调用TAPD API。


## http协议

>**办公网环境URL： http://api.oa.fenqile.com/oa/open/front/invoke_tapd.json**
>**Content-Type：application/json**
>**接口说明：api.oa.com是IDC域名，只能在服务器端访问，不支持办公网访问。该接口不需要OA登录态，使用open鉴权方式，在请求参数里需要带上appId、rand、timestamp和token4个参数，接入方式详见《**[OA网关open鉴权接入](https://ledocs.oa.fenqile.com/doc/56a70cf667d95baaefdd069b1c2ec88e)**》。**
### **请求参数说明**

|字段名|类型|是否必传|描述|
|:----|:----|:----|:----|
|appId|Int|是|从[OA网关](https://rd.oa.fenqile.com/#/application)申请获得，之前已经申请过可以复用|
|rand|Int|是|调用方随机生成|
|timestamp|Int|是|当前时间戳（秒）保留10位|
|token|String|是|加密后的值|
|type|String|是|get/post|
|url|String|是|tapd接口url|
|param|Map<String,Object>|是|TAPD入参|

具体的url和param可以参考TAPD API文档：[https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/](https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/)

### **请求参数示例**

```json
{
    "type": "post",
    "url": "https://api.tapd.cn/stories",
    "param": {
        "id": "1120061531001xxx",
        "workspace_id": "200xxx"
    },
    "appid":"",
    "rand":,
    "timestamp":,
    "token":""
}
```
### **响应参数说明**

|字段名|类型|描述|
|:----|:----|:----|
|status|Int|tapd返回的状态 1 请求成功；其他 失败|
|info|String|响应描述，success|
|data|String|响应的数据体|

### **响应参数示例**

```json
成功响应：
{
    "result_rows": [
        {
            "data": "[]",
            "info": "success",
            "status": 1
        }
    ],
    "retmsg": "success",
    "retcode": 0
}
失败响应：
null

```

