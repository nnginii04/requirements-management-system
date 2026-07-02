import type { Document } from '@/types'
import { currentProjectId } from './projects'

export const documents: Document[] = [
  {
    id: 'DOC-001',
    projectId: currentProjectId,
    type: 'srs',
    title: 'Software Requirements Specification v2.1',
    content: `# Software Requirements Specification

## 1. Introduction
Enterprise User Portal의 기능 및 비기능 요구사항을 정의합니다.

## 2. Functional Requirements
- REQ-001: 로그인 기능
- REQ-002: 회원가입 기능
- REQ-003: 대시보드 조회 기능
- REQ-004: 비밀번호 재설정 기능
- REQ-007: 자동 로그인 기능

## 3. Non-Functional Requirements
- REQ-005: 응답 속도 3초 이내
- REQ-006: 보안 정책 준수

## 4. Open Issues
- REQ-009: 세션 무제한 접속 (보안 정책과 충돌 — 검토 필요)
- REQ-010: 감사 로그 (v1.0에서 누락, v2.1에 추가)`,
    generatedAt: '2026-06-30T10:00:00Z',
    sourceRequirements: [
      'REQ-001', 'REQ-002', 'REQ-003', 'REQ-004',
      'REQ-005', 'REQ-006', 'REQ-007', 'REQ-009', 'REQ-010',
    ],
  },
  {
    id: 'DOC-002',
    projectId: currentProjectId,
    type: 'prd',
    title: 'Product Requirements Document v1.2',
    content: `# Product Requirements Document

## Product Vision
Enterprise User Portal — 통합 인증 및 대시보드 플랫폼

## Key Features
- 사용자 인증 (로그인, 회원가입, 자동 로그인)
- 개인화 대시보드
- 보안 및 성능 NFR`,
    generatedAt: '2026-06-18T11:00:00Z',
    sourceRequirements: ['REQ-001', 'REQ-002', 'REQ-003', 'REQ-007'],
  },
  {
    id: 'DOC-003',
    projectId: currentProjectId,
    type: 'brs',
    title: 'Business Requirements Specification v1.0',
    content: `# Business Requirements Specification

## Business Goals
- 사용자 온보딩 프로세스 자동화
- 보안 컴플라이언스(SOC2) 준수
- 시스템 응답 속도 SLA 3초 이내`,
    generatedAt: '2026-06-10T09:00:00Z',
    sourceRequirements: ['REQ-005', 'REQ-006', 'REQ-010'],
  },
  {
    id: 'DOC-004',
    projectId: currentProjectId,
    type: 'api_spec',
    title: 'Authentication API Specification',
    content: `# Authentication API

## POST /api/auth/login
이메일/비밀번호 기반 로그인

## POST /api/auth/signup
신규 사용자 등록

## POST /api/auth/refresh
Refresh Token 기반 세션 갱신

## POST /api/auth/reset-password
비밀번호 재설정 요청`,
    generatedAt: '2026-06-25T14:00:00Z',
    sourceRequirements: ['REQ-001', 'REQ-002', 'REQ-004', 'REQ-007'],
  },
  {
    id: 'DOC-005',
    projectId: currentProjectId,
    type: 'review_report',
    title: 'AI Analysis Review Report — June 2026',
    content: `# AI Analysis Review Report

## Summary
- 총 10개 요구사항 분석
- 중복 1건 (REQ-007 ↔ REQ-008)
- 충돌 1건 (REQ-006 ↔ REQ-009)
- 누락 1건 (REQ-010 신규 도출)

## Recommendations
1. REQ-008 병합 또는 폐기
2. REQ-009 보안 예외 정책 명문화
3. REQ-010 구현 우선순위 상향`,
    generatedAt: '2026-06-30T16:00:00Z',
    sourceRequirements: ['REQ-007', 'REQ-008', 'REQ-006', 'REQ-009', 'REQ-010'],
  },
  {
    id: 'DOC-006',
    projectId: currentProjectId,
    type: 'test_plan',
    title: 'Authentication Test Plan',
    content: `# Test Plan — Authentication Module

## Test Cases
- TC-001: Login with valid credentials
- TC-002: Signup with email validation
- TC-005: API response time under 3s`,
    generatedAt: '2026-06-20T09:00:00Z',
    sourceRequirements: ['REQ-001', 'REQ-002', 'REQ-005'],
  },
]
