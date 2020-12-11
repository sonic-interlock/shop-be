const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

const paths = {
  products: 'https://og1r0j6mg2.execute-api.eu-west-1.amazonaws.com/dev',
  import: 'https://yvsjfsuvm7.execute-api.eu-west-1.amazonaws.com/dev',
};

app.use('/products', createProxyMiddleware({changeOrigin: true,
    target: paths.products, logLevel: 'warn'}));

app.use('/import', createProxyMiddleware({changeOrigin: true,
    target: paths.import, logLevel: 'warn'}));

app.use('*', function(req, res) {
    console.log(req)
    res.status(502);
    res.write('502 cannot get service');
    res.send();
})
app.listen(process.env.PORT || 8080);