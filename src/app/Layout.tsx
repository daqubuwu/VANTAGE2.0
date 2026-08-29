import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { MagnifyingGlass, UserCircle, WifiHigh, WifiSlash } from '@phosphor-icons/react'
import { DEFAULT_STEAM_ID } from '@/shared/lib/config'
import { useStratzStatus } from '@/shared/api/queries'
import { Tooltip } from '@/shared/ui/Tooltip'

const NAV = [
  { to: '/heroes', label: 'Герои' },
  { to: '/draft', label: 'Драфт' },
  { to: '/esports', label: 'Киберспорт' },
  { to: '/compare', label: 'Сравнение' },
]

export function Layout() {
  return (
    <div className="min-h-[100dvh] bg-bg">
      <Background />
      <Header />
      <main className="mx-auto w-full max-w-[1320px] px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}

function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-[-80px] -z-10"
      style={{
        background:
          'radial-gradient(60% 45% at 18% 8%, rgba(0,207,227,.10), transparent 70%), radial-gradient(50% 40% at 86% 22%, rgba(155,126,222,.07), transparent 72%), radial-gradient(70% 50% at 50% 100%, rgba(0,97,107,.10), transparent 75%)',
      }}
    />
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-line bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex h-full w-full max-w-[1320px] items-center gap-7 px-6">
        <Link to="/" className="flex items-center gap-2.5 text-[14px] font-semibold tracking-[0.14em]">
          <Mark />
          VANTAGE
        </Link>
        <nav className="mr-auto flex gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-ctl px-3 py-1.5 text-[14px] transition-colors ${
                  isActive ? 'bg-accent/12 text-ink' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <SearchField />
        <StratzStatus />
        <NavLink
          to={`/player/${DEFAULT_STEAM_ID}`}
          className="flex items-center gap-2 rounded-full border border-line-2 bg-surface px-3 py-1.5 text-[13px] text-ink-2 transition-colors hover:border-accent/40 hover:text-ink"
        >
          <UserCircle size={17} />
          Мой профиль
        </NavLink>
      </div>
    </header>
  )
}

function SearchField() {
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  function submit(event: FormEvent) {
    event.preventDefault()
    const query = value.trim()
    if (!query) return
    if (/^\d{6,}$/.test(query)) {
      navigate(`/player/${query}`)
    } else {
      navigate(`/search/${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={submit} className="relative hidden md:block">
      <MagnifyingGlass
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
      />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Игрок, Steam ID или герой"
        aria-label="Поиск"
        className="h-9 w-[248px] rounded-full border border-line-2 bg-surface pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-3 transition-colors focus:border-accent/50 focus:outline-none"
      />
    </form>
  )
}

function StratzStatus() {
  const status = useStratzStatus()

  if (status.isPending) return null

  const online = status.data === true

  return (
    <Tooltip
      content={
        online
          ? 'Stratz отвечает, расширенные данные доступны'
          : 'Stratz не отвечает, часть данных недоступна'
      }
      variant="hint"
    >
      <span
        className={`hidden items-center gap-1.5 text-[12px] lg:flex ${online ? 'text-ink-3' : 'text-warm'}`}
      >
        {online ? <WifiHigh size={14} /> : <WifiSlash size={14} />}
        Stratz
      </span>
    </Tooltip>
  )
}

function Mark() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden fill="none">
      <path d="M3 4l7 12 7-12" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="10" cy="7.5" r="1.7" fill="var(--color-accent)" />
    </svg>
  )
}
