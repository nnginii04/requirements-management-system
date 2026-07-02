# ReqFlow — Requirements Engineering Platform

AI 기반 요구사항 관리 및 구현 검증 SaaS UI (Mock 데이터 기반 프론트엔드)

## 실행 방법

Mac에 Node.js가 없다면, 프로젝트 루트의 `dev.sh`를 사용하세요 (Node를 `~/.local/node`에 자동 사용).

```bash
./dev.sh
```

또는 Node.js가 설치된 경우:

```bash
npm install
npm run dev
```

브라우저에서 Vite가 안내하는 로컬 URL(기본 `http://localhost:5173`)로 접속합니다.

## 디자인 시스템

| 토큰 | 값 |
|------|-----|
| Primary | `#0064FF` |
| Background | `#F8FAFC` |
| Card | `#FFFFFF` |
| Border | `#E5E7EB` |
| Text Primary | `#111827` |
| Text Secondary | `#6B7280` |

## 사용자 흐름 (Requirements Engineering Lifecycle)

```
Elicitation → Analysis → Specification → Validation → Tracking
```

| 단계 | 경로 | 역할 |
|------|------|------|
| **Tracking / Overview** | `/dashboard` | Requirements Engineering Dashboard — KPI, AI 인사이트, Progress Timeline |
| **Elicitation** | `/requirements`, `/requirements/new` | Requirement Management — 등록, Version History, Baseline, Traceability |
| **Analysis** | `/analysis` | AI Analysis — 중복/충돌/누락 탐지, 설명 가능한 AI 결과 |
| **Specification** | `/documents` | Specification Generation — SRS / PRD / BRS 생성 |
| **Validation** | `/validation` | Implementation Validation — Requirement-Code Similarity, Code Relationship, Traceability Matrix |
| **Tracking** | `/build-history` | Jenkins Build History — 빌드별 Estimated Implementation Score 변화 |
| **Settings** | `/settings` | Baseline, Traceability, 연동 설정 |

## 프로젝트 구조 및 파일 역할

### 루트

| 파일 | 역할 |
|------|------|
| `index.html` | 앱 엔트리, Pretendard 폰트, 페이지 타이틀 |
| `package.json` | 의존성 및 스크립트 |
| `tailwind.config.js` | 디자인 토큰 (색상, shadow 등) |
| `vite.config.ts` | Vite + `@/` path alias |

### `src/config/`

| 파일 | 역할 |
|------|------|
| `workflow.ts` | 라우트별 Lifecycle 단계, 키워드, 다음 단계 링크 정의 |

### `src/layouts/`

| 파일 | 역할 |
|------|------|
| `AppLayout.tsx` | Sidebar + Header + Lifecycle Stepper + Outlet |
| `Sidebar.tsx` | RE 단계별 그룹 네비게이션, 모바일 `MobileNav` |
| `TopHeader.tsx` | 프로젝트 헤더, AI Analysis 바로가기 |

### `src/components/`

| 디렉터리 | 역할 |
|----------|------|
| `ui/` | Card, Badge, ProgressBar, StatusBadge, SectionHeader |
| `layout/` | PageContainer, WorkflowBanner |
| `lifecycle/` | LifecycleStepper (Elicitation → Tracking) |
| `dashboard/` | RE Dashboard KPI, 차트, AI 인사이트, 빌드 타임라인 |
| `requirements/` | 3열: 목록 / 상세+베이스라인+추적성 / AI 분석 패널 |
| `analysis/` | AI 분석 요약, findings 테이블, 설명 패널 |
| `documents/` | SRS/PRD/BRS 생성 사이드바, 미리보기, 품질 점검 |
| `validation/` | 관계 그래프, Estimated Implementation Score, Traceability Matrix |
| `build/` | Jenkins Build History 테이블, Progress Timeline 차트 |

### `src/pages/`

| 파일 | 역할 |
|------|------|
| `DashboardPage.tsx` | Requirements Engineering Dashboard (메인 화면) |
| `RequirementsPage.tsx` | Requirement Management |
| `NewRequirementPage.tsx` | 요구사항 등록 / AI 초안 |
| `AnalysisPage.tsx` | AI Analysis |
| `DocumentsPage.tsx` | Specification Generation |
| `ValidationPage.tsx` | Implementation Validation |
| `BuildHistoryPage.tsx` | Jenkins Build History |
| `SettingsPage.tsx` | Baseline, Traceability, 연동 설정 |

### `src/contexts/`

