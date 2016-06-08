var xhr = require('xhr-browserify');
var uri = require('url').parse('https://www.google.com.au', true);
 
xhr(uri, { jsonp: true }, function(err, data) {
 // console.log(data);
});
 