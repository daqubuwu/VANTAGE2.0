import { writeFileSync, mkdirSync } from 'node:fs'

const pages = {
  HomePage: ['Главная', 'Итерация 2', ['Свой профиль сразу на входе', 'Последние матчи с оценкой', 'Срез меты на высоком рейтинге']],
  PlayerPage: ['Игрок', 'Итерация 2', ['Метрики по ролям и героям', 'Тренд формы и график активности', 'Бенчмарк против медианы бракета', 'Догрузка матчей по 20 при скролле']],
  MatchPage: ['Матч', 'Итерация 3', ['6 слотов предметов с таймингами', 'Ползунок времени внизу экрана', 'Оценка и предметы под положение ползунка', 'Таланты и прокачка способностей', 'Текстовый разбор по правилам']],
  HeroesPage: ['Мета', 'Итерация 4', ['Тиры героев по рангу и позиции', 'Про-мета отдельно от паб-меты', 'Meta hero grids', 'Влияние патча на винрейты']],
  HeroPage: ['Герой', 'Итерация 4', ['Билды предметов по фазам с винрейтом', 'Порядок прокачки способностей', 'Матчапы и синергии с фильтром по роли', 'Тайминги силы по минутам']],
  TeamPage: ['Команда', 'Итерация 6', ['Состав и история матчей', 'Пул героев команды', 'Внутренняя навигация без ухода на opendota']],
  EsportsPage: ['Киберспорт', 'Итерация 6', ['Лайв-матчи с оценкой вероятности', 'Календарь турниров', 'Страницы команд и про-игроков']],
  ComparePage: ['Сравнение', 'Итерация 6', ['Два игрока лицом к лицу', 'Общие матчи и общие герои', 'Разница метрик в перцентилях']],
  DraftPage: ['Драфт', 'Итерация 5', ['Контрпики с винрейтом по бракету', 'Оценка драфта: лейн, файты, лейт', 'Timing windows по минутам', 'Банлист и подбор под свой пул']],
  SearchPage: ['Поиск', 'Итерация 2', ['Игроки по нику и Steam ID', 'Герои по названию и алиасам', 'Пометка закрытых Steam-профилей']],
}

mkdirSync('src/pages', { recursive: true })

for (const [name, [title, iteration, planned]] of Object.entries(pages)) {
  const body = `import { Placeholder } from './_Placeholder'

export function ${name}() {
  return (
    <Placeholder
      title="${title}"
      iteration="${iteration}"
      planned={${JSON.stringify(planned, null, 8).replace(/\n/g, '\n      ')}}
    />
  )
}
`
  writeFileSync(`src/pages/${name}.tsx`, body)
}

writeFileSync(
  'src/pages/NotFoundPage.tsx',
  `import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { EmptyState } from '@/shared/ui/States'

export function NotFoundPage() {
  useDocumentTitle('Страница не найдена')
  return (
    <EmptyState
      title="Такой страницы нет"
      hint="Проверьте адрес или вернитесь на главную."
      action={
        <Link
          to="/"
          className="mt-1 rounded-full border border-line-2 bg-surface-2 px-4 py-2 text-[13px] text-ink transition-colors hover:border-accent/40"
        >
          На главную
        </Link>
      }
    />
  )
}
`,
)

console.log('pages generated')
