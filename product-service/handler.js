'use strict';
const data = require('./cats');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PATCH, PUT',
}

module.exports.getProductsList = async event => {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(data),
  };
};


module.exports.getProductsById = async event => {
  const id = event.pathParameters.id;
  const cat = data.find(c => c.id === id);
  if (cat) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(cat),
    };
  } else {
    return {
      statusCode: 404,
      headers,
      body: 'Cannot find cat with id ' + id
    }
  }
};