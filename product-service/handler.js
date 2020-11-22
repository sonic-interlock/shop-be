'use strict';
const { Client } = require('pg');

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;
const dbOptions = {
    host: PG_HOST,
    port: PG_PORT,
    database: PG_DATABASE,
    user: PG_USERNAME,
    password: PG_PASSWORD,
    ssl: {
        rejectUnauthorized: false // to avoid warring in this example
    },
    connectionTimeoutMillis: 5000 // time in millisecond for termination of the database query
};

async function runQuery(query) {
    const client = new Client(dbOptions);
    await client.connect();
    try {
        const result = await client.query(query);
        console.log(result)
        return result.rows;
    } finally {
        client.end();
    }
}

function filterFields(data) {
  return {
    id: data.id,
    price: data.price,
    title: data.title,
    count: data.count,
    description: data.description
  }
}

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PATCH, PUT',
}

module.exports.getProductsList = async event => {
  const data = await runQuery(`select * from products 
    full join stocks on products.id=stocks.product_id;`)
  const cats = data.map(filterFields)
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(cats),
  };
};


module.exports.getProductsById = async event => {
  const id = event.pathParameters.id;
  const [cat] = await runQuery(`select * from products 
    inner join stocks on products.id=stocks.product_id and products.id=${id};`);
  if (cat) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(filterFields(cat)),
    };
  } else {
    return {
      statusCode: 404,
      headers,
      body: 'Cannot find cat with id ' + id
    }
  }
};

module.exports.addProduct = async event => {
  const body = JSON.parse(event.body);
  const {title, description, price, count} = body;
  const [{product_id: newId}] = await runQuery(`
    with product_insert as (
      INSERT INTO products (title, description, price)
        VALUES('${title}', '${description}', ${price}) returning id
    )
    INSERT INTO stocks (product_id, count) 
      VALUES((select id from product_insert), ${count}) returning *;
`);
  return {
    statusCode: 200, headers,
    body: `{id: ${newId}}`
  }
}

module.exports.catalogBatchProcess = async event => {
  console.log(event);
  console.log(event.Resources);
  return {statusCode: 200}
}