import type WaveSurfer from 'wavesurfer.js'

let current: WaveSurfer | null = null

export function playExclusive(instance: WaveSurfer) {
  if (current && current !== instance) {
    current.pause()
  }
  current = instance
}
