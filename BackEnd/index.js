const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();


//Express configuration
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cors());
const api = require('./routes/api.routes');
// const auth = require('./routes/auth.routes');

app.use('/api', api);
// app.use('/auth',auth);

const port = process.env.PORT || 8000;
app.listen(port, ()=> {
    console.log('Connected to port ' + port);
});

app.use((req,res,next) => {
    setImmediate(()=> {
        next(new Error('Something Went Wrong'));
    });
});

app.use((err,req,res,next) => {
    console.log(err);
    if(err.statutsCode) err.statutsCode = 500;
    res.status(err.statutsCode).send(err.message);
})