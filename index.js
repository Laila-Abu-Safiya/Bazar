const fs = require('fs');
const https =require('http'); 
const { parse } = require('csv-parse');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

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
app.get('/CATALOG_WEBSERVICE_IP', (req, res) => {
    let result = catalog.map(o => ({ id: parseInt(o.id), price: parseInt(o.price), tittle: o.tittle, quantity: parseInt(o.quantity), topic: o.topic }));
    res.send(result);
});
app.post('/CATALOG_WEBSERVICE_IP/purchase/:itemNUM', (req, res) => {
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

});
})

.on('error', (error) => {
    console.log(error);
});

res.send(Book_Sold);
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(` Listeningon port $ { port }...`))
////////
const fs = require('fs');
const { parse } = require('csv-parse');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var catalog = []
var parser = parse({ columns: true }, function(err, Catalog) {
    catalog = Catalog;
});

fs.createReadStream('catalog.csv').pipe(parser);

const express = require('express');
const { text } = require('express');
const e = require('express');
const app = express();
app.get('/', (req, res) => {
    res.send('Hello world!!!');
});
app.get('/CATALOG_WEBSERVICE_IP', (req, res) => {
    let result = catalog.map(o => ({ id: parseInt(o.id), price: parseInt(o.price), tittle: o.tittle, quantity: parseInt(o.quantity), topic: o.topic }));
    res.send(result);
});
app.get('/CATALOG_WEBSERVICE_IP/search/:itemName', (req, res) => {
    let Book = catalog.filter((c => c.topic === req.params.itemName));

    if (!Book) res.status(404).send('The Books is not found!');
    else {
        let result = Book.map(o => ({
            id: parseInt(o.id),
            tittle: o.tittle
        }));
        res.send(result);
    }
});

app.get('/CATALOG_WEBSERVICE_IP/info/:itemNUM', (req, res) => {
    let Book = catalog.filter((c => c.id === req.params.itemNUM));
    if (!Book) res.status(404).send('The Book is not found!');
    let result = Book.map(o => ({ tittle: o.tittle, quantity: parseInt(o.quantity), price: parseInt(o.price) }));
    res.send(result[0]);
});
app.get('/CATALOG_WEBSERVICE_IP/put/:itemNUM', (req, res) => {
    let Book = catalog.filter((c => c.id === req.params.itemNUM));
    if (!Book) res.status(404).send('The Book is not found!');
    else{
        for (var i in catalog) {
            if (catalog[i].id === req.params.itemNUM) {
                if (catalog[i].quantity > 0) {
                    catalog[i].quantity = `${(parseInt(catalog[i].quantity) - 1)}`;
                    const csvWriter = createCsvWriter({
                        path: 'catalog.csv',
                        header: [
                            { id: 'id', title: 'id' },
                            { id: 'price', title: 'price' },
                            { id: 'tittle', title: 'tittle' },
                            { id: 'quantity', title: 'quantity' },
                            { id: 'topic', title: 'topic' }
                        ]
                    });
                    csvWriter
                        .writeRecords(catalog)
                        .then(() => console.log(''));
                      let result = Book.map(o => ({ tittle: o.tittle, quantity: parseInt(o.quantity), price: parseInt(o.price) }));
                     res.send(result[0]);}
                }
            }
        }
});

const port = process.env.PORT||3000;
app.listen(port, () => console.log(` Listeningon port $ { port }...`))
