export type AttributeEntryType = "attribute" | "book";

export interface GodAttribute {
  id: string;
  /** "attribute" = named attribute (e.g. Omniscient); "book" = book study (e.g. Genesis) */
  entry_type: AttributeEntryType;
  /** Attribute name OR custom study title */
  name: string;
  /** Short one-line summary shown in cards and attribute header */
  description: string | null;
  /** Long-form rich text (HTML) — theological exposition */
  content: string | null;
  /** For book studies: the Bible book (e.g. "Genesis") */
  passage_book: string | null;
  /** Unused — kept for DB compatibility */
  passage_chapter: number | null;
  /** Unused — kept for DB compatibility */
  passage_chapter_end: number | null;
  approved: boolean;
  featured: boolean;
  submitted_by: string | null;
  created_at: string;
  references?: AttributeReference[];
}

/** Format a book study's label — just the book name. */
export function formatPassage(attr: Pick<GodAttribute, "passage_book">): string {
  return attr.passage_book ?? "";
}

export interface AttributeReference {
  id: string;
  attribute_id: string;
  book: string;
  chapter: number | null;
  verse_start: number | null;
  verse_end: number | null;
  verse_text: string | null;
  note: string | null;
  approved: boolean;
  submitted_by: string | null;
  created_at: string;
  // Present in admin joins
  god_attributes?: { name: string };
}

/** Format a reference into a citation string like "Genesis 1:1–3" */
export function formatCitation(ref: Pick<AttributeReference, "book" | "chapter" | "verse_start" | "verse_end">): string {
  let s = ref.book;
  if (ref.chapter) s += ` ${ref.chapter}`;
  if (ref.verse_start) {
    s += `:${ref.verse_start}`;
    if (ref.verse_end && ref.verse_end !== ref.verse_start) s += `–${ref.verse_end}`;
  }
  return s;
}

export const BIBLE_BOOKS = [
  // Old Testament
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  // New Testament
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John",
  "3 John", "Jude", "Revelation",
] as const;

export type BibleBook = (typeof BIBLE_BOOKS)[number];
