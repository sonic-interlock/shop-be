'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({region: 'eu-west-1', signatureVersion: "v4"});
const csv = require('csv-parser')
const bucket = 'da-rs-app-bucket';
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PATCH, PUT',
  'Access-Control-Allow-Credentials': 'true',
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
  const sns = new AWS.SNS();
  const allData = [];
  const streamsSent = event.Records.map(async record => {
    const params = {
      Bucket: bucket,
      Key: record.s3.object.key
    }
    const stream = s3.getObject(params).createReadStream().pipe(csv());
    const dataSent = [];
    const dataParsed = new Promise((res, rej) => {
        stream.on('data', parsed => {
          dataSent.push(sqs.sendMessage({
              QueueUrl: process.env.SQS_URL,
              MessageBody: JSON.stringify(parsed)
            }).promise()
          )
          allData.push(parsed);
        });
        stream.on('error', err => rej(err));
        stream.on('end', () => res())
    })

    await dataParsed;
    await sns.publish({
      Subject: 'New cats has been added to the DB',
      Message: JSON.stringify(allData),
      TopicArn: process.env.SNS_ARN
    }).promise();
    return Promise.all(dataSent);
  })

  return Promise.all(streamsSent).then(() => ({headers, statusCode: 200}));
  
}