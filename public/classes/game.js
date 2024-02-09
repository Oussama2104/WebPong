const {Player} = require("./player")
const {Ball} = require("./ball")


class Game {
    constructor(ranked, height, width) {
    this.height = height
    this.width = width
    this.players = [new Player(0,0,'blue', this.height,""), new Player(0,0,'blue', this.height,"")]
    this.ball = new Ball(this.width * 0.5, this.height*0.5, 5, this.height)
    this.Timer = 0,
    this.ranked = ranked,
    this.gameActive = false,
    this.gameTime = "4:00"
    }

    TimerCal(){
        let currentTime = new Date();
        let deltaTime = ((this.Timer.getTime() - currentTime.getTime() ) / 1000) * -1
        if (deltaTime > 1){
            this.Timer = currentTime
            let minute = parseInt(this.gameTime.split(":")[0])
            let sek = parseInt(this.gameTime.split(":")[1])
            if (sek === 0 && minute === 0 ){
                this.gameTime = "0:00"
            } else if (sek === 0 && minute > 0){
                minute -= 1
                let strMinute = String(minute)
                this.gameTime = strMinute + ":59"
                
            }else{
                sek -= 1
                let strSek = sek.toString().padStart(2,"0")
                this.gameTime = String(minute) + ":" + strSek
            }
        }
    
    }

    resetGame(){
       this.ball.y = this.height * 0.5
       this.ball.x = this.width * 0.5
        this.ball.speedX = Math.random() > 0.5 ? 2 : -2
        this.ball.speedY = Math.random() > 0.5 ? 2 : -2
    }


    gameLoop(){
        if (!this){
            return;
        }

        const playerOne = this.players[0];
        const playerTwo = this.players[1];
    
        playerOne.y;
        playerTwo.y;
    
        this.ball.getBallVelo(this.players)
    
    
        if (this.ball.x < playerOne.x &&this.ball.x < 0){
            playerTwo.score += 1
            this.resetGame()
        }
        
        
        if (this.ball.x > playerTwo.x && this.ball.x > this.width){
            playerOne.score += 1
            this.resetGame()
        }
        if(this.gameTime === "0:00"){
            if (playerOne.score === playerTwo.score){
                return "draw"
            } else if (playerOne.score > playerTwo.score){
                return 1
            }
            else {
                return 2
            }
        }
    
        if ( (!playerOne.inGame) || (!playerTwo.inGame)){
    
            if (!playerOne.inGame){
                return 2
            }
            else{
                return 1
            }
        }
        this.TimerCal()
    
        return false
    }
}

module.exports = {
    Game,
}
