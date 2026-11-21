// "Road to Jerusalem" — a guided Gospel quiz on the days leading into Holy Week.
// Passages: Mark 14:3–9; Matthew 26:6–13; John 12:1–11; Mark 11:1–11;
// Matthew 21:1–11; Luke 19:28–44; John 12:12–36.
// Scripture quotations are from the World English Bible (public domain).

export interface QuizQuestion {
  id: number;
  title: string;
  question: string;
  options: string[];
  /** Indexes into `options`. More than one means "select all that apply". */
  answers: number[];
  reference: string;
  verse: string;
  standsOut: string;
  didYouKnow?: string;
  reflect?: string;
}

export interface QuizPart {
  id: number;
  emoji: string;
  title: string;
  subtitle: string;
  passages: string;
  questions: QuizQuestion[];
}

export const QUIZ_PARTS: QuizPart[] = [
  {
    id: 1,
    emoji: "🏺",
    title: "The Anointing",
    subtitle: "Perfume, plots and a promise",
    passages: "Mark 14:3–9 · Matthew 26:6–13 · John 12:1–11",
    questions: [
      {
        id: 1,
        title: "Fragrance vs. Budget",
        question:
          "The smell of the nard filled the whole house, and Judas complained it should have been sold for the poor. What did John say was his real motive?",
        options: [
          "He was a thief who took from the money box",
          "He wanted the money for the Passover meal",
          "He was jealous of how close Mary was to Jesus",
          "He thought the perfume should be kept for the burial",
        ],
        answers: [0],
        reference: "John 12:4–6",
        verse:
          "He said this, not because he cared for the poor, but because he was a thief, and having the money box, used to steal what was put into it.",
        standsOut:
          "A complaint can sound spiritual and still hide a selfish motive. Jesus called the same act a gift that prepared him for his burial.",
        didYouKnow:
          "The perfume was worth more than 300 denarii, close to a year's wages for a labourer (Mark 14:5).",
      },
      {
        id: 2,
        title: "A Tale of Two Simons",
        question:
          "In Matthew and Mark, the anointing happens at the home of a man named Simon in Bethany. Which Simon?",
        options: ["Simon Peter", "Simon the leper", "Simon the Pharisee", "Simon of Cyrene"],
        answers: [1],
        reference: "Mark 14:3 · Matthew 26:6",
        verse:
          "While he was at Bethany, in the house of Simon the leper, as he sat at the table, a woman came having an alabaster jar of ointment of pure nard—very costly.",
        standsOut:
          "Jesus ate in the home of a man known by a disease that once kept people out of community.",
        didYouKnow:
          "Simon the Pharisee hosts a different anointing, earlier in Jesus' ministry (Luke 7:36–50). In John's account Martha serves, Lazarus is at the table, and Mary wipes Jesus' feet with her hair.",
      },
      {
        id: 3,
        title: "An Unexpected Target",
        question:
          "A large crowd came to Bethany to see Jesus and someone else. The chief priests then planned to kill a second person too. Who?",
        options: ["Mary", "Martha", "Lazarus", "Simon the leper"],
        answers: [2],
        reference: "John 12:9–11",
        verse:
          "But the chief priests conspired to put Lazarus to death also, because on account of him many of the Jews went away and believed in Jesus.",
        standsOut:
          "Lazarus was living proof of Jesus' power. That drew crowds, and it also drew opposition.",
      },
      {
        id: 4,
        title: "A Promise That Still Echoes",
        question: "What did Jesus promise about the woman who poured out the perfume?",
        options: [
          "Her sins were forgiven because she loved much",
          "Wherever the gospel is preached, what she did will be told in memory of her",
          "She would be the first to see him risen",
          "The fragrance of her gift would never fade",
        ],
        answers: [1],
        reference: "Mark 14:9 · Matthew 26:13",
        verse:
          "Most certainly I tell you, wherever this Good News may be preached throughout the whole world, that which this woman has done will also be spoken of for a memorial of her.",
        standsOut:
          "The others at the table argued about cost. She acted boldly, and at exactly the right moment.",
        didYouKnow:
          "“Her sins are forgiven, for she loved much” comes from the earlier anointing in Luke 7:47.",
        reflect:
          "What stands out most to you: her generosity, her timing, or the way Jesus defended her?",
      },
    ],
  },
  {
    id: 2,
    emoji: "🌿",
    title: "The Triumphal Entry",
    subtitle: "Parades, donkeys and crowd energy",
    passages: "Mark 11:1–11 · Matthew 21:1–11 · Luke 19:28–40 · John 12:12–19",
    questions: [
      {
        id: 5,
        title: "Very Specific Instructions",
        question:
          "Jesus sent two disciples ahead into a village with precise directions. What were they told to bring back?",
        options: [
          "A colt that no one had ever ridden",
          "A white horse",
          "A war horse from the Roman garrison",
          "A camel from the market",
        ],
        answers: [0],
        reference: "Mark 11:2 · Matthew 21:2",
        verse:
          "Go your way into the village that is opposite you. Immediately as you enter into it, you will find a young donkey tied, on which no one has sat. Untie him, and bring him.",
        standsOut:
          "A king arrives on a young donkey, not a war horse. It is humble and deliberate, and it fulfils prophecy.",
        didYouKnow:
          "Matthew says there was a donkey and her colt, and quotes Zechariah 9:9: “Behold, your King comes to you, humble, and riding on a donkey.” If anyone asked, they were to say: “The Lord needs it.”",
      },
      {
        id: 6,
        title: "The Street-Level Red Carpet",
        question: "What did the crowds spread on the road as Jesus rode in? Select all that apply.",
        options: ["Their cloaks", "Branches from the trees and fields", "Rose petals", "Fine linen rugs"],
        answers: [0, 1],
        reference: "Mark 11:8 · John 12:13",
        verse:
          "Many spread their garments on the way, and others were cutting down branches from the trees, and spreading them on the road.",
        standsOut: "Ordinary people honoured him with whatever they had to hand.",
        didYouKnow:
          "Only John says they were palm branches, which is where “Palm Sunday” comes from.",
      },
      {
        id: 7,
        title: "If They Keep Quiet…",
        question:
          "Some Pharisees told Jesus to rebuke his disciples for their loud praise. What did he say would happen if they stayed silent?",
        options: [
          "The angels would sing in their place",
          "The stones would cry out",
          "The temple walls would fall",
          "The heavens would thunder",
        ],
        answers: [1],
        reference: "Luke 19:39–40",
        verse: "He answered them, “I tell you that if these were silent, the stones would cry out.”",
        standsOut:
          "Creation itself recognises who Jesus is, even when religious critics push back.",
      },
      {
        id: 8,
        title: "Spot the Gospel",
        question:
          "One Gospel admits the disciples didn't understand any of this at first, and only remembered it after Jesus was glorified. Which one?",
        options: ["Matthew", "Mark", "Luke", "John"],
        answers: [3],
        reference: "John 12:16",
        verse:
          "His disciples didn't understand these things at first, but when Jesus was glorified, then they remembered that these things were written about him.",
        standsOut:
          "It is fine not to see the full picture in the moment. Often the meaning only becomes clear looking back.",
      },
      {
        id: 9,
        title: "The City Shakes",
        question:
          "When Jesus entered Jerusalem, the whole city was stirred and asked, “Who is this?” What did the crowds answer?",
        options: [
          "“This is the Son of David, the King of Israel”",
          "“This is the prophet, Jesus, from Nazareth of Galilee”",
          "“This is Elijah, who was to come”",
          "“This is the Lamb of God”",
        ],
        answers: [1],
        reference: "Matthew 21:10–11",
        verse:
          "When he had come into Jerusalem, all the city was stirred up, saying, “Who is this?” The multitudes said, “This is the prophet, Jesus, from Nazareth of Galilee.”",
        standsOut:
          "For all the cheering, “prophet” still fell short of who he really was.",
        didYouKnow:
          "This one is tricky. The crowd had just shouted “Hosanna to the son of David!” (Matthew 21:9), but when the city asked who he was, they answered “the prophet”.",
      },
      {
        id: 10,
        title: "The Pharisees' Frustration",
        question:
          "Watching the huge crowd welcome Jesus, what did the Pharisees say to one another?",
        options: [
          "“We must arrest him before the feast”",
          "“Surely this man is a prophet”",
          "“See how you accomplish nothing. The world has gone after him”",
          "“By what authority does he do these things?”",
        ],
        answers: [2],
        reference: "John 12:19",
        verse:
          "The Pharisees therefore said among themselves, “See how you accomplish nothing. Behold, the world has gone after him.”",
        standsOut: "Once a movement captures public attention, the momentum can shift very fast.",
      },
    ],
  },
  {
    id: 3,
    emoji: "🌾",
    title: "Tears & a Grain of Wheat",
    subtitle: "What the crowd couldn't see",
    passages: "Luke 19:41–44 · John 12:20–36",
    questions: [
      {
        id: 11,
        title: "Tears at the Peak of the Parade",
        question:
          "Right after the celebration, as Jesus came near and saw the city, he did something no one expected. What?",
        options: [
          "He cursed a fig tree",
          "He wept over it",
          "He turned over the money-changers' tables",
          "He withdrew to pray alone",
        ],
        answers: [1],
        reference: "Luke 19:41–42, 44",
        verse:
          "When he came near, he saw the city and wept over it, saying, “If you, even you, had known today the things which belong to your peace! But now, they are hidden from your eyes.”",
        standsOut:
          "Jesus was heartbroken in the middle of a celebration. He saw past the crowd to what was coming.",
        didYouKnow:
          "He wept because the city “didn't know the time of your visitation” (Luke 19:44). He foresaw a day when not one stone would be left on another.",
      },
      {
        id: 12,
        title: "Visitors From Outside",
        question: "Who came to Philip with a simple request: “Sir, we want to see Jesus”?",
        options: ["Roman soldiers", "Some Samaritans", "Some Greeks", "Pharisees from Galilee"],
        answers: [2],
        reference: "John 12:20–22",
        verse:
          "Now there were certain Greeks among those that went up to worship at the feast. These, therefore, came to Philip, who was from Bethsaida of Galilee, and asked him, saying, “Sir, we want to see Jesus.”",
        standsOut:
          "Jesus' reach goes beyond every boundary. In John, this simple request starts a major turning point: “The time has come for the Son of Man to be glorified.”",
        didYouKnow: "Philip told Andrew, and the two of them went and told Jesus together.",
      },
      {
        id: 13,
        title: "The Seed That Falls",
        question:
          "Jesus answered with a picture of a grain of wheat. What happens to it unless it falls into the earth and dies?",
        options: [
          "It rots and is lost",
          "The birds eat it",
          "It remains by itself alone",
          "It is gathered into the barn",
        ],
        answers: [2],
        reference: "John 12:24",
        verse:
          "Most certainly I tell you, unless a grain of wheat falls into the earth and dies, it remains by itself alone. But if it dies, it bears much fruit.",
        standsOut:
          "At the height of his popularity, Jesus taught about sacrifice and the fruit it bears.",
      },
      {
        id: 14,
        title: "Thunder From Heaven",
        question:
          "Jesus prayed, “Father, glorify your name,” and a voice answered from heaven. What did people in the crowd think they had heard? Select all that apply.",
        options: ["Thunder", "An angel speaking to him", "A trumpet blast", "The prophet Elijah"],
        answers: [0, 1],
        reference: "John 12:28–30",
        verse:
          "The multitude therefore, who stood by and heard it, said that it had thundered. Others said, “An angel has spoken to him.” Jesus answered, “This voice hasn't come for my sake, but for your sakes.”",
        standsOut:
          "People heard the same voice from heaven and came away with completely different explanations.",
      },
      {
        id: 15,
        title: "Walk While You Have the Light",
        question:
          "The crowd asked how the Messiah could be “lifted up” if he was meant to remain forever. What did Jesus urge them to do?",
        options: [
          "Wait for the morning",
          "Light a lamp and keep watch",
          "Walk while you have the light",
          "Go home before nightfall",
        ],
        answers: [2],
        reference: "John 12:35–36",
        verse:
          "Walk while you have the light, that darkness doesn't overtake you. While you have the light, believe in the light, that you may become children of light.",
        standsOut:
          "The light is not something to debate. It is something to walk in while it is shining.",
      },
    ],
  },
];

export const ALL_QUESTIONS = QUIZ_PARTS.flatMap((p) => p.questions.map((q) => ({ ...q, partId: p.id })));

export const WRAP_UP_PROMPTS = [
  { emoji: "😮", title: "Biggest Surprise", prompt: "Which detail across all these passages surprised you the most?" },
  {
    emoji: "⚖️",
    title: "Sharpest Contrast",
    prompt: "Compare the cheering crowd entering Jerusalem with Jesus weeping over the city. What stands out to you?",
  },
  { emoji: "🪞", title: "Personal Takeaway", prompt: "Which verse or moment feels most relevant to your life right now?" },
];
