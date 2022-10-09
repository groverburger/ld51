import Player from "./player.js"
import Terrain from "./terrain.js"
import DemoHelper from "./demohelper.js"
import Goal from "./goal.js"
import TitleMenu from "./titlemenu.js"

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
    squid: "enemy2.png",
    turret: "enemy3.png",
    turretbullet: "turretbullet.png",
    stone: "stone2.png",
    water: "water.png",
    skybox1: "skybox1.png",
    skybox2: "skybox2.png",
    skybox3: "skybox3.png",
    goal: "flag.png",
    path: "stone.png",
    roomFloor: "stone1.png",
    roomWall: "brick1.png",
    timePickup: "timepickup.png",
    goldenFloor: "brick2_f.png",
    goldenWall: "brick2.png",
    oneUp: "oneup.png",
    visionPickup: "eye.png",
    tech1: "tech1.png",
    techstone: "stone3.png",
    techfloor: "stone3_tile.png",
    wood: "woodwall.png",
    woodtile: "woodwalltop.png",
    dirt: "dirt.png",
    finale: "finale.png",
    crosshair: "crosshair.png",
  },

  textureSettings: {},

  soundSources: {
    playerJump: "jump.wav",
    playerLand: "land.wav",
    tick: "clocktick.wav",
    tock: "clocktock.wav",
    impact: "impact.wav",
    footstep1: "bigfootstep3.wav",
    footstep2: "bigfootstep4.wav",
    win: "win1.wav",
    shotgun: "shoot2.wav",
    machinegun: "shoot3.wav",
    enemyHurt1: "ehurt1.wav",
    enemyHurt2: "ehurt2.wav",
    timePickup: "timepickup.wav",
    oneUp: "oneup.wav",
    weaponPickup: "weapon.wav",
    music1: "music1.mp3",
    music2: "music2.mp3",
    music3: "music3.mp3",
  },

  sceneSources: {
    title: "title.ldtk",
    main: "3dtest3.ldtk",
    //first: "empty.ldtk",
  },

  things: {
    Terrain,
    Player,
    DemoHelper,
    Goal,
    TitleMenu,
  }
}

export default assets
