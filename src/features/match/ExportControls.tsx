import { useState } from 'react'
import type { RefObject } from 'react'
import { toPng } from 'html-to-image'
import { LinkSimple, DownloadSimple, Check } from '@phosphor-icons/react'

interface ExportControlsProps {
  targetRef: RefObject<HTMLElement | null>
  fileName: string
}

export function ExportControls({ targetRef, fileName }: ExportControlsProps) {
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setError('Не удалось скопировать ссылку')
    }
  }

  async function exportImage() {
    if (!targetRef.current) return
    setExporting(true)
    setError(null)
    try {
      const dataUrl = await toPng(targetRef.current, {
        backgroundColor: '#06080b',
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${fileName}.png`
      link.click()
    } catch {
      setError('Не удалось собрать картинку')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => void copyLink()}
        className="flex items-center gap-1.5 rounded-full border border-line-2 bg-surface-2 px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-accent/40 active:translate-y-px"
      >
        {copied ? <Check size={14} className="text-win" /> : <LinkSimple size={14} />}
        {copied ? 'Скопировано' : 'Ссылка'}
      </button>
      <button
        type="button"
        onClick={() => void exportImage()}
        disabled={exporting}
        className="flex items-center gap-1.5 rounded-full border border-line-2 bg-surface-2 px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-accent/40 active:translate-y-px disabled:opacity-50"
      >
        <DownloadSimple size={14} />
        {exporting ? 'Собираю…' : 'Картинка'}
      </button>
      {error && <span className="text-[12px] text-loss">{error}</span>}
    </div>
  )
}
