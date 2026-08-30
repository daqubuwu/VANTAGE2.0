export const ROLE_ORDER = [
  'Carry',
  'Support',
  'Nuker',
  'Disabler',
  'Initiator',
  'Durable',
  'Escape',
  'Pusher',
  'Jungler',
] as const

export const ROLE_LABEL_RU: Record<string, string> = {
  Carry: 'Керри',
  Support: 'Поддержка',
  Nuker: 'Нюкер',
  Disabler: 'Контроль',
  Initiator: 'Инициатор',
  Durable: 'Танк',
  Escape: 'Побег',
  Pusher: 'Пушер',
  Jungler: 'Джунглер',
}

export function roleLabel(role: string) {
  return ROLE_LABEL_RU[role] ?? role
}
