import type { CodeSnippet } from '../../src/utils/validation.js'

const JAVA_TEMPLATES: Record<string, string[]> = {
  login: [
    '@PostMapping("/api/auth/login")',
    'public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {',
    '  User user = authService.authenticate(req.getEmail(), req.getPassword());',
    '  String token = jwtProvider.generateToken(user);',
    '  return ResponseEntity.ok(new AuthResponse(token));',
    '}',
  ],
  authenticate: [
    'public User authenticate(String email, String password) {',
    '  User user = userRepository.findByEmail(email)',
    '      .orElseThrow(() -> new AuthException("INVALID_CREDENTIALS"));',
    '  if (!passwordEncoder.matches(password, user.getPasswordHash())) {',
    '    throw new AuthException("INVALID_CREDENTIALS");',
    '  }',
    '  return user;',
    '}',
  ],
  default: [
    '// AI-matched implementation region (estimated)',
    'public void matchedLogic() {',
    '  // requirement traceability link',
    '  validateAcceptanceCriteria();',
    '}',
  ],
}

function pickTemplate(functionName?: string): string[] {
  const fn = (functionName ?? '').toLowerCase()
  if (fn.includes('login')) return JAVA_TEMPLATES.login
  if (fn.includes('authenticate') || fn.includes('validate')) return JAVA_TEMPLATES.authenticate
  return JAVA_TEMPLATES.default
}

export function buildSnippet(
  displayName: string,
  functionName?: string,
  startLine = 24,
): CodeSnippet {
  const lines = pickTemplate(functionName)
  const lang = displayName.endsWith('.java') ? 'java' : displayName.endsWith('.ts') ? 'typescript' : 'text'

  return {
    startLine,
    endLine: startLine + lines.length - 1,
    language: lang,
    functionName,
    lines: lines.map((content, i) => ({
      lineNumber: startLine + i,
      content,
      highlighted: i >= 1 && i <= lines.length - 2,
    })),
  }
}

export function enrichMatchesWithSnippets<T extends { displayName: string; functions: { name: string }[]; snippets?: CodeSnippet[] }>(
  matches: T[],
): T[] {
  return matches.map((m) => {
    if (m.snippets?.length) return m
    const topFn = m.functions[0]?.name
    return { ...m, snippets: [buildSnippet(m.displayName, topFn)] }
  })
}
