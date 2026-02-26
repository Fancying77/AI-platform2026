# 1、统一登录站点URL

科技环境：https://oa.fenqile.com/passport


# 2、消费ticket

科技环境：https://oa.fenqile.com/auth/ticket_auth.json


**method :  GET**

**请求参数说明**

|参数|类型|传递|示例|必须|说明|
|:----|:----|:----|:----|:----|:----|
|ticket|string|GET 请求体|0a803130db9995542f16603c0089a094|是|当前登录 ticket|
|ip|string|GET 请求体|127.0.0.1|是|客户端 IP|
|timestamp|number|HEADER 请求头|1529055300|是|当前时间戳|
|rand|number|HEADER 请求头|92731603500|是|随机数|
|appid|number|HEADER 请求头|13037645|是|应用 ID|
|token|string|HEADER 请求头|0a803130db9995542f16603c0089a094|是|密钥|

**请求****参数****示例**

```plain
https://oa.fenqile.com/auth/ticket_auth.json?ticket=0a803130db9995542f16603c0089a094&ip=127.0.0.1
```
**响应参数说明**
|字段名|类型|描述|
|:----|:----|:----|
|retcode|integer|响应码 0 标识成功；其他响应码均为失败|
|retmsg|String|响应描述|
|result_rows|object|响应体|
|min|String|英文名|
|mid|String|mid|
|name|String|中文名|
|mobile|String|电话|

**响应参数示例**

```plain
{
  "retcode": 0,
  "retmsg": "ok",
  "result_rows": {
          "min": "eysonyou",
          "mid": "13",
          "name": "尤燕森",
         
  }
}
```
 
# 3、退出登录

科技环境：[https://oa.fenqile.com/auth/login_out.json](https://oa.fenqile.com/auth/login_out.json)


**method :  GET**

**请求参数说明**

|参数|类型|传递|示例|必须|说明|
|:----|:----|:----|:----|:----|:----|
|url|string|GET请求参数|url=http://ewew.com|否|登出后跳转passport并携带的redirect|

**请求参数示例**

```plain
https://oa.fenqile.com/auth/login_out.json?url=http://ewew.com
```
**响应参数说明**
|字段名|类型|描述|
|:----|:----|:----|
|retcode|integer|响应码 0 标识成功；其他响应码均为失败|
|retmsg|String|响应描述|

**响应参数示例**

```plain
{
  "retcode": 0,
  "retmsg": "success"
}
```


