Kern=require('../Kern.js');

describe("Kern",function(){
	it('can create a Model',function(){
		var m=new Kern.Model();
		expect(m).not.toBeUndefined();
	});
});
