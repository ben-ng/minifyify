var Backbone = require('backbone')
  , $ = require('../libraries/Jquery')
  , _ = require('lodash')
  , tmpl = require('./view.hbs')
  , View;

View = Backbone.View.extend({
  template: tmpl
, render: function () {
    this.el.innerHTML = (this.template({message: 'Hello From View Line 5'}));

    return this;
  }
});

module.exports = View;
