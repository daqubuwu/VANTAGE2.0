export type DraftSide = 'radiant' | 'dire'
export type DraftMode = DraftSide | 'ban'

export interface DraftState {
  radiant: number[]
  dire: number[]
  bans: number[]
}

export const EMPTY_DRAFT: DraftState = { radiant: [], dire: [], bans: [] }

export const MAX_PICKS = 5

export function isHeroTaken(state: DraftState, heroId: number) {
  return state.radiant.includes(heroId) || state.dire.includes(heroId) || state.bans.includes(heroId)
}

function canAssign(state: DraftState, mode: DraftMode) {
  if (mode === 'ban') return true
  return state[mode].length < MAX_PICKS
}

export function assign(state: DraftState, mode: DraftMode, heroId: number): DraftState {
  if (isHeroTaken(state, heroId) || !canAssign(state, mode)) return state
  if (mode === 'ban') return { ...state, bans: [...state.bans, heroId] }
  return { ...state, [mode]: [...state[mode], heroId] }
}

export function remove(state: DraftState, mode: DraftMode, heroId: number): DraftState {
  if (mode === 'ban') return { ...state, bans: state.bans.filter((id) => id !== heroId) }
  return { ...state, [mode]: state[mode].filter((id) => id !== heroId) }
}
