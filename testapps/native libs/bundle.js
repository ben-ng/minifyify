;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var process=require("__browserify_process");function filter(a,c){for(var b=[],d=0;d<a.length;d++)c(a[d],d,a)&&b.push(a[d]);return b}function normalizeArray(a,c){for(var b=0,d=a.length;0<=d;d--){var g=a[d];"."==g?a.splice(d,1):".."===g?(a.splice(d,1),b++):b&&(a.splice(d,1),b--)}if(c)for(;b--;b)a.unshift("..");return a}var splitPathRe=/^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;
exports.resolve=function(){for(var a="",c=!1,b=arguments.length;-1<=b&&!c;b--){var d=0<=b?arguments[b]:process.cwd();"string"===typeof d&&d&&(a=d+"/"+a,c="/"===d.charAt(0))}a=normalizeArray(filter(a.split("/"),function(a){return!!a}),!c).join("/");return(c?"/":"")+a||"."};exports.normalize=function(a){var c="/"===a.charAt(0),b="/"===a.slice(-1);(a=normalizeArray(filter(a.split("/"),function(a){return!!a}),!c).join("/"))||c||(a=".");a&&b&&(a+="/");return(c?"/":"")+a};
exports.join=function(){var a=Array.prototype.slice.call(arguments,0);return exports.normalize(filter(a,function(a,b){return a&&"string"===typeof a}).join("/"))};exports.dirname=function(a){return(a=splitPathRe.exec(a)[1]||"")?1===a.length?a:a.substring(0,a.length-1):"."};exports.basename=function(a,c){var b=splitPathRe.exec(a)[2]||"";c&&b.substr(-1*c.length)===c&&(b=b.substr(0,b.length-c.length));return b};exports.extname=function(a){return splitPathRe.exec(a)[3]||""};
exports.relative=function(a,c){function b(a){for(var b=0;b<a.length&&""===a[b];b++);for(var c=a.length-1;0<=c&&""===a[c];c--);return b>c?[]:a.slice(b,c-b+1)}a=exports.resolve(a).substr(1);c=exports.resolve(c).substr(1);for(var d=b(a.split("/")),g=b(c.split("/")),f=Math.min(d.length,g.length),h=f,e=0;e<f;e++)if(d[e]!==g[e]){h=e;break}f=[];for(e=h;e<d.length;e++)f.push("..");f=f.concat(g.slice(h));return f.join("/")};exports.sep="/";

},{"__browserify_process":2}],2:[function(require,module,exports){
var process=module.exports={};process.nextTick=function(){if("undefined"!==typeof window&&window.setImmediate)return function(a){return window.setImmediate(a)};if("undefined"!==typeof window&&window.postMessage&&window.addEventListener){var b=[];window.addEventListener("message",function(a){a.source===window&&"process-tick"===a.data&&(a.stopPropagation(),0<b.length&&b.shift()())},!0);return function(a){b.push(a);window.postMessage("process-tick","*")}}return function(a){setTimeout(a,0)}}();
process.title="browser";process.browser=!0;process.env={};process.argv=[];process.binding=function(b){throw Error("process.binding is not supported");};process.cwd=function(){return"/"};process.chdir=function(b){throw Error("process.chdir is not supported");};

},{}],3:[function(require,module,exports){
var submodule=require("./submodule"),path=require("path"),myString;myString=submodule.createString(function(){return path.join("highway","to","hell")});myString=path.join(myString,"stairway","to","heaven");console.log(myString);

},{"./submodule":4,"path":1}],4:[function(require,module,exports){
var createString=function(c){for(var a=[],b=0;3>b;b++)a.push(c());return a.join()};module.exports={createString:createString};

},{}]},{},[3])
;;;
//@ sourceMappingURL=bundle.map
