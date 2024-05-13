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
  username: String,
  description: String,
  duration: Number,
  date: Date
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

async function getUsers(){
  const users = await Users.find({});
  return users;

}

app.get('/api/users', function(req,res){
  getUsers().then((users)=>{
    res.json(users)
  })
})

app.post('/api/users/:_id/exercises', async function(req,res){
  const {description, duration, date} = req.body
  try {
    const user = await Users.findById(req.params._id)
    if (!user){
      res.json({error: "User not found"})
      return
    }
    // Create a new Date object
    const exerciseDate = date ? new Date(date) : new Date();

    // Format the date using toLocaleDateString() with the defined options
    const username = user.username
    let newExercise = new Exercises({
      username: username,
      description: description,
      duration: duration,
      date: exerciseDate
    })

    newExercise.save()
    res.json({
      username: username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: exerciseDate.toDateString(),
      _id: user._id
    })
  }
  
  catch(err){
    console.log(err)
  }})

app.get("/api/users/:_id/logs", async function (req,res){
  let count = 0;
  const {from, to, limit} = req.query
  try {
    const user = await Users.findById(req.params._id)
    if (!user){
      res.json({error: "User not found"})
      return
    }

    const query = {username: user.username}
    
    let dateFilter ={}
    // Add conditions for 'from' and 'to' dates if provided
    if (from) {
      const fromDate = new Date(from);
      dateFilter["$gte"] = fromDate
    } 
    if (to) {
      const toDate = new Date(to);
      dateFilter["$lte"] = toDate
    }

    let exercisesQuery = Exercises.find(query)
    if (limit) {
      exercisesQuery = exercisesQuery.limit(+limit);
    }
    const exercises = await exercisesQuery
    let log = exercises.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString(),
    }))
    res.json({
      username: user.username,
      count: log.length,
      _id: user._id,
      log: log
    })

  }
  catch(err) {
    console.log(err)
    res.json("Server Error")
  }

})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
