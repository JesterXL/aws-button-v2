/**
 * This is a sample Lambda function that sends an SMS on click of a
 * button. It needs one permission sns:Publish. The following policy
 * allows SNS publish to SMS but not topics or endpoints.
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sns:Publish"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Effect": "Deny",
            "Action": [
                "sns:Publish"
            ],
            "Resource": [
                "arn:aws:sns:*:*:*"
            ]
        }
    ]
}
 *
 * The following JSON template shows what is sent as the payload:
{
    "serialNumber": "GXXXXXXXXXXXXXXXXX",
    "batteryVoltage": "xxmV",
    "clickType": "SINGLE" | "DOUBLE" | "LONG"
}
 *
 * A "LONG" clickType is sent if the first press lasts longer than 1.5 seconds.
 * "SINGLE" and "DOUBLE" clickType payloads are sent for short clicks.
 *
 * For more documentation, follow the link below.
 * http://docs.aws.amazon.com/iot/latest/developerguide/iot-lambda-rule.html
 */

'use strict';

const AWS = require('aws-sdk');
const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });
const request = require('request');
const Result = require('folktale/result');
const _ = require('lodash');

const PHONE_NUMBER = require('./phoneNumber');
const WEATHER_KEY = require('./weatherKey');

const log = console.log;

const parseWeatherJSON = body => {
    try
    {
        const json = JSON.parse(body);
        return Result.Ok(json);
    }
    catch(err)
    {
        return Result.Error(err);
    }
};

const getStatusCode = response => _.get(response, 'statusCode');
const responseOk = response => getStatusCode(response) === 200;

const getWeather = (requestFunction=request) =>
    new Promise((success, failure)=>
        requestFunction(`http://api.openweathermap.org/data/2.5/weather?q=Mechanicsville,va&units=imperial&APPID=${WEATHER_KEY}`, (error, response, body)=>
            error ? failure(error)
            : responseOk(response) === false ? failure(new Error(`Status code wasn't 200: ${getStatusCode(response)}`))
                : parseWeatherJSON(body).matchWith({
                    Ok: ({value}) => success(value),
                    Error: ({value}) => failure(value)
                })));

const getWeatherString = result => `High of ${result.main.temp_max}, low of ${result.main.temp_min}.
Currently ${result.main.temp} with ${result.weather[0].description}, wind ${result.wind.speed} mph.`;

const handler = (event, context, callback) => {
    console.log('Received event:', event);

    // console.log(`Sending SMS to ${PHONE_NUMBER}`);
    // const payload = JSON.stringify(event);
    // const params = {
    //     PhoneNumber: PHONE_NUMBER,
    //     Message: `Hello from your IoT Button ${event.serialNumber}. Here is the full event: ${payload}.`,
    // };
    // // result will go to function callback
    // SNS.publish(params, callback);

    getWeather()
    .then(result =>
    {
        const str = getWeatherString(result);
        SNS.publish({
            PhoneNumber: PHONE_NUMBER,
            Message: str
        }, callback);
        // callback(undefined, undefined, str);
    })
    .catch(error =>
    {
        callback(error);
    });
};

module.exports = {
    getWeather,
    handler
}