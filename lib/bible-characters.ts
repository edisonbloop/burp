export interface BibleCharacter {
  name: string;
  emojis: string[];
  clue: string;
  passage: string;
  acceptedAnswers: string[]; // lowercase variants that count as correct
}

export const BIBLE_CHARACTERS: BibleCharacter[] = [
  {
    name: "Noah",
    emojis: ["🌊", "🚢", "🕊️", "🌈"],
    clue: "He built a vessel that saved creation.",
    passage: "Genesis 6–9",
    acceptedAnswers: ["noah"],
  },
  {
    name: "Moses",
    emojis: ["🔥", "🌿", "⛰️", "📜"],
    clue: "Burning bush. Parted sea. Ten commandments.",
    passage: "Exodus 3–20",
    acceptedAnswers: ["moses"],
  },
  {
    name: "David",
    emojis: ["🎵", "🪨", "🦁", "👑"],
    clue: "A shepherd boy became Israel's greatest king.",
    passage: "1 Samuel 17",
    acceptedAnswers: ["david"],
  },
  {
    name: "Jonah",
    emojis: ["🐳", "🌊", "😩", "🙏"],
    clue: "He ran from God and ended up inside a fish.",
    passage: "Jonah 1–2",
    acceptedAnswers: ["jonah"],
  },
  {
    name: "Samson",
    emojis: ["💪", "✂️", "🦁", "🏛️"],
    clue: "His strength was in his hair — until she cut it.",
    passage: "Judges 13–16",
    acceptedAnswers: ["samson"],
  },
  {
    name: "Daniel",
    emojis: ["🦁", "🙏", "👑", "🌙"],
    clue: "He prayed three times a day and survived the lions.",
    passage: "Daniel 6",
    acceptedAnswers: ["daniel"],
  },
  {
    name: "Joseph",
    emojis: ["🎨", "⛓️", "🌾", "👑"],
    clue: "Coat of many colours. Pit. Prison. Palace.",
    passage: "Genesis 37–41",
    acceptedAnswers: ["joseph"],
  },
  {
    name: "Esther",
    emojis: ["👑", "🏰", "🍷", "🎭"],
    clue: "She was queen for such a time as this.",
    passage: "Esther 4:14",
    acceptedAnswers: ["esther"],
  },
  {
    name: "Elijah",
    emojis: ["🔥", "⚡", "🌧️", "🫙"],
    clue: "He called fire from heaven and prayed for rain.",
    passage: "1 Kings 18",
    acceptedAnswers: ["elijah"],
  },
  {
    name: "Ruth",
    emojis: ["🌾", "👰", "🤝", "❤️"],
    clue: "Where you go, I will go. Loyal beyond blood.",
    passage: "Ruth 1:16",
    acceptedAnswers: ["ruth"],
  },
  {
    name: "Abraham",
    emojis: ["⭐", "🏕️", "🔪", "🐑"],
    clue: "Father of nations. He was willing to give up everything.",
    passage: "Genesis 22",
    acceptedAnswers: ["abraham", "abram"],
  },
  {
    name: "Solomon",
    emojis: ["👑", "🏛️", "💎", "⚖️"],
    clue: "The wisest man who ever lived — and the most foolish.",
    passage: "1 Kings 3",
    acceptedAnswers: ["solomon"],
  },
  {
    name: "John the Baptist",
    emojis: ["🐝", "🍯", "🌊", "📢"],
    clue: "He ate locusts and honey and prepared the way.",
    passage: "Matthew 3",
    acceptedAnswers: ["john the baptist", "john", "baptist"],
  },
  {
    name: "Peter",
    emojis: ["🐟", "🔑", "🌊", "🔥"],
    clue: "He walked on water, denied three times, then led thousands.",
    passage: "Matthew 14:29 / John 21",
    acceptedAnswers: ["peter", "simon peter"],
  },
  {
    name: "Paul",
    emojis: ["⚡", "✉️", "⛓️", "🗺️"],
    clue: "Blinded by light on a road. Became the greatest missionary.",
    passage: "Acts 9",
    acceptedAnswers: ["paul", "saul"],
  },
  {
    name: "Mary",
    emojis: ["👼", "⭐", "🕊️", "💙"],
    clue: "Blessed among women. She said yes when it cost everything.",
    passage: "Luke 1:38",
    acceptedAnswers: ["mary", "virgin mary", "mary mother of jesus"],
  },
  {
    name: "Job",
    emojis: ["😭", "🤕", "⚡", "🙌"],
    clue: "He lost everything — and still would not curse God.",
    passage: "Job 1–2",
    acceptedAnswers: ["job"],
  },
  {
    name: "Gideon",
    emojis: ["🏺", "🔦", "⚔️", "🐑"],
    clue: "300 men. Torches. Trumpets. The victory that made no sense.",
    passage: "Judges 7",
    acceptedAnswers: ["gideon"],
  },
  {
    name: "Lazarus",
    emojis: ["⚰️", "😭", "😮", "🎊"],
    clue: "Four days dead. Called out by name. He walked out.",
    passage: "John 11",
    acceptedAnswers: ["lazarus"],
  },
  {
    name: "Rahab",
    emojis: ["🪟", "🔴", "🧵", "🏰"],
    clue: "She hid the spies and hung a scarlet cord — and was saved.",
    passage: "Joshua 2",
    acceptedAnswers: ["rahab"],
  },
];

/** Shuffle array (Fisher-Yates) — safe for client-side seeding */
export function shuffleCharacters(chars: BibleCharacter[]): BibleCharacter[] {
  const arr = [...chars];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
