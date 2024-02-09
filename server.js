const express = require('express')
const session = require('express-session')
const path = require('path')
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
require('dotenv').config()

const { MongoClient } = require('mongodb')

const { Game } = require('./public/classes/game')
const { makeid } = require('./public/classes/utils')


const http = require('http')
const {Server} = require('socket.io')
const server = http.createServer(app)
const io = new Server(server, {pingInterval: 2000, pingTimeout: 5000})

const port =  process.env.PORT || 3000

app.use(express.static('public'))
app.use(session({
  secret: 'uwillneverguess', // Geheimnis für die Verschlüsselung der Session-Daten
  cookie: {maxAge: 86400000},
  saveUninitialized: false

}))
// Verbindung MongoDB-Datenbank
const uri = process.env.MONGO 
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })


app.post('/registered', async (req, res) => {
  try {
    await client.connect()

    const database = client.db('PingPong')
    const collection = database.collection('Login') 


    const checking = await collection.findOne({username:req.body['register-username']})

    let unique_id = false
    while (!unique_id){
      let user_id = makeid(12)
      let check = await collection.findOne({user_id: user_id})
      if (check !== null){
        unique_id = true
      }
    }

    if(checking === null){
    await collection.insertOne({
      username:req.body['register-username'],
      playername:req.body['player-name'],
      password:req.body['register-password'],
      user_id:user_id,
    })

    res.status(200).send('Registrierung erfolgreich!')
    res.redirect("/")

  }
  else{
    res.redirect('/signup')
  }
  

    
  } catch (error) {
    console.error('Fehler beim Speichern in der Datenbank:', error)
    res.status(500).send('Interner Serverfehler')
  } finally {

    await client.close()
  }
})


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,  '/index.html'))

})

app.get('/login', (req, res) => {
  if (req.session.authenticated){
    res.redirect("/")
  }else {
    res.sendFile(path.join(__dirname,  'public/login.html'))
  }
})

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname,  'public/signup.html'))
})

app.post('/auth', async (req, res) => {
  const database = client.db('PingPong') 
  const collection = database.collection('Login') 
  try {
    const check = await collection.findOne({ username: req.body['login-username'] })
    console.log(req.body['login-password'])
      if (check.password === req.body['login-password']) {
        req.session.playername = check.playername
        req.session.authenticated = true
        req.session.user_id = check.user_id
        res.redirect("/")
      }
  
      else {
          res.send("incorrect password")
      }

} 

catch (e) {
    console.log(e)
    res.send("wrong details")
}

})

app.get('/getUser', (req, res) => {
  if (req.session){
    res.json({user_id: req.session.user_id})
  } else {
    res.status(404).json({error:"ello"})
  }
})



let canvasHeight = 0
let canvasWidth = 0
const state = {}
const clientRooms ={}

io.on('connection', (socket) => {

  console.log(socket.id)

  socket.on('canvasData', (msg) => {
    if (msg) {
      canvasHeight = msg.height
      canvasWidth = msg.width
    }
    
  })
  socket.on('mouseMovem', handleMouseMovement)
  socket.on('searchGame', handleMatchMaking)

  function handleMouseMovement(y){
    const roomName = clientRooms[socket.id]
    if(!roomName){
      return
    }
    state[roomName].players[socket.number - 1].getVelo(y)
  }
  
  function handleCreateGame(ranked){

    let roomName = makeid(5)
    clientRooms[socket.id] = roomName
    state[roomName] = new Game(ranked, canvasHeight,canvasWidth)
    state[roomName].ranked = ranked 
    state[roomName].players[0].x = 10,
    state[roomName].players[0].y = canvasHeight * 0.5

    
    socket.join(roomName)
    socket.number = 1

    socket.emit('init', [1,state[roomName]])
  }

  function handleMatchMaking(ranked){
    const rooms = io.sockets.adapter.rooms
    let allUsers
    foundlobby = false
    if (Object.keys(clientRooms).length > 0){
      for (var key in clientRooms)
      {
      let roomName = String(clientRooms[key])
      allUsers = rooms.get(roomName)
      if (allUsers){
        let numClients =  allUsers.size
        if ( (numClients === 1) && (!state[roomName].gameActive) && (state[roomName].ranked === ranked)){
          foundlobby = true
          clientRooms[socket.id] = roomName
          socket.join(roomName)
          socket.number = 2
          state[roomName].players[1].x = canvasWidth - 20
          state[roomName].players[1].y = canvasHeight * 0.5
          state[roomName].gameActive = true
          state[roomName].Timer = new Date()

          socket.emit('init', [2, state[roomName]])

          startGameLoop(roomName)
          break
        }
      }
    }
  }


  if (!foundlobby) {
    handleCreateGame(ranked)
  }
  }

  function startGameLoop(roomName){
    const intervalId = setInterval( ()=> {
      const winner = state[roomName].gameLoop()

      if (!winner)
      {
        emitGameState(roomName, state[roomName])
      }else{
        emitWinner(roomName, winner)
        emptyClientRooms(roomName)
        clearInterval(intervalId)
      }
    }, 1000 / process.env.FRAME) 
  }

  function emitGameState(room, gameState){
    io.sockets.in(room).emit('gameState', JSON.stringify(gameState))
  }

  function emitWinner(room, winner){
    io.sockets.in(room).emit('Winner', JSON.stringify(winner))
    if (state[room].ranked){
      mmrCalc(room, winner)
    }
  }

  function disco(clientID){
    let room
    if (clientID in clientRooms){
      room = clientRooms[clientID]
      state[room].players[socket.number - 1].inGame = false
      return room
      }
  }

  function emptyClientRooms(roomName){
    for (var key in clientRooms){
      if(clientRooms[key] == roomName)
      delete clientRooms[key]
    }
  }

  async function mmrCalc(roomName, winner){
    const players = state[roomName].players

    const winnerUser = players[winner - 1].user_id
    const loser = winner == 2 ? players[0].user_id:players[1].user_id
    
  }

  socket.on('disconnect', (reason) => {
    // Lösche das Spiel, wenn der Spieler die Verbindung trennt
    console.log(reason)
    const discoRoom = disco(socket.id, socket.number)
    emptyClientRooms(discoRoom)
  
  })
})



server.listen(port, () => {
  console.log(`Server is running on port localhost:${port}`)
})
