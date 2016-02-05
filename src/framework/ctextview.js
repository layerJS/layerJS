'use strict';
var CobjView = require('./cobjview.js');
var CtextData = require('./ctextdata.js');
var pluginManager = require('./pluginmanager.js');
var Kern = require('../kern/Kern.js');

/**
 * A View which can render images
 * @param {CtextData} dataModel
 * @param {object}        options
 * @extends CobjView
 */
var CtextView = CobjView.extend({
    constructor: function (dataModel, options) {
        options = options || {};
        
        CobjView.call(this, dataModel, Kern.Base.extend({}, options, { noRender: true }));

        if (!options.noRender && (options.forceRender || !options.el))
            this.render();
    },
    render: function (options) {
        var attr = this.data.attributes,
            diff = this.data.changedAttributes || this.data.attributes,
            el = this.el;

        CobjView.prototype.render.call(this, options);

        if ('content' in diff) {
            el.innerHTML = attr.content;
        }
    }

}, {
        Model: CtextData
    });

pluginManager.registerType('text', CtextView);
module.exports = CtextView;
