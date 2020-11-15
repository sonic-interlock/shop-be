'use strict';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PATCH, PUT',
}

module.exports.importProductsFile = async event => {
  const data = await runQuery(`select * from products 
    full join stocks on products.id=stocks.product_id;`)
  const cats = data.map(filterFields)
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(cats),
  };
};
