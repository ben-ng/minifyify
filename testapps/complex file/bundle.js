;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var submodule=require("./submodule"),myString;myString=submodule.createString(function(){var r=20;return r*=1337,"potato #"+r}),console.log(myString);
},{"./submodule":2}],2:[function(require,module,exports){
var subsubmodule=require("./subsubmodule");module.exports={createString:function(r){var e,u;return e=subsubmodule.getTheDate(function(){var e;return e=["fried","baked","sliced"],e.join(r())}),u=r(),e+" "+u}};
},{"./subsubmodule":3}],3:[function(require,module,exports){
var getTheDate=function(e){var r=e();return"Wed Dec 31 1969 22:30:23 GMT-0800 (PST) "+r};module.exports={getTheDate:getTheDate};
},{}]},{},[1])
;;;
//@ sourceMappingURL=bundle.map
