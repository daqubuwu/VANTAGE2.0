import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { Section } from '@/shared/ui/Surface'
import { EmptyState } from '@/shared/ui/States'
import { Blueprint } from '@phosphor-icons/react'

interface PlaceholderProps {
  title: string
  iteration: string
  planned: string[]
}

export function Placeholder({ title, iteration, planned }: PlaceholderProps) {
  useDocumentTitle(title)
  return (
    <Section title={title} aside={iteration}>
      <div className="surface-panel p-0">
        <EmptyState
          icon={<Blueprint size={28} />}
          title="Экран ещё не собран"
          hint="Каркас маршрута готов, наполнение по плану ниже."
        />
        <ul className="border-t border-line px-6 py-4 text-[13px] text-ink-2">
          {planned.map((item) => (
            <li key={item} className="flex gap-2 py-1">
              <span className="num text-ink-3">·</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
