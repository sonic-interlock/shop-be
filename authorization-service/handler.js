'use strict';

module.exports.basicAuthorizer = (event, ctx, cb) => {
  console.log(event);
  if (event.type !== 'TOKEN') {
    return cb('Unauthorized')
  }
  const {authorizationToken} = event;
  const encodedCreds = authorizationToken.split(' ')[1];
  const buff = Buffer.from(encodedCreds, 'base64');
  const [username, password] = buff.toString('utf-8').split(':');
  console.log(username+':'+password)
  const storedPassword = process.env[username];
  if (storedPassword !== password || !storedPassword) {
    return cb(null, generatePolicy('Deny'));
  } else {
    return cb(null, generatePolicy('Allow'));
  }

  function generatePolicy(effect) {
    return {
      principalId: encodedCreds,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Action: ['execute-api:Invoke'],
          Effect: effect,
          Resource: [event.methodArn]
        }]
      }
    }
  }
};

