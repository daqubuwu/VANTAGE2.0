import type { PlayerProfile } from '@/shared/api/types'
import { rankIcon, rankName, rankStar } from '@/shared/api/images'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Tooltip } from '@/shared/ui/Tooltip'
import { LockSimple } from '@phosphor-icons/react'

interface PlayerHeaderProps {
  accountId: number
  profile: PlayerProfile | undefined
  loading: boolean
}

export function PlayerHeader({ accountId, profile, loading }: PlayerHeaderProps) {
  if (loading) {
    return (
      <div className="surface-feature flex items-center gap-4 px-5 py-4">
        <Skeleton className="h-16 w-16 rounded-panel" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-32" />
        </div>
      </div>
    )
  }

  const person = profile?.profile
  const closed = !person
  const star = rankStar(profile?.rank_tier ?? null)

  return (
    <div className="surface-feature flex flex-wrap items-center gap-4 px-5 py-4">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-block bg-surface-2">
        {person?.avatarfull ? (
          <img src={person.avatarfull} alt="" width={64} height={64} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-3">
            <LockSimple size={22} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="truncate text-[24px] font-semibold">
          {person?.personaname ?? `Аккаунт ${accountId}`}
        </h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-3">
          <span className="num">ID {accountId}</span>
          {closed && <span className="text-warm">профиль Steam закрыт</span>}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <Tooltip content={`Ранг: ${rankName(profile?.rank_tier ?? null)}`} variant="hint">
          <div className="relative h-12 w-12 shrink-0">
            <img src={rankIcon(profile?.rank_tier ?? null)} alt="" className="h-full w-full" />
            {star && <img src={star} alt="" className="absolute inset-0 h-full w-full" />}
          </div>
        </Tooltip>
        <div className="flex flex-col">
          <span className="text-[14px] whitespace-nowrap text-ink">
            {rankName(profile?.rank_tier ?? null)}
          </span>
          {profile?.leaderboard_rank && (
            <span className="num text-[12px] text-accent">#{profile.leaderboard_rank} в топе</span>
          )}
        </div>
      </div>
    </div>
  )
}
