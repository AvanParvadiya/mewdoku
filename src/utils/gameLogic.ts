export interface Position {
  row: number;
  col: number;
}

export interface Puzzle {
  size: number;
  regions: number[][]; // N x N grid, where regions[r][c] is the region ID (0 to N-1)
  solution: Position[]; // List of N positions where cats are placed
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master';
}

/**
 * Checks if a cat can be placed at (row, col) given other placed cats,
 * satisfying the row, column, and adjacency (no touching even diagonally) constraints.
 */
function isValidPlacement(row: number, col: number, placed: Position[]): boolean {
  for (const p of placed) {
    // Row constraint (implicitly handled if we place one per row, but good to check)
    if (p.row === row) return false;
    // Column constraint
    if (p.col === col) return false;
    // Adjacency constraint (no touching cardinally or diagonally)
    if (Math.abs(p.row - row) <= 1 && Math.abs(p.col - col) <= 1) return false;
  }
  return true;
}

/**
 * Backtracking algorithm to find all valid placements of N cats on a grid of size N
 * satisfying the basic row/col/adjacency constraints.
 */
export function generateValidPlacements(size: number): Position[] | null {
  const placements: Position[] = [];
  
  function backtrack(row: number): boolean {
    if (row === size) {
      return true;
    }
    
    // Randomize column choices for variation
    const cols = Array.from({ length: size }, (_, i) => i).sort(() => Math.random() - 0.5);
    
    for (const col of cols) {
      if (isValidPlacement(row, col, placements)) {
        placements.push({ row, col });
        if (backtrack(row + 1)) {
          return true;
        }
        placements.pop();
      }
    }
    return false;
  }
  
  // Try generating a few times because of randomization
  for (let attempt = 0; attempt < 50; attempt++) {
    if (backtrack(0)) {
      return placements;
    }
  }
  return null;
}

/**
 * Solver that counts the number of valid solutions for a given grid partition.
 * It uses backtracking, matching rows, columns, adjacent cells, and region constraints.
 */
export function solvePuzzle(size: number, regions: number[][], limit = 2): Position[][] {
  const solutions: Position[][] = [];
  const placed: Position[] = [];
  const usedCols = new Set<number>();
  const usedRegions = new Set<number>();

  function backtrack(row: number) {
    if (solutions.length >= limit) return;
    
    if (row === size) {
      solutions.push([...placed]);
      return;
    }

    for (let col = 0; col < size; col++) {
      if (usedCols.has(col)) continue;
      
      const region = regions[row][col];
      if (usedRegions.has(region)) continue;

      // Adjacency check
      let adjViolation = false;
      for (const p of placed) {
        if (Math.abs(p.row - row) <= 1 && Math.abs(p.col - col) <= 1) {
          adjViolation = true;
          break;
        }
      }
      if (adjViolation) continue;

      // Place
      placed.push({ row, col });
      usedCols.add(col);
      usedRegions.add(region);

      backtrack(row + 1);

      // Backtrack
      placed.pop();
      usedCols.delete(col);
      usedRegions.delete(region);
    }
  }

  backtrack(0);
  return solutions;
}

/**
 * Partitions a grid of size N into N connected regions.
 * Each region starts at one of the cat positions in the solution.
 */
function createRegions(size: number, solution: Position[]): number[][] {
  const regions = Array.from({ length: size }, () => Array(size).fill(-1));
  
  // Seed the regions at the solution positions
  const queue: { row: number; col: number; region: number }[] = [];
  solution.forEach((pos, idx) => {
    regions[pos.row][pos.col] = idx;
    queue.push({ row: pos.row, col: pos.col, region: idx });
  });

  // Random growth using a BFS-like queue expansion
  // We shuffle the queue to expand randomly
  const dirs = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ];

  while (queue.length > 0) {
    // Pick a random element from queue to expand
    const randIdx = Math.floor(Math.random() * queue.length);
    const curr = queue[randIdx];
    
    // Find all valid unassigned neighbors
    const neighbors: { row: number; col: number }[] = [];
    for (const [dr, dc] of dirs) {
      const nr = curr.row + dr;
      const nc = curr.col + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && regions[nr][nc] === -1) {
        neighbors.push({ row: nr, col: nc });
      }
    }

    if (neighbors.length === 0) {
      // No free neighbors, remove from queue
      queue.splice(randIdx, 1);
    } else {
      // Assign a random neighbor to this region
      const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      regions[neighbor.row][neighbor.col] = curr.region;
      queue.push({ row: neighbor.row, col: neighbor.col, region: curr.region });
    }
  }

  // Double check: if there are any orphaned -1 cells due to weird bounds, assign them to adjacent cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (regions[r][c] === -1) {
        // Find first valid neighbor
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && regions[nr][nc] !== -1) {
            regions[r][c] = regions[nr][nc];
            break;
          }
        }
      }
    }
  }

  return regions;
}

/**
 * Generates a puzzle of a given size with a unique solution.
 */
export function generatePuzzle(size: number): Puzzle {
  let attempts = 0;
  
  // Set difficulty description based on size
  let difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master' = 'medium';
  if (size === 5) difficulty = 'easy';
  else if (size === 6) difficulty = 'easy';
  else if (size === 7) difficulty = 'medium';
  else if (size === 8) difficulty = 'hard';
  else if (size === 9) difficulty = 'expert';

  while (attempts < 1000) {
    attempts++;
    // 1. Generate a valid cat layout
    const solution = generateValidPlacements(size);
    if (!solution) continue;

    // 2. Generate random regions around the cats
    const regions = createRegions(size, solution);

    // 3. Solve the puzzle to check for uniqueness
    const solutions = solvePuzzle(size, regions, 2);
    if (solutions.length === 1) {
      return {
        size,
        regions,
        solution,
        difficulty
      };
    }
  }

  // Fallback: if we exceed attempts, return a simple static pre-designed 5x5 board
  // to prevent locking up, although it should find one very quickly.
  console.warn("Using fallback puzzle generation");
  const fallbackSolution: Position[] = [
    { row: 0, col: 1 },
    { row: 1, col: 4 },
    { row: 2, col: 2 },
    { row: 3, col: 0 },
    { row: 4, col: 3 }
  ];
  const fallbackRegions = [
    [0, 0, 1, 1, 1],
    [0, 2, 2, 1, 1],
    [3, 2, 2, 2, 4],
    [3, 3, 2, 4, 4],
    [3, 3, 4, 4, 4]
  ];
  return {
    size: 5,
    regions: fallbackRegions,
    solution: fallbackSolution,
    difficulty: 'easy'
  };
}
