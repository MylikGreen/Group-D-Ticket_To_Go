// Unit tests for the StudyOrganizer unit (js/studyOrganizer.js)
// Developer: Julie Nguyen (lunamiel), Group D, CS3203 Fall 2026
// Test names match the units from M5-S1 Activity 3:
//   Test organizeMaterial(), Test categorizeByTopic(),
//   Test generateSummary(), Test suggestStudyPlan()
// Run with: npm test

const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Load js/studyOrganizer.js the same way the browser does (a plain script)
const code = fs.readFileSync(path.join(__dirname, "..", "js", "studyOrganizer.js"), "utf8");
const StudyOrganizer = vm.createContext({});
vm.runInContext(code, StudyOrganizer);
const { organizeMaterial, categorizeByTopic, generateSummary, suggestStudyPlan } = StudyOrganizer;

// Compare values made inside the sandbox with plain values
const plain = (value) => JSON.parse(JSON.stringify(value));

const materials = [
  { id: "m1", title: "Cells", text: "The cell is the basic unit of life. DNA holds the genes." },
  { id: "m2", title: "Loops", text: "A loop repeats code. An array stores values in order." },
  { id: "m3", title: "Photosynthesis", text: "Plants turn light energy into sugar." },
  { id: "m4", title: "Notes", text: "Remember to bring a pencil." },
];

describe("Test categorizeByTopic()", () => {
  test("tags a biology note as Biology", () => {
    assert.deepEqual(plain(categorizeByTopic(materials[0])), ["Biology"]);
  });

  test("tags a coding note as Computer Science", () => {
    assert.deepEqual(plain(categorizeByTopic(materials[1])), ["Computer Science"]);
  });

  test("can give more than one topic", () => {
    const mixed = {
      title: "Mix",
      text: "A gene is coded in DNA. The force of gravity pulls mass.",
    };
    assert.deepEqual(plain(categorizeByTopic(mixed)), ["Biology", "Physics"]);
  });

  test("uses General when no topic matches", () => {
    assert.deepEqual(plain(categorizeByTopic(materials[3])), ["General"]);
  });

  test("handles empty or missing material", () => {
    assert.deepEqual(plain(categorizeByTopic(null)), ["General"]);
    assert.deepEqual(plain(categorizeByTopic("")), ["General"]);
  });
});

describe("Test generateSummary()", () => {
  test("keeps the first two sentences", () => {
    const material = { text: "First idea. Second idea. Third idea." };
    assert.equal(generateSummary(material), "First idea. Second idea.");
  });

  test("returns the whole text when it is short", () => {
    assert.equal(generateSummary("Only one sentence."), "Only one sentence.");
  });

  test("never goes over 200 characters", () => {
    const longText = "word ".repeat(100) + "end.";
    const summaryText = generateSummary({ text: longText });
    assert.ok(summaryText.length <= 200);
    assert.ok(summaryText.endsWith("..."));
  });

  test("returns an empty string for empty material", () => {
    assert.equal(generateSummary({ text: "   " }), "");
    assert.equal(generateSummary(undefined), "");
  });
});

describe("Test organizeMaterial()", () => {
  test("groups materials by topic, sorted by topic name", () => {
    const studySet = plain(organizeMaterial(materials));
    assert.deepEqual(
      studySet.map((group) => group.topic),
      ["Biology", "Computer Science", "General"],
    );
    assert.deepEqual(
      studySet[0].materials.map((m) => m.id),
      ["m1", "m3"],
    );
  });

  test("adds topicTags and summaryText to each material", () => {
    const studySet = plain(organizeMaterial(materials));
    const cells = studySet[0].materials[0];
    assert.deepEqual(cells.topicTags, ["Biology"]);
    assert.equal(cells.summaryText, "The cell is the basic unit of life. DNA holds the genes.");
  });

  test("skips empty materials", () => {
    const studySet = plain(organizeMaterial([{ title: "", text: "" }, materials[1]]));
    assert.equal(studySet.length, 1);
    assert.equal(studySet[0].materials.length, 1);
  });

  test("returns an empty list when input is not a list", () => {
    assert.deepEqual(plain(organizeMaterial(null)), []);
    assert.deepEqual(plain(organizeMaterial("notes")), []);
  });
});

describe("Test suggestStudyPlan()", () => {
  test("puts the topic with the most material first", () => {
    const studyPlan = plain(suggestStudyPlan(organizeMaterial(materials)));
    assert.deepEqual(studyPlan[0], {
      step: 1,
      topic: "Biology",
      materialCount: 2,
      minutes: 30,
    });
  });

  test("numbers the steps in order and gives 15 minutes per material", () => {
    const studyPlan = plain(suggestStudyPlan(organizeMaterial(materials)));
    assert.deepEqual(
      studyPlan.map((s) => [s.step, s.topic, s.minutes]),
      [
        [1, "Biology", 30],
        [2, "Computer Science", 15],
        [3, "General", 15],
      ],
    );
  });

  test("returns an empty plan for an empty or bad studySet", () => {
    assert.deepEqual(plain(suggestStudyPlan([])), []);
    assert.deepEqual(plain(suggestStudyPlan(undefined)), []);
  });
});
