import posts from "@/data/roast-posts.json";

export interface RoastPost {
  id: string;
  date: string;
  text: string;
  platform: string;
  target: string;
  nickname: string;
  insult_type: string;
  rhetorical_moves: string;
  intensity: number;
}

const allPosts = posts as RoastPost[];

export function searchPosts(
  keywords: string,
  tags: string[],
  intensity: number,
  limit = 15
): RoastPost[] {
  const terms = keywords
    .toLowerCase()
    .split(/[\s,;.!?]+/)
    .filter((t) => t.length > 2);

  const tagSet = new Set(tags.map((t) => t.toLowerCase()));

  const scored = allPosts.map((post) => {
    let score = 0;
    const textLower = post.text.toLowerCase();
    const typeLower = post.insult_type.toLowerCase();

    for (const term of terms) {
      if (textLower.includes(term)) score += 3;
    }

    for (const tag of tagSet) {
      if (typeLower.includes(tag.replace(/\s+/g, "-"))) score += 2;
      if (textLower.includes(tag)) score += 1;
    }

    const intDiff = Math.abs(post.intensity - intensity);
    score += Math.max(0, 3 - intDiff);

    score += Math.random() * 0.8;

    return { post, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}
