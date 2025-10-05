import { useViewModel } from "./src";

// Example demonstrating the new typed schema properties
const viewModel = useViewModel({
  names: ["Alice", "Bob", "Charlie"],
  scores: [85, 92, 78, 96, 81],
  title: "Student Grades",
  count: 0,
});

// ✅ These now work with full type safety - no more (as any) casts!

// Array methods with proper IntelliSense
const upperNames = viewModel.$names.map((name: string) => name.toUpperCase());
const highScores = viewModel.$scores.filter((score: number) => score > 90);
const totalScore = viewModel.$scores.reduce(
  (sum: number, score: number) => sum + score,
  0
);
const foundName = viewModel.$names.find((name: string) => name.startsWith("A"));

// Length property
const nameCount = viewModel.$names.length;
const scoreCount = viewModel.$scores.length;

// Non-array properties work as before
const titleValue = viewModel.$title.value;
const countValue = viewModel.$count.value;

// Array methods return undefined for non-array props (as expected)
const titleMap = viewModel.$title.map; // undefined
const countLength = viewModel.$count.length; // undefined

console.log("Typed schema properties working correctly!");
console.log({
  upperNames,
  highScores,
  totalScore,
  foundName,
  nameCount,
  scoreCount,
});
