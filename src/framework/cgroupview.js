'use strict';
var Kern = require('../kern/Kern.js');
var WL = require('./wl.js');
var pluginManager = require('./pluginmanager.js');
var repository = require('./repository.js');
var CobjView = require('./cobjview.js');
var CGroupData = require('./cgroupdata.js');
/**
 * A View which can have child views
 * @param {CobjGroupData} dataModel
 * @param {object}        options
 * @extends CobjView
 */
var CGroupView = CobjView.extend({
  /**
   * construct a new view of a CobjGroupData
   *
   * @param {CobjData} dataModel - the data model to be used for the view
   * @param {object} options - passed to the Super constructor
   * @returns {this}
   */
  constructor: function(dataModel, options) {
    options = options || {};
    var that = this;
    this.childInfo = {};
    // create listener to child changes. need different callbacks for each instance in order to remove listeners separately from child data objects
    this.myChildListenerCallback = function(model) {
      that._renderChildPosition(that.childInfo[model.attributes.id].view);
    }

    CobjView.call(this, dataModel, Kern._extend({}, options, { noRender: true }));

    this.data.on('change:children', (function() {
      that._buildChildren(); // update DOM when data.children changes
    }).bind(this));
    this._buildChildren();

    if (!options.noRender && (options.forceRender || !options.el))
      this.render();
  },
  /**
   * Syncronise the DOM child nodes with the data IDs in the data's
   * children array.
   *
   * - Create Views for the data models if they haven't been created yet.
   * - Rearrange the child views to match the order of the child IDs
   * - be respectful with any HTML childnodes which are not connected to a data
   * object (i.e. no data-wl-id property); leaves them where they are.
   */
  _buildChildren: function() {


    var that = this;
    var empty;
    var childIds = this.data.attributes.children;
    var k = -1; // index in childNodes;
    var nodeId;
    var _k_nextChild = function() { // find next DOM child node that is a wl-element
      k++;
      while (!(empty = !(k < that.el.childNodes.length)) && !(nodeId = that.el.childNodes[k].getAttribute('data-wl-id'))) {
        k++;
      }
    }
    var _k_reset = function(k_orig) { // set k to k_orig and fix "empty" and "nodeId"
      k = k_orig - 1;
      _k_nextChild();
    }
    _bc_outer: for (var i = 0; i < childIds.length; i++) {
        var childId = childIds[i];
        _k_nextChild();
        if (!empty) {
          // check if we already have the corresponding view object of the child;
          // check if we can find it at the current position in DOM or in the remaining DOM children
          var k_saved = k; // save current position in DOM children list
          while (!empty) {
            if (nodeId === childId) { // found a matching DOM element; put it at the right position
              if (k !== k_saved) this.el.insertBefore(this.el.childNodes[k], this.el.childNodes[k_saved]);
              // create view object if it does not exist yet (even if the HTML element exist)
              var vo;
              if (!this.el.childNodes[k_saved]._wlView) {
                vo = pluginManager.createView(repository.get(childId, this.data.attributes.version), {
                  el: this.el.childNodes[k_saved],
                  parent: this
                });
              } else { // or get existing view
                vo = this.el.childNodes[k_saved]._wlView;
              }
              // check if we have registered another view under the same id
              if (this.childInfo[childId] && this.childInfo[childId].view && this.childInfo[childId].view != vo) {
                throw "duplicate child id " + childId + " in group " + this.data.attributes.id + ".";
              }
              // create childInfo which indicates which view we have for each id. This is also used for checking whether we registered a change callback already.
              this.childInfo[childId] = this.childInfo[childId] || {};
              this.childInfo[childId].view = vo;
              vo.data.on('change', this._myChildListenerCallback); // attach child change listener
              // Note: if the HTML was present, we don't render positions
              _k_reset(k_saved);
              continue _bc_outer;
            }
            _k_nextChild();
          }
          _k_reset(k_saved);
        }
        // check if we have already a new view object in childInfo that has to be added, OR create a new View object for the data object child that was not yet existing in the view's children list
        // Note: putting existing view objects into the childInfo before updateing data.children is the way to add new children that already have a view. This is done in this.attachChild()
        var newView = (this.childInfo[childId] && this.childInfo[childId].view) || pluginManager.createView(repository.get(childId, this.data.attributes.version), {
          parent: this
        });
        if (empty) {
          this.el.appendChild(newView.elWrapper);
        } else {
          this.el.insertBefore(newView.elWrapper, this.el.childNodes[k]);
        }
        //if (this.childInfo[childId]) console.warn("Apparently DOM element for child id " + childId + " of parent " + this.data.attributes.id + " got deleted. ");
        // create childInfo for new view (may already exist with same info)
        this.childInfo[childId] = {
          view: newView
        };
        newView.data.on('change', this._myChildListenerCallback); // attach child change listener
        this._renderChildPosition(newView);
      }
      // we checked/added all object in data.children. Are there more children in DOM left?
      !empty && _k_nextChild();
    while (!empty) { // some objects need to be deleted (only removes dom elements of wl objects)
      var vo = this.el.childNodes[k]._wlView;
      vo.data.off('change', this._myChildListenerCallback); // remove child change listener
      this.el.childNodes[k].remove(); // remove child from dom
      _k_nextChild(); // next wl object
    }
  },
  /**
   * return child CobjView for a given child id
   *
   * @param {string} childId - the id of the requested object
   * @returns {CobjView} the view object
   */
  getChildView: function(childId) {
    if (!this.childInfo.hasOwnProperty(childId)) throw "unknown child "+childId+" in group "+this.data.attributes.id;
    return this.childInfo[childId].view;
  },
  /**
   * Find a view by its name
   *
   * @param {string} name - the name of the child object
   * @returns {CobjView} the found view or undefined
   */
  findChildView: function(name) {
    for (var i = 0; i < this.data.attributes.children.length; i++) {
      var childId = this.data.attributes.children[i];
      if (!this.childInfo.hasOwnProperty(childId)) throw "view for child"+childId+" missing in group "+this.data.attributes.id;
      if (childInfo[childId].view.data.attributes.name === name) {
        return childInfo[childId].view;
      }
    }
  },
  /**
   * Attach a new view object as a child. This updates the this.data.children property, so don't do that manually.
   * This method is the only way to attach an existing view to the parent. If a child is added solely in the dataobject,
   * a new view object is generated via the plugin manager.
   *
   * @param {CobjView} newView - the view object to be attached as child
   * @returns {Type} Description
   */
  attachView: function(newView) {
    this.childInfo[newView.data.attributes.id] = newView; // prepare info about new view
    newView.setParent(this);
    this.data.children.addChild(newView.data.attributes.id); // this will eventually trigger _buildChildren which sets up everything for this group
  },
  /**
   * remove a view from this group. updates dataobject of this group which will trigger change event which
   * will call _buildChildren
   *
   * @param {CobjView} view - the view object to be removed
   * @returns {Type} Description
   */
  detachView: function(view) {
    this.data.silence();
    var idx = this.data.update('children').indexOf(view.data.attributes.id);
    this.data.update('children').splice(idx, 1);
    this.data.fire();
    view.setParent(undefined);
  },
  /**
   * render the position of the child. This is done similar as setting other style (CSS) properties in
   * cobjview's render method. It's important to do this here so that derived classes can overwrite it
   * and position objects differently
   * Note: this currently implements setting the positional style information directly on the object.
   * This is most likely the best for speed. For rendering on the server, this infor has to go into a
   * separate css style
   *
   * @param {Cobjview} childView - the view to be positioned.
   * @returns {Type} Description
   */
  _renderChildPosition: function(childView) {
    var attr = childView.data.attributes,
      diff = childView.data.changedAttributes || childView.data.attributes,
      el = childView.el;

    var css = {};
    'x' in diff && attr.x !== undefined && (css.left = attr.x);
    'y' in diff && attr.y !== undefined && (css.top = attr.y);
    ('x' in diff || 'y' in diff) && (css.position = (attr.x !== undefined || attr.y !== undefined ? "absolute" : "static"));
    ('scaleX' in diff || 'scaleY' in diff || 'rotation' in diff) && (css.transform = "scale(" + attr.scaleX + "," + attr.scaleY + ")" + (attr.rotation ? " rotate(" + Math.round(attr.rotation) + "deg)" : ""));
    'zIndex' in diff && attr.zIndex !== undefined && (css.zIndex = attr.zIndex);
    'hidden' in diff && (css.display = attr.hidden ? 'none' : '');
    'width' in diff && attr.width !== undefined && (css.width = attr.width);
    'height' in diff && attr.height !== undefined && (css.height = attr.height);

    Kern._extend(el.style, css);
  },
  /**
   * render the group. Uses cobjview.render to display changes to the object.
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  render: function(options) {
      options = options || {};

      CobjView.prototype.render.call(this, options);

     if (options.forceRender && this.data.attributes.children){
         var length = this.data.attributes.children.length;

         for( var i=0; i < length; i++)
            this.childInfo[this.data.attributes.children[i]].render(options)
     }
  },
  /**
   * Return decendent Views which give a true value when passed to a given
   * testFunction
   *
   * @param {function} testFunction A function that takes a view and returns true/false
   * @param {bool}     single       Should only one matching view be returned or an array of all matches
   * @param {array}    [results]    An array in which to store multiple results
   */
  filter: function(testFunction, single, results) {
    if (!single && !results) {
      results = [];
    }

    for (var i = 0; i < this.children.length; i++) {
      var currentObject = this.children[i];

      if (testFunction(currentObject)) {
        if (single) {
          return currentObject;
        }

        results.push(currentObject);
      }

      if (currentObject.children) {
        var result = currentObject.filter(testFunction, single, results);

        if (result && single) {
          return result;
        }
      }
    }

    return results;
  },

  /**
   * @param {array} [results] array to store the children
   * @returns {array} array of all decendents of the GroupView
   */
  getAllChildren: function() {
    return this.filter(function() {
      return true;
    });
  },

}, {
  Model: CGroupData
});
pluginManager.registerType("group", CGroupView);
module.exports = CGroupView;
