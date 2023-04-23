
import assets from './assets.js'

function getTrackList() {
  const { music1, music2, music3, music4, music5, music6, music7, music8, music14 } = assets.sounds
  return [music1, music2, music3, music4, music5, music6, music7, music8, music14]
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
  track.volume = volume || 0.8
  track.loop = true
  track.play()
}