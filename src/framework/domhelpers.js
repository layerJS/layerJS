var DomHelpers = {
  /**
   * wrap all children of element into a wrapper element
   *
   * @param {HTMLElement} element - the element who's children should be wrapped
   * @param {object} options - options.tag - the HTML tag of the wrapper
   * @returns {HTMLElement} the wrapper
   */
  wrapChildren: function(element, options) {
    options = options || {};
    var wrapper = document.createElement(options.tag || "div");
    for (var i = 0; i < element.childNodes.length; i++) {
      wrapper.appendChild(element.childNodes[i]);
    }
    element.appendChild(wrapper);
    return wrapper;
  },
  /**
   * unwrap the children of an element
   *
   * @param {HTMLElement} element - the element that contains a wrapper that should be removed. Copies all children of that wrapper into the element
   * @returns {void}
   */
  unwrapChildren: function(element) {
    var wrapper = element.removeChild(element.childNodes[0]);
    for (var i = 0; i < wrapper.childNodes.length; i++) {
      element.appendChild(wrapper.childNodes[i]);
    }
  }
}
module.exports = DomHelpers;
