export interface ContentPillar {
  id: string;
  category: "ideas" | "meanings" | "placement" | "firsttime" | "aftercare" | "style" | "seasonal" | "culture";
  primaryKeyword: string;
  searchIntent: string;
  suggestedTitle: string;
  searchQueries: string[];
  relatedKeywords: string[];
  targetAudience: string;
}

export const CONTENT_PILLARS: ContentPillar[] = [
  {
    id: "small-tattoos-women",
    category: "ideas",
    primaryKeyword: "small tattoo ideas for women",
    searchIntent: "Looking for delicate, small tattoo designs",
    suggestedTitle: "50 Small Tattoo Ideas for Women That Are Elegant and Timeless",
    searchQueries: [
      "small tattoo ideas for women 2026",
      "delicate feminine tattoo designs",
      "minimalist tattoo inspiration women",
    ],
    relatedKeywords: ["minimalist tattoo", "dainty tattoo", "tiny tattoo", "feminine tattoo"],
    targetAudience: "Women considering their first or next small tattoo",
  },
  {
    id: "arm-tattoos-men",
    category: "ideas",
    primaryKeyword: "arm tattoo ideas for men",
    searchIntent: "Looking for arm/sleeve tattoo designs for men",
    suggestedTitle: "Arm Tattoo Ideas for Men: From Subtle to Full Sleeve",
    searchQueries: [
      "arm tattoo ideas men 2026",
      "best arm tattoos for men",
      "half sleeve tattoo ideas men",
    ],
    relatedKeywords: ["sleeve tattoo", "forearm tattoo", "bicep tattoo", "half sleeve"],
    targetAudience: "Men wanting arm tattoos",
  },
  {
    id: "first-tattoo-ideas",
    category: "firsttime",
    primaryKeyword: "first tattoo ideas",
    searchIntent: "Never had a tattoo, looking for beginner-friendly ideas",
    suggestedTitle: "First Tattoo? Here Are the Best Ideas for Beginners",
    searchQueries: ["best first tattoo ideas", "first tattoo tips beginners", "easy first tattoo designs"],
    relatedKeywords: ["beginner tattoo", "first time tattoo", "simple tattoo", "starter tattoo"],
    targetAudience: "People getting their first tattoo ever",
  },
  {
    id: "meaningful-tattoos",
    category: "meanings",
    primaryKeyword: "meaningful tattoo ideas",
    searchIntent: "Looking for tattoos with deep personal meaning",
    suggestedTitle: "Meaningful Tattoo Ideas: Symbols That Tell Your Story",
    searchQueries: ["meaningful tattoo designs", "tattoo symbols and meanings", "symbolic tattoo ideas"],
    relatedKeywords: ["symbolic tattoo", "memorial tattoo", "tribute tattoo", "personal tattoo"],
    targetAudience: "People wanting tattoos with personal significance",
  },
  {
    id: "couple-tattoos",
    category: "ideas",
    primaryKeyword: "matching tattoo ideas for couples",
    searchIntent: "Couples looking for matching or complementary tattoos",
    suggestedTitle: "Matching Tattoo Ideas for Couples That Aren't Cliché",
    searchQueries: [
      "matching couple tattoo ideas 2026",
      "couple tattoo designs unique",
      "best friend matching tattoos",
    ],
    relatedKeywords: ["couple tattoo", "matching tattoo", "best friend tattoo", "pair tattoo"],
    targetAudience: "Couples and best friends",
  },
  {
    id: "wrist-tattoos",
    category: "placement",
    primaryKeyword: "wrist tattoo ideas",
    searchIntent: "Looking specifically for wrist tattoo designs",
    suggestedTitle: "Wrist Tattoo Ideas: Small Designs That Make a Statement",
    searchQueries: ["wrist tattoo ideas 2026", "inner wrist tattoo designs", "small wrist tattoo inspiration"],
    relatedKeywords: ["inner wrist tattoo", "bracelet tattoo", "wrist band tattoo"],
    targetAudience: "People wanting a visible but subtle tattoo",
  },
  {
    id: "behind-ear-tattoos",
    category: "placement",
    primaryKeyword: "behind the ear tattoo ideas",
    searchIntent: "Looking for subtle behind-ear tattoo designs",
    suggestedTitle: "Behind the Ear Tattoos: Subtle Designs You'll Love",
    searchQueries: ["behind the ear tattoo ideas", "small ear tattoo designs", "discreet tattoo placements"],
    relatedKeywords: ["ear tattoo", "discreet tattoo", "hidden tattoo"],
    targetAudience: "People wanting discreet, hideable tattoos",
  },
  {
    id: "tattoo-aftercare",
    category: "aftercare",
    primaryKeyword: "tattoo aftercare tips",
    searchIntent: "Just got a tattoo, needs care instructions",
    suggestedTitle: "Tattoo Aftercare: Everything You Need to Know for Perfect Healing",
    searchQueries: ["tattoo aftercare instructions 2026", "how to take care of new tattoo", "tattoo healing tips"],
    relatedKeywords: ["tattoo healing", "new tattoo care", "tattoo moisturizer", "tattoo scabbing"],
    targetAudience: "People who just got tattooed or are about to",
  },
  {
    id: "tattoo-pain-chart",
    category: "firsttime",
    primaryKeyword: "tattoo pain chart",
    searchIntent: "Worried about pain, wants to know which areas hurt most",
    suggestedTitle: "Tattoo Pain Chart: Where Does It Hurt Most (and Least)?",
    searchQueries: ["tattoo pain chart body", "most painful places to get a tattoo", "least painful tattoo spots"],
    relatedKeywords: ["tattoo pain level", "does tattoo hurt", "tattoo pain scale"],
    targetAudience: "First-timers anxious about pain",
  },
  {
    id: "flower-tattoos",
    category: "ideas",
    primaryKeyword: "flower tattoo ideas",
    searchIntent: "Looking for floral tattoo designs and meanings",
    suggestedTitle: "Flower Tattoo Ideas: Meanings, Styles and Inspiration",
    searchQueries: ["flower tattoo designs 2026", "rose tattoo ideas", "botanical tattoo inspiration"],
    relatedKeywords: ["rose tattoo", "botanical tattoo", "floral tattoo", "wildflower tattoo"],
    targetAudience: "People drawn to nature and botanical designs",
  },
  {
    id: "tattoo-cost",
    category: "firsttime",
    primaryKeyword: "how much does a tattoo cost",
    searchIntent: "Trying to understand tattoo pricing before booking",
    suggestedTitle: "How Much Does a Tattoo Cost? A Realistic Price Guide",
    searchQueries: ["tattoo cost guide 2026", "how much tattoo cost by size", "tattoo pricing explained"],
    relatedKeywords: ["tattoo price", "tattoo hourly rate", "cheap vs expensive tattoo"],
    targetAudience: "People budgeting for a tattoo",
  },
  {
    id: "fine-line-tattoos",
    category: "style",
    primaryKeyword: "fine line tattoo ideas",
    searchIntent: "Interested in the fine line/single needle style",
    suggestedTitle: "Fine Line Tattoos: Why This Delicate Style Is Everywhere",
    searchQueries: ["fine line tattoo designs 2026", "single needle tattoo ideas", "delicate line work tattoo"],
    relatedKeywords: ["single needle tattoo", "thin line tattoo", "micro tattoo"],
    targetAudience: "People who want subtle, delicate tattoos",
  },
  {
    id: "blackwork-tattoos",
    category: "style",
    primaryKeyword: "blackwork tattoo ideas",
    searchIntent: "Interested in bold black tattoo styles",
    suggestedTitle: "Blackwork Tattoos: Bold, Graphic and Unapologetic",
    searchQueries: ["blackwork tattoo designs 2026", "solid black tattoo ideas", "geometric blackwork tattoo"],
    relatedKeywords: ["solid black tattoo", "geometric tattoo", "tribal blackwork"],
    targetAudience: "People who want bold, striking tattoos",
  },
  {
    id: "tattoo-removal",
    category: "aftercare",
    primaryKeyword: "tattoo removal options",
    searchIntent: "Considering removing or covering up a tattoo",
    suggestedTitle: "Tattoo Removal vs Cover-Up: What You Need to Know",
    searchQueries: ["tattoo removal options 2026", "tattoo cover up ideas", "laser tattoo removal cost"],
    relatedKeywords: ["cover up tattoo", "laser removal", "tattoo fade", "tattoo regret"],
    targetAudience: "People with tattoo regret or wanting changes",
  },
  {
    id: "tattoo-aging",
    category: "aftercare",
    primaryKeyword: "how tattoos age",
    searchIntent: "Worried about how their tattoo will look in 10 years",
    suggestedTitle: "How Tattoos Age: What to Expect After 5, 10 and 20 Years",
    searchQueries: ["how do tattoos age over time", "tattoo aging before and after", "tattoo longevity tips"],
    relatedKeywords: ["tattoo fading", "tattoo over time", "old tattoo", "tattoo sun damage"],
    targetAudience: "People considering long-term appearance",
  },
  {
    id: "geometric-tattoos",
    category: "style",
    primaryKeyword: "geometric tattoo ideas",
    searchIntent: "Looking for geometric/mathematical tattoo designs",
    suggestedTitle: "Geometric Tattoos: Precision, Pattern and Meaning",
    searchQueries: ["geometric tattoo designs 2026", "sacred geometry tattoo", "mandala tattoo ideas"],
    relatedKeywords: ["mandala tattoo", "sacred geometry", "dotwork geometric"],
    targetAudience: "People drawn to symmetry and mathematical beauty",
  },
  {
    id: "shoulder-tattoos",
    category: "placement",
    primaryKeyword: "shoulder tattoo ideas",
    searchIntent: "Looking for shoulder/upper arm tattoo placement ideas",
    suggestedTitle: "Shoulder Tattoo Ideas: Designs That Flow With Your Body",
    searchQueries: [
      "shoulder tattoo ideas 2026",
      "shoulder cap tattoo designs",
      "shoulder blade tattoo inspiration",
    ],
    relatedKeywords: ["shoulder cap tattoo", "shoulder blade tattoo", "deltoid tattoo"],
    targetAudience: "People wanting a visible but coverable tattoo",
  },
  {
    id: "tattoo-cover-up",
    category: "ideas",
    primaryKeyword: "tattoo cover up ideas",
    searchIntent: "Need to cover an old or bad tattoo",
    suggestedTitle: "Tattoo Cover-Up Ideas: Transform What You No Longer Love",
    searchQueries: [
      "tattoo cover up ideas 2026",
      "best tattoo cover up designs",
      "cover up tattoo before and after",
    ],
    relatedKeywords: ["cover up design", "cover old tattoo", "tattoo rework"],
    targetAudience: "People with tattoos they want to change",
  },
  {
    id: "tattoo-trends-current-year",
    category: "style",
    primaryKeyword: "tattoo trends 2026",
    searchIntent: "Wants to know what's trending in tattoos right now",
    suggestedTitle: "Tattoo Trends 2026: The Styles Defining This Year",
    searchQueries: ["tattoo trends 2026", "popular tattoo styles this year", "trending tattoo designs 2026"],
    relatedKeywords: ["trending tattoo", "popular tattoo", "tattoo style 2026"],
    targetAudience: "Fashion-conscious people wanting current styles",
  },
  {
    id: "semicolon-tattoo-meaning",
    category: "meanings",
    primaryKeyword: "semicolon tattoo meaning",
    searchIntent: "Wants to understand the symbolism of specific tattoos",
    suggestedTitle: "Semicolon Tattoo Meaning: The Story Behind the Symbol",
    searchQueries: [
      "semicolon tattoo meaning mental health",
      "symbolic tattoo meanings",
      "tattoo symbols explained",
    ],
    relatedKeywords: ["mental health tattoo", "symbolic tattoo", "awareness tattoo"],
    targetAudience: "People interested in tattoos with social meaning",
  },
  {
    id: "leg-tattoos",
    category: "placement",
    primaryKeyword: "leg tattoo ideas",
    searchIntent: "Looking for thigh, calf, or ankle tattoo designs",
    suggestedTitle: "Leg Tattoo Ideas: From Ankle to Thigh",
    searchQueries: ["leg tattoo ideas 2026", "thigh tattoo designs", "calf tattoo inspiration"],
    relatedKeywords: ["thigh tattoo", "calf tattoo", "ankle tattoo", "knee tattoo"],
    targetAudience: "People wanting leg placement tattoos",
  },
  {
    id: "tattoo-for-moms",
    category: "ideas",
    primaryKeyword: "tattoo ideas for moms",
    searchIntent: "Mothers looking for family/children-themed tattoos",
    suggestedTitle: "Tattoo Ideas for Moms: Designs That Celebrate Motherhood",
    searchQueries: ["tattoo ideas for moms 2026", "mother daughter tattoo ideas", "kids name tattoo designs"],
    relatedKeywords: ["mother tattoo", "family tattoo", "children tattoo", "mom tattoo"],
    targetAudience: "Mothers wanting family-related tattoos",
  },
  {
    id: "watercolor-tattoos",
    category: "style",
    primaryKeyword: "watercolor tattoo ideas",
    searchIntent: "Interested in the watercolor/painterly style",
    suggestedTitle: "Watercolor Tattoos: Art That Bleeds Beyond the Lines",
    searchQueries: ["watercolor tattoo designs 2026", "watercolor style tattoo ideas", "painterly tattoo inspiration"],
    relatedKeywords: ["paint splash tattoo", "abstract tattoo", "colorful tattoo"],
    targetAudience: "People wanting colorful, artistic tattoos",
  },
  {
    id: "chest-tattoos",
    category: "placement",
    primaryKeyword: "chest tattoo ideas",
    searchIntent: "Looking for chest/sternum tattoo designs",
    suggestedTitle: "Chest Tattoo Ideas: Bold Placement for Bold Statements",
    searchQueries: ["chest tattoo ideas men women 2026", "sternum tattoo designs", "chest piece tattoo inspiration"],
    relatedKeywords: ["sternum tattoo", "chest piece", "pec tattoo"],
    targetAudience: "People wanting impactful chest placement",
  },
  {
    id: "minimalist-tattoos",
    category: "style",
    primaryKeyword: "minimalist tattoo ideas",
    searchIntent: "Looking for clean, simple, minimal designs",
    suggestedTitle: "Minimalist Tattoos: Less Ink, More Impact",
    searchQueries: ["minimalist tattoo ideas 2026", "simple tattoo designs", "minimal line tattoo"],
    relatedKeywords: ["simple tattoo", "minimal tattoo", "line tattoo", "tiny tattoo"],
    targetAudience: "People who prefer subtlety over boldness",
  },
  {
    id: "tattoo-dublin-guide",
    category: "culture",
    primaryKeyword: "getting a tattoo in Dublin",
    searchIntent: "Tourist or local looking for tattoo studios in Dublin",
    suggestedTitle: "Getting a Tattoo in Dublin: What to Know Before You Book",
    searchQueries: ["best tattoo studios Dublin", "getting tattooed in Dublin Ireland", "tattoo culture Dublin"],
    relatedKeywords: ["Dublin tattoo", "Ireland tattoo", "tattoo studio Dublin"],
    targetAudience: "People in Dublin looking for a studio",
  },
  {
    id: "travel-tattoos",
    category: "ideas",
    primaryKeyword: "travel tattoo ideas",
    searchIntent: "Wants a tattoo to commemorate travels or wanderlust",
    suggestedTitle: "Travel Tattoo Ideas: Ink Your Adventures",
    searchQueries: ["travel tattoo ideas 2026", "wanderlust tattoo designs", "adventure tattoo inspiration"],
    relatedKeywords: ["wanderlust tattoo", "compass tattoo", "map tattoo", "adventure tattoo"],
    targetAudience: "Travelers and adventure seekers",
  },
  {
    id: "tattoo-questions-answered",
    category: "firsttime",
    primaryKeyword: "questions to ask before getting a tattoo",
    searchIntent: "Preparing for their tattoo appointment",
    suggestedTitle: "12 Questions to Ask Before Getting a Tattoo",
    searchQueries: [
      "questions to ask tattoo artist",
      "what to know before getting a tattoo",
      "tattoo appointment preparation",
    ],
    relatedKeywords: ["tattoo consultation", "prepare for tattoo", "tattoo appointment"],
    targetAudience: "First-timers preparing for their appointment",
  },
  {
    id: "nature-tattoos",
    category: "ideas",
    primaryKeyword: "nature tattoo ideas",
    searchIntent: "Looking for nature-themed tattoo designs",
    suggestedTitle: "Nature Tattoo Ideas: Mountains, Waves, Trees and Beyond",
    searchQueries: ["nature tattoo designs 2026", "mountain tattoo ideas", "ocean wave tattoo inspiration"],
    relatedKeywords: ["mountain tattoo", "wave tattoo", "tree tattoo", "landscape tattoo"],
    targetAudience: "Nature lovers and outdoor enthusiasts",
  },
  {
    id: "animal-tattoos",
    category: "ideas",
    primaryKeyword: "animal tattoo ideas",
    searchIntent: "Looking for animal-themed tattoo designs and meanings",
    suggestedTitle: "Animal Tattoo Ideas: Meanings and Designs for Every Spirit",
    searchQueries: ["animal tattoo designs and meanings 2026", "wolf tattoo ideas", "lion tattoo inspiration"],
    relatedKeywords: ["wolf tattoo", "lion tattoo", "snake tattoo", "butterfly tattoo", "eagle tattoo"],
    targetAudience: "People who connect with animal symbolism",
  },
];

