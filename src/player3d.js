import {
  ctx,
  globals,
  getScene,
  resetScene,
  setNextScene,
  mouse,
  gamepads,
  keysDown,
  keysPressed,
  getThing
} from "./core/game.js"
import {width, height} from "./config.js"
import Thing from "./core/thing.js"
import * as gfx from "./core/webgl.js"
import * as mat from "./core/matrices.js"
import * as u from "./core/utils.js"
import assets from "./assets.js"
import * as vec3 from "./core/vector3.js"
import * as vec2 from "./core/vector2.js"
const {angleToVector} = vec2
import InputHandler from "./core/inputs.js"
import FadeIn from "./fadein.js"

export default class Player3D extends Thing {
  height = 56
  onGround = false
  wasOnGround = false
  aabb = [-16, -16, 16, 16]
  cameraTarget = [0, 0, 0]
  cameraLookAhead = 64
  color = u.stringToColor("#cbdbfc")
  legColor = u.stringToColor("#5b6e99")
  ears = []
  stretch = [1, 1]
  compression = 1
  width = 16
  canDash = true
  wannaJump = 0
  coyoteFrames = 0
  staircaseOffset = 0
  inputs = null
  lastFallSpeed = 0
  time = 0
  footstepToggle = false
  showGui = true // cutscenes set this to false
  deliveredCount = 0

  constructor(data={}) {
    super(data)

    assets.sounds.music.loop = true
    assets.sounds.music.volume = 0.3
    //assets.sounds.music.play()
    //mouse.setStyle("none")

    getScene().camera3D.position = [...this.position]
    getScene().camera3D.pitch = 0.25

    if (globals.showLevelIntro) {
      getScene().addThing(new FadeIn())
      globals.showLevelIntro = false
    }

    if (data.fieldInstances) {
      for (const {__identifier: id, __value: val} of data.fieldInstances) {
        if (id == "direction") {
          this.direction = 2*Math.PI*val/8
          getScene().camera3D.yaw = Math.PI + this.direction
        }
      }
    }

    this.collisionSettings.tiles = new Set()
    this.position[2] = this.height + 128
    this.spawnPosition = [...this.position]
    this.speed[2] = 0
    //this.direction = 0
    //this.lookDirection = 0

    this.setName("player")

    this.inputs = new InputHandler({
      jump(keys, mouse, gamepad) {
        return keys.Space || gamepad?.buttons[0].pressed
      },
      dash(keys, mouse, gamepad) {
        return (mouse.isLocked() && mouse.button) || gamepad?.buttons[1].pressed
      },

      xMove(keys, mouse, gamepad) {
        const kb = !!keys.KeyD - !!keys.KeyA
        const gp = Math.abs(gamepad?.axes[0]) > 0.1 && gamepad.axes[0]
        return kb + gp
      },
      yMove(keys, mouse, gamepad) {
        const kb = !!keys.KeyS - !!keys.KeyW
        const gp = Math.abs(gamepad?.axes[1]) > 0.1 && gamepad.axes[1]
        return kb + gp
      },

      xLook(keys, mouse, gamepad) {
        const kb = !!keys.ArrowRight - !!keys.ArrowLeft
        const gp = Math.abs(gamepad?.axes[2]) > 0.1 && gamepad.axes[2]
        return kb*0.02 + gp*0.04
      },
      yLook(keys, mouse, gamepad) {
        const kb = !!keys.ArrowDown - !!keys.ArrowUp
        const gp = Math.abs(gamepad?.axes[3]) > 0.1 && gamepad.axes[3]
        return kb*0.02 + gp*0.04
      },

      pause(keys, mouse, gamepad) {
        return keys.Escape
      },

      reset(keys, mouse, gamepad) {
        return keys.KeyR
      },
    })

    /*
    const mapColors = []
    for (let i=1; i<=64; i++) {
      mapColors.push({
        value: i,
        identifier: `height_${i}`,
        color: u.colorToString(...u.hsvToRgb(0.5 + ((i-1)/128)%0.5, 1, 1))
      })
    }
    console.log(JSON.stringify(mapColors))
    */
  }

