'use strict';

var defaults = require('./defaults.js');
var Kern = require('../kern/kern.js');

/**
 *  class that will contain helper methods for url parsing
 *
 * @extends Kern.Base
 */
var UrlHelper = Kern.Base.extend({
  constructor: function() {},
  /**
   * Will parse the url for a location, queryString and hash
   *
   * @param {string} url - url to parse
   * @returns {Object} An object that contains the location, queryString and hash based on the provided url
   */
  splitUrl: function(url) {
    var splitted = url.split('?');
    var before = splitted[0];
    var queryString = '';
    var hash = '';

    if (splitted.length > 1) {
      splitted = splitted[1].split('#');
      queryString = '?' + splitted[0];
      hash = splitted.length > 1 ? splitted[1] : '';
    } else {
      splitted = splitted[0].split('#');
      before = splitted[0];
      hash = splitted.length > 1 ? ('#' + splitted[1]) : '';
    }

    return {
      location: before,
      queryString: queryString,
      hash: hash
    };
  },
  /**
   * Will parse a string for transition parameters
   *
   * @param {string} string - A string to parse for transition parameters
   * @param {boolean} keepParameters - If true, the transitionParameters will not be removed from the string
   * @returns {Object} An object that contains a string and a transition object
   */
  parseStringForTransitions: function(string, keepParameters) {
    var transition = {};
    for (var parameter in defaults.transitionParameters) {
      if (defaults.transitionParameters.hasOwnProperty(parameter)) {
        var parameterName = defaults.transitionParameters[parameter];
        var regEx = new RegExp("[?&]" + parameterName + "=([^&]+)");
        var match = string.match(regEx);
        if (match) {
          transition[parameter] = match[1];
          if (true !== keepParameters) {
            string = string.replace(regEx, '');
          }
        }
      }
    }

    return {
      string: string,
      transition: transition
    };
  },
  /**
   * Will parse an url for transition parameters
   *
   * @param {string} url - An url to parse
   * @param {boolean} keepParameters - If true, the transitionParameters will not be removed from the string
   * @returns {Object} An object that contains a url and a transition object
   */
  parseQueryString: function(url, keepParameters) {
    var parsedUrl = this.splitUrl(url);
    var parsed = this.parseStringForTransitions(parsedUrl.queryString, keepParameters);

    return {
      transition: parsed.transition,
      url: parsedUrl.location + (parsed.string.length > 0 ? (parsed.string) : '') + (parsedUrl.hash.length > 0 ? ('#' + parsedUrl.hash) : '')
    };
  },
  /**
   *  Will transform a relative url to an absolute url
   * https://developer.mozilla.org/en-US/docs/Web/API/document/cookie#Using_relative_URLs_in_the_path_parameter
   * @param {string} url to tranform to an absolute url
   * @return {string} an absolute url
   */
  getAbsoluteUrl: function(url) {
    url = url.replace(window.location.origin, '');
    var result = url,
      pattern = /^((http|https):\/\/)/;
    if (!pattern.test(url) && (url.indexOf('~/') !== -1 || url.indexOf('./') !== -1 || url.indexOf('../') !== -1)) {
      if (url.startsWith('~/')) {
        result = url.substr(1);
      } else if (url.indexOf('/~/') !== -1) {
        result = url.substr(url.indexOf('/~/') + 2);
      } else {
        var nUpLn, sDir = "",
          sPath = window.location.pathname.replace(/[^\/]*$/, url.replace(/(\/|^)(?:\.?\/+)+/g, "$1"));
        for (var nEnd, nStart = 0; nEnd = sPath.indexOf("/../", nStart), nEnd > -1; nStart = nEnd + nUpLn) {
          nUpLn = /^\/(?:\.\.\/)*/.exec(sPath.slice(nEnd))[0].length;
          sDir = (sDir + sPath.substring(nStart, nEnd)).replace(new RegExp("(?:\\\/+[^\\\/]*){0," + ((nUpLn - 1) / 3) + "}$"), "/");
        }
        result = sDir + sPath.substr(nStart);
      }
    }

    return result;
  }
});

module.exports = new UrlHelper();
