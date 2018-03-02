module.exports = {
  version: 'default',
  defaultDuration: '1s',
  transitionParameters: {
    duration: 't',
    type: 'p',
    delay: 'd'
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
    b: 'auto:up',
    t: 'auto:down',
    r: 'auto:left',
    l: 'auto:right'
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
    previous : '!prev',
    default : '!default',
    current: '!current'
  }
};
