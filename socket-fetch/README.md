# Socket fetch

The HTTP client transport based on [chrome.sockets.tcp] API.

## Getting started
Bower the library
```
bower install socket-fetch
```
And import it into your project using web components.
```html
<link rel="import" href="bower-components/socket-fetch/socket-fetch.html">
```
Now you can use following classes:
* ArcEventTarget
* ArcEventSource
* ArcRequest
* ArcResponse
* SocketFetch
* HttpParser

The Arc prefix comes from [Advanced Rest Client] project.

## usage

Basically you need a resource you want to fetch:
```
var url = 'http://www.google.com';
```
You can set up some headers if you wish.
This implementation will not set any default headers so if you don't do it the request will not contain them.
```
var headers = {
  'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Encoding':'gzip, deflate, sdch',
  'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2652.0 Safari/537.36'
};
```
By default the implementation will use `GET` method and will follow redirects.
```
var init = {
  'method': 'GET',
  'headers': new Headers(headers),
  'redirect': 'follow'
};
```
And finally you just need to fetch the resource:
```
var connection = new SocketFetch(url, opts);
connection.fetch()
.then((response) => {
  if (response.ok) {
    response.text().then((result) => {
      console.log('Fetch result', result);
    })
    .catch((cause) => {
      console.error('Error during fetch', cause);
    });
  }
})
.catch((cause) => {
   console.error('Error during fetch', cause);
});
```

If you want to send data use `body` property in `init` object:
```
var payload = JSON.stringify({
  'test': 'request'
});
var headers = {
  'Content-Type': 'application/json',
  'Content-Length': payload.length
};
var init = {
  'method': 'POST',
  'headers': new Headers(headers),
  'body': payload
};
```
You can send body of type of Blob, BufferSource, FormData, URLSearchParams, or String.

## ArcRequest
The ArcRequest class is similar to JavaScript's Request class. You can initialize it the same way as regular Request class.

### Initialization
Initialize as Request object. The first parameter can be `String`, `Request` or `ArcRequest` object.
Second argument may have following options:

| Name | Type | Description | Default |
| --- | --- | --- | --- |
| method | String | The request method, e.g., GET, POST. | `GET` |
| headers | Headers or Object | Any headers you want to add to your request, contained within a Headers object or an object literal with key value pairs. Note that the library will not generate default headers. If none headers are passed it will not send headers in the request. | _none_ |
| body | Blob, BufferSource, FormData, URLSearchParams, or String | Any body that you want to add to your request. Note that the body will be removed if the request's method is either `GET` or `HEAD` | _none_ |
| redirect | String | The redirect mode to use: follow or error. If follow is set the result will contain redairect information. | `follow` |
| timeout | Number | A number of milliseconds for connection timeout. Note that the timer run at the moment when connection was established. | _none_ |


## Bonus in ArcResponse
Regular Response object will not contain all headers in the response. ArcResponse class however will return all received headers from the server - even the prohibited ones. Other properties and methods are inherited from the Response object.

Additionally the ArcResponse will contain two custom fields:
* redirects {Set<ArcResponse>} - A list of responses that lead to redirection
* stats {Set<Object>} - Some stats about the request and response. It is the same as `timings` object in HAR 1.2 specification.

## Import scripts (web workers)
This library uses web workers. Sometimes it is necessary to change import path of the library.
By default the script will look in the '/' path for web workers. However bower or combined scripts
may have been placed in different location so `SocketFetchOptions.importUrl` should be set to
the real path to locate a file.

The decompress worker uses Zlib and Gzip library. It has hardcoded script import to '../zlib/bin/zlib_and_gzip.min.js'. It means that the script will be included from this path relatively to the web worker file location.
In most cases the element will be placed in `bower_components` or `components` folder with other bower elements so it resolve paths correctly. However, if you concat JS files or move the element somewhere else it may be the problem.
In this case you need to move decompression libraries accordingly.

```
/path/to/file/%s
```
Keep the %s. The script will replace it with corresponding file name.

When importing the library as a web component it will guess the correct location of the file and will set up it for you. However if you have difficulties with paths feel free to set up paths on your own.


  [chrome.sockets.tcp]: https://developer.chrome.com/apps/sockets_tcp
  [Advanced Rest Client]: https://github.com/jarrodek/ChromeRestClient
