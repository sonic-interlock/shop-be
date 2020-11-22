'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({region: 'eu-west-1'});
const csv = require('csv-parser')
const bucket = 'da-rs-app-bucket';
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PATCH, PUT',
}

module.exports.importProductsFile = async event => {
  const name = event.queryStringParameters.name;
  const params = {
    Bucket: bucket,
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

module.exports.importFileParser = async event => {
  const sqs = new AWS.SQS();
  const streams = event.Records.map(record => {
    const params = {
      Bucket: bucket,
      Key: record.s3.object.key
    }
    const stream = s3.getObject(params).createReadStream().pipe(csv());
    const dataSent = [];
    const dataParsed = new Promise((res, rej) => {
        stream.on('data', parsed => {
          dataSent.push(new Promise((res, rej) => {
            sqs.sendMessage({
              QueueUrl: process.env.SQS_URL,
              MessageBody: parsed
            }, (err, response) => {
              if (err) rej(err);
              res(response)
            })
          }))
        });
        stream.on('error', err => rej(err));
        stream.on('end', () => res())
    });
    return Promise.all([dataParsed].concat(dataSent));
  })

  return Promise.all(streams).then(() => ({headers, statusCode: 200}));
  
}