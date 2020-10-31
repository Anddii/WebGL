var express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser')
var fs = require("fs");
var app = express();

// create application/json parser
var jsonParser = bodyParser.json()

app.get('/getscene', cors(),function (req, res) {
    fs.readFile( "saved_files/scene.json", 'utf8', function (err, data) {
        res.end( data );
    });
})

app.post('/setscene', jsonParser ,cors(),function (req, res) {
    fs.writeFile("saved_files/scene.json", JSON.stringify(req.body), function (err) {
        if (err) return console.log(err);
    })
})

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions));

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})