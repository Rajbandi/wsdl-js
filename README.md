MIT License

Copyright (c) [2016] [Raj Bandi]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

#WSDL-JS

WSDL-JS is entirely written javascript WSDL-JS downloads and parses a remote wsdl in javascript. To overcome CORS related issues with remote api, WSDL-JS depends on socket-fetch library which uses http socket connections instead of Ajax XMLHttpRequest. To Parse xml to json, it uses X2JS library. 

Example

Add the following in the head section
```
<link rel="import" href="/socket-fetch/socket-fetch.html">
<script src="/abdmob/x2js/xml2json.min.js"></script>
```
Use below code to download and parse wsdl. 
```
 var w = new wsdl(apiService);
            w.load().then(function () {
                w.createRequests();
                //to get operations
                var operations = w.operations;
                
               }
```



