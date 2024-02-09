


class Ball {
    constructor(x,y,radius=5,canvasHeight){
        this.x = x
        this.y = y
        this.radius = radius
        this.speedX = Math.random() > 0.5 ? 2 : -2
        this.speedY = Math.random() > 0.5 ? 2 : -2
        this.canvasHeight = canvasHeight
    }


    checkCollision(player){

        const rectCollision = (
            x1, y1, width1, height1,
            x2, y2, width2, height2
          ) => {
            return (
              x1 < x2 + width2 &&
              x1 + width1 > x2 &&
              y1 < y2 + height2 &&
              y1 + height1 > y2
            )
          }
          
          if (rectCollision(
            this.x - this.radius,
            this.y - this.radius,
            2 * this.radius,
            2 * this.radius,
            player.x,
            player.y,
            player.size.width,
            player.size.height
          )) {
            player.ballcollision = true
    
          }
    
        
        
    
    }

    getBallVelo(players){
        this.checkCollision(players[0])
        this.checkCollision(players[1])
    
        if (players[0].ballcollision || players[1].ballcollision) {
            // Berechne den Einfallswinkel
            const incidentAngle = Math.atan2(this.speedY,this.speedX)
        
            // Berechne den Reflexionswinkel
            const reflectionAngle = incidentAngle + (Math.PI - 2 * incidentAngle)
        
            // Berechne die Geschwindigkeitslänge
            const speed = Math.hypot(this.speedX, this.speedY)
        
            // Berechne die neuen Geschwindigkeitskomponenten basierend auf dem Reflexionswinkel
            this.speedX = speed * Math.cos(reflectionAngle)
            this.speedY = speed * Math.sin(reflectionAngle)
    
            players[0].ballcollision = false
            players[1].ballcollision = false
        }
        
        // Restlicher Code für Kollision mit Wänden
    
        if (this.y - this.radius < 0 || this.y + this.radius > this.canvasHeight) {
            // Wenn ja, kehre die Richtung in der vertikalen Richtung um
            this.speedY *= -1
        }
        this.y += this.speedY
        this.x +=this.speedX
    }
    
}

module.exports = {
  Ball
}