/* ============================================================
   ARCHIVE CORPUS
   ------------------------------------------------------------
   Synthetic, parody-style "archive snippets" that mimic the
   cadence/structure of a Trump-style social post. NOT real
   posts. Used to populate the "Archive Matches" drawer and
   to seed the Style DNA generator.

   Each entry has:
     id     — stable id
     date   — fake post date string
     channel — "TS" (truth-social-style) or "X"
     text   — synthetic snippet, ALL CAPS sometimes, with
              characteristic patterns
     tags   — pattern tags used to score similarity
     dna    — pattern type contributed: NICKNAME, REPETITION,
              EXAGGERATION, INSULT_THEME, SIGNOFF, ALLCAPS_BURST
   ============================================================ */
window.CORPUS = [
  { id: "A-0421", date: "2024-08-12 07:14", channel: "TS",
    text: "Sleepy SUBJECT, the worst at what he does, by far! Total disaster. Sad!",
    tags: ["sleepy","disaster","sad","superlative"], dna: ["NICKNAME","SIGNOFF","EXAGGERATION"] },
  { id: "A-0517", date: "2024-09-03 22:48", channel: "X",
    text: "Nobody plays tennis worse than SUBJECT. Believe me. NOBODY. A real low energy player!",
    tags: ["sports","low_energy","nobody"], dna: ["REPETITION","EXAGGERATION","INSULT_THEME"] },
  { id: "A-0633", date: "2024-10-19 06:02", channel: "TS",
    text: "The Failing SUBJECT has been writing FAKE NEWS again. Total LOSER. Sad!",
    tags: ["fake_news","loser","failing"], dna: ["NICKNAME","ALLCAPS_BURST","SIGNOFF"] },
  { id: "A-0741", date: "2024-11-05 11:35", channel: "TS",
    text: "Crooked SUBJECT thinks he's smart. He's not. Tremendously not smart. Many people are saying it!",
    tags: ["crooked","smart","many_people"], dna: ["NICKNAME","REPETITION","EXAGGERATION"] },
  { id: "A-0808", date: "2024-12-14 18:22", channel: "X",
    text: "Tiny SUBJECT from a tiny country. Nobody respects him. Nobody! TOTAL JOKE.",
    tags: ["tiny","country","joke"], dna: ["NICKNAME","REPETITION","ALLCAPS_BURST"] },
  { id: "A-0912", date: "2025-01-22 04:11", channel: "TS",
    text: "Coffee Boy SUBJECT can't even finish a sentence without his espresso. WEAK!",
    tags: ["coffee","weak"], dna: ["NICKNAME","ALLCAPS_BURST","INSULT_THEME"] },
  { id: "A-1004", date: "2025-02-10 13:09", channel: "X",
    text: "I know SUBJECT very well. Believe me. He's a fraud. A complete fraud. Maybe the biggest fraud!",
    tags: ["fraud","believe_me","biggest"], dna: ["REPETITION","EXAGGERATION","INSULT_THEME"] },
  { id: "A-1117", date: "2025-03-04 09:53", channel: "TS",
    text: "SUBJECT just lost again. Always losing. Born to lose. SAD!",
    tags: ["loser","always"], dna: ["REPETITION","EXAGGERATION","SIGNOFF"] },
  { id: "A-1233", date: "2025-04-18 15:27", channel: "X",
    text: "The Fake Genius SUBJECT couldn't pass a 3rd grade test. NOT EVEN CLOSE!",
    tags: ["fake_genius","stupid","test"], dna: ["NICKNAME","ALLCAPS_BURST","EXAGGERATION"] },
  { id: "A-1349", date: "2025-05-29 23:01", channel: "TS",
    text: "Lying SUBJECT lies. That's all he does. He lies, and lies, and lies again. A LIAR!",
    tags: ["lying","liar"], dna: ["NICKNAME","REPETITION","ALLCAPS_BURST"] },
  { id: "A-1455", date: "2025-06-12 08:44", channel: "X",
    text: "SUBJECT is going to lose so badly. So so badly. Like nobody has ever lost before. Bigly!",
    tags: ["lose","badly","bigly"], dna: ["REPETITION","EXAGGERATION"] },
  { id: "A-1562", date: "2025-07-04 19:33", channel: "TS",
    text: "Low Energy SUBJECT — falls asleep at the worst possible times. NOT a winner. Sad!",
    tags: ["low_energy","sleep","loser"], dna: ["NICKNAME","SIGNOFF","INSULT_THEME"] },
  { id: "A-1678", date: "2025-08-21 02:18", channel: "X",
    text: "Just got off a call. SUBJECT was rambling. Total amateur. Should retire. PATHETIC!",
    tags: ["amateur","pathetic","retire"], dna: ["INSULT_THEME","ALLCAPS_BURST","SIGNOFF"] },
  { id: "A-1794", date: "2025-09-17 14:55", channel: "TS",
    text: "SUBJECT thinks he's tough. He's not tough. He's a paper tiger. A weak, weak paper tiger!",
    tags: ["tough","weak","paper_tiger"], dna: ["REPETITION","INSULT_THEME","EXAGGERATION"] },
  { id: "A-1830", date: "2025-10-08 06:39", channel: "X",
    text: "Nobody, and I mean NOBODY, watches SUBJECT. The ratings? A CATASTROPHE!",
    tags: ["nobody","ratings","catastrophe"], dna: ["REPETITION","ALLCAPS_BURST","EXAGGERATION"] },
  { id: "A-1902", date: "2025-11-19 21:11", channel: "TS",
    text: "Phony SUBJECT — pretending to be smart. Not smart. Failed at everything he's ever touched. SAD.",
    tags: ["phony","smart","failed"], dna: ["NICKNAME","SIGNOFF","INSULT_THEME"] },
  { id: "A-2011", date: "2026-01-07 10:03", channel: "X",
    text: "I made SUBJECT what he is. Without me? Nothing. A nobody. ZERO.",
    tags: ["made_him","nothing","zero"], dna: ["EXAGGERATION","INSULT_THEME"] },
  { id: "A-2087", date: "2026-02-14 16:42", channel: "TS",
    text: "SUBJECT just gave the worst speech in the history of speeches. THE WORST! By far. Many are saying it.",
    tags: ["worst","speech","history"], dna: ["EXAGGERATION","ALLCAPS_BURST","REPETITION"] },
  { id: "A-2154", date: "2026-03-22 03:27", channel: "X",
    text: "Crybaby SUBJECT cried again. Always crying. Bring tissues. Sad to watch!",
    tags: ["crybaby","crying"], dna: ["NICKNAME","REPETITION","SIGNOFF"] },
  { id: "A-2230", date: "2026-04-15 12:08", channel: "TS",
    text: "REMEMBER: SUBJECT didn't build that. I did. He took credit. TOTAL FRAUD!",
    tags: ["fraud","credit","remember"], dna: ["ALLCAPS_BURST","INSULT_THEME","SIGNOFF"] }
];
