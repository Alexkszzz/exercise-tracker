const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

let mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true, useUnifiedTopology: true})
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const exerciseSchema = new mongoose.Schema({
  username:String,
  description: String,
  duration: Number,
  date: String
})

const userSchema = new mongoose.Schema({
  username: String
})



const Exercises = mongoose.model('Exercises', exerciseSchema)
const Users = mongoose.model('Users', userSchema)
app.post('/api/users', function (req,response){
  let newUser = new Users({username: req.body.username})
  newUser.save().then(()=>{
      response.json({
        username: newUser.username,
        _id: newUser._id
      })
    }).catch((err) =>{
      console.log(err)
    })
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
