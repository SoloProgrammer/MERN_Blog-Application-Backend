const connectToMongo = require('./db')
var cors = require("cors")

const bodyparser = require('body-parser');

connectToMongo();

const express = require('express')
const app = express()
const port = 5000

app.use(express.json())

app.use(cors())

app.use(bodyparser.urlencoded({extended:false}));

app.use(bodyparser.json())

app.use('/uploads',express.static('uploads'))

// available routes

app.use('/api/auth',require('./Routes/auth.js'))
app.use('/api/blog',require('./Routes/blog.js'))


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})