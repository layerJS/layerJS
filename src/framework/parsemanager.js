var WL = require('./wl.js');
var CobjView = require('./cobjview.js');
var repository = require('./repository.js');
var defaults = require('./defaults.js');
var StageView = require('./stageview.js');

var ParseManager = function() {

  /**
   * Parses the children of a specific DOM element and add the children
   * to the parent data object
   * Asks the repository for an id if it is not provided
   *
   * @param {Object} parentDataObject - the data object for the passed element
   * @param {HTMLElement} element - parent element
   * @param {Array} dataObjects - A list of all found data objects, new ones are added to this collection
   * @param {Object} options - an options object
   * @returns {void}
   */
  var parseChildren = function(parentDataObject, element, dataObjects, options) {
    var children = element.children;
    var length = children.length;

    var nonLayerJsChildren = [];

    if (!parentDataObject.children) {
      parentDataObject.children = [];
    }

    for (var i = 0; i < length; i++) {
      var childElement = children[i];
      var type;

      if (childElement.hasAttribute('data-wl-type') && (type = childElement.getAttribute('data-wl-type')) !== 'stage') {

        var childData = getDataObject(childElement);
        parentDataObject.children.push(childData.id);
        dataObjects.push(childData);

        if (type !== options.stopAt) {
          parseChildren(childData, childElement, dataObjects, options);
        }
      } else if (options.lookInNonLayerJsElements && !childElement.hasAttribute('data-wl-type')) {
        nonLayerJsChildren.push(childElement);
      }
    }

    var length = nonLayerJsChildren.length;
    for (var i = 0; i < length; i++) {
      parseChildren(parentDataObject, nonLayerJsChildren[i], dataObjects, options);
    }
  }

  /**
   * Parses a DOM element to a data object.
   * Asks the repository for an id if it is not provided
   *
   * @param {Object} element - a DOM element
   * @returns {Object} a data object
   */
  var getDataObject = function(element) {
    var dataObject = CobjView.parse(element);

    if (dataObject.id == undefined) {
      dataObject.id = repository.getId();
      element.setAttribute('data-wl-id', dataObject.id);
    }

    return dataObject;
  };

  /**
   * Parses a document for layerJs objects and adds them to the repository
   *
   * @param {Object} options - an options object
   * @returns {void}
   */
  this.parseDocument = function(options) {
    options = options || {
      stopAt: 'frame',
      lookInNonLayerJsElements: false
    };

    options.stopAt = options.stopAt || 'frame';
    options.lookInNonLayerJsElements = options.lookInNonLayerJsElements || false;

    var stageElements = document.querySelectorAll("[data-wl-type='stage']");
    var stageIDs = [];
    var dataObjects = [];
    var length = stageElements.length;

    for (var index = 0; index < length; index++) {
      var stageElement = stageElements[index];
      var dataObject = getDataObject(stageElement);
      stageIDs.push(dataObject.id);
      dataObject.children = [];

      dataObjects.push(dataObject);

      if (options.stopAt !== 'stage') {
        parseChildren(dataObject, stageElement, dataObjects, options);
      }
    }
    repository.importJSON(dataObjects, options.version || defaults.version);
    for (var index = 0; index < length; index++) {
      var stageElement = stageElements[index];
      var dataObject = repository.get(stageIDs[index], options.version || defaults.version)
      if (!stageElement._wlView) {
        var v = new StageView(dataObject, {
          el: stageElement
        });
      }
    }
  };
};


WL.parseManager = new ParseManager();
module.exports = WL.parseManager;