| 파일 | 역할 |
|------|------|
| `RequirementsContext.tsx` | 요구사항 Mock CRUD 상태 (등록·수정·베이스라인 할당) |

### `src/mocks/`

| 파일/디렉터리 | 역할 |
|---------------|------|
| `index.ts` | Mock 데이터 re-export + selector 함수 (API 레이어 대체) |
| `data/requirements.ts` | 10개 요구사항 (중복/충돌/누락 예시 포함) |
| `data/requirementVersions.ts` | Version History |
| `data/baselines.ts` | Baseline 스냅샷 |
| `data/analysisFindings.ts` | AI 분석 findings |
| `data/validationDetails.ts` | 요구사항-코드 매칭 상세 |
| `data/similarityScores.ts` | Requirement-Code Similarity |
| `data/codeFiles.ts` | 코드 파일 메타 |
| `data/buildHistories.ts` | Jenkins Build History (#140–#149) |
| `data/documents.ts` | 생성된 SRS/PRD/BRS |
| `documentGenerator.ts` | 명세서 생성 Mock |
| `aiGeneration.ts` | AI 초안 생성 Mock |

### `src/utils/`

| 파일 | 역할 |
|------|------|
| `dashboard.ts` | Dashboard KPI 집계 |
| `analysis.ts` | 분석 요약 계산 |
| `validation.ts` | 검증 점수·상태 계산 |
| `buildHistory.ts` | 빌드 타임라인·필터 |
| `traceability.ts` | 요구사항-문서-코드 추적성 해석 |
| `requirement.ts` | 구현 점수 → 상태 라벨 변환 |

### `src/hooks/`

| 파일 | 역할 |
|------|------|
| `useWorkflow.ts` | 현재 경로의 WorkflowConfig |
| `useRequirementFilters.ts` | 요구사항 필터 |
| `useValidationFilters.ts` | 검증 페이지 필터 |

## Mock 데이터 관계

- `requirements.implementationScore` — 현재 Estimated Implementation Score (기준값)
- `validationDetails` — 요구사항별 코드 매칭, AI 설명, 누락 항목
- `similarityScores` — Requirement-Code Similarity 원시 점수
- `buildHistories` — 빌드별 `requirementProgress` 및 요구사항 스냅샷 (시간에 따른 점수 변화)
- `analysisFindings` — 중복/충돌/누락 (Review Needed 상태 트리거)
- `baselines` + `requirementVersions` — Baseline / Version History

점수는 모두 **추정치**이며 UI에서 `~XX%` 또는 `Estimated Implementation Score`로 표시됩니다.

## Phase A — REST API (PoC)

프론트 + API를 함께 실행:

```bash
./dev-all.sh
# 또는
npm run dev:all
```

API만 실행: `npm run dev:api` (포트 3001)  
프론트만 실행: `npm run dev` (Vite proxy → `/api` → `:3001`)

### 주요 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 헬스체크 |
| GET | `/api/requirements` | 요구사항 목록 |
| GET | `/api/requirements/:id/impact` | 변경 영향 분석 |
| GET | `/api/validation/:requirementId` | 검증 상세 + 코드 스니펫 |
| GET | `/api/builds` | 빌드 이력 |
| POST | `/api/builds/simulate` | Jenkins 빌드 시뮬레이션 |
| POST | `/api/webhooks/github` | GitHub push webhook |
| POST | `/api/webhooks/jenkins` | Jenkins build webhook |
| GET | `/api/openapi.json` | OpenAPI 3.0 스펙 |

데이터는 `server/db/reqflow.json`에 저장됩니다 (최초 실행 시 mock 시드).

## 남은 TODO (백엔드/프로덕션)

- [x] Phase A REST API (`server/`, JSON DB)
- [x] Jenkins / GitHub webhook → 점수 재계산
- [x] 코드 스니펫 패널 (line-level evidence)
- [x] 변경 영향 분석 (`GET /api/requirements/:id/impact`)
- [x] OpenAPI v1 (`GET /api/openapi.json`)
- [ ] 사용자 인증 (SSO/OAuth)
- [ ] AI 임베딩·유사도 엔진 실연동
- [ ] 명세서 PDF/Word export
- [ ] 실시간 빌드 알림
- [ ] 다중 프로젝트/워크스페이스
- [ ] E2E 테스트 (Playwright/Cypress)
- [ ] i18n (한/영 전환)

## 기술 스택

- React 18 + Vite + TypeScript
- react-router-dom
- Tailwind CSS
- lucide-react
- recharts
