'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({region: 'eu-west-1'});

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PATCH, PUT',
}

module.exports.importProductsFile = async event => {
  const name = event.queryStringParameters.name;
  const params = {
    Bucket: 'da-rs-app-bucket',
    Key: 'uploaded/'+name,
    Expires: 60,
    ContentType: 'text/csv'
  }
  return new Promise((res, rej) => {
    s3.getSignedUrl('putObject', params, (err, url) => {
      if (err) rej(err);

      res({
        statusCode: 200,
        headers,
        body: url,
      })
    })
  })
};
