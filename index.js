const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const bodyParser = require('body-parser')
const app = express()
const port = 3001;
const cors=require("cors");
const corsOptions ={
   origin:'*', 
}

app.use(cors(corsOptions)) 

const db = new sqlite3.Database("./users.db", err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'users.db'");
});
function randomNumber(min, max) { 
  return Math.random() * (max - min) + min;
} 
app.use(bodyParser.json())

/**
 * Checks the password supplied as a parm in the body against the user identified by 
 * the username or email supplied in the body
 * 
 */
app.post('/user/checkPassword', async (req, res) => {
  let queryString;
  let property;
  let body = req.body
  console.log(req.body)
  if (body.username && body.password) {
    queryString = 'SELECT * FROM users WHERE username = ?';
    property = body.username;
  }
  else if (body.email && body.password) {
    queryString = 'SELECT * FROM users WHERE email = ?';
    property = body.email;
  }
  else {
    res.statusCode = 400
    res.json({message: "Please enter a username or email and a password", success: false})
    return
  }

  db.get(queryString, property, (err, rows) => {
    console.log(err)
    console.log(rows)
    if (rows) {
      if (rows.password == body.password) {
        // I know this is lazy, let me be
        rows.message = "Passwords match"
        rows.success = true
        res.json(rows)
      }
      else {
        res.statusCode = 403
        res.json({message: "Passwords do not match", success: false})
      }
    }
    else {
      res.statusCode = 404
      res.json({message: "User not found", success: false})
    }
  });
})

app.delete('/user/deleteByUsername', async (req, res) => {
  db.run('DELETE FROM users WHERE username = ?', req.query.username, (err, rows) => {res.json(rows)});
})

app.post('/user/create', async (req, res) => {
  db.run('INSERT INTO users (firstName,surname,username,password,email,userId,dateOfBirth) VALUES (?,?,?,?,?,?,?);', req.body.firstName, 
  req.body.surname, req.body.username, req.body.password, req.body.email,randomNumber(1000, 9999), req.body.dateOfBirth);
})

app.listen(port, () => {
  console.log(`Users app listening on port ${port}`)
})
