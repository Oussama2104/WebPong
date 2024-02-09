

class Player{
    constructor(x, y, color,canvasHeight, user_id){
        this.x = x
        this.y = y
        this.size = {
            width:10,
            height:45
        }
        this.canvasHeight = canvasHeight
        this.color = color
        this.score = 0
        this.ballcollision = false
        this.inGame = true
        this.user_id = user_id

    }

    getVelo(y){
        let dy = y - this.y
        let speedY = dy / 3
        if ( this.y + this.size.height + speedY > 0 && this.y + this.size.height + speedY < this.canvasHeight){
            this.y += speedY
        }
}
}

module.exports = { Player
}
