const fs = require('fs');
const https =require('http'); 
const { parse } = require('csv-parse');

var Book_Sold = []
var parser_Order = parse({ columns: true }, function(err, Order) {
    Book_Sold = Order;
});

fs.createReadStream('order.csv').pipe(parser_Order);

const express = require('express');
const { text, response } = require('express');
const e = require('express');

const app = express();
app.get('/', (req, res) => {
    res.send('Hello world!!!');
});
app.post('/CATALOG_WEBSERVICE_IP', (req, res) => {
    let result = catalog.map(o => ({ id: parseInt(o.id), price: parseInt(o.price), tittle: o.tittle, quantity: parseInt(o.quantity), topic: o.topic }));
    res.send(result);
});
app.get('/CATALOG_WEBSERVICE_IP/purchase/:itemNUM', (req, res) => {
   // let Book = catalog.filter((c => c.id === req.params.itemNUM));
   // if (!Book) res.status(404).send('The Book is not found!');
   let data = '';
   let parse;
https.get(`http://10.0.2.4:3000/CATALOG_WEBSERVICE_IP/put/${req.params.itemNUM}`, (res) => {
res.on('data', (chunk) => {
    data += chunk;
    console.log(chunk);
});
res.on('end', () => {
    console.log(data);
 parse = JSON.parse(data);
 const book = {
    id : Book_Sold.length,
    tittle : parse.tittle,
    price: parse.price
 } 
 Book_Sold.push(book);  
 const csvWriterOrder = createCsvWriter({
    path: 'order.csv',
    header: [
        { id: 'id', title: 'id' },
        { id: 'tittle', title: 'tittle' },
        { id: 'price', title: 'price' }
    ]
});
csvWriterOrder
    .writeRecords(Book_Sold)
    .then(() => console.log(``));
res.send(Book_Sold);

});
})

.on('error', (error) => {
    console.log(error);
});

res.send(Book_Sold);
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(` Listeningon port $ { port }...`))
