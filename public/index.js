const socket = io()

socket.on('init', handleInit)
socket.on('gameState', handleGameState)
socket.on('Winner', handleWinner)


function searchGame(ranked){
    socket.emit('searchGame', ranked)
}


let canvas, ctx
let playerNumber
let screenCanvas, screenCtx

canvas = document.getElementById('pingPongCanvas')
ctx = canvas.getContext('2d')


canvas.width = 1280
canvas.height = 720

screenCanvas = document.getElementById('gameScreen');
screenCtx = screenCanvas.getContext('2d');

screenCanvas.width = 600
screenCanvas.height = 400


function drawButton(x, y, text) {
    screenCtx.font = "30px Arial"
    screenCtx.fillStyle = 'white'
    screenCtx.fillText(text, x + 20, y + 25)
  }

function drawTitle(){
    screenCtx.font = "30px Arial"
    screenCtx.fillStyle = "white"
    screenCtx.fillText('Xtreme Ping Pong', screenCanvas.width * 0.25 ,40)
  }


function drawScreen(){

    screenCtx.fillStyle = '#000'
    screenCtx.fillRect(0,0,screenCanvas.width,screenCanvas.height)
    
    drawTitle()
    drawButton(screenCanvas.width * 0.25, screenCanvas.height * 0.5, 'Search Normal')
    if (user_id){
        drawButton (screenCanvas.width * 0.25, screenCanvas.height * 0.40, 'Search Ranked')
    }
    screenCanvas.addEventListener('click', (e) => {
        const x = e.offsetX
        const y = e.offsetY


        if (x > 165 && x < 370 && y > 200 && y < 225){
           switchCanvas()
            searchGame(false)
        } else if (user_id && x > 200 && x < 370 && y > 160 && y < 190){
            switchCanvas()
            searchGame(true)
        }
    })
}

function switchCanvas(){
    screenCanvas.style.display = 'none'
    canvas.style.display = 'block'

    if (canvas.requestFullscreen){
        canvas.requestFullscreen()
    }else if (canvas.webkitRequestFullscreen){
        canvas.webkitRequestFullscreen()
    }else if (canvas.msRequestFullscreen){
        canvas.msRequestFullscreen()
    }

    socket.emit('canvasData',{
        height: canvas.height,
        width: canvas.width
    })

}
function handleInit(data){
    playerNumber = data[0]


    ctx.fillStyle = '#000'
    ctx.fillRect(0,0,canvas.width, canvas.height)

    if (user_id){
        data[1].players[playerNumber - 1].user_id =user_id
    }
    paintPlayer(data[1].players[playerNumber - 1])
    canvas.addEventListener('mousemove', mouseMovem)
}

function mouseMovem(e){
    socket.emit('mouseMovem', e.offsetY)
    
}

function paintPlayer(player){
        ctx.beginPath()
        ctx.rect(player.x, player.y, player.size.width, player.size.height)
        ctx.fillStyle = "blue"
        ctx.fill()
}

function handleWinner(data){

    data = JSON.parse(data)
    if (data === playerNumber){
        console.log("Du hast Gewonnen")
   }
   else {
    console.log("Du hast Verloren")
   }
}





function paintGame(state){
    ctx.fillStyle = '#000'
    ctx.fillRect(0,0,canvas.width, canvas.height)

    const ball = state.ball
    ctx.beginPath()
    ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI *2)
    ctx.fillStyle = 'white'
    ctx.fill()


    paintPlayer(state.players[0])
    paintPlayer(state.players[1])

    ctx.font =  '20px Arial'
    ctx.fillStyle = 'white'
    ctx.fillText(state.players[0].score, (canvas.width *0.5) - 50, 30)
    ctx.fillText(state.gameTime, (canvas.width *0.5) - 12 ,30)
    ctx.fillText(state.players[1].score, (canvas.width *0.5) + 50, 30)
}

function handleGameState(gameState){

    gameState = JSON.parse(gameState)
    requestAnimationFrame(() => paintGame(gameState))
}

drawScreen()