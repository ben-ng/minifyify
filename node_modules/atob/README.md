atob
===

Uses `Buffer` to emulate the exact functionality of the browser's atob.

Note: Unicode may be handled incorrectly (like the browser).

It turns base64-encoded **a**scii data back **to** **b**inary.

    (function () {
      "use strict";
      
      var atob = require('atob')
        , b64 = "SGVsbG8gV29ybGQ="
        , bin = atob(b64)
        ;

      console.log(bin); // "Hello World"
    }());
