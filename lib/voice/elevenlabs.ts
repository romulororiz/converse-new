export const VOICE_CONFIGS = {
  narrator: {
    voice_id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'George',
    description: 'Professional, clear narrator voice',
    gender: 'male' as const,
    personality: 'authoritative',
  },
  storyteller: {
    voice_id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    description: 'Warm, engaging storyteller',
    gender: 'male' as const,
    personality: 'warm',
  },
  wise: {
    voice_id: 'CYw3kZ02Hs0563khs1Fj',
    name: 'Dave',
    description: 'Wise, thoughtful voice',
    gender: 'male' as const,
    personality: 'wise',
  },
  conversational: {
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    description: 'Natural, conversational voice',
    gender: 'male' as const,
    personality: 'friendly',
  },
  elegantFemale: {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    description: 'Elegant, sophisticated female voice',
    gender: 'female' as const,
    personality: 'elegant',
  },
  warmFemale: {
    voice_id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    description: 'Warm, nurturing female voice',
    gender: 'female' as const,
    personality: 'nurturing',
  },
  intellectualFemale: {
    voice_id: 'ThT5KcBeYPX3keUQqHPh',
    name: 'Dorothy',
    description: 'Intellectual, clear female voice',
    gender: 'female' as const,
    personality: 'intellectual',
  },
  youthfulFemale: {
    voice_id: 'XrExE9yKIg1WjnnlVkGX',
    name: 'Matilda',
    description: 'Youthful, energetic female voice',
    gender: 'female' as const,
    personality: 'youthful',
  },
};

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.5,
  style: 0.5,
  use_speaker_boost: true,
};

const FEMALE_AUTHORS = [
  'jane austen', 'charlotte brontë', 'emily brontë', 'virginia woolf',
  'george eliot', 'edith wharton', 'willa cather', 'louisa may alcott',
  'agatha christie', 'harper lee', 'toni morrison', 'maya angelou',
  'margaret atwood', 'j.k. rowling', 'gillian flynn', 'donna tartt',
  'zadie smith', 'chimamanda ngozi adichie', 'octavia butler',
  'ursula k. le guin', 'sylvia plath', "flannery o'connor",
  'zora neale hurston', 'alice walker', 'simone de beauvoir', 'ayn rand',
  'pearl s. buck', 'gertrude stein', 'anne rice', 'joyce carol oates',
  'alice munro', 'doris lessing', 'nadine gordimer',
];

const MALE_AUTHORS = [
  'william shakespeare', 'charles dickens', 'mark twain',
  'ernest hemingway', 'f. scott fitzgerald', 'george orwell',
  'j.d. salinger', 'john steinbeck', 'william faulkner',
  'herman melville', 'nathaniel hawthorne', 'edgar allan poe',
  'oscar wilde', 'james joyce', 'franz kafka', 'leo tolstoy',
  'fyodor dostoevsky', 'gabriel garcía márquez', 'jorge luis borges',
  'milan kundera', 'isaac asimov', 'ray bradbury', 'arthur c. clarke',
  'stephen king', 'dan brown', 'john grisham', 'michael crichton',
  'tom clancy', 'jack kerouac', 'allen ginsberg', 'kurt vonnegut',
  'joseph heller', 'norman mailer', 'philip roth', 'saul bellow',
];

const FEMALE_NAME_PATTERNS = [
  'jane', 'mary', 'elizabeth', 'emma', 'charlotte', 'emily', 'anne',
  'margaret', 'sarah', 'lisa', 'jennifer', 'jessica', 'ashley',
  'michelle', 'kimberly', 'amy', 'donna', 'carol', 'susan', 'helen',
  'patricia', 'linda', 'barbara', 'maria', 'nancy', 'dorothy',
  'sandra', 'betty', 'ruth', 'sharon', 'diana',
];

export function selectVoiceForBook(
  bookAuthor?: string,
  bookId?: string,
): string {
  if (!bookAuthor || !bookId) {
    return VOICE_CONFIGS.conversational.voice_id;
  }

  const authorLower = bookAuthor.toLowerCase();
  const isKnownFemale = FEMALE_AUTHORS.some((a) => authorLower.includes(a));
  const isKnownMale = MALE_AUTHORS.some((a) => authorLower.includes(a));

  let isFemale = false;
  if (isKnownFemale) {
    isFemale = true;
  } else if (!isKnownMale) {
    isFemale = FEMALE_NAME_PATTERNS.some((n) => authorLower.includes(n));
  }

  const bookHash = bookId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variation = bookHash % 4;

  if (isFemale) {
    const voices = [
      VOICE_CONFIGS.elegantFemale,
      VOICE_CONFIGS.warmFemale,
      VOICE_CONFIGS.intellectualFemale,
      VOICE_CONFIGS.youthfulFemale,
    ];
    return voices[variation].voice_id;
  }

  const voices = [
    VOICE_CONFIGS.narrator,
    VOICE_CONFIGS.storyteller,
    VOICE_CONFIGS.wise,
    VOICE_CONFIGS.conversational,
  ];
  return voices[variation].voice_id;
}

export function getVoiceInfo(voiceId: string) {
  return (
    Object.values(VOICE_CONFIGS).find((c) => c.voice_id === voiceId) ??
    VOICE_CONFIGS.conversational
  );
}
