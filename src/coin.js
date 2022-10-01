import {ctx, getScene, getThing} from "./core/game.js"
import Thing from "./core/thing.js"

export default class Coin extends Thing {
  time = 0
  aabb = [-16, -16, 16, 16]

  update() {
    this.time += 1
    //getScene().camera.yaw = getScene().camera.yaw || 0
    //getScene().camera.yaw += 0.01

    if (this.getAllThingCollisions().includes(getThing("player"))) {
      this.dead = true
      console.log("hit!")
    }
  }

  draw() {
    ctx.save()
    ctx.fillStyle = "yellow"
    ctx.translate(...this.position)
    ctx.scale(Math.sin(this.time/20), 1)
    ctx.beginPath()
    ctx.arc(0, 0, 16, 0, Math.PI*2)
    ctx.fill()
    ctx.restore()
  }
}