  update() {
    this.inputs.update()
    const scene = getScene()
    this.time += 1

    // walking and friction
    let dx = this.inputs.get("xMove")
    let dy = this.inputs.get("yMove")
    if (u.distance2d(0, 0, dx, dy) > 1) {
      [dx, dy] = vec2.normalize([dx, dy])
    }
    const yaw = scene.camera3D.yaw - Math.PI/2
    const friction = 0.94
    const groundSpeed = 0.725 // 0.6
    const airSpeed = 0.5 // 0.4
    const walkSpeed = this.onGround ? groundSpeed : airSpeed
    const maxSpeed = groundSpeed / (1 - friction)
    const xAccel = (Math.cos(yaw)*dx - Math.sin(yaw)*dy)*walkSpeed
    const yAccel = (Math.sin(yaw)*dx + Math.cos(yaw)*dy)*walkSpeed

    // can't move if diving
    if (this.onGround || !this.timer("disableAirControl")) {
      const lastMagnitude = vec2.magnitude(this.speed)
      this.speed[0] += xAccel
      this.speed[1] += yAccel
      const newMagnitude = vec2.magnitude(this.speed)

      if (u.distance2d(0, 0, this.speed[0]+xAccel, this.speed[1]+yAccel) >= maxSpeed) {
        this.speed[0] *= lastMagnitude/newMagnitude
        this.speed[1] *= lastMagnitude/newMagnitude
      }

      //scene.camera3D.yaw += dx*0.025
    }
    this.speed[2] -= this.speed[2] < 0 ? 0.6 : 0.35

    if (this.onGround) {
      this.speed[0] *= friction
      this.speed[1] *= friction
      this.canDash = true
      this.cancelTimer("disableAirControl")

      // land
      if (!this.wasOnGround && this.lastFallSpeed < -5) {
        this.stretch = [1.6, 0.5]
        const sound = assets.sounds.playerLand
        sound.volume = 0.1
        sound.playbackRate = u.random(1, 1.2)
        sound.currentTime = 0
        sound.play()
      }
    } else {
      this.lastFallSpeed = this.speed[2]
    }

    // falling and jumping
    if (this.inputs.pressed("jump")) {
      this.wannaJump = 6
    }
    if (this.onGround) {
      this.coyoteFrames = 10
    }

    const jump = () => {
      this.speed[2] = 10
      this.wannaJump = 0
      this.coyoteFrames = 0
      this.stretch = [0.3, 1.4]
      const sound = assets.sounds.playerJump
      sound.volume = 0.2
      sound.playbackRate = u.random(1, 1.2)
      sound.currentTime = 0
      sound.play()
    }

    if (this.wannaJump && this.coyoteFrames) {
      jump()
    }

    if (this.wannaJump) {
      const closestWall = this.getClosestWall()
      if (closestWall) {
        const kickSpeed = 8
        this.speed[0] += closestWall.normal[0] * kickSpeed
        this.speed[1] += closestWall.normal[1] * kickSpeed
        this.after(20, null, "disableAirControl")
        jump()
      }
    }

    if (!this.inputs.get("jump") && this.speed[2] >= 0) {
      this.speed[2] /= 2
    }
    if (this.position[2] < 0) {
      assets.sounds.playerSplash.play()
      resetScene()
    }
    this.wannaJump = Math.max(this.wannaJump - 1, 0)
    this.coyoteFrames = Math.max(this.coyoteFrames - 1, 0)
    this.staircaseOffset = Math.max(this.staircaseOffset - 8, 0)
    this.disableAirControl = Math.max(this.disableAirControl - 1, 0)

    // dashing
    if (this.canDash && this.inputs.pressed("dash") && !this.timer("dashCooldown")) {
      const sound = assets.sounds.playerDash
      sound.playbackRate = u.random(1, 1.2)
      sound.currentTime = 0
      sound.play()
      this.canDash = false
      //this.after(10, null, "dash")
      const dash = vec3.multiply(vec3.anglesToVector(scene.camera3D.yaw, scene.camera3D.pitch - 0.25), -18)
      this.speed[0] = dash[0]
      this.speed[1] = dash[1]
      this.speed[2] = dash[2]
      this.cancelTimer("disableAirControl")
      this.after(20, null, "dashCooldown")
    }

    if (this.time > 5 && this.inputs.pressed("reset")) {
      resetScene()
    }

    if (this.time > 5 && keysDown.KeyN) {
      setNextScene()
    }

    this.moveAndCollide()
    this.updateTimers()
    //super.update()
    this.cameraUpdate()
  }

