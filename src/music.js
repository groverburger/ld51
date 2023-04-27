
import assets from './assets.js'

const MUSIC_VOLUME = 0.8
let volumeSetting = MUSIC_VOLUME

function getTrackList() {
  const { music1, music2, music3, music4, music5, music6, music7, music8, music14, music16 } = assets.sounds
  return [music1, music2, music3, music4, music5, music6, music7, music8, music14, music16]
}

export function pauseAllTracks() {
  for (let track of getTrackList()) {
    track.pause()
  }
}

export function restartAllTracks() {
  for (let track of getTrackList()) {
    track.currentTime = 0
  }
}

export function playTrack(trackName, volume) {
  pauseAllTracks()
  let track = assets.sounds[trackName]
  track.volume = volumeSetting
  track.loop = true
  track.play()
}

export function setVolume(volume) {
  volumeSetting = (volume || 0) * MUSIC_VOLUME
  for (let track of getTrackList()) {
    track.volume = volumeSetting
  }
}