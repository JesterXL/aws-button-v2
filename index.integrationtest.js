const chai = require('chai');
chai.should();
const {
    getWeather
} = require('./index');
const log = console.log;
const _ = require('lodash');

describe("index.js", ()=>
{
    describe("#getWeather", ()=>
    {
        it('should give back a numerical tempature', done =>
        {
            getWeather()
            .then(result =>
            {
                _.isNumber(result.main.temp).should.be.true;
                done();
            })
            .catch(done);
        });
    });
});