'use strict';
var Kern = require('../../kern/Kern.js');
var defaults = require('../defaults.js');
var state =  require('../state.js').getState();

var UrlData = Kern.Base.extend({
  constructor: function(url, localLayerView) {
    this.baseUrl = url;
    this.localLayerView = localLayerView;
    this.parse();
  },
  _getTransitionAndPart: function(part) {
    var transition = {};
    for (var parameter in defaults.transitionParameters) {
      if (defaults.transitionParameters.hasOwnProperty(parameter)) {
        var parameterName = defaults.transitionParameters[parameter];
        var regEx = new RegExp("[?&]" + parameterName + "=([^&]+)");
        var match = part.match(regEx);
        if (match) {
          transition[parameter] = match[1];
          part = part.replace(regEx, '');
        }
      }
    }
    return {
      transition: transition,
      part: part
    };
  },
  parse: function() {
    this.url = this.baseUrl.replace(window.location.origin, '');

    var pattern = /^((http|https):\/\/)/;
    if (!pattern.test(this.url) && (this.url.indexOf('~/') !== -1 || this.url.indexOf('./') !== -1 || this.url.indexOf('../') !== -1)) {
      this.url = this._getAbsoluteUrl(this.url);
    }

    var parser = document.createElement('a');
    parser.href = this.url;
    this.protocol = parser.protocol;
    this.hostname = parser.hostname;
    this.port = parser.port;
    this.pathname = parser.pathname;
    this.queryParameters = (parser.search && parser.search.length > 0) ? parser.search : '';
    this.hash = (parser.hash !== '#') ? parser.hash.substr(1) : '';
    this.host = parser.host;
    this.transition = {};
    this.hashTransitions = {};
    this.hasHashTransitions = false;
    this.url = this.url.replace(this.queryParameters, '').replace('#' + this.hash, '');

    this._parseQueryString();
    this._parseHashString();
    this.url = this.url + this.queryParameters + ((this.hash !== '') ? ('#' + this.hash) : this.hash);
  },

  _parseQueryString: function() {
    var result = this._getTransitionAndPart(this.queryParameters);
    this.transition = result.transition;
    this.queryParameters = result.part;
  },

  _parseHashString: function() {
    var result = '',
      hashParts = this.hash.split(';'),
      tmpHashParts = [],
      search = '',
      queryParams = '';

    for (var i = 0; i < hashParts.length; i++) {
      result = this._getTransitionAndPart(hashParts[i]);
      hashParts[i] = result.part;

      if (hashParts[i].indexOf('?') > -1) {
        search = hashParts[i].substr(hashParts[i].indexOf('?'));
        hashParts[i] = hashParts[i].substr(0, hashParts[i].indexOf('?'));
      }

      if (hashParts[i].indexOf('&') > -1) {
        queryParams = hashParts[i].substr(hashParts[i].indexOf('&'));
        hashParts[i] = hashParts[i].substr(0, hashParts[i].indexOf('&'));
      }

      var paths = this._resolveHashPath(hashParts[i]);
      var hashTransition = Kern._extend({}, this.transition, result.transition);

      for (var index = 0; index < paths.length; index++) {
        var view = state.getViewForPath(paths[index]);
          this.hashTransitions[paths[index]] = hashTransition;
          this.hasHashTransitions = true;
          if (!view || !view.parent || !view.parent.noUrl()) {
            tmpHashParts.push(paths[index] + search + queryParams);
          }

      }
    }

    this.hash = tmpHashParts.join(';');
  },
  _resolveHashPath: function(hashPath) {
    var results = [];
    console.log(hashPath);
    //var isLocalHash = false;
    //var frameView, layerView;


      //return state.resolvePath(hashPath, this.localLayerView ? this.localLayerView.innerEl : undefined);
/*

    for (var specialFrame in defaults.specialFrames) {
      if (defaults.specialFrames.hasOwnProperty(specialFrame) && hashPath === defaults.specialFrames[specialFrame]) {
        isLocalHash = true;
        frameView = this.localLayerView._getFrame(defaults.specialFrames[specialFrame]);
        results.push(state.getPathForView(this.localLayerView) + '.' + defaults.specialFrames[specialFrame]);
        break;
      }
    }

    if (!isLocalHash) {
      results = state._determineTransitionPaths([hashPath]);
    }

    // resolve special frame names
    for (var index = 0; index < results.length; index++) {
      for (specialFrame in defaults.specialFrames) {
        if (defaults.specialFrames.hasOwnProperty(specialFrame) && -1 !== results[index].indexOf(defaults.specialFrames[specialFrame])) {
          var layerPath = results[index].replace('.' + defaults.specialFrames[specialFrame], '');
          layerView = state.getViewForPath(layerPath);
          frameView = layerView._getFrame(defaults.specialFrames[specialFrame]);
          var frameName = (undefined !== frameView && null !== frameView) ? frameView.name() : defaults.specialFrames[specialFrame];
          results[index] = state.getPathForView(layerView) + '.' + frameName;
          break;
        }
      }
    }*/

    return results;
  },
  /**
   *  Will transform a relative url to an absolute url
   * https://developer.mozilla.org/en-US/docs/Web/API/document/cookie#Using_relative_URLs_in_the_path_parameter
   * @param {string} url to tranform to an absolute url
   * @return {string} an absolute url
   */
  _getAbsoluteUrl: function(sRelPath) {

    if (sRelPath.startsWith('~/')) {
      return sRelPath.substr(1);
    } else if (sRelPath.indexOf('/~/') !== -1) {
      return sRelPath.substr(sRelPath.indexOf('/~/') + 2);
    }

    var nUpLn, sDir = "",
      sPath = window.location.pathname.replace(/[^\/]*$/, sRelPath.replace(/(\/|^)(?:\.?\/+)+/g, "$1"));
    for (var nEnd, nStart = 0; nEnd = sPath.indexOf("/../", nStart), nEnd > -1; nStart = nEnd + nUpLn) {
      nUpLn = /^\/(?:\.\.\/)*/.exec(sPath.slice(nEnd))[0].length;
      sDir = (sDir + sPath.substring(nStart, nEnd)).replace(new RegExp("(?:\\\/+[^\\\/]*){0," + ((nUpLn - 1) / 3) + "}$"), "/");
    }
    return sDir + sPath.substr(nStart);
  }
});

module.exports = UrlData;
