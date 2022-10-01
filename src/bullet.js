import {ctx} from "./core/game.js"
import Thing from "./core/thing.js"

export default class Bullet extends Thing {
  time = 0
  aabb = [-16, -16, 16, 16]
  radius = 12

  constructor(data) {
    super(data)
    this.speed = data.speed
  }

  update() {
    this.time += 1
    this.dead = this.dead || this.time > 60
    super.update()
    this.dead = this.dead || Object.values(this.contactDirections).some(x => x)
  }

  draw() {
    ctx.save()
    ctx.translate(...this.position)

    if (this.time <= 1) {
      ctx.fillStyle = "white"
      ctx.beginPath()
      ctx.arc(0, 0, 36, 0, Math.PI*2)
      ctx.fill()
    } else {
      ctx.fillStyle = "red"
      ctx.beginPath()
      ctx.arc(-1 * this.speed[0], -1 * this.speed[1], this.radius, 0, Math.PI*2)
      ctx.arc(-0.5 * this.speed[0], -0.5 * this.speed[1], this.radius, 0, Math.PI*2)
      ctx.fill()

      ctx.fillStyle = "white"
      ctx.beginPath()
      ctx.arc(0, 0, this.radius, 0, Math.PI*2)
      ctx.fill()
    }

    ctx.restore()
  }
}
