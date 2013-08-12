var Ribcage = require('ribcage-view')
  , View = Ribcage.extend({
      template: require('./view.hbs')
    , context: function () {
        return {message: 'Hello From View Line 5'};
      }
    });

module.exports = View;
