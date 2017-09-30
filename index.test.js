const chai = require('chai');
chai.should();
const {
    getWeather
} = require('./index');
const log = console.log;

const weatherMock = {
    "coord": {
      "lon": -77.37,
      "lat": 37.61
    },
    "weather": [
      {
        "id": 801,
        "main": "Clouds",
        "description": "few clouds",
        "icon": "02d"
      }
    ],
    "base": "stations",
    "main": {
      "temp": 67.23,
      "pressure": 1023,
      "humidity": 43,
      "temp_min": 64.4,
      "temp_max": 69.8
    },
    "visibility": 16093,
    "wind": {
      "speed": 18.34,
      "deg": 340,
      "gust": 9.8
    },
    "clouds": {
      "all": 20
    },
    "dt": 1506784500,
    "sys": {
      "type": 1,
      "id": 2875,
      "message": 0.0037,
      "country": "US",
      "sunrise": 1506769496,
      "sunset": 1506811963
    },
    "id": 4772566,
    "name": "Mechanicsville",
    "cod": 200
  };

describe("index.js", ()=>
{
    describe("#getWeather", ()=>
    {
        it('should work with good data', done =>
        {
            const mockRequest = (url, callback) => callback(undefined, {statusCode: 200}, JSON.stringify(weatherMock));
            getWeather(mockRequest)
            .then(result =>
            {
                result.main.temp.should.equal(67.23);
                done();
            })
            .catch(done);
        });
        it('should fail with bad status code', done =>
        {
            const mockBadRequest = (url, callback) => callback(undefined, {statusCode: 500}, JSON.stringify(weatherMock));
            getWeather(mockBadRequest)
            .then(()=> done(new Error('Should of failed')))
            .catch(()=> done());
        });
        it('should fail with bad JSON', done =>
        {
            const mockBadRequest = (url, callback) => callback(undefined, {statusCode: 200}, '');
            getWeather(mockBadRequest)
            .then(()=> done(new Error('Should of failed')))
            .catch(()=> done());
        });
        it('should fail with request error', done =>
        {
            const mockBadRequest = (url, callback) => callback(new Error('boom'));
            getWeather(mockBadRequest)
            .then(()=> done(new Error('Should of failed')))
            .catch(()=> done());
        });

    });
});