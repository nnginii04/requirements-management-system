import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Upload, FileText, Loader2 } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useRequirements } from '@/contexts/RequirementsContext'
import { useWorkflow } from '@/hooks/useWorkflow'
import { currentProjectId, users } from '@/contexts/RequirementsContext'
import {
  generateRequirementsFromText,
  createRequirementFromForm,
  createRequirementFromAI,
  type AIGeneratedRequirement,
} from '@/mocks/aiGeneration'
import type { RequirementPriority, RequirementType } from '@/types'

const DEMO_INPUT =
  '사용자가 로그인하면 개인 대시보드를 확인할 수 있어야 하고, 응답 속도는 3초 이내여야 한다.'

export function NewRequirementPage() {
  const workflow = useWorkflow()
  const navigate = useNavigate()
  const { requirements, addRequirement } = useRequirements()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<RequirementType>('functional')
  const [priority, setPriority] = useState<RequirementPriority>('medium')
  const [owner, setOwner] = useState(users[0]?.id ?? '')
  const [dueDate, setDueDate] = useState('')
  const [source, setSource] = useState('')
  const [relatedFeature, setRelatedFeature] = useState('')
  const [tags, setTags] = useState('')
  const [criteria, setCriteria] = useState('')

  const [aiInput, setAiInput] = useState(DEMO_INPUT)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResults, setAiResults] = useState<AIGeneratedRequirement[]>([])
  const [savedMessage, setSavedMessage] = useState('')

  const handleDirectSave = () => {
    if (!title.trim()) {
      alert('제목을 입력하세요.')
      return
    }

    const req = createRequirementFromForm({
      title,
      description,
      type,
      priority,
      owner,
      dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      source,
      acceptanceCriteria: criteria.split('\n'),
      relatedFeature,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      projectId: currentProjectId,
      existingCount: requirements.length,
    })

    addRequirement(req)
    setSavedMessage(`"${req.id}" 요구사항이 등록되었습니다.`)
    setTimeout(() => navigate('/requirements'), 800)
  }

  const handleAIGenerate = async () => {
    if (!aiInput.trim()) return
    setAiLoading(true)
    try {
      const results = await generateRequirementsFromText(aiInput)
      setAiResults(results)
    } finally {
      setAiLoading(false)
    }
  }

  const handleSaveAIResults = () => {
    let nextIndex = requirements.length
    aiResults.forEach((ai) => {
      addRequirement(createRequirementFromAI(ai, currentProjectId, nextIndex, owner))
      nextIndex += 1
    })
    setSavedMessage(`${aiResults.length}개 AI 요구사항이 등록되었습니다.`)
    setTimeout(() => navigate('/requirements'), 800)
  }

  return (
    <PageContainer
      title={workflow.title}
      description={workflow.subtitle}
      workflow={workflow}
      action={<Badge variant="primary">도출 단계</Badge>}
    >
      {savedMessage && (
        <div className="mb-4 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {savedMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card>
          <SectionHeader title="직접 등록" description="요구사항 정보를 직접 입력합니다" />
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              handleDirectSave()
            }}
          >
            <FormField label="요구사항 제목" required>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="field-input"
                placeholder="예: 로그인 기능"
              />
            </FormField>
            <FormField label="설명">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="field-input"
                placeholder="요구사항 상세 설명"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="요구사항 유형">
                <select value={type} onChange={(e) => setType(e.target.value as RequirementType)} className="field-input">
                  <option value="functional">기능</option>
                  <option value="non_functional">비기능</option>
                </select>
              </FormField>
              <FormField label="우선순위">
                <select value={priority} onChange={(e) => setPriority(e.target.value as RequirementPriority)} className="field-input">
                  <option value="critical">치명</option>
                  <option value="high">높음</option>
                  <option value="medium">보통</option>
                  <option value="low">낮음</option>
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="담당자">
                <select value={owner} onChange={(e) => setOwner(e.target.value)} className="field-input">
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </FormField>
              <FormField label="마감일">
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="field-input" />
              </FormField>
            </div>
            <FormField label="출처">
              <input value={source} onChange={(e) => setSource(e.target.value)} className="field-input" placeholder="회의록 2026-06-23" />
            </FormField>
            <FormField label="관련 기능">
              <input value={relatedFeature} onChange={(e) => setRelatedFeature(e.target.value)} className="field-input" placeholder="인증" />
            </FormField>
            <FormField label="태그">
              <input value={tags} onChange={(e) => setTags(e.target.value)} className="field-input" placeholder="auth, login (쉼표 구분)" />
            </FormField>
            <FormField label="수용 기준">
              <textarea
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                rows={4}
                className="field-input"
                placeholder="한 줄에 하나씩 입력"
              />
            </FormField>
            <button type="submit" className="btn-primary w-full">
              요구사항 등록
            </button>
          </form>
        </Card>

        <div className="space-y-5">
          <Card>
            <SectionHeader
              title="AI 요구사항 생성"
              description="회의록이나 아이디어를 입력하면 AI가 요구사항 초안을 생성합니다."
            />
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              rows={5}
              className="field-input mt-4"
              placeholder="자연어로 요구사항을 설명하세요..."
            />
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn-secondary flex-1" onClick={() => alert('파일 업로드 (mock)')}>
                <Upload className="mr-1.5 h-4 w-4" />
                업로드
              </button>
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={handleAIGenerate}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-1.5 h-4 w-4" />
                )}
                AI 요구사항 생성
              </button>
            </div>
            <p className="mt-2 text-[10px] text-text-secondary">
              PDF, 회의록 업로드 지원 (mock)
            </p>
          </Card>

          {aiResults.length > 0 && (
            <Card>
              <SectionHeader title="AI 생성 결과 미리보기" />
              <div className="mt-4 space-y-4">
                {aiResults.map((item, index) => (
                  <div key={item.tempId} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-text-secondary">
                          {index + 1}. {item.tempId}
                        </p>
                        <p className="font-medium text-text-primary">{item.title}</p>
                      </div>
                      <Badge variant={item.type === 'functional' ? 'primary' : 'secondary'}>
                        {item.type === 'functional' ? '기능' : '비기능'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-text-secondary">{item.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">우선순위: {item.priority}</Badge>
                      {item.duplicateRisk && (
                        <Badge variant="warning">⚠ {item.duplicateRisk}</Badge>
                      )}
                    </div>
                    {item.priorityReason && (
                      <p className="mt-2 text-[11px] text-primary">추천: {item.priorityReason}</p>
                    )}
                    <div className="mt-3">
                      <p className="text-[10px] font-medium uppercase text-text-secondary">수용 기준 추천</p>
                      <ul className="mt-1 space-y-0.5">
                        {item.acceptanceCriteria.map((c, i) => (
                          <li key={i} className="text-xs text-text-secondary">• {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="btn-primary mt-4 w-full" onClick={handleSaveAIResults}>
                <FileText className="mr-1.5 h-4 w-4" />
                {aiResults.length}개 요구사항 등록
              </button>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-text-secondary">
        {label}{required && <span className="text-danger"> *</span>}
      </label>
      {children}
    </div>
  )
}
