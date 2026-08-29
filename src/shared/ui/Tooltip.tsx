import { cloneElement, useState, isValidElement } from 'react'
import type { ReactElement, ReactNode, Ref } from 'react'
import {
  useFloating,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  useTransitionStyles,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  useMergeRefs,
  FloatingPortal,
  FloatingArrow,
  safePolygon,
} from '@floating-ui/react'
import { useRef } from 'react'

type Variant = 'hint' | 'entity' | 'math'

const WIDTH: Record<Variant, string> = {
  hint: 'max-w-[240px]',
  entity: 'max-w-[320px]',
  math: 'max-w-[320px]',
}

interface TooltipProps {
  content: ReactNode
  variant?: Variant
  placement?: 'top' | 'bottom' | 'left' | 'right'
  children: ReactElement<{ ref?: Ref<Element> }>
}

export function Tooltip({ content, variant = 'hint', placement = 'top', children }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const arrowRef = useRef<SVGSVGElement>(null)

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 }), arrow({ element: arrowRef })],
  })

  const hover = useHover(context, {
    delay: { open: 120, close: 60 },
    handleClose: variant === 'entity' ? safePolygon() : null,
  })
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role])

  const { isMounted, styles } = useTransitionStyles(context, {
    duration: { open: 140, close: 80 },
    initial: { opacity: 0, transform: 'translateY(2px)' },
  })

  const childRef = isValidElement(children) ? (children.props.ref ?? null) : null
  const ref = useMergeRefs([refs.setReference, childRef])

  return (
    <>
      {cloneElement(children, { ref, ...getReferenceProps(children.props) } as never)}
      {isMounted && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-[55] pointer-events-none"
          >
            <div
              style={styles}
              className={`${WIDTH[variant]} rounded-block border border-line-2 bg-surface-2 px-3 py-2 text-[12px] leading-relaxed text-ink-2 shadow-[0_12px_36px_rgba(0,0,0,.6)]`}
            >
              {content}
              <FloatingArrow ref={arrowRef} context={context} className="fill-surface-2" />
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

interface MathTooltipProps {
  formula: string
  inputs: { label: string; value: string }[]
  note?: string
}

export function MathTooltip({ formula, inputs, note }: MathTooltipProps) {
  return (
    <div className="flex flex-col gap-2">
      <code className="num block text-[11px] text-accent">{formula}</code>
      <ul className="flex flex-col gap-0.5">
        {inputs.map((input) => (
          <li key={input.label} className="flex justify-between gap-3">
            <span className="text-ink-3">{input.label}</span>
            <span className="num text-ink">{input.value}</span>
          </li>
        ))}
      </ul>
      {note && <p className="text-ink-3">{note}</p>}
    </div>
  )
}
