export interface TrueFalseStatement {
  statement: string;
  answer: boolean;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export const TRUE_FALSE_STATEMENTS: TrueFalseStatement[] = [

  // -- EASY -----------------------------------------------------------------
  { statement: "Jesus was born in Bethlehem.", answer: true, explanation: "Luke 2:4–7 — Joseph and Mary travelled from Nazareth to Bethlehem, where Jesus was born.", difficulty: "easy" },
  { statement: "Moses parted the Red Sea.", answer: true, explanation: "Exodus 14:21 — Moses stretched out his hand and the LORD drove the sea back.", difficulty: "easy" },
  { statement: "David killed Goliath with a sword.", answer: false, explanation: "1 Samuel 17:49–50 — David used a sling and a stone. He took Goliath's sword only after he fell.", difficulty: "easy" },
  { statement: "The Bible has 66 books.", answer: true, explanation: "39 books in the Old Testament and 27 in the New Testament.", difficulty: "easy" },
  { statement: "Jonah spent three days inside a big fish.", answer: true, explanation: "Jonah 1:17 — 'Now the LORD provided a huge fish to swallow Jonah, and Jonah was in the belly of the fish three days and three nights.'", difficulty: "easy" },
  { statement: "Peter walked on water.", answer: true, explanation: "Matthew 14:29 — Peter stepped out of the boat and walked on the water towards Jesus.", difficulty: "easy" },
  { statement: "The first book of the Bible is Genesis.", answer: true, explanation: "Genesis means 'beginning' — it opens with the creation of the heavens and the earth.", difficulty: "easy" },
  { statement: "The last book of the Bible is Revelation.", answer: true, explanation: "Also called the Apocalypse of John, it closes the canon of Scripture.", difficulty: "easy" },
  { statement: "Jesus had exactly 12 disciples.", answer: true, explanation: "Matthew 10:1–4 — Jesus called twelve disciples, also referred to as the twelve apostles.", difficulty: "easy" },
  { statement: "Noah had three sons.", answer: true, explanation: "Genesis 6:10 — Shem, Ham, and Japheth were Noah's three sons.", difficulty: "easy" },
  { statement: "Goliath's height was over 9 feet tall.", answer: true, explanation: "1 Samuel 17:4 — 'His height was six cubits and a span,' which is approximately 9 feet 9 inches.", difficulty: "easy" },
  { statement: "Hezekiah is a book of the Bible.", answer: false, explanation: "Hezekiah was a king of Judah — but there is no book of the Bible named after him.", difficulty: "easy" },
  { statement: "Adam and Eve ate an apple in the Garden of Eden.", answer: false, explanation: "Genesis 3:6 — The Bible says they ate 'fruit' from the tree. The word apple never appears. That tradition came later.", difficulty: "easy" },
  { statement: "Joseph had 11 brothers.", answer: true, explanation: "Jacob had 12 sons. Joseph was one of them, so he had 11 brothers.", difficulty: "easy" },
  { statement: "Mary and Joseph fled to Egypt with baby Jesus.", answer: true, explanation: "Matthew 2:13–14 — An angel warned Joseph in a dream, and the family fled to Egypt to escape Herod.", difficulty: "easy" },
  { statement: "Jesus fasted for 40 days and 40 nights.", answer: true, explanation: "Matthew 4:2 — Jesus was led by the Spirit into the wilderness and fasted for forty days and forty nights.", difficulty: "easy" },
  { statement: "Judas betrayed Jesus for 30 pieces of silver.", answer: true, explanation: "Matthew 26:15 — The chief priests offered Judas thirty pieces of silver to hand Jesus over.", difficulty: "easy" },
  { statement: "The Holy Spirit appeared as a dove at Jesus's baptism.", answer: true, explanation: "Matthew 3:16 — 'He saw the Spirit of God descending like a dove and alighting on him.'", difficulty: "easy" },
  { statement: "Jesus's first miracle was feeding the 5,000.", answer: false, explanation: "John 2:1–11 — His first miracle was turning water into wine at the wedding in Cana of Galilee.", difficulty: "easy" },
  { statement: "The Ten Commandments were given on Mount Sinai.", answer: true, explanation: "Exodus 19–20 — God called Moses up to Mount Sinai and gave him the commandments.", difficulty: "easy" },
  { statement: "Samson's strength was in his beard.", answer: false, explanation: "Judges 16:17 — Samson's strength was tied to his uncut hair as part of his Nazirite vow — not his beard.", difficulty: "easy" },
  { statement: "Elijah was taken to heaven in a chariot of fire.", answer: true, explanation: "2 Kings 2:11 — 'A chariot of fire and horses of fire appeared and separated the two of them, and Elijah went up to heaven in a whirlwind.'", difficulty: "easy" },
  { statement: "Ruth was from the land of Moab.", answer: true, explanation: "Ruth 1:4 — Naomi's sons married Moabite women. Ruth was from Moab.", difficulty: "easy" },
  { statement: "The shortest verse in the Bible is 'Jesus wept'.", answer: true, explanation: "John 11:35 — Two words in English, three in Greek. The shortest verse in the Bible.", difficulty: "easy" },
  { statement: "Solomon had 700 wives.", answer: true, explanation: "1 Kings 11:3 — 'He had seven hundred wives of royal birth and three hundred concubines.'", difficulty: "easy" },
  { statement: "Jesus fed 5,000 people with 5 loaves of bread and 2 fish.", answer: true, explanation: "Matthew 14:17–21 — A boy's lunch of five loaves and two fish fed the crowd, with twelve baskets left over.", difficulty: "easy" },
  { statement: "Daniel was thrown into the lions' den.", answer: true, explanation: "Daniel 6 — Daniel was thrown in because he refused to stop praying to God. He was found unharmed.", difficulty: "easy" },
  { statement: "The book of Psalms has 150 chapters.", answer: true, explanation: "Psalms is the longest book in the Bible with 150 individual psalms.", difficulty: "easy" },
  { statement: "Lazarus was raised from the dead after being in the tomb for 4 days.", answer: true, explanation: "John 11:39 — Martha said 'by this time there is a bad odour, for he has been there four days.'", difficulty: "easy" },
  { statement: "Jesus turned water into wine at a wedding.", answer: true, explanation: "John 2:1–11 — The wedding at Cana, where Jesus turned six stone jars of water into wine.", difficulty: "easy" },
  { statement: "Paul's name before his conversion was Saul.", answer: true, explanation: "Acts 9 — He was known as Saul of Tarsus before his encounter with the risen Jesus on the Damascus road.", difficulty: "easy" },

  // -- MEDIUM ----------------------------------------------------------------
  { statement: "The book of Esther never mentions God.", answer: true, explanation: "The book of Esther is one of only two books in the Bible (along with Song of Songs) that never explicitly mentions God.", difficulty: "medium" },
  { statement: "Methuselah is the oldest person recorded in the Bible, living 969 years.", answer: true, explanation: "Genesis 5:27 — 'Altogether, Methuselah lived a total of 969 years, and then he died.'", difficulty: "medium" },
  { statement: "The disciples were first called Christians in Jerusalem.", answer: false, explanation: "Acts 11:26 — 'The disciples were called Christians first at Antioch,' not Jerusalem.", difficulty: "medium" },
  { statement: "The New Testament was originally written in Greek.", answer: true, explanation: "The entire New Testament was written in Koine Greek, the common language of the Roman world.", difficulty: "medium" },
  { statement: "Abraham was 100 years old when Isaac was born.", answer: true, explanation: "Genesis 21:5 — 'Abraham was a hundred years old when his son Isaac was born to him.'", difficulty: "medium" },
  { statement: "Esther's Hebrew name was Hadassah.", answer: true, explanation: "Esther 2:7 — 'Mordecai had a cousin named Hadassah, whom he had brought up because she had neither father nor mother. This young woman, who was also known as Esther…'", difficulty: "medium" },
  { statement: "The book of Jude has only one chapter.", answer: true, explanation: "Jude is one of the shortest books in the New Testament — just 25 verses in a single chapter.", difficulty: "medium" },
  { statement: "Jesus healed 10 lepers but only one came back to thank him.", answer: true, explanation: "Luke 17:11–19 — Ten were healed; only one, a Samaritan, returned to give thanks.", difficulty: "medium" },
  { statement: "Paul was shipwrecked three times.", answer: true, explanation: "2 Corinthians 11:25 — 'Three times I was shipwrecked, I spent a night and a day in the open sea.'", difficulty: "medium" },
  { statement: "The Bible contains the word 'Trinity'.", answer: false, explanation: "The word 'Trinity' never appears in Scripture. The doctrine is derived from passages about the Father, Son, and Holy Spirit, but the term itself is theological, not biblical.", difficulty: "medium" },
  { statement: "Jesus was tempted by Satan three times in the wilderness.", answer: true, explanation: "Matthew 4:1–11 — Satan tested Jesus three times: turning stones to bread, jumping from the temple, and bowing for all kingdoms.", difficulty: "medium" },
  { statement: "The book of Acts was written by Luke.", answer: true, explanation: "Acts is the second volume of Luke's work (Luke-Acts). It continues the story from where the Gospel of Luke ends.", difficulty: "medium" },
  { statement: "Naomi was Ruth's mother-in-law.", answer: true, explanation: "Ruth 1:14 — Ruth clung to Naomi her mother-in-law even after Naomi urged her to return to her own people.", difficulty: "medium" },
  { statement: "Isaiah predicted that Jesus would be born of a virgin.", answer: true, explanation: "Isaiah 7:14 — 'Therefore the Lord himself will give you a sign: The virgin will conceive and give birth to a son.'", difficulty: "medium" },
  { statement: "The book of Revelation was written by the apostle Paul.", answer: false, explanation: "Revelation 1:9 — Written by John, who identifies himself as being on the island of Patmos.", difficulty: "medium" },
  { statement: "Solomon built the first temple in Jerusalem.", answer: true, explanation: "1 Kings 6 — Solomon built the temple over seven years. His father David had wanted to but was told he was a man of war.", difficulty: "medium" },
  { statement: "Mary Magdalene was the first person to see the risen Jesus.", answer: true, explanation: "John 20:14–16 — Jesus appeared to Mary Magdalene first, before any of the disciples.", difficulty: "medium" },
  { statement: "Mark is the shortest of the four Gospels.", answer: true, explanation: "Mark has 16 chapters. Matthew has 28, Luke 24, and John 21.", difficulty: "medium" },
  { statement: "Elijah killed 450 prophets of Baal on Mount Carmel.", answer: true, explanation: "1 Kings 18:40 — After fire fell from heaven, Elijah had the 450 prophets of Baal seized and killed at the Kishon Valley.", difficulty: "medium" },
  { statement: "Zacchaeus was a shepherd.", answer: false, explanation: "Luke 19:2 — Zacchaeus was a chief tax collector and was wealthy.", difficulty: "medium" },
  { statement: "Stephen was the first Christian martyr.", answer: true, explanation: "Acts 7:54–60 — Stephen was stoned to death after his speech to the Sanhedrin, making him the first recorded Christian martyr.", difficulty: "medium" },
  { statement: "The Holy Spirit descended at Pentecost as tongues of fire.", answer: true, explanation: "Acts 2:3 — 'They saw what seemed to be tongues of fire that separated and came to rest on each of them.'", difficulty: "medium" },
  { statement: "Gideon defeated the Midianites with 300 soldiers.", answer: true, explanation: "Judges 7 — God whittled Gideon's army down to 300 men so Israel couldn't boast about the victory.", difficulty: "medium" },
  { statement: "Jesus appeared to more than 500 people after his resurrection.", answer: true, explanation: "1 Corinthians 15:6 — Paul writes that Jesus 'appeared to more than five hundred of the brothers and sisters at the same time.'", difficulty: "medium" },
  { statement: "Peter denied Jesus three times before the rooster crowed.", answer: true, explanation: "Mark 14:66–72 — Exactly as Jesus predicted, Peter denied knowing him three times before the rooster crowed.", difficulty: "medium" },
  { statement: "Noah's ark came to rest on Mount Everest.", answer: false, explanation: "Genesis 8:4 — 'The ark came to rest on the mountains of Ararat.' Mount Everest is in the Himalayas, not Ararat.", difficulty: "medium" },
  { statement: "The Sermon on the Mount is found in the book of Matthew.", answer: true, explanation: "Matthew 5–7 — Jesus delivered the Sermon on the Mount including the Beatitudes, the Lord's Prayer, and much more.", difficulty: "medium" },
  { statement: "Jesus was about 30 years old when he began his ministry.", answer: true, explanation: "Luke 3:23 — 'Now Jesus himself was about thirty years old when he began his ministry.'", difficulty: "medium" },
  { statement: "The city of Jericho's walls fell after the Israelites marched around it for 7 days.", answer: true, explanation: "Joshua 6 — They marched around once daily for six days, then seven times on the seventh day, and the walls collapsed.", difficulty: "medium" },
  { statement: "Ananias and Sapphira were struck dead for lying to the Holy Spirit.", answer: true, explanation: "Acts 5:1–11 — Both husband and wife separately lied about the price they received for land, and both fell down dead.", difficulty: "medium" },

  // -- HARD ------------------------------------------------------------------
  { statement: "The word 'Easter' appears in the King James Bible.", answer: true, explanation: "Acts 12:4 (KJV) — 'Intending after Easter to bring him forth to the people.' Modern translations use 'Passover', which is more accurate.", difficulty: "hard" },
  { statement: "The Bible tells us exactly how many wise men visited Jesus.", answer: false, explanation: "Matthew 2 mentions 'Magi from the East' and three gifts (gold, frankincense, myrrh) — but never states how many men came.", difficulty: "hard" },
  { statement: "The Bible mentions unicorns.", answer: true, explanation: "The King James Bible uses 'unicorn' nine times to translate the Hebrew 're'em' — now believed to be a wild ox or aurochs.", difficulty: "hard" },
  { statement: "The prophet Hosea married a woman described as a prostitute, at God's command.", answer: true, explanation: "Hosea 1:2 — God told Hosea to take 'an adulterous wife' as a living illustration of Israel's unfaithfulness.", difficulty: "hard" },
  { statement: "Esau sold his birthright for a bowl of red lentil stew.", answer: true, explanation: "Genesis 25:29–34 — 'Esau despised his birthright' and sold it to Jacob for bread and lentil stew.", difficulty: "hard" },
  { statement: "Noah sent out a raven before he sent out a dove.", answer: true, explanation: "Genesis 8:7 — 'Then he sent out a raven, and it kept flying back and forth.' He later sent a dove.", difficulty: "hard" },
  { statement: "The Bible records Jesus laughing.", answer: false, explanation: "The Gospels record Jesus weeping (John 11:35) and being moved with compassion — but laughing is never recorded. He speaks of joy, but no laugh is written.", difficulty: "hard" },
  { statement: "Judas Iscariot hanged himself after betraying Jesus.", answer: true, explanation: "Matthew 27:5 — 'So Judas threw the money into the temple and left. Then he went away and hanged himself.'", difficulty: "hard" },
  { statement: "The Bible says God spoke to Moses through a burning bush that was not consumed.", answer: true, explanation: "Exodus 3:2 — 'There the angel of the LORD appeared to him in flames of fire from within a bush. Moses saw that though the bush was on fire it did not burn up.'", difficulty: "hard" },
  { statement: "King Saul was from the tribe of Benjamin.", answer: true, explanation: "1 Samuel 9:1–2 — 'There was a Benjaminite, a man of standing, whose name was Kish son of Abiel… He had a son named Saul.'", difficulty: "hard" },
  { statement: "Jesus was born on December 25.", answer: false, explanation: "The Bible never states the date of Jesus's birth. December 25 is a tradition established later by the church.", difficulty: "hard" },
  { statement: "Moses saw God's face.", answer: false, explanation: "Exodus 33:20 — God said 'you cannot see my face, for no one may see me and live.' Moses saw God's back (v.23).", difficulty: "hard" },
  { statement: "The name 'Lucifer' appears in the Bible.", answer: true, explanation: "Isaiah 14:12 (KJV) — 'How art thou fallen from heaven, O Lucifer, son of the morning.' Modern translations use 'morning star' or 'day star.'", difficulty: "hard" },
  { statement: "Deborah was the only female judge of Israel recorded in the Bible.", answer: true, explanation: "Judges 4–5 — Deborah is the only woman named as a judge (shophet) of Israel in the book of Judges.", difficulty: "hard" },
  { statement: "The word 'dinosaur' appears in the Bible.", answer: false, explanation: "The word 'dinosaur' was coined by Richard Owen in 1842 — centuries after the Bible was written. Some suggest 'Behemoth' in Job 40 could describe a large creature.", difficulty: "hard" },
  { statement: "The Prodigal Son had two brothers.", answer: false, explanation: "Luke 15:11 — The parable mentions a man and his two sons. The prodigal had one brother, not two.", difficulty: "hard" },
  { statement: "The apostle Thomas is also called Didymus, meaning 'twin'.", answer: true, explanation: "John 11:16 — 'Thomas (also known as Didymus) said to the rest of the disciples…' Didymus is Greek for twin.", difficulty: "hard" },
  { statement: "God spoke through a donkey in the Bible.", answer: true, explanation: "Numbers 22:28 — 'Then the LORD opened the donkey's mouth, and it said to Balaam, 'What have I done to you to make you beat me these three times?''", difficulty: "hard" },
  { statement: "The book of Job is in the Old Testament.", answer: true, explanation: "Job is one of the wisdom books, found between Esther and Psalms in the Old Testament.", difficulty: "hard" },
  { statement: "Absalom was King David's son.", answer: true, explanation: "2 Samuel 3:3 — Absalom was one of David's sons who later led a rebellion against his own father.", difficulty: "hard" },
  { statement: "Cain's wife is named in the Bible.", answer: false, explanation: "Genesis 4 refers to Cain's wife but never gives her a name. She remains anonymous in Scripture.", difficulty: "hard" },
  { statement: "The Bible says the earth is described as a circle.", answer: true, explanation: "Isaiah 40:22 — 'He sits enthroned above the circle of the earth.' The Hebrew word 'chug' means circle or sphere.", difficulty: "hard" },
  { statement: "Paul never met Jesus in person during Jesus's earthly ministry.", answer: true, explanation: "Paul (then Saul) was not among the disciples. His encounter with Jesus was after the ascension, on the Damascus road (Acts 9).", difficulty: "hard" },
  { statement: "The book of Song of Songs never uses the name God or Lord.", answer: true, explanation: "Song of Songs (Song of Solomon) is unique in that it never explicitly names God — though 8:6 may contain a hidden reference.", difficulty: "hard" },
  { statement: "The Bible records that Elijah prayed that it would not rain — and it didn't rain for 3 years.", answer: true, explanation: "James 5:17 confirms this: 'Elijah was a human being… He prayed earnestly that it would not rain, and it did not rain on the land for three and a half years.'", difficulty: "hard" },
  { statement: "Lot's wife was turned into a pillar of salt.", answer: true, explanation: "Genesis 19:26 — 'But Lot's wife looked back, and she became a pillar of salt.'", difficulty: "hard" },
  { statement: "The apostle Paul was a tent maker by trade.", answer: true, explanation: "Acts 18:3 — 'Paul stayed and worked with them. They were tent makers as he was.'", difficulty: "hard" },
  { statement: "The walls of Jericho fell after Joshua and the Israelites blew trumpets.", answer: true, explanation: "Joshua 6:20 — When the priests blew trumpets and the people shouted, the wall collapsed flat.", difficulty: "hard" },
  { statement: "The Bible records that Samson killed 1,000 men with the jawbone of a donkey.", answer: true, explanation: "Judges 15:15 — 'Finding a fresh jawbone of a donkey, he grabbed it and struck down a thousand men.'", difficulty: "hard" },
  { statement: "The Apostle John died a violent martyr's death.", answer: false, explanation: "Tradition holds that John was the only one of the twelve apostles to die of natural old age — reportedly in Ephesus.", difficulty: "hard" },
];

/** Build deck: easy → medium → hard, shuffled within each tier */
export function buildTrueFalseDeck(): TrueFalseStatement[] {
  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const easy   = shuffle(TRUE_FALSE_STATEMENTS.filter((s) => s.difficulty === "easy"));
  const medium = shuffle(TRUE_FALSE_STATEMENTS.filter((s) => s.difficulty === "medium"));
  const hard   = shuffle(TRUE_FALSE_STATEMENTS.filter((s) => s.difficulty === "hard"));
  return [...easy, ...medium, ...hard];
}
