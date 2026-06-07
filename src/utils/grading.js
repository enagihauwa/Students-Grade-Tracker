export function calculateGrade(total) {
  if (total >= 70) return { grade: "A", gradePoint: 5.0 };
  if (total >= 60) return { grade: "B", gradePoint: 4.0 };
  if (total >= 50) return { grade: "C", gradePoint: 3.0 };
  if (total >= 45) return { grade: "D", gradePoint: 2.0 };
  if (total >= 40) return { grade: "E", gradePoint: 1.0 };
  return { grade: "F", gradePoint: 0.0 };
}

export function computeStats(students) {
  if (!students || students.length === 0) {
    return {
      totalStudents: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 },
      bestStudent: null,
      worstStudent: null,
    };
  }

  const totals = students.map((s) => s.total ?? 0);
  const sum = totals.reduce((a, b) => a + b, 0);
  const highest = Math.max(...totals);
  const lowest = Math.min(...totals);
  const average = sum / totals.length;

  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  students.forEach((s) => {
    const { grade } = calculateGrade(s.total ?? 0);
    gradeDistribution[grade]++;
  });

  const sorted = [...students].sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
  const bestStudent = sorted[0] || null;
  const worstStudent = sorted[sorted.length - 1] || null;

  return {
    totalStudents: students.length,
    averageScore: Number(average.toFixed(1)),
    highestScore: highest,
    lowestScore: lowest,
    gradeDistribution,
    bestStudent,
    worstStudent,
  };
}
