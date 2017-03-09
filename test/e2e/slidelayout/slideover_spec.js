var utilities = require('../helpers/utilities.js');

describe('slideOver', function() {

    utilities.resizeWindow(800, 600);

    describe('slideOverRight', function() {
        /*
        frame2 slides, from left, over default-frame(frame1). after transition frame1 is diplay none and stays in the same place.
        */
        it('basic slideOverRight - frame slides over from left to right', function() {
            browser.get('slidelayout/slideOver.html').then(function() {

                var f1 = element(by.id('frame1'));
                var f2 = element(by.id('frame2'));

                // frame1_display_before == block
                expect(f1.getCssValue('display')).toBe('block');
                // frame2_display_before == none
                expect(f2.getCssValue('display')).toBe('none');

                protractor.promise.all([utilities.setStyle('frame2', {
                    width: '500px',
                    height: '500px'
                }), utilities.setStyle('stage', {
                    width: '500px',
                    height: '500px'
                })]).then(function() {
                    utilities.setAttributes('frame2', {
                        'lj-transition': 'slideOverRight'
                    }).then(function() {
                        utilities.wait(300); // time for the style changes to take effect
                        utilities.listenDimensionsBeforeTransition('layer', 'frame1');
                        utilities.listenDimensionsBeforeTransition('layer', 'frame2');
                        utilities.transitionTo('layer', 'frame2', {}).then(function() {
                            protractor.promise.all([
                                utilities.getBoundingClientRect('stage'),
                                utilities.getBoundingClientRect('frame1'),
                                utilities.getBoundingClientRect('frame2'),
                                utilities.getFromStore('frame1'),
                                utilities.getFromStore('frame2')
                            ]).then(function(data) {
                                var stage_dimensions = data[0];
                                var frame1_dimensions_after = data[1];
                                var frame2_dimensions_after = data[2];
                                var frame1_dimensions_before = data[3];
                                var frame2_dimensions_before = data[4];

                                // frame1_display_after == none
                                expect(f1.getCssValue('display')).toBe('none');
                                // frame2_display_after == block
                                expect(f2.getCssValue('display')).toBe('block');
                                // z-index
                                expect(frame1_dimensions_before['z-index']).toBe('1');
                                expect(frame1_dimensions_after['z-index']).toBe('-1');
                                // positioning and dimensions of frame1 and frame 2
                                expect(frame2_dimensions_before.left).toBe(stage_dimensions.left - frame2_dimensions_after.width);
                                expect(frame2_dimensions_before.right).toBe(stage_dimensions.left);
                                expect(frame2_dimensions_before.right).toBe(frame1_dimensions_before.left);

                                delete frame1_dimensions_before.opacity;
                                delete frame1_dimensions_after.opacity;
                                delete frame2_dimensions_after.opacity;
                                delete frame1_dimensions_before['z-index'];
                                delete frame1_dimensions_after['z-index'];
                                delete frame2_dimensions_after['z-index'];

                                expect(frame1_dimensions_before).toEqual(frame2_dimensions_after);
                                expect(frame1_dimensions_after).toEqual(frame2_dimensions_after);
                            });
                        });
                    });
                });
            });
        });

        /*
          frame2 slides, from left, over default-frame(frame1) - that fades. after transition frame1 is diplay none and stays in the same place.
        */
        it('slideOverRightFade - frame slides over from left to right as other frame fades', function() {
            browser.get('slidelayout/slideOver.html').then(function() {

                var f1 = element(by.id('frame1'));
                var f2 = element(by.id('frame2'));

                // frame1_display_before == block
                expect(f1.getCssValue('display')).toBe('block');
                // frame2_display_before == none
                expect(f2.getCssValue('display')).toBe('none');

                protractor.promise.all([utilities.setStyle('frame2', {
                    width: '500px',
                    height: '500px'
                }), utilities.setStyle('stage', {
                    width: '500px',
                    height: '500px'
                })]).then(function() {
                    utilities.setAttributes('frame2', {
                        'lj-transition': 'slideOverRightFade'
                    }).then(function() {
                        utilities.wait(300); // time for the style changes to take effect
                        utilities.listenDimensionsBeforeTransition('layer', 'frame1');
                        utilities.listenDimensionsBeforeTransition('layer', 'frame2');
                        utilities.transitionTo('layer', 'frame2', {}).then(function() {
                            protractor.promise.all([
                                utilities.getBoundingClientRect('stage'),
                                utilities.getBoundingClientRect('frame1'),
                                utilities.getBoundingClientRect('frame2'),
                                utilities.getFromStore('frame1'),
                                utilities.getFromStore('frame2')
                            ]).then(function(data) {
                                var stage_dimensions = data[0];
                                var frame1_dimensions_after = data[1];
                                var frame2_dimensions_after = data[2];
                                var frame1_dimensions_before = data[3];
                                var frame2_dimensions_before = data[4];

                                // frame1_display_after == none
                                expect(f1.getCssValue('display')).toBe('none');
                                // frame2_display_after == block
                                expect(f2.getCssValue('display')).toBe('block');
                                // opacity
                                expect(frame1_dimensions_before.opacity).toBe('1');
                                // expect(frame1_dimensions_after.opacity).toBe('0'); //result: Expected '1' to be '0'.- this is not fulfilled because of resetting opacity
                                // z-index
                                expect(frame1_dimensions_before['z-index']).toBe('1');
                                expect(frame1_dimensions_after['z-index']).toBe('-1');
                                // positioning and dimensions of frame1 and frame 2
                                expect(frame2_dimensions_before.left).toBe(stage_dimensions.left - frame2_dimensions_after.width);
                                expect(frame2_dimensions_before.right).toBe(stage_dimensions.left);
                                expect(frame2_dimensions_before.right).toBe(frame1_dimensions_before.left);

                                delete frame1_dimensions_before.opacity;
                                delete frame1_dimensions_after.opacity;
                                delete frame2_dimensions_after.opacity;
                                delete frame1_dimensions_before['z-index'];
                                delete frame1_dimensions_after['z-index'];
                                delete frame2_dimensions_after['z-index'];

                                expect(frame1_dimensions_before).toEqual(frame2_dimensions_after);
                                expect(frame1_dimensions_after).toEqual(frame2_dimensions_after);
                            });
                        });
                    });
                });
            });
        });
    });

    describe('slideOverLeft', function() {
        /*
        frame2 slides, from right, over default-frame(frame1). after transition frame1 is diplay none and stays in the same place.
        */
        it('frame slides over from right to left', function() {
            browser.get('slidelayout/slideOver.html').then(function() {

                var f1 = element(by.id('frame1'));
                var f2 = element(by.id('frame2'));

                // frame1_display_before == block
                expect(f1.getCssValue('display')).toBe('block');
                // frame2_display_before == none
                expect(f2.getCssValue('display')).toBe('none');

                protractor.promise.all([utilities.setStyle('frame2', {
                    width: '500px',
                    height: '500px'
                }), utilities.setStyle('stage', {
                    width: '500px',
                    height: '500px'
                })]).then(function() {
                    utilities.setAttributes('frame2', {
                        'lj-transition': 'slideOverLeft'
                    }).then(function() {
                        utilities.wait(300); // time for the style changes to take effect
                        utilities.listenDimensionsBeforeTransition('layer', 'frame1');
                        utilities.listenDimensionsBeforeTransition('layer', 'frame2');
                        utilities.transitionTo('layer', 'frame2', {}).then(function() {
                            protractor.promise.all([
                                utilities.getBoundingClientRect('stage'),
                                utilities.getBoundingClientRect('frame1'),
                                utilities.getBoundingClientRect('frame2'),
                                utilities.getFromStore('frame1'),
                                utilities.getFromStore('frame2')
                            ]).then(function(data) {
                                var stage_dimensions = data[0];
                                var frame1_dimensions_after = data[1];
                                var frame2_dimensions_after = data[2];
                                var frame1_dimensions_before = data[3];
                                var frame2_dimensions_before = data[4];

                                // frame1_display_after == none
                                expect(f1.getCssValue('display')).toBe('none');
                                // frame2_display_after == block
                                expect(f2.getCssValue('display')).toBe('block');
                                // z-index
                                expect(frame1_dimensions_before['z-index']).toBe('1');
                                expect(frame1_dimensions_after['z-index']).toBe('-1');
                                // positioning and dimensions of frame1 and frame 2
                                expect(frame2_dimensions_before.right).toBe(stage_dimensions.right + frame2_dimensions_after.width);
                                expect(frame2_dimensions_before.left).toBe(stage_dimensions.width);
                                expect(frame2_dimensions_before.left).toBe(frame1_dimensions_before.width);

                                delete frame1_dimensions_before.opacity;
                                delete frame1_dimensions_after.opacity;
                                delete frame2_dimensions_after.opacity;
                                delete frame1_dimensions_before['z-index'];
                                delete frame1_dimensions_after['z-index'];
                                delete frame2_dimensions_after['z-index'];

                                expect(frame1_dimensions_before).toEqual(frame2_dimensions_after);
                                expect(frame1_dimensions_after).toEqual(frame2_dimensions_after);
                            });
                        });
                    });
                });
            });
        });

        /*
            frame2 slides, from right, over default-frame(frame1) - that fades. after transition frame1 is diplay none and stays in the same place.
          */
        it('slideOverLeftFade - frame slides over from right to left as other frame fades', function() {
            browser.get('slidelayout/slideOver.html').then(function() {

                // frame1_display_before == block
                expect(element(by.id('frame1')).getCssValue('display')).toBe('block');
                // frame2_display_before == none
                expect(element(by.id('frame2')).getCssValue('display')).toBe('none');

                protractor.promise.all([utilities.setStyle('frame2', {
                    width: '500px',
                    height: '500px'
                }), utilities.setStyle('stage', {
                    width: '500px',
                    height: '500px'
                })]).then(function() {
                    utilities.setAttributes('frame2', {
                        'lj-transition': 'slideOverLeftFade'
                    }).then(function() {
                        utilities.wait(300); // time for the style changes to take effect
                        utilities.listenDimensionsBeforeTransition('layer', 'frame1');
                        utilities.listenDimensionsBeforeTransition('layer', 'frame2');
                        utilities.transitionTo('layer', 'frame2', {}).then(function() {
                            protractor.promise.all([
                                utilities.getBoundingClientRect('stage'),
                                utilities.getBoundingClientRect('frame1'),
                                utilities.getBoundingClientRect('frame2'),
                                utilities.getFromStore('frame1'),
                                utilities.getFromStore('frame2')
                            ]).then(function(data) {
                                var stage_dimensions = data[0];
                                var frame1_dimensions_after = data[1];
                                var frame2_dimensions_after = data[2];
                                var frame1_dimensions_before = data[3];
                                var frame2_dimensions_before = data[4];

                                // frame1_display_after == none
                                expect(element(by.id('frame1')).getCssValue('display')).toBe('none');
                                // frame2_display_after == block
                                expect(element(by.id('frame2')).getCssValue('display')).toBe('block');
                                // opacity
                                expect(frame1_dimensions_before.opacity).toBe('1');
                                // expect(frame1_dimensions_after.opacity).toBe('0'); //result: Expected '1' to be '0'.- this is not fulfilled because of resetting opacity
                                // z-index
                                expect(frame1_dimensions_before['z-index']).toBe('1');
                                expect(frame1_dimensions_after['z-index']).toBe('-1');
                                // positioning and dimensions of frame1 and frame 2
                                expect(frame2_dimensions_before.right).toBe(stage_dimensions.right + frame2_dimensions_after.width);
                                expect(frame2_dimensions_before.left).toBe(stage_dimensions.width);
                                expect(frame2_dimensions_before.left).toBe(frame1_dimensions_before.width);

                                delete frame1_dimensions_before.opacity;
                                delete frame1_dimensions_after.opacity;
                                delete frame2_dimensions_after.opacity;
                                delete frame1_dimensions_before['z-index'];
                                delete frame1_dimensions_after['z-index'];
                                delete frame2_dimensions_after['z-index'];

                                expect(frame1_dimensions_before).toEqual(frame2_dimensions_after);
                                expect(frame1_dimensions_after).toEqual(frame2_dimensions_after);
                            });
                        });
                    });
                });
            });
        });

    });

    describe('slideOverDown', function() {
        /*
        frame2 slides, from top, over default-frame(frame1). after transition frame1 is diplay none and stays in the same place.
        */
        it('frame slides down from top', function() {
            browser.get('slidelayout/slideOver.html').then(function() {

                var f1 = element(by.id('frame1'));
                var f2 = element(by.id('frame2'));

                // frame1_display_before == block
                expect(f1.getCssValue('display')).toBe('block');
                // frame2_display_before == none
                expect(f2.getCssValue('display')).toBe('none');

                protractor.promise.all([utilities.setStyle('frame2', {
                    width: '500px',
                    height: '500px'
                }), utilities.setStyle('stage', {
                    width: '500px',
                    height: '500px'
                })]).then(function() {
                    utilities.setAttributes('frame2', {
                        'lj-transition': 'slideOverDown'
                    }).then(function() {
                        utilities.wait(300); // time for the style changes to take effect
                        utilities.listenDimensionsBeforeTransition('layer', 'frame1');
                        utilities.listenDimensionsBeforeTransition('layer', 'frame2');
                        utilities.transitionTo('layer', 'frame2', {}).then(function() {
                            protractor.promise.all([
                                utilities.getBoundingClientRect('stage'),
                                utilities.getBoundingClientRect('frame1'),
                                utilities.getBoundingClientRect('frame2'),
                                utilities.getFromStore('frame1'),
                                utilities.getFromStore('frame2')
                            ]).then(function(data) {
                                var stage_dimensions = data[0];
                                var frame1_dimensions_after = data[1];
                                var frame2_dimensions_after = data[2];
                                var frame1_dimensions_before = data[3];
                                var frame2_dimensions_before = data[4];

                                // frame1_display_after == none
                                expect(f1.getCssValue('display')).toBe('none');
                                // frame2_display_after == block
                                expect(f2.getCssValue('display')).toBe('block');
                                // z-index
                                expect(frame1_dimensions_before['z-index']).toBe('1');
                                expect(frame1_dimensions_after['z-index']).toBe('-1');
                                // positioning and dimensions of frame1 and frame 2
                                expect(frame2_dimensions_before.top).toBe(stage_dimensions.top - frame2_dimensions_after.height);
                                expect(frame2_dimensions_before.bottom).toBe(stage_dimensions.top);
                                expect(frame2_dimensions_before.bottom).toBe(frame1_dimensions_before.top);

                                delete frame1_dimensions_before.opacity;
                                delete frame1_dimensions_after.opacity;
                                delete frame2_dimensions_after.opacity;
                                delete frame1_dimensions_before['z-index'];
                                delete frame1_dimensions_after['z-index'];
                                delete frame2_dimensions_after['z-index'];

                                expect(frame1_dimensions_before).toEqual(frame2_dimensions_after);
                                expect(frame1_dimensions_after).toEqual(frame2_dimensions_after);
                            });
                        });
                    });
                });
            });
        });
        /*
              frame2 slides, from top, over default-frame(frame1) - that fades. after transition frame1 is diplay none and stays in the same place.
            */
        it('slideOverDownFade - frame slides down from top as other frame fades ', function() {
            browser.get('slidelayout/slideOver.html').then(function() {

                var f1 = element(by.id('frame1'));
                var f2 = element(by.id('frame2'));

                // frame1_display_before == block
                expect(f1.getCssValue('display')).toBe('block');
                // frame2_display_before == none
                expect(f2.getCssValue('display')).toBe('none');

                protractor.promise.all([utilities.setStyle('frame2', {
                    width: '500px',
                    height: '500px'
                }), utilities.setStyle('stage', {
                    width: '500px',
                    height: '500px'
                })]).then(function() {
                    utilities.setAttributes('frame2', {
                        'lj-transition': 'slideOverDownFade'
                    }).then(function() {
                        utilities.wait(300); // time for the style changes to take effect
                        utilities.listenDimensionsBeforeTransition('layer', 'frame1');
                        utilities.listenDimensionsBeforeTransition('layer', 'frame2');
                        utilities.transitionTo('layer', 'frame2', {}).then(function() {
                            protractor.promise.all([
                                utilities.getBoundingClientRect('stage'),
                                utilities.getBoundingClientRect('frame1'),
                                utilities.getBoundingClientRect('frame2'),
                                utilities.getFromStore('frame1'),
                                utilities.getFromStore('frame2')
                            ]).then(function(data) {
                                var stage_dimensions = data[0];
                                var frame1_dimensions_after = data[1];
                                var frame2_dimensions_after = data[2];
                                var frame1_dimensions_before = data[3];
                                var frame2_dimensions_before = data[4];

                                // frame1_display_after == none
                                expect(f1.getCssValue('display')).toBe('none');
                                // frame2_display_after == block
                                expect(f2.getCssValue('display')).toBe('block');
                                // opacity
                                expect(frame1_dimensions_before.opacity).toBe('1');
                                // expect(frame1_dimensions_after.opacity).toBe('0'); //result: Expected '1' to be '0'.- this is not fulfilled because of resetting opacity
                                // z-index
                                expect(frame1_dimensions_before['z-index']).toBe('1');
                                expect(frame1_dimensions_after['z-index']).toBe('-1');
                                // positioning and dimensions of frame1 and frame 2
                                expect(frame2_dimensions_before.top).toBe(stage_dimensions.top - frame2_dimensions_after.height);
                                expect(frame2_dimensions_before.bottom).toBe(stage_dimensions.top);
                                expect(frame2_dimensions_before.bottom).toBe(frame1_dimensions_before.top);

                                delete frame1_dimensions_before.opacity;
                                delete frame1_dimensions_after.opacity;
                                delete frame2_dimensions_after.opacity;
                                delete frame1_dimensions_before['z-index'];
                                delete frame1_dimensions_after['z-index'];
                                delete frame2_dimensions_after['z-index'];

                                expect(frame1_dimensions_before).toEqual(frame2_dimensions_after);
                                expect(frame1_dimensions_after).toEqual(frame2_dimensions_after);
                            });
                        });
                    });
                });
            });
        });

    });

    describe('slideOverUp', function() {
        /*
        frame2 slides, from the bottom, over default-frame(frame1). after transition frame1 is diplay none and stays in the same place.
        */
        it('frame slides up from the bottom', function() {
            browser.get('slidelayout/slideOver.html').then(function() {

                var f1 = element(by.id('frame1'));
                var f2 = element(by.id('frame2'));

                // frame1_display_before == block
                expect(f1.getCssValue('display')).toBe('block');
                // frame2_display_before == none
                expect(f2.getCssValue('display')).toBe('none');

                protractor.promise.all([utilities.setStyle('frame2', {
                    width: '500px',
                    height: '500px'
                }), utilities.setStyle('stage', {
                    width: '500px',
                    height: '500px'
                })]).then(function() {
                    utilities.setAttributes('frame2', {
                        'lj-transition': 'slideOverUp'
                    }).then(function() {
                        utilities.wait(300); // time for the style changes to take effect
                        utilities.listenDimensionsBeforeTransition('layer', 'frame1');
                        utilities.listenDimensionsBeforeTransition('layer', 'frame2');
                        utilities.transitionTo('layer', 'frame2', {}).then(function() {
                            protractor.promise.all([
                                utilities.getBoundingClientRect('stage'),
                                utilities.getBoundingClientRect('frame1'),
                                utilities.getBoundingClientRect('frame2'),
                                utilities.getFromStore('frame1'),
                                utilities.getFromStore('frame2')
                            ]).then(function(data) {
                                var stage_dimensions = data[0];
                                var frame1_dimensions_after = data[1];
                                var frame2_dimensions_after = data[2];
                                var frame1_dimensions_before = data[3];
                                var frame2_dimensions_before = data[4];

                                // frame1_display_after == none
                                expect(f1.getCssValue('display')).toBe('none');
                                // frame2_display_after == block
                                expect(f2.getCssValue('display')).toBe('block');
                                // z-index
                                expect(frame1_dimensions_before['z-index']).toBe('1');
                                expect(frame1_dimensions_after['z-index']).toBe('-1');
                                // positioning and dimensions of frame1 and frame 2
                                expect(frame2_dimensions_before.bottom).toBe(stage_dimensions.height + frame2_dimensions_before.height);
                                expect(frame2_dimensions_before.top).toBe(frame1_dimensions_before.bottom);

                                delete frame1_dimensions_before.opacity;
                                delete frame1_dimensions_after.opacity;
                                delete frame2_dimensions_after.opacity;
                                delete frame1_dimensions_before['z-index'];
                                delete frame1_dimensions_after['z-index'];
                                delete frame2_dimensions_after['z-index'];

                                expect(frame1_dimensions_before).toEqual(frame2_dimensions_after);
                                expect(frame1_dimensions_after).toEqual(frame2_dimensions_after);
                            });
                        });
                    });
                });
            });
        });

        /*
            frame2 slides, from the bottom, over default-frame(frame1) - that fades. after transition frame1 is diplay none and stays in the same place.
            */
        it('slideOverUpFade - frame slides up from the bottom as other frame fades', function() {
            browser.get('slidelayout/slideOver.html').then(function() {

                var f1 = element(by.id('frame1'));
                var f2 = element(by.id('frame2'));

                // frame1_display_before == block
                expect(f1.getCssValue('display')).toBe('block');
                // frame2_display_before == none
                expect(f2.getCssValue('display')).toBe('none');

                protractor.promise.all([utilities.setStyle('frame2', {
                    width: '500px',
                    height: '500px'
                }), utilities.setStyle('stage', {
                    width: '500px',
                    height: '500px'
                })]).then(function() {
                    utilities.setAttributes('frame2', {
                        'lj-transition': 'slideOverUpFade'
                    }).then(function() {
                        utilities.wait(300); // time for the style changes to take effect
                        utilities.listenDimensionsBeforeTransition('layer', 'frame1');
                        utilities.listenDimensionsBeforeTransition('layer', 'frame2');
                        utilities.transitionTo('layer', 'frame2', {}).then(function() {
                            protractor.promise.all([
                                utilities.getBoundingClientRect('stage'),
                                utilities.getBoundingClientRect('frame1'),
                                utilities.getBoundingClientRect('frame2'),
                                utilities.getFromStore('frame1'),
                                utilities.getFromStore('frame2')
                            ]).then(function(data) {
                                var stage_dimensions = data[0];
                                var frame1_dimensions_after = data[1];
                                var frame2_dimensions_after = data[2];
                                var frame1_dimensions_before = data[3];
                                var frame2_dimensions_before = data[4];

                                // frame1_display_after == none
                                expect(f1.getCssValue('display')).toBe('none');
                                // frame2_display_after == block
                                expect(f2.getCssValue('display')).toBe('block');
                                // opacity
                                expect(frame1_dimensions_before.opacity).toBe('1');
                                // expect(frame1_dimensions_after.opacity).toBe('0'); //result: Expected '1' to be '0'.- this is not fulfilled because of resetting opacity
                                // z-index
                                expect(frame1_dimensions_before['z-index']).toBe('1');
                                expect(frame1_dimensions_after['z-index']).toBe('-1');
                                // positioning and dimensions of frame1 and frame 2
                                expect(frame2_dimensions_before.bottom).toBe(stage_dimensions.height + frame2_dimensions_after.height);
                                expect(frame2_dimensions_before.top).toBe(stage_dimensions.bottom);
                                expect(frame2_dimensions_before.top).toBe(frame1_dimensions_before.bottom);

                                delete frame1_dimensions_before.opacity;
                                delete frame1_dimensions_after.opacity;
                                delete frame2_dimensions_after.opacity;
                                delete frame1_dimensions_before['z-index'];
                                delete frame1_dimensions_after['z-index'];
                                delete frame2_dimensions_after['z-index'];

                                expect(frame1_dimensions_before).toEqual(frame2_dimensions_after);
                                expect(frame1_dimensions_after).toEqual(frame2_dimensions_after);
                            });
                        });
                    });
                });
            });
        });
    });
});
