type PrismType = typeof import('prismjs');

let prismPromise: Promise<PrismType> | null = null;

export async function loadPrism(): Promise<PrismType> {
  if (prismPromise) return prismPromise;

  prismPromise = (async () => {
    const mod = await import('prismjs');
    const Prism: PrismType = (mod as unknown as { default?: PrismType }).default ?? (mod as PrismType);

    // Best-effort: don't fail highlighting globally if one language fails.
    const safe = async (p: Promise<unknown>) => p.catch(() => null);

    await safe(import('prismjs/components/prism-markup'));
    await safe(import('prismjs/components/prism-clike'));
    await safe(import('prismjs/components/prism-javascript'));

    await safe(import('prismjs/components/prism-typescript'));
    await safe(import('prismjs/components/prism-jsx'));
    await safe(import('prismjs/components/prism-tsx'));
    await safe(import('prismjs/components/prism-json'));
    await safe(import('prismjs/components/prism-yaml'));
    await safe(import('prismjs/components/prism-toml'));
    await safe(import('prismjs/components/prism-bash'));
    await safe(import('prismjs/components/prism-diff'));
    await safe(import('prismjs/components/prism-markdown'));
    await safe(import('prismjs/components/prism-rust'));

    return Prism;
  })();

  return prismPromise;
}

export type CodeLanguage =
  | 'bash'
  | 'diff'
  | 'javascript'
  | 'jsx'
  | 'json'
  | 'markdown'
  | 'rust'
  | 'toml'
  | 'tsx'
  | 'typescript'
  | 'yaml'
  | 'text';

export function normalizeLanguage(
  language?: string,
  title?: string,
  code?: string
): CodeLanguage {
  const raw = (language || '').trim().toLowerCase();
  const byRaw = mapLanguage(raw);
  if (byRaw) return byRaw;

  const inferred = inferFromTitle(title);
  if (inferred) return inferred;

  if (code) {
    const byCode = inferLanguageFromCode(code);
    if (byCode) return byCode;
  }

  return 'text';
}

function mapLanguage(raw: string): CodeLanguage | null {
  if (!raw) return null;
  if (raw === 'ts') return 'typescript';
  if (raw === 'tsx') return 'tsx';
  if (raw === 'js' || raw === 'javascript') return 'javascript';
  if (raw === 'jsx') return 'jsx';
  if (raw === 'json') return 'json';
  if (raw === 'bash' || raw === 'sh' || raw === 'shell' || raw === 'zsh') return 'bash';
  if (raw === 'diff' || raw === 'patch') return 'diff';
  if (raw === 'md' || raw === 'markdown') return 'markdown';
  if (raw === 'yaml' || raw === 'yml') return 'yaml';
  if (raw === 'toml') return 'toml';
  if (raw === 'rs' || raw === 'rust') return 'rust';
  if (raw === 'text' || raw === 'plain' || raw === 'plaintext') return 'text';
  return null;
}

function inferFromTitle(title?: string): CodeLanguage | null {
  if (!title) return null;
  const t = title.toLowerCase();

  const fileMatch = t.match(/\b[\w./-]+\.(ts|tsx|js|jsx|json|sh|bash|zsh|md|yaml|yml|toml|rs)\b/);
  if (fileMatch) {
    return mapLanguage(fileMatch[1]) ?? null;
  }

  if (t.includes('diff')) return 'diff';
  if (t.includes('bash') || t.includes('shell')) return 'bash';
  if (t.includes('json')) return 'json';

  return null;
}

export function inferLanguageFromCode(code: string): CodeLanguage | null {
  const c = code.trim();
  if (!c) return null;

  // Diff
  if (
    c.startsWith('diff --git') ||
    c.includes('\n@@ ') ||
    c.includes('\n+++ ') ||
    c.includes('\n--- ')
  ) {
    return 'diff';
  }

  // JSON
  if (
    (c.startsWith('{') && c.endsWith('}')) ||
    (c.startsWith('[') && c.endsWith(']'))
  ) {
    // quick check for JSON-ish patterns
    if (c.includes('":') || c.includes('": ')) return 'json';
  }

  // TOML
  if (c.includes('\n[package]') || c.includes('\n[dependencies]')) return 'toml';

  // YAML
  if (c.includes('\n---\n') || c.includes('\napiVersion:') || c.includes('\nkind:')) {
    return 'yaml';
  }

  // Bash/Shell
  const firstLine = c.split('\n', 1)[0] ?? '';
  if (
    firstLine.startsWith('#!/bin/bash') ||
    firstLine.startsWith('#!/usr/bin/env bash') ||
    firstLine.startsWith('#!/usr/bin/env sh') ||
    firstLine.startsWith('#!/bin/sh') ||
    c.includes('\n$ ') ||
    c.includes('npm run ') ||
    c.includes('pnpm ') ||
    c.includes('yarn ')
  ) {
    return 'bash';
  }

  // Rust
  if (c.includes('\nfn ') || c.includes('pub fn ') || c.includes('use ') || c.includes('impl ')) {
    if (c.includes('::') || c.includes('Result<') || c.includes('tokio::')) return 'rust';
  }

  // TS/TSX heuristics
  if (c.includes('interface ') || c.includes('type ') || c.includes('export ') || c.includes('import ')) {
    if (c.includes('<div') || c.includes('className=') || c.includes('</')) return 'tsx';
    return 'typescript';
  }

  if (c.includes('function ') || c.includes('const ') || c.includes('let ')) {
    return 'typescript';
  }

  return null;
}
