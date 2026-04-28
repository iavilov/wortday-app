const NOUN_ARTICLES = ['der', 'die', 'das'] as const;

export function buildWordText(article: string | null | undefined, wordDe: string): string {
  const hasArticle = !!article && (NOUN_ARTICLES as readonly string[]).includes(article);
  return hasArticle ? `${article} ${wordDe}` : wordDe;
}

export function stripSentenceMarkdown(sentence: string): string {
  return sentence.replace(/\*\*/g, '');
}
