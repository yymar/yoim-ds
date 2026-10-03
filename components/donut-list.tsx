import { Amount } from './amount'
import { Bar } from './bar'

/** De elf categoriekleuren uit tokens.css; elk is een paar `--cat-x` en `--cat-x-bg`. */
export type CategoryColor =
  | 'green'
  | 'red'
  | 'yellow'
  | 'gray'
  | 'blue'
  | 'brown'
  | 'pink'
  | 'purple'
  | 'orange'
  | 'teal'
  | 'olijf'

export type DonutItem = {
  name: string
  /** Een lucide-icoon; de maat zet DonutList zelf. */
  icon: React.ReactNode
  color: CategoryColor
  amount: number
  budget?: number
}

const RING = 14
const LUCHT = 2

/**
 * Twee keer getekend en niet geschaald: een viewBox zou de ring van 14px en
 * de 2px lucht mee laten groeien.
 */
function Donut({ items, maat, klasse }: { items: DonutItem[]; maat: number; klasse: string }) {
  const r = (maat - RING) / 2
  const omtrek = 2 * Math.PI * r
  const som = items.reduce((t, i) => t + Math.max(0, i.amount), 0)
  let start = 0

  return (
    <svg width={maat} height={maat} aria-hidden="true" className={`shrink-0 -rotate-90 ${klasse}`}>
      <circle cx={maat / 2} cy={maat / 2} r={r} fill="none" stroke="var(--surface-sunken)" strokeWidth={RING} />
      {som > 0
        ? items.map((item) => {
            const lengte = (Math.max(0, item.amount) / som) * omtrek
            const stuk = (
              <circle
                key={`${item.color}:${item.name}`}
                cx={maat / 2}
                cy={maat / 2}
                r={r}
                fill="none"
                stroke={`var(--cat-${item.color})`}
                strokeWidth={RING}
                strokeDasharray={`${Math.max(0, lengte - LUCHT)} ${omtrek}`}
                strokeDashoffset={-start}
              />
            )
            start += lengte
            return stuk
          })
        : null}
    </svg>
  )
}

/**
 * Waar het geld heen ging: een donut met het totaal, en daaronder de lijst.
 * De lijst is de hoofdzaak en draagt alle informatie; de donut is decor en
 * staat voor een schermlezer uit.
 */
export function DonutList({
  items,
  total,
  heading,
  today,
}: {
  items: DonutItem[]
  total: number
  heading: string
  /** Hoe ver de periode is, 0 tot 1: de markering op de budgetbalken. */
  today?: number
}) {
  const gesorteerd = [...items].sort((a, b) => b.amount - a.amount)

  return (
    <div className="@container flex flex-col gap-4">
      <div className="flex items-center gap-5">
        <Donut items={gesorteerd} maat={112} klasse="@min-[24rem]:hidden" />
        <Donut items={gesorteerd} maat={160} klasse="hidden @min-[24rem]:block" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[13px] text-[var(--text-muted)]">{heading}</span>
          <Amount value={total} kind="neutral" size="large" />
        </div>
      </div>

      <ul className="flex flex-col">
        {gesorteerd.map((item) => (
          <li key={`${item.color}:${item.name}`} className="flex flex-col gap-2 py-2.5">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ background: `var(--cat-${item.color})` }}
              />
              <span
                aria-hidden="true"
                className="shrink-0 text-[var(--text-muted)] [&_svg]:size-[18px]"
              >
                {item.icon}
              </span>
              <span className="min-w-0 flex-1 truncate text-[15px] text-[var(--text)]">
                {item.name}
              </span>
              <Amount value={item.amount} kind="neutral" />
            </div>
            {item.budget === undefined ? null : (
              // Ingesprongen tot onder de naam: stip 8 + gap 10 + icoon 18 + gap 10.
              <div className="pl-[46px]">
                <Bar value={item.amount} max={item.budget} marker={today} height={6} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
