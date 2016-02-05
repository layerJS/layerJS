'use strict';
var pluginManager = require('./pluginmanager.js');
var layoutManager = require('./layoutmanager.js');
var LayerData = require('./layerdata.js');
var CGroupView = require('./cgroupview.js');
var Kern = require('../kern/Kern.js');

/**
 * A View which can have child views
 * @param {LayerData} dataModel
 * @param {object}        options
 * @extends CGroupView
 */
var LayerView = CGroupView.extend({
    constructor: function (dataModel, options) {
        options = options || {};
        this.frames = {};
        debugger;
        this.layout = new (layoutManager.get(dataModel.attributes.layoutType))(this);
        
        CGroupView.call(this, dataModel, Kern.Base.extend({}, options, { noRender: true }));

        this.stage = this.parent;

        if (!options.noRender && (options.forceRender || !options.el))
            this.render();
    },
    /**
     * transform to a given frame in this layer with given transition
     *
     * @param {string} framename - (optional) frame name to transition to
     * @param {Object} transition - (optional) transition object
     * @returns {Type} Description
     */
    transformTo: function (framename, transition) {
        // is framename is omitted?
        if (typeof framename === 'object') {
            transition = framename;
            framename = transition.frame;
        };
        transition = transition || {};
        framename = framename || transition.framename;
        if (!framename) throw "transformTo: no frame given";
        var frame = this.frames[framename];
        if (!frame) throw "transformTo: " + framename + " does not exist in layer";

    }
}, {
        Model: LayerData
    });

pluginManager.registerType('layer', LayerView);

module.exports = LayerView;