  moveAndCollide() {
    this.position[0] += this.speed[0]
    this.position[1] += this.speed[1]
    this.position[2] += this.speed[2]
    this.wasOnGround = this.onGround
    this.onGround = false

    // colliders are just triangles considered solid
    const colliderList = getThing("terrain").query(this.position[0] - 64, this.position[1] - 64, 128, 128)

    // floor collisions
    for (const collider of colliderList) {
      const {normal, points} = collider
      if (normal[2] < 0.7) continue
      let position = [...this.position]
      position[2] -= this.height

      if (!vec3.isInsideTriangle(...points, [0, 0, 1], position)) {
        continue
      }

      const distance = vec3.distanceToTriangle(points[0], normal, position)
      if (distance > 0) continue
      if (distance < -64) continue

      const dot = vec3.dotProduct(this.speed, normal)
      this.speed[2] -= dot * normal[2]
      this.position[2] += normal[2]*(-1 * distance)
      this.onGround = true

      if (this.wasOnGround && distance < 0) {
        this.staircaseOffset = Math.min(
          this.staircaseOffset + Math.abs(distance),
          48
        )
      }
    }

    // wall/ceiling collisions
    for (const collider of colliderList) {
      const {normal, points} = collider
      if (normal[2] >= 0.7) continue

      const fakeNormal = vec3.findMostSimilarVector(normal, [
        [0, 0, -1],
        [1, 0, 0],
        [-1, 0, 0],
        [0, 1, 0],
        [0, -1, 0],
      ])

      let stepHeight = this.onGround ? 48 : 16
      for (let h=stepHeight; h<=64; h+=8) {
        let position = [...this.position]
        position[2] += h - this.height

        if (!vec3.isInsideTriangle(...points, fakeNormal, position)) {
          continue
        }

        const distance = vec3.distanceToTriangle(points[0], normal, position)
        if (distance > this.width) continue
        if (distance < -1 * this.width) continue

        const dot = vec3.dotProduct(this.speed, normal)
        if (dot < 0) {
          this.speed[0] -= dot * normal[0]
          this.speed[1] -= dot * normal[1]
          this.speed[2] -= dot * normal[2]
        }
        const push = (this.width - distance) / 10
        this.position[0] += normal[0]*push
        this.position[1] += normal[1]*push
        this.position[2] += normal[2]*push
      }
    }
  }

  getClosestWall() {
    let closest = null
    let closestDistance = Infinity
    const position = [...this.position]
    position[2] -= this.height/2

    for (const collider of getThing("terrain").query(this.position[0] - 64, this.position[1] - 64, 128, 128)) {
      const {normal, points} = collider
      if (normal[2] >= 0.7) continue

      if (!vec3.isInsideTriangle(...points, normal, position)) {
        continue
      }

      const distance = vec3.distanceToTriangle(points[0], normal, position)
      if (distance > this.width*1.25) continue
      if (distance < -1 * this.width) continue

      if (distance < closestDistance) {
        closestDistance = distance
        closest = collider
      }
    }

    return closest
  }

  cameraUpdate() {
    const scene = getScene()

    // mouse look
    mouse.click && mouse.lock()
    if (mouse.isLocked()) {
      scene.camera3D.yaw += mouse.delta[0]/500
      scene.camera3D.pitch += mouse.delta[1]/500
    }
    scene.camera3D.yaw += this.inputs.get("xLook")
    scene.camera3D.pitch += this.inputs.get("yLook")
    scene.camera3D.position = [...this.position]
  }
}
