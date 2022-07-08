const fs = require('fs'); //fs to read csv file
const { parse } = require('csv-parse');
const createCsvWriter = require('csv-writer').createObjectCsvWriter; //requierd to write to the file when update
var Book_Sold = []
var catalog = []
var parser = parse({ columns: true }, function(err, Catalog) {
    catalog = Catalog;
});

fs.createReadStream('catalog.csv').pipe(parser);  //read catalog.csv
var parser_Order = parse({ columns: true }, function(err, Order) {
    Book_Sold = Order;
});

fs.createReadStream('order.csv').pipe(parser_Order);//read order.csv

const express = require('express'); //use express to API's
const { text } = require('express');
const e = require('express');
const app = express();
app.get('/', (req, res) => {
    res.send('Hello world!!!');
});
app.get('/CATALOG_WEBSERVICE_IP', (req, res) => { //first API return all books
    let result = catalog.map(o => ({ id: parseInt(o.id), price: parseInt(o.price), tittle: o.tittle, quantity: parseInt(o.quantity), topic: o.topic }));
    res.send(result);
});
app.get('/CATALOG_WEBSERVICE_IP/search/:itemName', (req, res) => {//return books belong to topic
    let Book = catalog.filter((c => c.topic === req.params.itemName));

    if (!Book) res.status(404).send('The Books is not found!');//if topic not found
    else {
        let result = Book.map(o => ({//returned value
            id: parseInt(o.id),
            tittle: o.tittle
        }));
        res.send(result);
    }
});

app.get('/CATALOG_WEBSERVICE_IP/info/:itemNUM', (req, res) => {//API return the info for specific book  due to id
    let Book = catalog.filter((c => c.id === req.params.itemNUM));
    if (!Book) res.status(404).send('The Book is not found!');//if not exist
    let result = Book.map(o => ({ tittle: o.tittle, quantity: parseInt(o.quantity), price: parseInt(o.price) }));//returend value
    res.send(result[0]);
});
app.get('/CATALOG_WEBSERVICE_IP/purchase/:itemNUM', (req, res) => {//API to purchase specific item
    let Book = catalog.filter((c => c.id === req.params.itemNUM));
    if (!Book) res.status(404).send('The Book is not found!');//if not exist
    else {
        for (var i in catalog) {
            if (catalog[i].id === req.params.itemNUM) {//if its exist 
                if (catalog[i].quantity > 0) {//if theres still items to buy
                    catalog[i].quantity = `${(parseInt(catalog[i].quantity) - 1)}`;//decrement from catalog
                    Book_Sold[i].quantity = `${(parseInt(Book_Sold[i].quantity) + 1)}`;//increment to the number of bought book
                    const csvWriter = createCsvWriter({//update the number of book available in catalog server
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
                    const csvWriterOrder = createCsvWriter({//update the number of book bought in order server
                        path: 'order.csv',
                        header: [
                            { id: 'id', title: 'id' },
                            { id: 'tittle', title: 'tittle' },
                            { id: 'quantity', title: 'quantity' }
                        ]
                    });
                    csvWriterOrder
                        .writeRecords(Book_Sold)
                        .then(() => console.log(``));
                    res.send(`Bought book ${catalog[i].tittle}`); //returend value
                }
            }
        }

    }
});

const port = process.env.PORT || 3000;//connection to server
app.listen(port, () => console.log(` Listeningon port $ { port }...`))