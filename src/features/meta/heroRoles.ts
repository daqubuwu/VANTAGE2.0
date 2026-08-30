export type ClassicRole = 'carry' | 'mid' | 'offlane' | 'support' | 'hardsupport'

export const CLASSIC_ROLE_ORDER: ClassicRole[] = ['carry', 'mid', 'offlane', 'support', 'hardsupport']

export const CLASSIC_ROLE_LABEL: Record<ClassicRole, string> = {
  carry: 'Керри',
  mid: 'Мид',
  offlane: 'Оффлейн',
  support: 'Поддержка',
  hardsupport: 'Хардсаппорт',
}

export function classicRoleLabel(role: ClassicRole) {
  return CLASSIC_ROLE_LABEL[role]
}

export function classicRole(roles: string[] | undefined): ClassicRole {
  const tags = roles ?? []
  const has = (tag: string) => tags.includes(tag)

  if (has('Support')) {
    return has('Initiator') || has('Disabler') ? 'support' : 'hardsupport'
  }
  if (has('Durable') || has('Initiator')) return 'offlane'
  if (has('Carry')) return has('Nuker') ? 'mid' : 'carry'
  if (has('Nuker')) return 'mid'
  return 'offlane'
}
