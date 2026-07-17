const storedPlates = [
  "R-AB 1234",
  "R-CD 987",
  "M-XY 2024",
  "B-AA 1001",
  "B-AA 1002",
  "B-BC 4455",
  "M-AB 7788",
  "M-KL 330",
  "N-PQ 7711",
  "N-RS 8822",
  "A-TT 909",
  "A-UV 4567",
  "LA-ZZ 12",
  "S-PK 800",
  "F-MM 4321",
  "ER-TY 654",
  "R-BA 1234",
  "R-AB 1243",
  "R-AX 1234",
  "REG-PP 77",
];

function normalizePlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function getPrefixScore(query: string, candidate: string) {
  let score = 0;

  while (
    score < query.length &&
    score < candidate.length &&
    query[score] === candidate[score]
  ) {
    score += 1;
  }

  return score;
}

function getCharacterOverlapScore(query: string, candidate: string) {
  let score = 0;
  const remaining = candidate.split("");

  for (const char of query) {
    const index = remaining.indexOf(char);

    if (index >= 0) {
      score += 1;
      remaining.splice(index, 1);
    }
  }

  return score;
}

export function hasStoredPlate(plate: string) {
  const normalizedPlate = normalizePlate(plate);
  return storedPlates.some((storedPlate) => normalizePlate(storedPlate) === normalizedPlate);
}

export function getTopPlateMatches(plate: string, limit = 10) {
  const normalizedPlate = normalizePlate(plate);

  return storedPlates
    .map((storedPlate) => {
      const normalizedStoredPlate = normalizePlate(storedPlate);
      const exactIncludes =
        normalizedStoredPlate.includes(normalizedPlate) || normalizedPlate.includes(normalizedStoredPlate);
      const prefixScore = getPrefixScore(normalizedPlate, normalizedStoredPlate);
      const overlapScore = getCharacterOverlapScore(normalizedPlate, normalizedStoredPlate);
      const lengthPenalty = Math.abs(normalizedStoredPlate.length - normalizedPlate.length);
      const totalScore =
        (exactIncludes ? 100 : 0) + prefixScore * 10 + overlapScore * 3 - lengthPenalty;

      return {
        plate: storedPlate,
        score: totalScore,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((entry) => entry.plate);
}
