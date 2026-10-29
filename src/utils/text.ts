export interface TextStats {
  words: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

export function analyzeText(text: string): TextStats {
  const charactersWithSpaces = text.length;
  const charactersWithoutSpaces = text.replace(/\s+/g, '').length;

  // Words: match non-whitespace word sequences
  const wordsMatch = text.trim().match(/[\p{L}\p{N}'’_-]+/gu);
  const words = wordsMatch ? wordsMatch.length : 0;

  // Sentences: match endings (. ! ?) followed by whitespace or end of string
  const sentencesMatch = text.trim().match(/[^.!?]+[.!?]+(\s|$)/g);
  let sentences = sentencesMatch ? sentencesMatch.length : 0;
  if (sentences === 0 && words > 0) {
    sentences = 1;
  }

  // Paragraphs: non-empty chunks separated by one or more newlines
  const paragraphsMatch = text.split(/\r?\n+/).filter((p) => p.trim().length > 0);
  const paragraphs = paragraphsMatch.length;

  // Reading time (average 200 words per minute)
  const readingTimeMinutes = Math.ceil(words / 200);

  // Speaking time (average 130 words per minute)
  const speakingTimeMinutes = Math.ceil(words / 130);

  return {
    words,
    charactersWithSpaces,
    charactersWithoutSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes,
    speakingTimeMinutes,
  };
}
