'use strict';
var Kern = require('../kern/Kern.js');
var pluginManager = require('./pluginmanager.js');
var repository = require('./repository.js'); // jshint ignore:line
var ElementView = require('./elementview.js');
/**
 * A View which can have child views
 * @param {GroupData} dataModel
 * @param {object}        options
 * @extends ElementView
 */
var GroupView = ElementView.extend({
  /**
   * construct a new view of a GroupData
   *
   * @param {GroupData} dataModel - the data model to be used for the view
   * @param {object} options - passed to the Super constructor
   * @returns {this}
   */
  constructor: function(dataModel, options) {
    options = options || {};
    var that = this;
    this._childViews = {};
    this._childNames = {};

    ElementView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true
    }));
    // create listener to child changes. need different callbacks for each instance in order to remove listeners separately from child data objects
    this._myChildListenerCallback = function(model) {
      var view = that._childViews[model.attributes.id];
      if (!view) throw "listing to datamodel changes that does not have a childview " + model.attributes.id + " in this group " + this.data.attributes.id;
      that._renderChildPosition(view);
      if (model.changedAttributes.hasOwnProperty('name')) { // did name change?
        var names = Object.keys(that._childNames);
        for (var i = 0; i < names.length; i++) { // delete old reference
          if (that._childViews[names[i]] === view) {
            delete that._childViews[names[i]];
          }
        }
        if (model.attributes.name) {
          that._childNames[model.attributes.name] = view;
        }
      }
    };

    this.data.on('change:children', (function() {
      if (!this._dataObserverCounter) {
        that._buildChildren(); // update DOM when data.children changes
        that.render();
      }
    }).bind(this));

    if (this.data.attributes.children && this.data.attributes.children.length > 0) {
      this._buildChildren();
    }

    if (this.innerEl.childNodes.length > 0) {
      this._parseChildren();
    }

    if (!options.noRender && (options.forceRender || !options.el))
      this.render(options);
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

    this.disableObserver(); // dont react to DOM changes on this element
    var that = this; // jshint ignore:line
    var empty;
    var childIds = this.data.attributes.children;
    var k = -1; // index in childNodes;
    var nodeId; // layerjs id of current HMTL element
    var vo; // view object created for current element

    var _k_nextChild = function() { // find next DOM child node that is a wl-element
      // jshint ignore:start
      k++;
      var elem;
      while (!(empty = !(k < that.innerEl.childNodes.length)) && (elem = that.innerEl.childNodes[k]) && (elem.nodeType != 1 || !(nodeId = (elem._wlView && elem._wlView.data.attributes.id) || elem.getAttribute('data-wl-id')))) {
        k++;
      }
      // jshint ignore:end
    };
    var _k_reset = function(k_orig) { // set k to k_orig and fix "empty" and "nodeId"
      k = k_orig - 1;
      _k_nextChild();
    };
    _bc_outer:
      for (var i = 0; i < childIds.length; i++) {
        var childId = childIds[i];
        _k_nextChild();

        if (!empty) {
          // check if we already have the corresponding view object of the child;
          // check if we can find it at the current position in DOM or in the remaining DOM children
          var k_saved = k; // save current position in DOM children list
          while (!empty) {
            if (nodeId === childId) { // found a matching DOM element; put it at the right position
              if (k !== k_saved) {
                this.innerEl.insertBefore(this.innerEl.childNodes[k], this.innerEl.childNodes[k_saved]);
              }
              // create view object if it does not exist yet (even if the HTML element exist)
              if (!this.innerEl.childNodes[k_saved]._wlView) {
                vo = pluginManager.createView(repository.get(childId, this.data.attributes.version), {
                  el: this.innerEl.childNodes[k_saved],
                  parent: this
                });
              } else { // or get existing view
                vo = this.innerEl.childNodes[k_saved]._wlView;
              }

              // check if we have registered another view under the same id
              if (this._childViews[childId]) {
                if (this._childViews[childId] !== vo) throw "duplicate child id " + childId + " in group " + this.data.attributes.id + ".";
              } else {
                // create _childViews which indicates which view we have for each id. This is also used for checking whether we registered a change callback already.
                this._childViews[childId] = vo;
                vo.data.on('change', this._myChildListenerCallback); // attach child change listener
                if (vo.data.attributes.name) this._childNames[vo.data.attributes.name] = vo;
              }
              // Note: if the HTML was present, we don't render positions
              _k_reset(k_saved);
              continue _bc_outer; // continue with next id from data.children
            }
            _k_nextChild();
          }
          _k_reset(k_saved);
        }
        // no fitting element found -> create new view and element
        // we may already have a view supplied in _childViews if it was moved here via attachView()
        var newView = this._childViews[childId] || pluginManager.createView(repository.get(childId, this.data.attributes.version), {
          parent: this
        });
        // new HMTL element: append or place at current position
        if (empty) {
          this.innerEl.appendChild(newView.outerEl);
        } else {
          this.innerEl.insertBefore(newView.outerEl, this.innerEl.childNodes[k]);
        }
        // create _childViews for new view (may already exist with same info)
        this._childViews[childId] = newView;
        // set name
        if (newView.data.attributes.name) this._childNames[newView.data.attributes.name] = newView;
        newView.data.on('change', this._myChildListenerCallback); // attach child change listener
        //this._renderChildPosition(newView);
      }

    // we checked/added all object in data.children. Are there more childNodes in DOM left?
    if (!empty) {
      _k_nextChild();

      while (!empty) { // some objects need to be deleted (only removes dom elements of wl objects)
        vo = this.innerEl.childNodes[k]._wlView;
        if (!vo) { // this object has not been parsed yet, leave it there
          _k_nextChild();
          continue;
        }
        vo.data.off('change', this._myChildListenerCallback); // remove child change listener
        delete this._childNames[vo.data.attributes.name];
        delete this._childViews[vo.data.attributes.id];
        this.innerEl.removeChild(this.innerEl.childNodes[k]); // remove child from dom
        _k_nextChild(); // next wl object
      }
    }
    this.enableObserver();
  },
  /**
   * analyse list of childNodes (HTMLElements) in this group and create view- (and possibly data-) objects for them.
   *
   * @returns {void}
   */
  _parseChildren: function() {
    this.disableDataObserver();
    var cn = this.innerEl.childNodes;
    var childIds = this.data.attributes.children;
    var inChildren = {};
    var i;
    var vo;
    // hash denoting which ids are in data.attributes.children
    for (i = 0; i < childIds.length; i++) {
      inChildren[childIds[i]] = true;
    }
    var k = 0;
    var nodeId;
    var nodeType;
    var data;
    for (i = 0; i < cn.length; i++) {
      var elem = cn[i];
      if (elem.nodeType !== 1) {
        nodeType = pluginManager.identify(elem);

        vo = pluginManager.createView(nodeType, {
          el: elem,
          parent: this
        });

        nodeId = vo.data.attributes.id; // id has been generated automatically
        vo.data.attributes.version = this.data.attributes.version; // take version from parent (this)
        childIds.splice(k, 0, nodeId); // insert new nodeid in data.children
        if (!repository.contains(vo.data.attributes.id, vo.data.attributes.version)) {
          repository.add(vo.data, this.data.attributes.version); // add new (implicitly created) data object to repository
        }
        this._childViews[nodeId] = vo; // update _childViews
        if (vo.data.attributes.name) this._childNames[vo.data.attributes.name] = vo;
        vo.data.on('change', this._myChildListenerCallback); // attach child change listener
        k++; // next in data.children

      } else {
        nodeId = (elem._wlView && elem._wlView.data.attributes.id) || elem.getAttribute('data-wl-id');
        try {
          data = nodeId && repository.get(nodeId, this.data.attributes.version);
        } catch (e) {
          data = undefined;
        }
        nodeType = (elem._wlView && elem._wlView.data.attributes.type) || elem.getAttribute('data-wl-type');
        if (nodeId && (data || nodeType)) {
          // search for nodeId in data.children
          var k_saved = k;

          while (k < childIds.length && nodeId !== childIds[k]) {
            k++;
          }
          // put at right position in data.children if not already there
          if (k !== k_saved || k >= childIds.length) {
            if (k < childIds.length) {
              childIds.splice(k, 1);
            }
            childIds.splice(k_saved, 0, nodeId);
          }
          k = k_saved; // put k back to current position
          if (data) { // do we have a data object for this nodeid?
            vo = pluginManager.createView(data, {
              el: elem,
              parent: this
            });
          } else if (nodeType) { // or  a nodeType?
            // create new view without data object, just by type. creates data object implicitly with cElementView._parse
            vo = pluginManager.createView(nodeType, {
              el: elem,
              parent: this
            });
            vo.data.attributes.id = nodeId; // overwrite new id generated by above call with nodeid given in HMTL
            vo.data.attributes.version = this.data.attributes.version; // take version from parent (this)
            if (!repository.contains(vo.data.attributes.id, vo.data.attributes.version)) {
              repository.add(vo.data, this.data.attributes.version); // add new (implicitly created) data object to repository
            }
          }
          this._childViews[nodeId] = vo; // update _childViews
          if (vo.data.attributes.name) this._childNames[vo.data.attributes.name] = vo;
          vo.data.on('change', this._myChildListenerCallback); // attach child change listener
          k++; // next in data.children

        } else if (nodeType) {
          // create new view without data object, just by type. creates data object implicitly with cElementView._parse
          vo = pluginManager.createView(nodeType, {
            el: elem,
            parent: this
          });
          nodeId = vo.data.attributes.id; // id has been generated automatically
          vo.data.attributes.version = this.data.attributes.version; // take version from parent (this)
          childIds.splice(k, 0, nodeId); // insert new nodeid in data.children
          if (!repository.contains(vo.data.attributes.id, vo.data.attributes.version)) {
            repository.add(vo.data, this.data.attributes.version); // add new (implicitly created) data object to repository
          }
          this._childViews[nodeId] = vo; // update _childViews
          if (vo.data.attributes.name) this._childNames[vo.data.attributes.name] = vo;
          vo.data.on('change', this._myChildListenerCallback); // attach child change listener
          k++; // next in data.children
        } else if (undefined !== GroupView.getNodeType) { // jshint ignore:line
          // add import of non-typed elements later
          nodeType = GroupView.getNodeType(elem);
          // create new view without data object, just by type. creates data object implicitly with cElementView._parse
          vo = pluginManager.createView(nodeType, {
            el: elem,
            parent: this
          });
          nodeId = vo.data.attributes.id; // id has been generated automatically
          vo.data.attributes.version = this.data.attributes.version; // take version from parent (this)
          childIds.splice(k, 0, nodeId); // insert new nodeid in data.children
          if (!repository.contains(vo.data.attributes.id, vo.data.attributes.version)) {
            repository.add(vo.data, this.data.attributes.version); // add new (implicitly created) data object to repository
          }
          this._childViews[nodeId] = vo; // update _childViews
          if (vo.data.attributes.name) this._childNames[vo.data.attributes.name] = vo;
          vo.data.on('change', this._myChildListenerCallback); // attach child change listener
          k++; // next in data.children

        }
      }
    }
    // delete further ids in data.children
    if (k < childIds.length) {
      childIds.splice(k);
    }
    this.enableDataObserver();
  },
  /**
   * return child ElementView for a given child id
   *
   * @param {string} childId - the id of the requested object
   * @returns {ElementView} the view object
   */
  getChildView: function(childId) {
    if (!this._childViews.hasOwnProperty(childId)) throw "unknown child " + childId + " in group " + this.data.attributes.id;
    return this._childViews[childId];
  },
  /**
   * return view by name property
   *
   * @param {string} name - the name of the searched child
   * @returns {ElementView} the view object
   */
  getChildViewByName: function(name) {
    if (!this._childNames.hasOwnProperty(name)) throw "unknown child with name " + name + " in group " + this.data.attributes.id;
    return this._childNames[name];
  },
  /**
   * return all the child views
   *
   * @returns {array} the view object
   */
  getChildViews: function() {

    var childViews = [];

    for (var child in this._childViews) {
      if (this._childViews.hasOwnProperty(child)) {
        childViews.push(this._childViews[child]);
      }
    }

    return childViews;
  },

  /**
   * Attach a new view object as a child. This updates the this.data.children property, so don't do that manually.
   * This method is the only way to attach an existing view to the parent. If a child is added solely in the dataobject,
   * a new view object is generated via the plugin manager.
   *
   * @param {ElementView} newView - the view object to be attached as child
   * @returns {Type} Description
   */
  attachView: function(newView) {
    var childId = newView.data.attributes.id;

    if (!this._childViews[childId]) {
      this._childViews[childId] = newView;
      newView.setParent(this);
      this.data.addChild(childId); // this will eventually trigger _buildChildren which sets up everything for this group
    }
  },
  /**
   * remove a view from this group. updates dataobject of this group which will trigger change event which
   * will call _buildChildren
   *
   * @param {ElementView} view - the view object to be removed
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
   * ElementView's render method. It's important to do this here so that derived classes can overwrite it
   * and position objects differently
   * Note: this currently implements setting the positional style information directly on the object.
   * This is most likely the best for speed. For rendering on the server, this infor has to go into a
   * separate css style
   *
   * @param {ElementView} childView - the view to be positioned.
   * @returns {Type} Description
   */
  _renderChildPosition: function(childView) {

    var attr = childView.data.attributes,
      diff = childView.data.changedAttributes || childView.data.attributes;

    var css = {};
    if ('x' in diff && attr.x !== undefined) {
      css.left = attr.x + 'px';
    }

    if ('y' in diff && attr.y !== undefined) {
      css.top = attr.y + 'px';
    }

    if ('x' in diff || 'y' in diff) {
      css.position = (attr.x !== undefined || attr.y !== undefined ? "absolute" : "static");
    }

    if ('scaleX' in diff || 'scaleY' in diff || 'rotation' in diff) {
      css.transform = "scale(" + attr.scaleX + "," + attr.scaleY + ")" + (attr.rotation ? " rotate(" + Math.round(attr.rotation) + "deg)" : "");
    }

    if ('zIndex' in diff && attr.zIndex !== undefined) {
      css.zIndex = attr.zIndex;
    }

    if ('hidden' in diff) {
      css.display = attr.hidden ? 'none' : '';
    }

    if ('width' in diff && attr.width !== undefined) {
      css.width = attr.width;
    }

    if ('height' in diff && attr.height !== undefined) {
      css.height = attr.height;
    }

    if (childView.applyStyles) {
      childView.applyStyles(css);
    }
  },
  /**
   * render the group. Uses ElementView.render to display changes to the object.
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  render: function(options) {
    var i;
    options = options || {};
    this.disableObserver();

    ElementView.prototype.render.call(this, options);

    if (!this.data.changedAttributes || this.data.changedAttributes.children) {
      var views = Object.keys(this._childViews);
      var length = views.length;
      for (i = 0; i < length; i++) {
        var childView = this._childViews[views[i]];
        if (options.forceRender) {
          childView.render(options);
        }
        this._renderChildPosition(childView);
      }
    }
    this.enableObserver();
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
  defaultProperties: Kern._extend({}, ElementView.defaultProperties, {
    type: 'group',
    children: []
  }),
  getNodeType: undefined,
  identify: function(element) {
    var type = element.getAttribute('data-wl-type');
    var knownTag = false;
    var tags = ['DIV', 'HEAD', 'BODY'];

    for (var i = 0; i < tags.length; i++) {
      knownTag = element.tagName.toUpperCase() === tags[i];
      if (knownTag)
        break;
    }

    return element.nodeType === 1 && knownTag && ((null !== type && type.toLowerCase() === 'group') || !type);
  }
});


pluginManager.registerType("group", GroupView);
module.exports = GroupView;
