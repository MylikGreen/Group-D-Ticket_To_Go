// StudyOrganizer: the AI Study Material Organizer unit (Julie Nguyen, Group D)
// Units from M5-S1 Activity 3:
//   organizeMaterial(materials), categorizeByTopic(material),
//   generateSummary(material), suggestStudyPlan(studySet)
// A material looks like: { id, title, text }

// Keywords used to tag each material with a topic
const TOPIC_KEYWORDS = {
  Biology: ["cell", "dna", "gene", "organism", "photosynthesis", "protein", "evolution"],
  Chemistry: ["atom", "molecule", "reaction", "acid", "bond", "element", "compound"],
  "Computer Science": ["algorithm", "code", "function", "variable", "loop", "array", "software"],
  History: ["war", "empire", "revolution", "century", "king", "treaty", "president"],
  Math: ["equation", "derivative", "integral", "matrix", "fraction", "theorem", "probability"],
  Physics: ["force", "energy", "velocity", "gravity", "momentum", "mass", "acceleration"],
};
const GENERAL_TOPIC = "General";
const SUMMARY_MAX_LENGTH = 200;
const MINUTES_PER_MATERIAL = 15;

// Reads the text of a material, whether it is a string or { title, text }
function materialText(material) {
  if (typeof material === "string") return material;
  if (!material || typeof material !== "object") return "";
  return [material.title, material.text].filter(Boolean).join(". ");
}

// Returns topicTags for one material, for example ["Biology"]
function categorizeByTopic(material) {
  const words =
    materialText(material)
      .toLowerCase()
      .match(/[a-z]+/g) || [];
  const topicTags = Object.keys(TOPIC_KEYWORDS).filter((topic) =>
    TOPIC_KEYWORDS[topic].some(
      (keyword) => words.includes(keyword) || words.includes(keyword + "s"),
    ),
  );
  return topicTags.length > 0 ? topicTags : [GENERAL_TOPIC];
}

// Returns summaryText: the first two sentences, at most 200 characters
function generateSummary(material) {
  const text = (typeof material === "string" ? material : (material && material.text) || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";

  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
  let summaryText = sentences.slice(0, 2).join("").trim();

  if (summaryText.length > SUMMARY_MAX_LENGTH) {
    summaryText = summaryText.slice(0, SUMMARY_MAX_LENGTH - 3).trimEnd() + "...";
  }
  return summaryText;
}

// Groups materials into a studySet: [{ topic, materials: [...] }], sorted by topic
// Each material gets its topicTags and summaryText added
function organizeMaterial(materials) {
  if (!Array.isArray(materials)) return [];

  const groups = {};
  materials.forEach((material) => {
    if (!materialText(material).trim()) return; // skip empty materials

    const topicTags = categorizeByTopic(material);
    const item = {
      ...(typeof material === "string" ? { text: material } : material),
      topicTags,
      summaryText: generateSummary(material),
    };
    const topic = topicTags[0];
    (groups[topic] = groups[topic] || []).push(item);
  });

  return Object.keys(groups)
    .sort()
    .map((topic) => ({ topic, materials: groups[topic] }));
}

// Returns a studyPlan from a studySet: topics with the most material come first
function suggestStudyPlan(studySet) {
  if (!Array.isArray(studySet)) return [];

  return studySet
    .filter((group) => group && Array.isArray(group.materials) && group.materials.length > 0)
    .sort((a, b) => b.materials.length - a.materials.length || a.topic.localeCompare(b.topic))
    .map((group, i) => ({
      step: i + 1,
      topic: group.topic,
      materialCount: group.materials.length,
      minutes: group.materials.length * MINUTES_PER_MATERIAL,
    }));
}
