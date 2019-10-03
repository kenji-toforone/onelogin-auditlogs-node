'use strict';

const aws = require('aws-sdk');
const request = require('request-promise');
require('dotenv').config();

// AWS Setting
aws.config.region = process.env.AWS_REGION;
if (process.env.LOCAL) {
    var credentials = new aws.SharedIniFileCredentials(
        {profile: process.env.LOCAL_PROFILE});
    aws.config.credentials = credentials;
}

// OneLogin Setting
const ONELOGIN_CLIENTID = process.env.ONELOGIN_CLIENTID;
const ONELOGIN_SECRET = process.env.ONELOGIN_SECRET;

// S3 Setting
var s3 = new aws.S3();
var bucketName = process.env.S3_BUCKETNAME;
var fileName = '';
var contentType = 'application/json';

exports.handler = (event, context, callback) => {
    main();
};

// get Onelogin AccessToken
async function getAccessToken() {
    var accessToken;
    let options = {
        method: 'POST',
        uri: 'https://api.us.onelogin.com/auth/oauth2/v2/token',
        auth: {
            user: ONELOGIN_CLIENTID,
            pass: ONELOGIN_SECRET
        },
        json: {
            grant_type: 'client_credentials'
        }
    }
    await request(options)
        .then(function (body) {
            accessToken = body.access_token;
        })
        .catch(function (err) {
            console.log(err);
        });
    return accessToken;
}

// get Onelogin event log recursively
async function getEventsRecursively(accessToken,eventGetUrl) {
    let options = {
        method: 'GET',
        uri: eventGetUrl,
        auth: {
            bearer: accessToken
        }
    }
    var fileIndex = 0;
    var next_link = 'not null';
    while (next_link!=null) {
        await request(options).then(function (body) {
            var jBody = JSON.parse(body);
            // Put this data somewhere like ElasticSearch,S3 blah blah blah.
            var body = '';
            jBody.data.forEach(function( value ) {
                body = body + JSON.stringify(value) + '\n';
            });
            console.log(body);
            // Case : Using S3
            // Upload the BodyData file to S3
            var params = {
                Key: fileName + ('0000000000' + fileIndex).slice(-10),
                Body: body,
                Bucket: bucketName,
                ContentType: contentType,
            };
            s3.putObject(params, function(err, data) {
                if (err) {
                    console.log("Error uploading data: ", err);
                } else {
                    console.log("Successfully uploaded data to " 
                        + bucketName + "/" + fileName);
                }
            });
            // Check next_link and get recursively
            next_link = jBody.pagination.next_link;
            fileIndex++;
            options = {
                method: 'GET',
                uri: next_link,
                auth: {
                    bearer: accessToken
                }
            }
        })
        .catch(function (err) {
            console.log(err);
            next_link = null;
        });
    }
}

async function main() {
    // create Since Until Date
    // this case, specify from 00:00 to 23:59 the previous day
    var untilDate = new Date();
    untilDate.setDate(untilDate.getDate() -1);
    var sinceDate = new Date(untilDate.setHours(0, 0, 0, 0));
    untilDate.setHours(23, 59, 59, 999);
    // set S3 FileName
    fileName = sinceDate.toISOString();
    // make Url
    var eventGetUrl = 'https://api.us.onelogin.com/api/1/events?since='+sinceDate.toISOString()+'&until=' + untilDate.toISOString();
    // get Onelogin AccessToken
    var accessToken = await getAccessToken();
    // Using an access token, get Onelogin event log recursively
    await getEventsRecursively(accessToken,eventGetUrl);
}