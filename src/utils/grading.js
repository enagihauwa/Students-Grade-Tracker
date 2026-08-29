export function calculateGrade(total) {
  if (total >= 70) return { grade: "A", gradePoint: 5.0 };
  if (total >= 60) return { grade: "B", gradePoint: 4.0 };
  if (total >= 50) return { grade: "C", gradePoint: 3.0 };
  if (total >= 45) return { grade: "D", gradePoint: 2.0 };
  if (total >= 40) return { grade: "E", gradePoint: 1.0 };
  return { grade: "F", gradePoint: 0.0 };
}

export function computeStats(students) {
  const empty = {
    totalStudents: 0,
    gradedCount: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 },
    bestStudent: null,
    worstStudent: null,
  };

  if (!students || students.length === 0) return empty;

  const graded = students.filter((s) => s.total != null);
  if (graded.length === 0) return { ...empty, totalStudents: students.length };

  const totals = graded.map((s) => s.total);
  const sum = totals.reduce((a, b) => a + b, 0);
  const highest = Math.max(...totals);
  const lowest = Math.min(...totals);
  const average = sum / totals.length;

  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  graded.forEach((s) => {
    const { grade } = calculateGrade(s.total);
    gradeDistribution[grade]++;
  });

  const sorted = [...graded].sort((a, b) => b.total - a.total);
  const bestStudent = sorted[0] || null;
  const worstStudent = sorted[sorted.length - 1] || null;

  return {
    totalStudents: students.length,
    gradedCount: graded.length,
    averageScore: Number(average.toFixed(1)),
    highestScore: highest,
    lowestScore: lowest,
    gradeDistribution,
    bestStudent,
    worstStudent,
  };
}
