export type Difficulty = "easy" | "medium" | "hard";

export interface BibleQuote {
  quote: string;
  speaker: string;
  reference: string;
  difficulty: Difficulty;
}

// Pool used to generate wrong-answer options
export const SPEAKER_POOL = [
  "Jesus", "Moses", "David", "Paul", "Peter", "Isaiah", "Jeremiah",
  "Solomon", "Job", "Ruth", "Elijah", "Daniel", "Joseph", "Abraham",
  "Mary", "John the Baptist", "Samson", "Gideon", "Esther", "Deborah",
  "Cain", "Judas", "Pilate", "Nicodemus", "Thomas", "Stephen",
  "Nehemiah", "Ezekiel", "Hosea", "Jonah", "Noah", "Samuel", "Joshua",
  "Hannah", "Saul", "Jonathan", "Nathan", "Amos", "Habakkuk", "Malachi",
  "Barnabas", "Elijah", "Naomi", "Angel", "God", "Pharaoh", "Nebuchadnezzar",
  "Goliath", "Adam", "Eve", "Jacob", "Rebekah", "Ezra", "Caleb",
  "Job's wife", "Mary Magdalene", "Asaph", "Hezekiah", "Tax Collector",
  "Centurion", "Pharisee", "Zechariah",
];

export const BIBLE_QUOTES: BibleQuote[] = [

  // ── EASY ─────────────────────────────────────────────────────────────────
  {
    quote: "I am the way, the truth and the life. No one comes to the Father except through me.",
    speaker: "Jesus",
    reference: "John 14:6",
    difficulty: "easy",
  },
  {
    quote: "The LORD is my shepherd, I shall not want.",
    speaker: "David",
    reference: "Psalm 23:1",
    difficulty: "easy",
  },
  {
    quote: "It is finished.",
    speaker: "Jesus",
    reference: "John 19:30",
    difficulty: "easy",
  },
  {
    quote: "Where you go I will go, and where you stay I will stay. Your people will be my people and your God my God.",
    speaker: "Ruth",
    reference: "Ruth 1:16",
    difficulty: "easy",
  },
  {
    quote: "Am I my brother's keeper?",
    speaker: "Cain",
    reference: "Genesis 4:9",
    difficulty: "easy",
  },
  {
    quote: "Here I am. Send me!",
    speaker: "Isaiah",
    reference: "Isaiah 6:8",
    difficulty: "easy",
  },
  {
    quote: "You are the Messiah, the Son of the living God.",
    speaker: "Peter",
    reference: "Matthew 16:16",
    difficulty: "easy",
  },
  {
    quote: "My God, my God, why have you forsaken me?",
    speaker: "Jesus",
    reference: "Matthew 27:46",
    difficulty: "easy",
  },
  {
    quote: "The LORD gave and the LORD has taken away; may the name of the LORD be praised.",
    speaker: "Job",
    reference: "Job 1:21",
    difficulty: "easy",
  },
  {
    quote: "I can do all this through him who gives me strength.",
    speaker: "Paul",
    reference: "Philippians 4:13",
    difficulty: "easy",
  },
  {
    quote: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.",
    speaker: "Paul",
    reference: "1 Corinthians 13:4",
    difficulty: "easy",
  },
  {
    quote: "Blessed are the poor in spirit, for theirs is the kingdom of heaven.",
    speaker: "Jesus",
    reference: "Matthew 5:3",
    difficulty: "easy",
  },
  {
    quote: "For God so loved the world that he gave his one and only Son.",
    speaker: "Jesus",
    reference: "John 3:16",
    difficulty: "easy",
  },
  {
    quote: "What is truth?",
    speaker: "Pilate",
    reference: "John 18:38",
    difficulty: "easy",
  },
  {
    quote: "I AM WHO I AM.",
    speaker: "God",
    reference: "Exodus 3:14",
    difficulty: "easy",
  },
  {
    quote: "Let my people go.",
    speaker: "Moses",
    reference: "Exodus 5:1",
    difficulty: "easy",
  },
  {
    quote: "Silver or gold I do not have, but what I do have I give you. In the name of Jesus Christ of Nazareth, walk!",
    speaker: "Peter",
    reference: "Acts 3:6",
    difficulty: "easy",
  },
  {
    quote: "You intended to harm me, but God intended it for good.",
    speaker: "Joseph",
    reference: "Genesis 50:20",
    difficulty: "easy",
  },
  {
    quote: "I am the bread of life. Whoever comes to me will never go hungry.",
    speaker: "Jesus",
    reference: "John 6:35",
    difficulty: "easy",
  },
  {
    quote: "Speak, for your servant is listening.",
    speaker: "Samuel",
    reference: "1 Samuel 3:10",
    difficulty: "easy",
  },
  {
    quote: "Create in me a pure heart, O God, and renew a steadfast spirit within me.",
    speaker: "David",
    reference: "Psalm 51:10",
    difficulty: "easy",
  },
  {
    quote: "I know that my redeemer lives, and that in the end he will stand on the earth.",
    speaker: "Job",
    reference: "Job 19:25",
    difficulty: "easy",
  },
  {
    quote: "My soul glorifies the Lord and my spirit rejoices in God my Saviour.",
    speaker: "Mary",
    reference: "Luke 1:46–47",
    difficulty: "easy",
  },
  {
    quote: "I have been crucified with Christ and I no longer live, but Christ lives in me.",
    speaker: "Paul",
    reference: "Galatians 2:20",
    difficulty: "easy",
  },
  {
    quote: "Come, follow me, and I will send you out to fish for people.",
    speaker: "Jesus",
    reference: "Matthew 4:19",
    difficulty: "easy",
  },
  {
    quote: "The harvest is plentiful but the workers are few.",
    speaker: "Jesus",
    reference: "Matthew 9:37",
    difficulty: "easy",
  },
  {
    quote: "Blessed are you among women, and blessed is the child you will bear!",
    speaker: "Elizabeth",
    reference: "Luke 1:42",
    difficulty: "easy",
  },
  {
    quote: "Vanity of vanities! All is vanity.",
    speaker: "Solomon",
    reference: "Ecclesiastes 1:2",
    difficulty: "easy",
  },
  {
    quote: "Come to me, all you who are weary and burdened, and I will give you rest.",
    speaker: "Jesus",
    reference: "Matthew 11:28",
    difficulty: "easy",
  },
  {
    quote: "Do not be afraid. I bring you good news that will cause great joy for all the people.",
    speaker: "Angel",
    reference: "Luke 2:10",
    difficulty: "easy",
  },
  {
    quote: "But as for me and my household, we will serve the LORD.",
    speaker: "Joshua",
    reference: "Joshua 24:15",
    difficulty: "easy",
  },
  {
    quote: "Before I formed you in the womb I knew you, before you were born I set you apart.",
    speaker: "God",
    reference: "Jeremiah 1:5",
    difficulty: "easy",
  },
  {
    quote: "I am the resurrection and the life. The one who believes in me will live, even though they die.",
    speaker: "Jesus",
    reference: "John 11:25",
    difficulty: "easy",
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────
  {
    quote: "Though he slay me, yet will I hope in him.",
    speaker: "Job",
    reference: "Job 13:15",
    difficulty: "medium",
  },
  {
    quote: "The spirit is willing, but the flesh is weak.",
    speaker: "Jesus",
    reference: "Matthew 26:41",
    difficulty: "medium",
  },
  {
    quote: "Who is the LORD, that I should obey him and let Israel go?",
    speaker: "Pharaoh",
    reference: "Exodus 5:2",
    difficulty: "medium",
  },
  {
    quote: "Woe to me! I am ruined! For I am a man of unclean lips.",
    speaker: "Isaiah",
    reference: "Isaiah 6:5",
    difficulty: "medium",
  },
  {
    quote: "Is not this the great Babylon I have built as the royal residence, by my mighty power and for the glory of my majesty?",
    speaker: "Nebuchadnezzar",
    reference: "Daniel 4:30",
    difficulty: "medium",
  },
  {
    quote: "How long, LORD? Will you forget me forever?",
    speaker: "David",
    reference: "Psalm 13:1",
    difficulty: "medium",
  },
  {
    quote: "Behold, the Lamb of God, who takes away the sin of the world!",
    speaker: "John the Baptist",
    reference: "John 1:29",
    difficulty: "medium",
  },
  {
    quote: "My Lord and my God!",
    speaker: "Thomas",
    reference: "John 20:28",
    difficulty: "medium",
  },
  {
    quote: "Even if all fall away on account of you, I never will.",
    speaker: "Peter",
    reference: "Matthew 26:33",
    difficulty: "medium",
  },
  {
    quote: "How can someone be born when they are old? Can they enter a second time into their mother's womb and be born?",
    speaker: "Nicodemus",
    reference: "John 3:4",
    difficulty: "medium",
  },
  {
    quote: "Is there no balm in Gilead? Is there no physician there?",
    speaker: "Jeremiah",
    reference: "Jeremiah 8:22",
    difficulty: "medium",
  },
  {
    quote: "They will soar on wings like eagles; they will run and not grow weary.",
    speaker: "Isaiah",
    reference: "Isaiah 40:31",
    difficulty: "medium",
  },
  {
    quote: "I am the vine; you are the branches.",
    speaker: "Jesus",
    reference: "John 15:5",
    difficulty: "medium",
  },
  {
    quote: "Truly I tell you, today you will be with me in paradise.",
    speaker: "Jesus",
    reference: "Luke 23:43",
    difficulty: "medium",
  },
  {
    quote: "I have sinned against the LORD.",
    speaker: "David",
    reference: "2 Samuel 12:13",
    difficulty: "medium",
  },
  {
    quote: "Do not think that I have come to abolish the Law or the Prophets; I have not come to abolish them but to fulfil them.",
    speaker: "Jesus",
    reference: "Matthew 5:17",
    difficulty: "medium",
  },
  {
    quote: "I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes.",
    speaker: "Paul",
    reference: "Romans 1:16",
    difficulty: "medium",
  },
  {
    quote: "Am I a dog, that you come at me with sticks?",
    speaker: "Goliath",
    reference: "1 Samuel 17:43",
    difficulty: "medium",
  },
  {
    quote: "I have fought the good fight, I have finished the race, I have kept the faith.",
    speaker: "Paul",
    reference: "2 Timothy 4:7",
    difficulty: "medium",
  },
  {
    quote: "Where were you when I laid the earth's foundation?",
    speaker: "God",
    reference: "Job 38:4",
    difficulty: "medium",
  },
  {
    quote: "Can a mother forget the baby at her breast? Though she may forget, I will not forget you!",
    speaker: "God",
    reference: "Isaiah 49:15",
    difficulty: "medium",
  },
  {
    quote: "Call to me and I will answer you and tell you great and unsearchable things you do not know.",
    speaker: "God",
    reference: "Jeremiah 33:3",
    difficulty: "medium",
  },
  {
    quote: "I will not let you go unless you bless me.",
    speaker: "Jacob",
    reference: "Genesis 32:26",
    difficulty: "medium",
  },
  {
    quote: "Cast all your anxiety on him because he cares for you.",
    speaker: "Peter",
    reference: "1 Peter 5:7",
    difficulty: "medium",
  },
  {
    quote: "A good name is more desirable than great riches; to be esteemed is better than silver or gold.",
    speaker: "Solomon",
    reference: "Proverbs 22:1",
    difficulty: "medium",
  },
  {
    quote: "My grace is sufficient for you, for my power is made perfect in weakness.",
    speaker: "God",
    reference: "2 Corinthians 12:9",
    difficulty: "medium",
  },
  {
    quote: "Surely the LORD is in this place, and I was not aware of it.",
    speaker: "Jacob",
    reference: "Genesis 28:16",
    difficulty: "medium",
  },
  {
    quote: "Lord, I am not worthy to have you come under my roof.",
    speaker: "Centurion",
    reference: "Matthew 8:8",
    difficulty: "medium",
  },
  {
    quote: "Here I am! I stand at the door and knock.",
    speaker: "Jesus",
    reference: "Revelation 3:20",
    difficulty: "medium",
  },
  {
    quote: "What does it profit a man to gain the whole world, yet forfeit his soul?",
    speaker: "Jesus",
    reference: "Mark 8:36",
    difficulty: "medium",
  },
  {
    quote: "No one can serve two masters.",
    speaker: "Jesus",
    reference: "Matthew 6:24",
    difficulty: "medium",
  },
  {
    quote: "Not by might nor by power, but by my Spirit, says the LORD Almighty.",
    speaker: "God",
    reference: "Zechariah 4:6",
    difficulty: "medium",
  },
  {
    quote: "Let justice roll on like a river, righteousness like a never-failing stream!",
    speaker: "God",
    reference: "Amos 5:24",
    difficulty: "medium",
  },
  {
    quote: "How long will you waver between two opinions? If the LORD is God, follow him; but if Baal is God, follow him.",
    speaker: "Elijah",
    reference: "1 Kings 18:21",
    difficulty: "medium",
  },
  {
    quote: "Neither do I condemn you. Go now and leave your life of sin.",
    speaker: "Jesus",
    reference: "John 8:11",
    difficulty: "medium",
  },
  {
    quote: "Train up a child in the way he should go; even when he is old he will not depart from it.",
    speaker: "Solomon",
    reference: "Proverbs 22:6",
    difficulty: "medium",
  },
  {
    quote: "Though I have the gift of prophecy and can fathom all mysteries… but do not have love, I am nothing.",
    speaker: "Paul",
    reference: "1 Corinthians 13:2",
    difficulty: "medium",
  },
  {
    quote: "I thank you that I am not like other people — robbers, evildoers, adulterers.",
    speaker: "Pharisee",
    reference: "Luke 18:11",
    difficulty: "medium",
  },
  {
    quote: "God, have mercy on me, a sinner.",
    speaker: "Tax Collector",
    reference: "Luke 18:13",
    difficulty: "medium",
  },
  {
    quote: "Return to me, and I will return to you.",
    speaker: "God",
    reference: "Malachi 3:7",
    difficulty: "medium",
  },

  // ── HARD ──────────────────────────────────────────────────────────────────
  {
    quote: "I have made a covenant with my eyes not to look lustfully at a young woman.",
    speaker: "Job",
    reference: "Job 31:1",
    difficulty: "hard",
  },
  {
    quote: "Let me die with the Philistines!",
    speaker: "Samson",
    reference: "Judges 16:30",
    difficulty: "hard",
  },
  {
    quote: "I have drunk neither wine nor strong drink, but have been pouring out my soul before the LORD.",
    speaker: "Hannah",
    reference: "1 Samuel 1:15",
    difficulty: "hard",
  },
  {
    quote: "Far be it from me that I should sin against the LORD by failing to pray for you.",
    speaker: "Samuel",
    reference: "1 Samuel 12:23",
    difficulty: "hard",
  },
  {
    quote: "Is it nothing to you, all you who pass by? Look around and see. Is any suffering like my suffering?",
    speaker: "Jeremiah",
    reference: "Lamentations 1:12",
    difficulty: "hard",
  },
  {
    quote: "How beautiful you are, my darling! Oh, how beautiful!",
    speaker: "Solomon",
    reference: "Song of Songs 1:15",
    difficulty: "hard",
  },
  {
    quote: "Whom have I in heaven but you? And earth has nothing I desire besides you.",
    speaker: "Asaph",
    reference: "Psalm 73:25",
    difficulty: "hard",
  },
  {
    quote: "I have been very zealous for the LORD God Almighty. The Israelites have rejected your covenant.",
    speaker: "Elijah",
    reference: "1 Kings 19:10",
    difficulty: "hard",
  },
  {
    quote: "Prepare to meet your God, O Israel.",
    speaker: "God",
    reference: "Amos 4:12",
    difficulty: "hard",
  },
  {
    quote: "I will put enmity between you and the woman, and between your offspring and hers.",
    speaker: "God",
    reference: "Genesis 3:15",
    difficulty: "hard",
  },
  {
    quote: "The heart is deceitful above all things and beyond cure. Who can understand it?",
    speaker: "Jeremiah",
    reference: "Jeremiah 17:9",
    difficulty: "hard",
  },
  {
    quote: "We have sinned and done wrong. We have been wicked and have rebelled; we have turned away from your commands.",
    speaker: "Daniel",
    reference: "Daniel 9:5",
    difficulty: "hard",
  },
  {
    quote: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.",
    speaker: "Paul",
    reference: "Ephesians 2:10",
    difficulty: "hard",
  },
  {
    quote: "I will climb up to my watchtower and stand at my guard post. There I will wait to see what the LORD says.",
    speaker: "Habakkuk",
    reference: "Habakkuk 2:1",
    difficulty: "hard",
  },
  {
    quote: "Do not take revenge, my dear friends, but leave room for God's wrath.",
    speaker: "Paul",
    reference: "Romans 12:19",
    difficulty: "hard",
  },
  {
    quote: "Who told you that you were naked?",
    speaker: "God",
    reference: "Genesis 3:11",
    difficulty: "hard",
  },
  {
    quote: "Do you still maintain your integrity? Curse God and die!",
    speaker: "Job's wife",
    reference: "Job 2:9",
    difficulty: "hard",
  },
  {
    quote: "I will make you into a great nation, and I will bless you; I will make your name great.",
    speaker: "God",
    reference: "Genesis 12:2",
    difficulty: "hard",
  },
  {
    quote: "I sink in the miry depths, where there is no foothold.",
    speaker: "David",
    reference: "Psalm 69:2",
    difficulty: "hard",
  },
  {
    quote: "Though I walk through the valley of the shadow of death, I will fear no evil, for you are with me.",
    speaker: "David",
    reference: "Psalm 23:4",
    difficulty: "hard",
  },
  {
    quote: "You have been weighed on the scales and found wanting.",
    speaker: "Daniel",
    reference: "Daniel 5:27",
    difficulty: "hard",
  },
  {
    quote: "I will never leave you nor forsake you.",
    speaker: "God",
    reference: "Joshua 1:5",
    difficulty: "hard",
  },
  {
    quote: "It is not good for the man to be alone. I will make a helper suitable for him.",
    speaker: "God",
    reference: "Genesis 2:18",
    difficulty: "hard",
  },
  {
    quote: "You did not choose me, but I chose you and appointed you so that you might go and bear fruit.",
    speaker: "Jesus",
    reference: "John 15:16",
    difficulty: "hard",
  },
  {
    quote: "I have been very jealous for the LORD, the God of hosts. For the people of Israel have forsaken your covenant.",
    speaker: "Elijah",
    reference: "1 Kings 19:14",
    difficulty: "hard",
  },
  {
    quote: "You are the salt of the earth. But if the salt loses its saltiness, how can it be made salty again?",
    speaker: "Jesus",
    reference: "Matthew 5:13",
    difficulty: "hard",
  },
  {
    quote: "This is what the LORD says: Stand at the crossroads and look; ask for the ancient paths.",
    speaker: "God",
    reference: "Jeremiah 6:16",
    difficulty: "hard",
  },
  {
    quote: "The LORD does not look at the things people look at. People look at the outward appearance, but the LORD looks at the heart.",
    speaker: "God",
    reference: "1 Samuel 16:7",
    difficulty: "hard",
  },
  {
    quote: "I knew you before I formed you in your mother's womb. Before you were born I set you apart.",
    speaker: "God",
    reference: "Jeremiah 1:5",
    difficulty: "hard",
  },
  {
    quote: "Here I am — it is I who have sinned and done wrong. These are but sheep. What have they done?",
    speaker: "David",
    reference: "2 Samuel 24:17",
    difficulty: "hard",
  },
];

/** Build a deck: easy → medium → hard, shuffled within each tier */
export function buildQuoteDeck(): BibleQuote[] {
  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const easy   = shuffle(BIBLE_QUOTES.filter((q) => q.difficulty === "easy"));
  const medium = shuffle(BIBLE_QUOTES.filter((q) => q.difficulty === "medium"));
  const hard   = shuffle(BIBLE_QUOTES.filter((q) => q.difficulty === "hard"));
  return [...easy, ...medium, ...hard];
}

/** Pick 3 plausible wrong answers for a given speaker */
export function getWrongAnswers(correctSpeaker: string): string[] {
  const pool = SPEAKER_POOL.filter((s) => s !== correctSpeaker);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}
