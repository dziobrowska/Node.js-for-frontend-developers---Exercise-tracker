const express = require('express')
const bodyParser = require('body-parser') 
const app = express()
const cors = require('cors')
require('dotenv').config()
require('./db');

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const usersRouter = require("./routes/users");

app.use("/api/users", usersRouter);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
