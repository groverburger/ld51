import {getScene, getThing} from "./core/game.js"
import Thing from "./core/thing.js"
import * as gfx from "./core/webgl.js"
import * as mat from "./core/matrices.js"
import * as u from "./core/utils.js"
import assets from "./assets.js"
import * as vec3 from "./core/vector3.js"
import * as vec2 from "./core/vector2.js"
const {angleToVector} = vec2

class Leg extends Thing {
  owner = null
  directionOffset = 0
  heightOffset = 0
  offset = 8
  footOffset = 8
  width = 4
  color = [1, 1, 1, 1]
  targetPosition = [0, 0, 0]
  lastPosition = [0, 0, 0]
  kneeCount = 0
  kneeDirectionOffset = 0
  kneeMagnitude = 16
  maxLength = 64

  constructor(owner, options) {
    super()

    for (const opt in options) {
      this[opt] = options[opt]
    }

    this.owner = owner
    this.stand()
    this.position = [...this.targetPosition]
  }

  getGroundHeight() {
    /*
    const terrain = getThing("terrain")
    if (!terrain) return 0

    const ground = terrain.getGroundHeight(
      this.targetPosition[0] + this.owner.position[0],
      this.targetPosition[1] + this.owner.position[1],
    )

    return u.clamp(ground - (this.owner.position[2] + this.heightOffset), this.maxLength*-0.5, this.maxLength*-1.5)
    */

    return -1 * this.maxLength
  }

  stand(direction = this.owner.direction) {
    this.targetPosition[0] = 0//this.owner.position[0]
    this.targetPosition[1] = 0//this.owner.position[1]
    this.targetPosition[0] += Math.cos(direction + this.directionOffset) * (this.offset + this.footOffset)
    this.targetPosition[1] += Math.sin(direction + this.directionOffset) * (this.offset + this.footOffset)
    const groundHeight = this.getGroundHeight()
    this.targetPosition[2] = groundHeight > -16 ? this.targetPosition[2] : groundHeight
  }

  step(stepSize=64, stepTime=15) {
    this.stand()
    this.lastPosition = [...this.position]
    this.targetPosition[0] += Math.cos(this.owner.direction) * stepSize
    this.targetPosition[1] += Math.sin(this.owner.direction) * stepSize
    const groundHeight = this.getGroundHeight()
    this.targetPosition[2] = groundHeight > -16 ? this.targetPosition[2] : groundHeight
    this.after(stepTime, () => {
      this.position = [...this.targetPosition]
      if (this.onStep) {
        this.onStep()
      }
      if (this.owner.onStep) {
        this.owner.onStep(this)
      }
    }, "step")
  }

  snap() {
    this.position = [...this.targetPosition]
  }

  update() {
    super.update()

    this.targetPosition[2] = Math.max(this.targetPosition[2], -1 * this.maxLength)

    if (this.timer("step")) {
      for (let i=0; i<=2; i++) {
        this.position[i] = u.lerp(this.lastPosition[i], this.targetPosition[i], this.timer("step"))
      }
      const sin = Math.sin(u.lerp(0, Math.PI, this.timer("step")))
      this.position[2] += sin * Math.abs(this.targetPosition[2] * 0.5)
      return
    }

    for (let i=0; i<=2; i++) {
      this.position[i] = u.lerp(this.position[i], this.targetPosition[i], 0.25)
    }
  }

  draw(position = this.owner.position, alpha = 1) {
    const op = position
    const offset = [
      Math.cos(this.owner.direction + this.directionOffset)*this.offset,
      Math.sin(this.owner.direction + this.directionOffset)*this.offset,
      this.heightOffset
    ]

    const bodyPoint = vec3.add(op, offset)
    const footPoint = this.getWorldPosition(position)

    const getPoint = (i) => {
      const result = vec3.lerp(bodyPoint, footPoint, i/Math.PI)
      result[0] += Math.cos(this.owner.direction + this.kneeDirectionOffset) * this.kneeMagnitude * Math.sin(i)
      result[1] += Math.sin(this.owner.direction + this.kneeDirectionOffset) * this.kneeMagnitude * Math.sin(i)
      return result
    }

    const inc = Math.PI/(this.kneeCount+1)
    for (let i = 0; i < Math.PI; i += inc) {
      gfx.setShader(assets.shaders.default)
      gfx.setTexture(assets.textures.square)
      getScene().camera3D.setUniforms()
      gfx.set("color", [...this.color.slice(0, 3), alpha])
      gfx.set("modelMatrix", mat.getTransformation())
      gfx.drawLine(
        getPoint(i),
        getPoint(i+inc),
        this.width
      )

      gfx.set("modelMatrix", mat.getTransformation({
        translation: vec3.subtract(this.getWorldPosition(position), [0, 0, -1]),
        scale: [6, 6, 3]
      }))
      gfx.drawMesh(assets.models.sphere)
    }
  }

  getWorldPosition(position = this.owner.position) {
    const footPoint = vec3.add(position, this.position)
    footPoint[2] += this.heightOffset
    return footPoint
  }
}

export default class Creature extends Thing {
  angle = 0
  legs = []
  legStepIndex = 0
  direction = 0
  targetDirection = 0
  color = u.stringToColor("#5b6ee1")
  random = u.random

  constructor(data) {
    super(data)
    this.position[2] = 64
  }

  chooseDirection() {
    this.targetDirection = this.random(0, Math.PI*2)
    this.after(this.random(60*3, 60*5), "choose direction", () => this.chooseDirection())
    this.stand()
  }

