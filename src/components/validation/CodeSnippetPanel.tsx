import { useState } from 'react'
import { Code2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { CodeSnippet } from '@/utils/validation'
import { cn } from '@/utils/cn'

interface CodeSnippetPanelProps {
  snippets: CodeSnippet[]
  fileName: string
  className?: string
}

export function CodeSnippetPanel({ snippets, fileName, className }: CodeSnippetPanelProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const snippet = snippets[activeIdx]

  if (!snippet) {
    return (
      <Card className={cn('p-4', className)}>
        <p className="text-xs text-text-secondary">코드 스니펫 증거 없음</p>
      </Card>
    )
  }

  return (
    <Card padding="none" className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          <SectionHeader
            title="코드 스니펫 증거"
            description={`${fileName} · L${snippet.startLine}–${snippet.endLine}`}
          />
        </div>
        {snippets.length > 1 && (
          <div className="flex gap-1">
            {snippets.map((s, i) => (
              <button
                key={`${s.startLine}-${i}`}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={cn(
                  'rounded px-2 py-0.5 text-[10px] font-medium',
                  i === activeIdx ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary',
                )}
              >
                {s.functionName ?? `블록 ${i + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto bg-[#1e1e2e] p-0">
        <pre className="font-mono text-[11px] leading-5">
          {snippet.lines.map((line) => (
            <div
              key={line.lineNumber}
              className={cn(
                'flex',
                line.highlighted ? 'bg-primary/20' : 'hover:bg-white/5',
              )}
            >
              <span className="w-10 shrink-0 select-none pr-3 text-right text-gray-500">
                {line.lineNumber}
              </span>
              <code className={cn('flex-1 pr-4', line.highlighted ? 'text-green-300' : 'text-gray-200')}>
                {line.content || ' '}
              </code>
            </div>
          ))}
        </pre>
      </div>

      <div className="border-t border-border px-4 py-2 text-[10px] text-text-secondary">
        언어: {snippet.language}
        {snippet.functionName && ` · 함수: ${snippet.functionName}`}
        {' · '}
        AI 매칭 구간 (추정 증거)
      </div>
    </Card>
  )
}
