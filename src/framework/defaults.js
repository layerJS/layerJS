module.exports = {
  version: 'default',
  transitionParameters: {
    duration: 't',
    type: 'p'
  },
  identifyPriority : {
    low: 1,
    normal: 2,
    high: 3
  },

  directions2neighbors : {
    up: 'b',
    down: 't',
    left: 'r',
    right: 'l'
  },

  neighbors2transition : {
    b: 'up',
    t: 'down',
    r: 'left',
    l: 'right'
    // b: 'slideOverUp',
    // t: 'slideOverDown',
    // r: 'slideOverLeft',
    // l: 'slideOverRight'
  },
  specialFrames: {
    none : '!none',
    left: '!left',
    right :'!right',
    top : '!top',
    bottom : '!bottom',
    next  :'!next',
    previous : '!prev'
  }
};
