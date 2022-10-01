import {getScene, mouse, keysDown, keysPressed, ctx} from "./core/game.js"
import {width, height} from "./config.js"
import {sign, angleTowards, lerp, random, clamp} from "./core/utils.js"
import * as vec2 from "./core/vector2.js"
import assets from "./assets.js"
import Thing from "./core/thing.js"
import Bullet from "./bullet.js"

export default class Player extends Thing {
  sprite = assets.images.lad
  spriteOffset = [8, 0]
  aabb = [-8, -16, 8, 32]
  stretch = [1, 1]
  direction = 1
  mouseAngle = 0
  depth = 10
  isOnGround = false
  coyoteTime = 0
  wannaJump = 0
  animations = {
    idle: {frames: [0, 1], speed: 1/12},
    walk: {frames: [0, 2], speed: 1/8},
    jump: {frames: [2], speed: 0},
  }
  collisionSettings = {
    solidThings: true,
    tiles: new Set([1]),
    levelContained: true
  }

  constructor(data) {
    super(data)
    this.setName("player")
    //mouse.setStyle("none")
  }

  update() {
    const camera = getScene().camera.position
    this.mouseAngle = angleTowards(...this.position, mouse.position[0] + camera[0] - width/2, mouse.position[1] + camera[1] - height/2)
    this.direction = sign(Math.cos(this.mouseAngle)) || this.direction

    const walkSpeed = 2
    const airSpeed = 0.65
    const friction = 0.8

    this.coyoteTime = Math.max(this.coyoteTime - 1, 0)
    this.wannaJump = Math.max(this.wannaJump - 1, 0)

    if (mouse.button && !this.reloading) {
      this.reloading = true
      this.after(10, () => this.reloading = false)
      const mp = vec2.subtract(vec2.add(mouse.position, getScene().camera.position), [width/2, height/2])
      const angle = angleTowards(...this.position, ...mp) + random(-0.1, 0.1)
      let speed = vec2.angleToVector(angle, 24)
      let bullet = new Bullet({position: vec2.add(this.position, speed), speed})
      this.speed = vec2.add(this.speed, vec2.angleToVector(angle, -2))
      getScene().addThing(bullet)
      getScene().shakeScreen()
    }

    // walking and friction
    this.speed[0] += (!!keysDown.KeyD - !!keysDown.KeyA) * (this.isOnGround ? walkSpeed : airSpeed)
    if (this.isOnGround) {
      this.speed[0] *= friction
      this.coyoteTime = 6
    } else {
      this.speed[0] = sign(this.speed[0]) * Math.min(walkSpeed / (1 - friction), Math.abs(this.speed[0]))
    }

    // gravity and jumping
    this.speed[1] += this.speed[1] > 0 ? 0.8 : 0.6
    if (keysPressed.Space) {
      this.wannaJump = 6
    }
    if (this.wannaJump && this.coyoteTime) {
      this.coyoteTime = 0
      this.wannaJump = 0
      this.speed[1] = -14
      this.stretch = [0.4, 1.5]
    }
    if (!keysDown.Space && !this.isOnGround && this.speed[1] < 0) {
      this.speed[1] /= 2
    }

    // animation
    this.animation = Math.abs(this.speed[0]) > 0.2 ? "walk" : "idle"
    if (!this.isOnGround) this.animation = "jump"

    // integrate
    const wasOnGround = this.isOnGround
    const lastSpeed = [...this.speed]
    super.update()
    this.isOnGround = this.contactDirections.down
    if (this.isOnGround && !wasOnGround && lastSpeed[1] > 10) {
      this.stretch = [1.5, 0.4]
    }
    if (this.contactDirections.left || this.contactDirections.right) this.stretch[0] *= 0.9

    // squash and stretch
    this.stretch[0] = lerp(this.stretch[0], 1, 0.25)
    this.stretch[1] = lerp(this.stretch[1], 1, 0.25)

    // camera follows player
    const level = getScene().getLevelAt(...this.position)
    getScene().camera.position[0] = this.position[0]
    getScene().camera.position[1] = this.position[1]
    if (level) {
      getScene().camera.position[0] = clamp(
        this.position[0],
        level.aabb[0] + width/2,
        level.aabb[2] - width/2
      )
      getScene().camera.position[1] = clamp(
        this.position[1],
        level.aabb[1] + height/2,
        level.aabb[3] - height/2
      )
    }
  }

  draw() {
    this.scale[0] = this.direction * this.stretch[0]
    this.scale[1] = this.stretch[1]
    this.spriteOffset[0] = 8
    this.spriteOffset[1] = 40 * (1 - this.stretch[1])
    super.draw()

    // draw gun
    ctx.save()
    ctx.translate(...this.position)
    ctx.translate(0, 8)
    ctx.translate(0, (64 - this.height*2) / -2)
    ctx.rotate(this.mouseAngle)
    ctx.scale(1, Math.cos(this.mouseAngle) < 0 ? -1 : 1)
    ctx.translate(8, 0)
    ctx.drawImage(assets.images.gunArm, 0, -16)
    ctx.restore()
  }

  _guiDraw() {
    const pointerSize = 28
    ctx.save()
    ctx.translate(...mouse.position)
    ctx.fillStyle = "white"
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(...vec2.angleToVector(Math.PI/4, pointerSize))
    ctx.lineTo(...vec2.angleToVector(Math.PI*3/8, pointerSize * 0.75))
    ctx.lineTo(...vec2.angleToVector(Math.PI/2, pointerSize))
    ctx.closePath()
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = "black"
    ctx.stroke()
    ctx.restore()
  }
}
