'use strict';
const data = require('./cats');

module.exports.getProductsList = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};


module.exports.getProductsById = async event => {
  const id = event.pathParameters.id;
  const cat = data.find(c => c.id === id);
  if (cat) {
    return {
      statusCode: 200,
      body: JSON.stringify(cat),
    };
  } else {
    return {
      statusCode: 404,
      body: 'Cannot find cat with id ' + id
    }
  }
};