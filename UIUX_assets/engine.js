/* ============================================================
   GENERATOR — produces a parody Trump-style roast tweet.
   Pure synthesis from user dossier + corpus pattern matching.
   No real posts are reproduced.
   ============================================================ */

(function () {
  const NICKNAMES = {
    playful:  ["Sleepy","Low Energy","Coffee Boy","Tiny","Crybaby","Fake Genius","Phony","Sloppy","Foolish"],
    brutal:   ["Crooked","Failing","Lying","Crazy","Pathetic","Weak","Dopey","Loser","Disgraced"],
    political:["Crooked","Failing","Lying","Phony","Disgraced","Crazy","Sleepy"],
    sports:   ["Choking","Low Energy","Sloppy","Tiny","Foolish","Weak"],
    media:    ["Failing","Fake News","Phony","Lying","Disgraced","Sloppy"],
    sleepy:   ["Sleepy","Low Energy","Snoozing","Sluggish","Drowsy"]
  };

  const SIGNOFFS = {
    playful: ["Sad!","Not good!","A real shame!","So sad to watch.","Pathetic!"],
    brutal:  ["SAD!","TOTAL DISASTER!","A LOSER!","PATHETIC!","TERRIBLE!","ZERO!"],
    political:["SAD!","DISGRACE!","WITCH HUNT!","TOTAL FRAUD!"],
    sports:  ["CHOKER!","WEAK!","SAD!","NOT A WINNER!"],
    media:   ["FAKE NEWS!","SAD!","DISGRACE!","TOTAL FRAUD!"],
    sleepy:  ["WAKE UP!","SAD!","Low energy. Always.","Snooze!"]
  };

  const REPEATERS = ["Believe me.", "Many people are saying it.", "I know him very well.",
                     "Nobody. Nobody!", "Like nobody has ever seen before.", "Bigly.",
                     "Tremendous. Just tremendous.", "Mark my words."];

  const EXAGGERATIONS = ["the worst","the absolute worst","the biggest","the most","by far",
                         "in the history of history","like never before","totally","completely","100%"];

  const THEME_HOOKS = {
    sports:    ["can't even hit a {hobby} ball straight","plays {hobby} like an amateur","embarrassing on the {hobby} court"],
    job:       ["pretends to know about {job}","totally clueless about {job}","a fraud at {job} — and everybody knows it"],
    location:  ["from {location}, of all places","represents {location}? They deserve better","a {location} embarrassment"],
    quirk:     ["always {quirk} — every single time","can't stop {quirk}. Sad to see"],
    weakness:  ["{weakness}. Enough said","{weakness} — and that's the BEST thing about him"]
  };

  function pick(arr, seed) {
    if (!arr || !arr.length) return "";
    const i = Math.abs(hashStr(seed || Math.random().toString())) % arr.length;
    return arr[i];
  }
  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return h;
  }

  /** Score corpus entries against a dossier. Returns top N matches. */
  function scoreCorpus(dossier, n) {
    const blob = [
      dossier.hobbies, dossier.job, dossier.quirks, dossier.weakness,
      dossier.location, dossier.insideJokes, (dossier.chips || []).join(" "),
      dossier.style
    ].join(" ").toLowerCase();

    const styleMap = {
      playful: ["sleepy","tiny","coffee","weak"],
      brutal: ["loser","fraud","fake","pathetic","disaster","worst"],
      political: ["crooked","fake_news","witch","fraud","disgrace"],
      sports: ["sports","tennis","loser","weak","choke"],
      media: ["fake_news","ratings","failing","phony"],
      sleepy: ["sleepy","low_energy","sleep","weak"]
    };
    const styleTags = styleMap[dossier.style] || [];

    const scored = window.CORPUS.map(c => {
      let score = 0;
      c.tags.forEach(t => {
        if (blob.includes(t.replace("_"," "))) score += 3;
        if (styleTags.includes(t)) score += 2;
      });
      // intensity affects allcaps preference
      if (dossier.intensity >= 7 && c.dna.includes("ALLCAPS_BURST")) score += 1.5;
      if (dossier.intensity <= 3 && !c.dna.includes("ALLCAPS_BURST")) score += 1;
      // a tiny noise so re-rolls feel different
      score += (Math.random() * 0.6);
      return { ...c, score };
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, n || 5);
  }

  /** Compose a parody tweet. */
  function generate(dossier) {
    const seed = `${dossier.name}|${dossier.style}|${dossier.intensity}|${Date.now()}`;
    const style = dossier.style || "playful";
    const intensity = dossier.intensity == null ? 5 : dossier.intensity;

    const matches = scoreCorpus(dossier, 5);

    // Build a nickname.
    const nick = pick(NICKNAMES[style] || NICKNAMES.playful, seed);
    const name = (dossier.name || "Subject").trim();
    const fullSubject = `${nick} ${name}`;

    // Choose 1–2 theme hook fragments based on dossier richness.
    const hooks = [];
    if (dossier.hobbies)  hooks.push(pick(THEME_HOOKS.sports,    seed + "h").replace("{hobby}", firstWord(dossier.hobbies)));
    if (dossier.job)      hooks.push(pick(THEME_HOOKS.job,       seed + "j").replace("{job}",   dossier.job));
    if (dossier.location) hooks.push(pick(THEME_HOOKS.location,  seed + "l").replace("{location}", dossier.location));
    if (dossier.quirks)   hooks.push(pick(THEME_HOOKS.quirk,     seed + "q").replace("{quirk}", firstWord(dossier.quirks)));
    if (dossier.weakness) hooks.push(pick(THEME_HOOKS.weakness,  seed + "w").replace("{weakness}", capFirst(dossier.weakness)));

    // intensity → number of fragments
    const numHooks = Math.max(1, Math.min(hooks.length, Math.round(intensity / 3)));
    const chosenHooks = hooks.slice(0, numHooks);

    const exag = pick(EXAGGERATIONS, seed + "e");
    const repeater = pick(REPEATERS, seed + "r");
    const signoff = pick(SIGNOFFS[style] || SIGNOFFS.playful, seed + "s");

    // Sentence assembly with cadence — short jabs, repetition, signoff.
    const sentences = [];
    sentences.push(`${fullSubject} — ${exag} ${pick(["disaster","fraud","amateur","disappointment","joke"], seed+"a")}.`);

    if (chosenHooks.length) {
      sentences.push(capFirst(chosenHooks[0]) + ".");
    }
    if (chosenHooks[1]) {
      sentences.push(capFirst(chosenHooks[1]) + ".");
    }

    if (intensity >= 5) sentences.push(repeater);

    // ALLCAPS burst at higher intensity
    if (intensity >= 7) {
      sentences.push(pick([
        "NOBODY LIKES HIM. NOBODY!",
        "A TOTAL FRAUD. EVERYBODY KNOWS IT!",
        "SO BAD. SO, SO BAD!",
        "THE WORST. BY FAR!"
      ], seed + "k"));
    }

    // Inside joke gets quoted & questioned, if provided
    if (dossier.insideJokes && dossier.insideJokes.trim()) {
      sentences.push(`Remember "${trimTo(dossier.insideJokes, 40)}"? Says it all.`);
    }

    sentences.push(signoff);

    let text = sentences.join(" ");

    // Avoid forbidden topics
    if (dossier.avoid && dossier.avoid.trim()) {
      const banned = dossier.avoid.split(/[,;\n]/).map(s => s.trim().toLowerCase()).filter(Boolean);
      banned.forEach(b => {
        if (!b) return;
        const re = new RegExp("\\b" + escapeReg(b) + "\\b", "ig");
        text = text.replace(re, "[—]");
      });
    }

    // Clamp length to ~280 chars feel
    if (text.length > 278) text = text.slice(0, 275) + "…";

    // Style DNA tally
    const dna = computeDNA({ text, intensity, hadHooks: chosenHooks.length, nick });

    return { text, nickname: nick, matches, dna, style, intensity, generatedAt: new Date() };
  }

  function computeDNA({ text, intensity, hadHooks, nick }) {
    const allcapsBursts = (text.match(/\b[A-Z!]{4,}\b/g) || []).length;
    const exclamations  = (text.match(/!/g) || []).length;
    const repeats       = (text.match(/\b(\w+)\b(?:[^\w]+\1\b){1,}/gi) || []).length;
    return {
      NICKNAME:       nick ? 100 : 0,
      REPETITION:     Math.min(100, repeats * 35 + (intensity >= 5 ? 20 : 0)),
      EXAGGERATION:   Math.min(100, 50 + intensity * 5),
      ALLCAPS_BURST:  Math.min(100, allcapsBursts * 30 + (intensity >= 7 ? 20 : 0)),
      INSULT_THEME:   Math.min(100, hadHooks * 30 + 30),
      SIGNOFF:        100,
      EXCLAMATIONS:   Math.min(100, exclamations * 18)
    };
  }

  function firstWord(s) { return (s || "").trim().split(/[\s,]+/)[0] || ""; }
  function capFirst(s) { s = (s || "").trim(); return s ? s[0].toUpperCase() + s.slice(1) : s; }
  function trimTo(s, n) { s = (s || "").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  window.RoastEngine = { generate, scoreCorpus };
})();
