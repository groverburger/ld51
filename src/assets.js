import Player from './player.js'
import Terrain from './terrain.js'
import DemoHelper from './demohelper.js'
import Goal from './goal.js'
import TitleMenu from './titlemenu.js'

const assets = {
  shaderFileSources: {
    defaultFrag: 'default.frag',
    defaultShadedFrag: 'defaultshaded.frag',
    mapFrag: 'map.frag',
    scrollingFrag: 'scrolling.frag',
    cloudsFrag: 'clouds.frag',
    defaultVert: 'default.vert',
    billboardVert: 'billboard.vert',
    axisBillboardVert: 'axisbillboard.vert',
    pointDefaultFrag: 'pointdefault.frag',
    pointDefaultVert: 'pointdefault.vert',
    paletteFrag: 'palette.frag',
    triplanarFrag: 'triplanar.frag',
    animatedFrag: 'animated.frag'
  },

  shaderSources: {
    default: ['defaultVert', 'defaultFrag'],
    defaultShaded: ['defaultVert', 'defaultShadedFrag'],
    map: ['defaultVert', 'triplanarFrag'],
    scrolling: ['defaultVert', 'scrollingFrag'],
    clouds: ['defaultVert', 'cloudsFrag'],
    billboard: ['billboardVert', 'defaultFrag'],
    animatedBillboard: ['billboardVert', 'animatedFrag'],
    axisBillboard: ['axisBillboardVert', 'defaultFrag'],
    pointcloud: ['pointDefaultVert', 'pointDefaultFrag'],
    palette: ['defaultVert', 'paletteFrag']
  },

  modelSources: {
    cube: 'cube.obj',
    cylinder: 'cylinder.obj',
    plane: 'plane.obj',
    sphere: 'sphere.obj',
    pistol: 'pistol.obj',
    shotgun: 'shotgun.obj',
    machinegun: 'machinegun.obj',
    rifle: 'rifle.obj',
    clock: 'clock.obj',
    boots: 'boots.obj',
    oneup: 'oneup.obj',

    crystal: 'deco_crystal.obj',
  },

  imageSources: {
    // Map
    stone: 'stone_grey.png',
    lightStone: 'stone_lgrey.png',
    stoneFloor: 'stone_grey_tile.png',
    stoneFloor2: 'stone_lgrey_tile.png',
    roomWall: 'stone_purple_brick.png',
    roomFloor: 'stone_purple.png',
    goldenFloor: 'stone_gold.png',
    goldenWall: 'stone_gold_brick.png',
    tech1: 'tech_lgreen.png',
    techStone: 'stone_dblue.png',
    techFloor: 'stone_dblue_tile.png',
    wood: 'concrete_wall.png',
    concreteTile: 'concrete_tile.png',
    computer: 'stone_grey_computer.png',
    dirt: 'dirt.png',
    darkDirt: 'dirt_dbrown.png',
    hive: 'hive_dblue.png',
    snow: 'snow.png',
    rustBrown: 'rust_brown.png',
    rustBrownTile: 'rust_brown_smalltile.png',
    rustBrownStrips: 'rust_brown_strips.png',
    stoneBlack: 'stone_black.png',
    stoneBlackTile: 'stone_black_smalltile.png',
    stoneBlackStrips: 'stone_black_strips.png',
    crystalCyan: 'crystal_cyan.png',

    // Skyboxes
    skybox1: 'skybox1.png',
    skybox2: 'skybox2.png',
    skybox3: 'skybox3.png',
    skybox4: 'skybox4.png',
    skybox5: 'skybox5.png',

    // Enemies
    enemy: 'enemy1.png',
    squid: 'enemy2.png',
    turret: 'enemy3.png',

    // Projectiles
    turretbullet: 'turretbullet.png',

    // Collectibles
    goal: 'pickup_flag.png',
    oneUp: 'pickup_oneup.png',
    visionPickup: 'pickup_eye.png',
    timePickup: 'pickup_clock.png',

    // UV Mapped textures
    pistol: 'uv_pistol.png',
    shotgun: 'uv_shotgun.png',
    machinegun: 'uv_machinegun.png',
    rifle: 'uv_rifle.png',
    clock: 'uv_clock.png',
    boots: 'uv_boots.png',
    oneup: 'uv_oneup.png',

    crystal: 'uv_crystal.png',

    // Misc
    circle: 'circle.png',
    square: 'square.png',
    crosshair: 'crosshair.png',

    // Calendar
    calBorder: 'calendar/border.png',
    calTile_calendar: 'calendar/tile_calendar.png',
    calTile_attempted: 'calendar/tile_attempted.png',
    calTile_bronze: 'calendar/tile_bronze.png',
    calTile_silver: 'calendar/tile_silver.png',
    calTile_gold: 'calendar/tile_gold.png',
    calWeekday_sunday: 'calendar/w_sunday.png',
    calWeekday_monday: 'calendar/w_monday.png',
    calWeekday_tuesday: 'calendar/w_tuesday.png',
    calWeekday_wednesday: 'calendar/w_wednesday.png',
    calWeekday_thursday: 'calendar/w_thursday.png',
    calWeekday_friday: 'calendar/w_friday.png',
    calWeekday_saturday: 'calendar/w_saturday.png',
    calDate_0: 'calendar/d00.png',
    calDate_1: 'calendar/d01.png',
    calDate_2: 'calendar/d02.png',
    calDate_3: 'calendar/d03.png',
    calDate_4: 'calendar/d04.png',
    calDate_5: 'calendar/d05.png',
    calDate_6: 'calendar/d06.png',
    calDate_7: 'calendar/d07.png',
    calDate_8: 'calendar/d08.png',
    calDate_9: 'calendar/d09.png',
    calDate_10: 'calendar/d10.png',
    calDate_11: 'calendar/d11.png',
    calDate_12: 'calendar/d12.png',
    calDate_13: 'calendar/d13.png',
    calDate_14: 'calendar/d14.png',
    calDate_15: 'calendar/d15.png',
    calDate_16: 'calendar/d16.png',
    calDate_17: 'calendar/d17.png',
    calDate_18: 'calendar/d18.png',
    calDate_19: 'calendar/d19.png',
    calDate_20: 'calendar/d20.png',
    calDate_21: 'calendar/d21.png',
    calDate_22: 'calendar/d22.png',
    calDate_23: 'calendar/d23.png',
    calDate_24: 'calendar/d24.png',
    calDate_25: 'calendar/d25.png',
    calDate_26: 'calendar/d26.png',
    calDate_27: 'calendar/d27.png',
    calDate_28: 'calendar/d28.png',
    calDate_29: 'calendar/d29.png',
    calDate_30: 'calendar/d30.png',
    calDate_31: 'calendar/d31.png',
    calLevel_0: 'calendar/l.png',
    calLevel_1: 'calendar/l.png',
    calLevel_2: 'calendar/l.png',
    calLevel_3: 'calendar/l.png',
    calLevel_4: 'calendar/l.png',
    calLevel_5: 'calendar/l.png',
    calLevel_6: 'calendar/l.png',
    calLevel_7: 'calendar/l.png',
    calLevel_8: 'calendar/l.png',
    calLevel_9: 'calendar/l.png',
    calLevel_10: 'calendar/l.png',
    calLevel_11: 'calendar/l.png',
    calLevel_12: 'calendar/l.png',
    calLevel_13: 'calendar/l.png',
    calLevel_14: 'calendar/l.png',
    calLevel_15: 'calendar/l.png',
    calLevel_0: 'calendar/l00.png',
    calLevel_1: 'calendar/l01.png',
    calLevel_2: 'calendar/l02.png',
    calLevel_3: 'calendar/l03.png',
    calLevel_4: 'calendar/l04.png',
    calLevel_5: 'calendar/l05.png',
    calLevel_6: 'calendar/l06.png',
    calLevel_7: 'calendar/l07.png',
    calLevel_8: 'calendar/l08.png',
    calLevel_9: 'calendar/l09.png',
    calLevel_10: 'calendar/l10.png',
    calLevel_11: 'calendar/l11.png',
    calLevel_12: 'calendar/l12.png',
    calLevel_13: 'calendar/l13.png',
    calLevel_14: 'calendar/l14.png',
    calLevel_15: 'calendar/l15.png',
    calLevel_firstTry: 'calendar/l_first_try.png',
  },

  textureSettings: {},

  soundSources: {
    // Sound effects
    playerJump: 'jump.wav',
    playerLand: 'land.wav',
    tick: 'clocktick.wav',
    tock: 'clocktock.wav',
    impact: 'impact.wav',
    footstep1: 'bigfootstep3.wav',
    footstep2: 'bigfootstep4.wav',
    win: 'win1.wav',
    shotgun: 'shoot2.wav',
    machinegun: 'shoot3.wav',
    enemyHurt1: 'ehurt1.wav',
    enemyHurt2: 'ehurt2.wav',
    timePickup: 'timepickup.wav',
    oneUp: 'oneup.wav',
    weaponPickup: 'weapon.wav',
    slowRay: 'slowray.wav',
    slowHit: 'slowhit.wav',

    // Music
    music1: 'music/Starshot1.mp3',
    music2: 'music/Starshot2.mp3',
    music3: 'music/Starshot3.mp3',
    music4: 'music/Starshot4.mp3',
    music5: 'music/Starshot5.mp3',
    music6: 'music/Starshot6.mp3',
    music7: 'music/Starshot7.mp3',
    music8: 'music/Starshot8.mp3',
    music14: 'music/Starshot14.mp3',
  },

  sceneSources: {
    title: 'title.json',
    main: 'main.json'
  },

  things: {
    Terrain,
    Player,
    DemoHelper,
    Goal,
    TitleMenu
  }
}

export default assets
