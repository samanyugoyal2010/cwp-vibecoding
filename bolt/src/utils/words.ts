// Word lists for games
export const WORDLE_WORDS = [
  'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
  'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
  'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE',
  'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AUDIO', 'AUDIT', 'AVOID',
  'AWAKE', 'AWARD', 'AWARE', 'BADLY', 'BAKER', 'BASES', 'BASIC', 'BEACH', 'BEGAN', 'BEGIN',
  'BEING', 'BELOW', 'BENCH', 'BILLY', 'BIRTH', 'BLACK', 'BLAME', 'BLANK', 'BLIND', 'BLOCK',
  'BLOOD', 'BOARD', 'BOOST', 'BOOTH', 'BOUND', 'BRAIN', 'BRAND', 'BREAD', 'BREAK', 'BREED',
  'BRIEF', 'BRING', 'BROAD', 'BROKE', 'BROWN', 'BUILD', 'BURST', 'BUYER', 'CABLE', 'CALIF',
  'CARRY', 'CATCH', 'CAUSE', 'CHAIN', 'CHAIR', 'CHAOS', 'CHARM', 'CHART', 'CHASE', 'CHEAP',
  'CHECK', 'CHEST', 'CHIEF', 'CHILD', 'CHINA', 'CHOSE', 'CIVIL', 'CLAIM', 'CLASS', 'CLEAN'
];

export const HANGMAN_CATEGORIES = {
  animals: [
    'ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'BUTTERFLY', 'KANGAROO', 'OCTOPUS', 'FLAMINGO',
    'TIGER', 'WHALE', 'RABBIT', 'MONKEY', 'ZEBRA', 'HIPPO', 'CHEETAH', 'PANDA', 'KOALA', 'SLOTH'
  ],
  countries: [
    'AUSTRALIA', 'BRAZIL', 'CANADA', 'DENMARK', 'EGYPT', 'FRANCE', 'GERMANY', 'HUNGARY',
    'ICELAND', 'JAPAN', 'KENYA', 'LUXEMBOURG', 'MEXICO', 'NORWAY', 'POLAND', 'QATAR', 'RUSSIA', 'SPAIN'
  ],
  foods: [
    'PIZZA', 'HAMBURGER', 'CHOCOLATE', 'STRAWBERRY', 'SANDWICH', 'SPAGHETTI', 'PANCAKE', 'BURRITO',
    'CROISSANT', 'CHEESECAKE', 'AVOCADO', 'BROCCOLI', 'PINEAPPLE', 'WATERMELON', 'PRETZEL', 'MUFFIN'
  ],
  movies: [
    'TITANIC', 'AVATAR', 'FROZEN', 'MATRIX', 'GLADIATOR', 'INCEPTION', 'JAWS', 'ROCKY',
    'CASABLANCA', 'PSYCHO', 'ALIEN', 'CHICAGO', 'BATMAN', 'SUPERMAN', 'SPIDERMAN', 'IRONMAN'
  ],
  sports: [
    'BASKETBALL', 'FOOTBALL', 'BASEBALL', 'TENNIS', 'GOLF', 'SWIMMING', 'BOXING', 'HOCKEY',
    'VOLLEYBALL', 'BADMINTON', 'CRICKET', 'RUGBY', 'SKIING', 'SURFING', 'CYCLING', 'RUNNING'
  ]
};

export const getRandomWord = (category?: keyof typeof HANGMAN_CATEGORIES): string => {
  if (category && HANGMAN_CATEGORIES[category]) {
    const words = HANGMAN_CATEGORIES[category];
    return words[Math.floor(Math.random() * words.length)];
  }
  
  // Get random word from all categories
  const allWords = Object.values(HANGMAN_CATEGORIES).flat();
  return allWords[Math.floor(Math.random() * allWords.length)];
};

export const getRandomWordleWord = (): string => {
  return WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)];
};

export const isValidWord = (word: string): boolean => {
  return WORDLE_WORDS.includes(word.toUpperCase());
};

export const getTodaysWord = (): string => {
  // Generate consistent daily word based on date
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  const seed = dateString.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const index = seed % WORDLE_WORDS.length;
  return WORDLE_WORDS[index];
};