  updateLegs({updateTarget=true, stepAmount=48, stepTime=15, balance=16}={}) {
    for (const leg of this.legs) {
      leg.update()
    }

    if (!updateTarget) return

    for (const leg of this.legs) {
      leg.targetPosition[0] -= this.speed[0]
      leg.targetPosition[1] -= this.speed[1]
    }

    const cob = this.getCenterOfBalance()
    if (this.distanceInDirection(cob) <= -balance) {
      this.legs[this.legStepIndex].step(stepAmount, stepTime)
      this.legStepIndex = (this.legStepIndex+1)%this.legs.length
    }
  }

  stand() {
    for (const leg of this.legs) {
      leg.stand(this.targetDirection)
    }
  }

  standAndSnap() {
    for (const leg of this.legs) {
      leg.stand(this.targetDirection)
      leg.snap()
    }
  }

  getCenterOfBalance() {
    const center = [0, 0]
    for (const leg of this.legs) {
      center[0] += (this.position[0] + leg.targetPosition[0]) / this.legs.length
      center[1] += (this.position[1] + leg.targetPosition[1]) / this.legs.length
    }
    return center
  }

  distanceInDirection(position) {
    const dir = angleToVector(this.direction)
    const pos = this.position[0]*dir[0] + this.position[1]*dir[1]
    const dot = position[0]*dir[0] + position[1]*dir[1]
    return dot - pos
  }

  getFurthestLeg() {
    let furthest = null
    let furthestDist = -1 * Infinity

    for (const leg of this.legs) {
      const dist = -1 * this.distanceInDirection(leg.position)

      if (dist > furthestDist) {
        furthestDist = dist
        furthest = leg
      }
    }

    return furthest
  }

  addLeg(options) {
    //const leg = getScene().addThing(new Leg(this, options))
    const leg = new Leg(this, options)
    this.legs.push(leg)
    return leg
  }

  drawLegs(position, alpha) {
    for (const leg of this.legs) {
      leg.draw(position, alpha)
    }
  }

  drawShadow(radius=16) {
    gfx.setShader(assets.shaders.default)
    getScene().camera3D.setUniforms()
    gfx.setTexture(assets.textures.circle)
    gfx.set("color", [0, 0, 0, 0.5])
    gfx.set("modelMatrix", mat.getTransformation({
      translation: [this.position[0], this.position[1], getThing("terrain").getGroundHeight(...this.position) + 1],
      scale: radius
    }))
    gfx.drawQuad(
      -1, -1, 0,
       1, -1, 0,
      -1,  1, 0,
       1,  1, 0,
    )
  }
}


class Spider extends Creature {
  direction = 0

  constructor(data) {
    super(data)
    this.collisionSettings.levelContained = true
    this.chooseDirection()

    for (let i=-1; i<=1; i+=2) {
      for (let c=0; c<4; c++) {
        const a = u.map(c, 0, 3, i*Math.PI*0.2, i*Math.PI*0.8)
        const leg = this.addLeg({
          directionOffset: a,
          kneeDirectionOffset: a,
          kneeCount: 2,
          kneeMagnitude: 40,
          offset: 32,
          color: u.stringToColor("#000000")
        })
        leg.footOffset = 64
      }
    }

    const solidTiles = [undefined]
    for (const tileID in getThing("terrain").heightMap) {
      if (tileID != getScene().getTileAtWorld(this.position[0], this.position[1])) {
        solidTiles.push(Number(tileID))
      }
    }
    this.collisionSettings.tiles = new Set(solidTiles)
    this.stand()
  }

  update() {
    this.updateLegs()
    const dir = angleToVector(this.direction)
    const tdir = angleToVector(this.targetDirection)
    dir[0] = u.lerp(dir[0], tdir[0], 0.1)
    dir[1] = u.lerp(dir[1], tdir[1], 0.1)
    this.direction = u.angleTowards(0, 0, ...dir)
    this.speed[0] += Math.cos(this.direction)*0.2
    this.speed[1] += Math.sin(this.direction)*0.2
    this.speed[0] *= 0.9
    this.speed[1] *= 0.9
    super.update()
    if (Object.values(this.contactDirections).some(x => x)) {
      this.direction += Math.PI
      this.speed[0] *= -1
      this.speed[1] *= -1
      this.chooseDirection()
    }
  }

  draw(_ctx) {
    // body
    const camera = getScene().camera3D
    gfx.setShader(assets.shaders.default)
    gfx.setTexture(assets.textures.square)
    camera.setUniforms()
    gfx.set("color", [0,0,0,1])
    gfx.set("modelMatrix", mat.getTransformation({
      translation: this.position,
      scale: 36
    }))
    gfx.drawMesh(assets.models.sphere)

    // head
    let headRadius = 32
    gfx.set("modelMatrix", mat.getTransformation({
      translation: [
        this.position[0] + Math.cos(this.direction)*headRadius,
        this.position[1] + Math.sin(this.direction)*headRadius,
        this.position[2] + 4,
      ],
      scale: 24
    }))
    gfx.drawMesh(assets.models.sphere)

    // eyes
    for (let x=-1; x<=1; x+=2) {
      for (let y=-1; y<=1; y+=2) {
        const amount = 0.15
        gfx.set("color", [1,0,0,1])
        gfx.set("modelMatrix", mat.getTransformation({
          translation: [
            this.position[0] + Math.cos(this.direction + x*amount)*(headRadius+24),
            this.position[1] + Math.sin(this.direction + x*amount)*(headRadius+24),
            this.position[2] + 8 + y*6,
          ],
          scale: 2
        }))
        gfx.drawMesh(assets.models.sphere)
      }
    }
  }
}
