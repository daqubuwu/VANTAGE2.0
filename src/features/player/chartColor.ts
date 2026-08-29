const LOSS: [number, number, number] = [0xe5, 0x4b, 0x52]
const MID: [number, number, number] = [0x61, 0x6a, 0x73]
const WIN: [number, number, number] = [0x37, 0xbb, 0x62]

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t)
}

function mix(from: [number, number, number], to: [number, number, number], t: number) {
  return `rgb(${lerp(from[0], to[0], t)}, ${lerp(from[1], to[1], t)}, ${lerp(from[2], to[2], t)})`
}

export function winrateColor(value: number) {
  const clamped = Math.max(0, Math.min(1, value))
  if (clamped <= 0.5) return mix(LOSS, MID, clamped / 0.5)
  return mix(MID, WIN, (clamped - 0.5) / 0.5)
}