function normKw(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function getNextUnusedPillar(
  usedKeywords: string[],
  options?: { excludeIds?: string[]; preferCmsCategory?: string },
): ContentPillar | null {
  const usedSet = new Set(usedKeywords.map(normKw));
  const exclude = new Set(options?.excludeIds ?? []);
  const unused = CONTENT_PILLARS.filter(
    (p) => !usedSet.has(normKw(p.primaryKeyword)) && !exclude.has(p.id),
  );
  if (!unused.length) return null;

  const prefer = options?.preferCmsCategory;
  const preferred = prefer
    ? unused.filter((p) => pillarToCmsCategory(p.category) === prefer)
    : unused;
  const pool = preferred.length ? preferred : unused;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

export function pillarToCmsCategory(
  category: ContentPillar["category"],
): "cuidados" | "tendencias" | "bastidores" | "estilo" {
  if (category === "aftercare" || category === "firsttime") return "cuidados";
  if (category === "style" || category === "placement") return "estilo";
  if (category === "culture") return "bastidores";
  return "tendencias";
}

export function withCurrentYearQueries(pillar: ContentPillar): ContentPillar {
  const year = String(new Date().getFullYear());
  return {
    ...pillar,
    searchQueries: pillar.searchQueries.map((q) => q.replace(/\b20\d{2}\b/g, year)),
    primaryKeyword: pillar.primaryKeyword.replace(/\b20\d{2}\b/g, year),
  };
}
