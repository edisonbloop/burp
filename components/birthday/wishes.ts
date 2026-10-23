/**
 * Ready-made birthday wishes for when the words won't come. `{name}` is
 * replaced with the birthday person's name. Scripture is quoted from the
 * World English Bible (public domain).
 */
export type IdeaKind = "heartfelt" | "prayer" | "scripture" | "fun";

export const IDEA_KINDS: { id: IdeaKind; label: string; emoji: string }[] = [
  { id: "heartfelt", label: "Heartfelt", emoji: "💛" },
  { id: "prayer", label: "Prayer", emoji: "🙏" },
  { id: "scripture", label: "Scripture", emoji: "📖" },
  { id: "fun", label: "Fun", emoji: "😄" },
];

const IDEAS: Record<IdeaKind, string[]> = {
  heartfelt: [
    "Happy birthday, {name}! Thank you for the warmth you bring into every room. The world is better with you in it, and so is our community.",
    "{name}, you have a way of making people feel seen. I'm so grateful our paths crossed. Have the most beautiful day.",
    "Happy birthday, {name}! Your kindness, your laugh and your faith have blessed me more than you know. Here's to your best year yet.",
    "To one of the most genuine people I know — happy birthday, {name}. Celebrate big today; you deserve every bit of it.",
  ],
  prayer: [
    "Happy birthday, {name}! I'm praying this new year brings you deeper joy, fresh strength and answered prayers you didn't even dare to ask for.",
    "{name}, may this year be marked by God's goodness — open doors, sweet rest and His peace guarding your heart every single day. Happy birthday!",
    "Happy birthday, {name}! Praying that you grow in grace, walk in favour, and feel how deeply you are loved — by God and by all of us.",
    "Lord, thank You for {name}. Bless them this year with wisdom, good health and a heart full of gladness. Happy birthday, friend!",
  ],
  scripture: [
    "Happy birthday, {name}! \"The LORD bless you, and keep you. The LORD make his face to shine on you, and be gracious to you.\" — Numbers 6:24–25",
    "Happy birthday, {name}! \"For I know the thoughts that I think toward you,\" says the LORD, \"thoughts of peace, and not of evil, to give you hope and a future.\" — Jeremiah 29:11",
    "{name}, this verse made me think of you: \"This is the day that the LORD has made. We will rejoice and be glad in it!\" — Psalm 118:24. Happy birthday!",
    "Happy birthday, {name}! \"May he grant you your heart's desire, and fulfill all your counsel.\" — Psalm 20:4",
    "Happy birthday, {name}! \"The LORD is my strength and my shield. My heart has trusted in him, and I am helped.\" — Psalm 28:7. May this be your year.",
  ],
  fun: [
    "Happy birthday, {name}! 🎉 Don't worry about getting older — you're just levelling up. Cake is mandatory today.",
    "{name}, another trip around the sun and still this fabulous? Unfair, honestly. Happy birthday! 🎂",
    "Happy birthday, {name}! I tried to think of a gift as amazing as you, but they don't sell those. So here's a message. And cake. Mostly cake. 🍰",
    "Happy birthday to the main character, {name}! 👑 May your day be full of joy, snacks and zero responsibilities.",
  ],
};

/** A random idea of the given kind, avoiding `previous` when possible. */
export function pickIdea(kind: IdeaKind, name: string, previous?: string) {
  const who = name.trim() || "friend";
  const options = IDEAS[kind].map((t) => t.replaceAll("{name}", who));
  const fresh = options.filter((o) => o !== previous);
  const pool = fresh.length ? fresh : options;
  return pool[Math.floor(Math.random() * pool.length)];
}
