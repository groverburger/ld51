import {getScene, keysDown, mouse} from "./core/game.js"
import Thing from "./core/thing.js"
import * as gfx from "./core/webgl.js"
import * as mat from "./core/matrices.js"
import * as u from "./core/utils.js"
import assets from "./assets.js"

export default class ThreeHandler extends Thing {
  constructor(data) {
    throw new Error("threehandler")
    super(data)
    //this.collisionSettings.levelContained = true
    this.position[2] = 64
  }

  update() {
    const scene = getScene()

    mouse.click && mouse.lock()
    if (mouse.isLocked()) {
      scene.camera3D.yaw += mouse.delta[0]/500
      scene.camera3D.pitch += u.clamp(mouse.delta[1]/500, -Math.PI/4 + 0.0001, Math.PI/4 - 0.0001)
    }
    scene.camera3D.yaw += (!!keysDown.ArrowRight - !!keysDown.ArrowLeft)*0.02
    scene.camera3D.pitch += (!!keysDown.ArrowDown - !!keysDown.ArrowUp)*0.02

    const speed = 8
    const dx = (!!keysDown.KeyD - !!keysDown.KeyA)*speed
    const dy = (!!keysDown.KeyS - !!keysDown.KeyW)*speed
    const yaw = scene.camera3D.yaw
    const walkSpeed = 0.1
    this.speed[0] += (Math.cos(yaw)*dx - Math.sin(yaw)*dy)*walkSpeed
    this.speed[1] += (Math.sin(yaw)*dx + Math.cos(yaw)*dy)*walkSpeed
    this.speed[0] *= 0.9
    this.speed[1] *= 0.9
    this.position[2] += (!!keysDown.KeyE - !!keysDown.KeyQ)*8

    super.update()
    scene.camera3D.position[0] = this.position[0]
    scene.camera3D.position[1] = this.position[1]
    scene.camera3D.position[2] = this.position[2]
  }

  draw(ctx) {
    ctx.fillStyle = "white"
    ctx.font = "32px Arial"
    ctx.fillText(Math.round(this.position[0]) + ", " + Math.round(this.position[1]), 32, 64)

    const camera = getScene().camera3D
    gfx.setShader(assets.shaders.default)
    gfx.setTexture(assets.textures.square)
    gfx.set("modelMatrix", mat.getIdentity())
    camera.setUniforms()

    const w = getScene().getLevelAt(0, 0).pxWid
    const l = getScene().getLevelAt(0, 0).pxHei

    gfx.set("color", u.stringToColor("#6abe30"))
    gfx.drawQuad(
      0, 0, 0,
      w, 0, 0,
      0, l, 0,
      w, l, 0,
    )

    gfx.set("color", u.stringToColor("#341d19"))
    const h = 64
    gfx.drawQuad(
      0, 0, 0,
      w, 0, 0,
      0, 0, h,
      w, 0, h,
    )

    gfx.drawQuad(
      0, l, 0,
      w, l, 0,
      0, l, h,
      w, l, h,
    )
  }
}
