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
  },

  imageSources: {
    lad: "lad.png",
    gunArm: "gunarm.png",
    Tileset1: "tileset1.png",
    //Tileset2: "tileset2.png",
    circle: "circle.png",
    square: "square.png",
    grass: "grass.png",
    grassSide: "grassside.png",
    stone: "stone.png",
    sand: "sand.png",
    water: "water.png",
    coin: "coin.png",
    perlin: "perlin.png",
    skybox: "skybox.png",
    face1: "face1.png",
    face2: "face2.png",
    goal: "mailbox.png",
  },

  textureSettings: {
    perlin: "linear"
  },

  soundSources: {
    playerDash: "p_dash1.wav",
    playerJump: "jump.wav",
    playerLand: "land.wav",
    playerSplash: "splash.wav",
    footstep1: "bigfootstep3.wav",
    footstep2: "bigfootstep4.wav",
    rank: "win.wav",
    win: "win2.wav",
    delivery: "win1.wav",
    boing: "boing.wav",
    boingFootstep: "boing.wav",
    music: "music1.mp3",
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
