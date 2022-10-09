export let data = {
  // General
  "width": {
    "randomMode": "bell",
    "bellCenter": 40,
    "bellRadius": 10,
    "advanceAmount": 3,
    "max": 45,
    "truncate": true
  },
  "length": {
    "randomMode": "bell",
    "bellCenter": 70,
    "bellRadius": 17,
    "advanceAmount": 3,
    "max": 90,
    "truncate": true
  },
  "height": {
    "randomMode": "constant",
    "value": 20,
    "truncate": true
  },
  "maxPathLength": {
    "randomMode": "constant",
    "value": 74,
    "advanceAmount": 2,
    "max": 100,
    "truncate": true
  },

  // Cave
  "caveSteps": {
    "randomMode": "bell",
    "bellCenter": 7,
    "bellRadius": 1.7,
    "rerollChance": "0.3",
    "truncate": true
  },
  "caveInitialChance": {
    "randomMode": "bell",
    "bellCenter": 0.3,
    "bellRadius": 0.01,
    "rerollChance": "0.3",
    "truncate": false
  },
  "caveLayers": {
    "randomMode": "constant",
    "value": 1,
    "advanceAmount": 0.5,
    "max": 15,
    "truncate": true
  },
  "caveLayerSpacing": {
    "randomMode": "constant",
    "value": 2,
    "truncate": true
  },
  "caveMode": {
    "randomMode": "constant",
    "value": 0,
    "truncate": true
  },

  // Terrain
  "terrainVariance": {
    "randomMode": "bell",
    "bellCenter": 15,
    "bellRadius": 10,
    "advanceAmount": 3,
    "truncate": true
  },
  "terrainRoughness": {
    "randomMode": "constant",
    "value": 0.4,
    "truncate": true
  },

  // Rooms
  "roomMaxSize": {
    "randomMode": "bell",
    "bellCenter": 7,
    "bellRadius": 5,
    "max": 100,
    "advanceAmount": 1,
    "truncate": true
  },
  "roomMinSize": {
    "randomMode": "bell",
    "bellCenter": 3,
    "bellRadius": 2,
    "truncate": true
  },
  "roomWallHeight": {
    "randomMode": "bell",
    "bellCenter": 8,
    "bellRadius": 7,
    "rerollChance": "0.3",
    "truncate": true
  },
  "room1Position": {
    "randomMode": "linear",
    "linearMin": 0.01,
    "linearMax": 0.99,
    "rerollChance": "0.4",
    "truncate": false
  },
  "room2Position": {
    "randomMode": "linear",
    "linearMin": 0.01,
    "linearMax": 0.99,
    "rerollChance": "0.4",
    "truncate": false
  },

  // Palace
  "palaceFloorHeight": {
    "randomMode": "constant",
    "value": 20,
    "truncate": true
  },
}