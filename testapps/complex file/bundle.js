;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var submodule=require("./submodule"),myString;myString=submodule.createString(function(){return"potato #26740"});console.log(myString);

},{"./submodule":2}],2:[function(require,module,exports){
var subsubmodule=require("./subsubmodule");module.exports={createString:function(a){var b,c;b=subsubmodule.getTheDate(function(){return["fried","baked","sliced"].join(a())});c=a();return b+" "+c}};

},{"./subsubmodule":3}],3:[function(require,module,exports){
var getTheDate=function(a){return"Wed Dec 31 1969 22:30:23 GMT-0800 (PST) "+a()};module.exports={getTheDate:getTheDate};

},{}]},{},[1])
;;;
//@ sourceMappingURL=bundle.map
