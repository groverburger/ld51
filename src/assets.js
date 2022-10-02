import Player from "./player.js"
import Terrain from "./terrain.js"
import DemoHelper from "./demohelper.js"
import Goal from "./goal.js"

const assets = {
  shaderFileSources: {
    defaultFrag: "default.frag",
    defaultShadedFrag: "defaultshaded.frag",
    mapFrag: "map.frag",
    scrollingFrag: "scrolling.frag",
    cloudsFrag: "clouds.frag",
    defaultVert: "default.vert",
    billboardVert: "billboard.vert",
    axisBillboardVert: "axisbillboard.vert",
    pointDefaultFrag: "pointdefault.frag",
    pointDefaultVert: "pointdefault.vert",
    paletteFrag: "palette.frag",
    triplanarFrag: "triplanar.frag",
    animatedFrag: "animated.frag",
  },

  shaderSources: {
    default: ["defaultVert", "defaultFrag"],
    defaultShaded: ["defaultVert", "defaultShadedFrag"],
    map: ["defaultVert", "triplanarFrag"],
    scrolling: ["defaultVert", "scrollingFrag"],
    clouds: ["defaultVert", "cloudsFrag"],
    billboard: ["billboardVert", "defaultFrag"],
    animatedBillboard: ["billboardVert", "animatedFrag"],
    axisBillboard: ["axisBillboardVert", "defaultFrag"],
    pointcloud: ["pointDefaultVert", "pointDefaultFrag"],
    palette: ["defaultVert", "paletteFrag"],
  },

  modelSources: {
    cube: "cube.obj",
    cylinder: "cylinder.obj",
    plane: "plane.obj",
    sphere: "sphere.obj",
    pistol: "pistol.obj",
    shotgun: "shotgun.obj",
    machinegun: "machinegun.obj",
  },

  imageSources: {
    circle: "circle.png",
    square: "square.png",
    enemy: "enemy1.png",
    stone: "stone2.png",
    water: "water.png",
    skybox: "skybox.png",
    goal: "flag.png",
    path: "stone.png",
    roomFloor: "stone1.png",
    roomWall: "brick1.png",
    timePickup: "timepickup.png",
    goldenFloor: "brick2_f.png",
    goldenWall: "brick2.png",
  },

  textureSettings: {},

  soundSources: {
    playerJump: "jump.wav",
    playerLand: "land.wav",
    playerSplash: "splash.wav",
    pistolShoot: "pistolshoot.wav",
    footstep1: "footstep1.wav",
    footstep2: "footstep2.wav",
    footstep3: "footstep3.wav",
    win: "win1.wav",
    tick: "clocktick.mp3",
    tock: "clocktock.mp3",
    impact: "impact.mp3",
    footstep1: "bigfootstep3.wav",
    footstep2: "bigfootstep4.wav",
    rank: "win.wav",
    win: "win2.wav",
    delivery: "win1.wav",
    boing: "boing.wav",
    boingFootstep: "boing.wav",
    music: "music1.mp3",
    pistol: "shoot1.wav",
    shotgun: "shoot2.wav",
    machinegun: "shoot3.wav",
  },

  sceneSources: {
    first: "main.ldtk",
    first: "3dtest3.ldtk",
    second: "3dtest2.ldtk",
    third: "3dtest1.ldtk",
    //first: "empty.ldtk",
  },

  things: {
    Terrain,
    Player,
    DemoHelper,
    Goal,
  }
}

export default assets
