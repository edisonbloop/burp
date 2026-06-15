export type Difficulty = "easy" | "medium" | "hard";

export interface BibleCharacter {
  name: string;
  emojis: string[];
  hint: string;        // shown during guessing (easy = auto, medium = on request)
  clue: string;        // shown after correct / reveal
  passage: string;
  acceptedAnswers: string[];
  difficulty: Difficulty;
}

export const BIBLE_CHARACTERS: BibleCharacter[] = [

  // -- EASY -----------------------------------------------------------------
  {
    name: "Noah",
    emojis: ["🌊", "🚢", "🕊️", "🌈"],
    hint: "He built a giant boat to survive a flood.",
    clue: "He built a vessel that saved creation.",
    passage: "Genesis 6–9",
    acceptedAnswers: ["noah"],
    difficulty: "easy",
  },
  {
    name: "Moses",
    emojis: ["🔥", "🌿", "⛰️", "📜"],
    hint: "He led Israel out of Egypt.",
    clue: "Burning bush. Parted sea. Ten commandments.",
    passage: "Exodus 3–20",
    acceptedAnswers: ["moses"],
    difficulty: "easy",
  },
  {
    name: "David",
    emojis: ["🎵", "🪨", "🦁", "👑"],
    hint: "A shepherd boy who became Israel's greatest king.",
    clue: "A shepherd boy became Israel's greatest king.",
    passage: "1 Samuel 17",
    acceptedAnswers: ["david"],
    difficulty: "easy",
  },
  {
    name: "Jonah",
    emojis: ["🐳", "🌊", "😩", "🙏"],
    hint: "He ran from God and ended up inside a giant fish.",
    clue: "He ran from God and ended up inside a fish.",
    passage: "Jonah 1–2",
    acceptedAnswers: ["jonah"],
    difficulty: "easy",
  },
  {
    name: "Daniel",
    emojis: ["🦁", "🙏", "👑", "🌙"],
    hint: "He prayed three times a day and survived the lions' den.",
    clue: "He prayed three times a day and survived the lions.",
    passage: "Daniel 6",
    acceptedAnswers: ["daniel"],
    difficulty: "easy",
  },
  {
    name: "Joseph",
    emojis: ["🎨", "⛓️", "🌾", "👑"],
    hint: "His brothers sold him into slavery — then he ruled Egypt.",
    clue: "Coat of many colours. Pit. Prison. Palace.",
    passage: "Genesis 37–41",
    acceptedAnswers: ["joseph"],
    difficulty: "easy",
  },
  {
    name: "Samson",
    emojis: ["💪", "✂️", "🦁", "🏛️"],
    hint: "His incredible strength was hidden in his hair.",
    clue: "His strength was in his hair — until she cut it.",
    passage: "Judges 13–16",
    acceptedAnswers: ["samson"],
    difficulty: "easy",
  },

  // -- MEDIUM ----------------------------------------------------------------
  {
    name: "Esther",
    emojis: ["👑", "🏰", "🍷", "🎭"],
    hint: "A queen who risked her life to save her people.",
    clue: "She was queen for such a time as this.",
    passage: "Esther 4:14",
    acceptedAnswers: ["esther"],
    difficulty: "medium",
  },
  {
    name: "Elijah",
    emojis: ["🔥", "⚡", "🌧️", "🫙"],
    hint: "He called fire from heaven and prayed rain into existence.",
    clue: "He called fire from heaven and prayed for rain.",
    passage: "1 Kings 18",
    acceptedAnswers: ["elijah"],
    difficulty: "medium",
  },
  {
    name: "Ruth",
    emojis: ["🌾", "👰", "🤝", "❤️"],
    hint: "She left her homeland out of loyalty and found a new family.",
    clue: "Where you go, I will go. Loyal beyond blood.",
    passage: "Ruth 1:16",
    acceptedAnswers: ["ruth"],
    difficulty: "medium",
  },
  {
    name: "Abraham",
    emojis: ["⭐", "🏕️", "🔪", "🐑"],
    hint: "God called him to sacrifice his son — then provided a ram.",
    clue: "Father of nations. He was willing to give up everything.",
    passage: "Genesis 22",
    acceptedAnswers: ["abraham", "abram"],
    difficulty: "medium",
  },
  {
    name: "Solomon",
    emojis: ["👑", "🏛️", "💎", "⚖️"],
    hint: "God gave him more wisdom than anyone — and he still went astray.",
    clue: "The wisest man who ever lived — and the most foolish.",
    passage: "1 Kings 3",
    acceptedAnswers: ["solomon"],
    difficulty: "medium",
  },
  {
    name: "Peter",
    emojis: ["🐟", "🔑", "🌊", "🔥"],
    hint: "He walked on water, denied Jesus three times, then preached to thousands.",
    clue: "He walked on water, denied three times, then led thousands.",
    passage: "Matthew 14:29 / John 21",
    acceptedAnswers: ["peter", "simon peter"],
    difficulty: "medium",
  },
  {
    name: "Paul",
    emojis: ["⚡", "✉️", "⛓️", "🗺️"],
    hint: "He was blinded on a road to Damascus — and became the greatest missionary.",
    clue: "Blinded by light on a road. Became the greatest missionary.",
    passage: "Acts 9",
    acceptedAnswers: ["paul", "saul"],
    difficulty: "medium",
  },
  {
    name: "John the Baptist",
    emojis: ["🐝", "🍯", "🌊", "📢"],
    hint: "He lived in the wilderness, ate locusts and honey, and prepared the way.",
    clue: "He ate locusts and honey and prepared the way.",
    passage: "Matthew 3",
    acceptedAnswers: ["john the baptist", "john", "baptist"],
    difficulty: "medium",
  },
  {
    name: "Mary",
    emojis: ["👼", "⭐", "🕊️", "💙"],
    hint: "She said yes to God when it would cost her everything.",
    clue: "Blessed among women. She said yes when it cost everything.",
    passage: "Luke 1:38",
    acceptedAnswers: ["mary", "virgin mary", "mary mother of jesus"],
    difficulty: "medium",
  },

  // -- HARD ------------------------------------------------------------------
  {
    name: "Job",
    emojis: ["😭", "🤕", "⚡", "🙌"],
    hint: "",
    clue: "He lost everything — and still would not curse God.",
    passage: "Job 1–2",
    acceptedAnswers: ["job"],
    difficulty: "hard",
  },
  {
    name: "Gideon",
    emojis: ["🏺", "🔦", "⚔️", "🐑"],
    hint: "",
    clue: "300 men. Torches. Trumpets. The victory that made no sense.",
    passage: "Judges 7",
    acceptedAnswers: ["gideon"],
    difficulty: "hard",
  },
  {
    name: "Lazarus",
    emojis: ["⚰️", "😭", "😮", "🎊"],
    hint: "",
    clue: "Four days dead. Called out by name. He walked out.",
    passage: "John 11",
    acceptedAnswers: ["lazarus"],
    difficulty: "hard",
  },
  {
    name: "Rahab",
    emojis: ["🪟", "🔴", "🧵", "🏰"],
    hint: "",
    clue: "She hid the spies and hung a scarlet cord — and was saved.",
    passage: "Joshua 2",
    acceptedAnswers: ["rahab"],
    difficulty: "hard",
  },
];

/** Build a deck: easy → medium → hard, shuffled within each tier */
export function buildDeck(): BibleCharacter[] {
  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const easy   = shuffle(BIBLE_CHARACTERS.filter((c) => c.difficulty === "easy"));
  const medium = shuffle(BIBLE_CHARACTERS.filter((c) => c.difficulty === "medium"));
  const hard   = shuffle(BIBLE_CHARACTERS.filter((c) => c.difficulty === "hard"));

  return [...easy, ...medium, ...hard];
}

// Keep for any existing imports
export function shuffleCharacters(chars: BibleCharacter[]): BibleCharacter[] {
  return buildDeck();
}
