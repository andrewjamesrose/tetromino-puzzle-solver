import { Injectable, signal } from '@angular/core';
import * as THREE from 'three';
import { generateOctahedralGroup } from '../../../ultilities/octahedral-rotations';
import { buildDLX, solveWithSymmetry } from '../../solver/solver';


// ***TO DO *** refactor
export interface RenderablePiece {
  matrix: THREE.Matrix3;
  position: [number, number, number];
  color: string;
}

@Injectable({ providedIn: 'root' })
export class GridStateService {
  public readonly SIZE = 6;
  public readonly TOTAL_CELLS = 216;

  // Create the signal to hold the final 54 pieces
  public solution = signal<RenderablePiece[]>([]);

  private isAnimating = false;

// Signal to hold the current animation delay (default 100ms)
public delayMs = signal<number>(100);


  // Your L-tetromino "Source of Truth"
  private readonly DEFAULT_SHAPE = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 2, 0),
    new THREE.Vector3(1, 0, 0)
  ];


  public rowMetadata: PlacementMetadata[] = [];

  // A signal to store just the one initial piece the user picked
  public initialPiece = signal<RenderablePiece | null>(null);
  
  // A signal to store the actual rowId for the solver to use later
  public initialRowId = signal<number | null>(null);


  readonly matrixOptions =  generateOctahedralGroup();

    /**
   * Generates all valid placements for the incidence matrix.
   * @param rotations The 24 unique Matrix3 octahedral rotations.
   */
generateValidPositions(rotations: THREE.Matrix3[]): number[][] {
  const validPlacements: number[][] = [];
  const seenPlacements = new Set<string>();
  this.rowMetadata = []; 

  rotations.forEach((matrix, rIdx) => {
    // 1. Pre-calculate rotated block positions relative to (0,0,0)
    const rotatedBlocks = this.DEFAULT_SHAPE.map(v => 
      v.clone().applyMatrix3(matrix).round() 
    );

    for (let z = 0; z < this.SIZE; z++) {
      for (let y = 0; y < this.SIZE; y++) {
        for (let x = 0; x < this.SIZE; x++) {
          
          const cellIndices: number[] = [];
          let isValid = true;

          for (const block of rotatedBlocks) {
            const nx = x + block.x;
            const ny = y + block.y;
            const nz = z + block.z;

            if (nx >= 0 && nx < this.SIZE && 
                ny >= 0 && ny < this.SIZE && 
                nz >= 0 && nz < this.SIZE) {
              cellIndices.push(getIndex(nx, ny, nz, this.SIZE));
            } else {
              isValid = false;
              break;
            }
          }

          if (isValid) {
            // We sort a copy to check for uniqueness without losing 
            // the link between the matrix/offset and the cells
            const sortedIndices = [...cellIndices].sort((a, b) => a - b);
            const key = sortedIndices.join(',');

            if (!seenPlacements.has(key)) {
              validPlacements.push(sortedIndices);
              
              // 2. RECORD TRANSFORMATIONS
              this.rowMetadata.push({
                rotationIndex: rIdx,
                rotationMatrix: matrix.clone(), // The specific rotation
                gridOffset: new THREE.Vector3(x, y, z), // The translation
                cellIndices: sortedIndices
              });

              seenPlacements.add(key);
            }
          }
        }
      }
    }
  });
  return validPlacements;
}

public selectInitialPiece(generatorPath: string, x: number, y: number, z: number) {
  // Find the row metadata that matches these user-friendly parameters
  const matchIndex = this.rowMetadata.findIndex(m => {
    // Find the rotation object by path to get its matrix
    // (Assuming you have access to your rotations array here)
    const rot = this.matrixOptions.find(r => r.generatorPath === generatorPath);
    
    return rot && 
           m.rotationIndex === this.matrixOptions.indexOf(rot) &&
           m.gridOffset.x === x &&
           m.gridOffset.y === y &&
           m.gridOffset.z === z;
  });
  

  console.log()

  if (matchIndex !== -1) {
    const data = this.rowMetadata[matchIndex];
    this.initialRowId.set(matchIndex);
    this.initialPiece.set({
      matrix: data.rotationMatrix,
      position: [data.gridOffset.x, data.gridOffset.y, data.gridOffset.z],
      color: '#ffffff' // Pure white to distinguish the "fixed" piece
    });
  } else {
    // This happens if the piece doesn't fit at that coordinate
    this.initialPiece.set(null);
    this.initialRowId.set(null);
  }
}

generateDLXGraph() {
  const rotationMatrices = this.matrixOptions.map(namedRotation => namedRotation.matrix)
  const validlacements = this.generateValidPositions(rotationMatrices)
  const dlxGrah = buildDLX(validlacements, this.SIZE * this.SIZE * this.SIZE)
  console.log(dlxGrah)
}

solve(){
    const rotationMatrices = this.matrixOptions.map(namedRotation => namedRotation.matrix)
    const validPlacements = this.generateValidPositions(rotationMatrices)
    console.log("valid placements", validPlacements)
    
    const dlxGraph = buildDLX(validPlacements, this.SIZE * this.SIZE * this.SIZE)
    const selectedId = this.initialRowId() ?? undefined;
    const solution = solveWithSymmetry(dlxGraph, this.rowMetadata, selectedId )
    
    console.log("solution array positions", solution)

    // *** TODO *** These variables need better names. Metadata is not ideal. Perhaps refactor so this is returned directly
    const solutionPositions = solution?.map(position => this.rowMetadata[position])
    console.log("solution positions", solutionPositions)

    if(solution){
    this.setSolution(solution)
  }
  }

  animateSolution() {
    const rotationMatrices = this.matrixOptions.map(namedRotation => namedRotation.matrix)
    const validPlacements = this.generateValidPositions(rotationMatrices)
    console.log("valid placements", validPlacements)
    
    const dlxGraph = buildDLX(validPlacements, this.SIZE * this.SIZE * this.SIZE)

    const selectedId = this.initialRowId() ?? undefined;
    const solution = solveWithSymmetry(dlxGraph, this.rowMetadata, selectedId)

    if(solution){
      this.setSolutionAnimated(solution)
    }
  }

  setSolution(rowIds: number[]) {
    const pieces: RenderablePiece[] = rowIds.map((id, i) => {
      const data = this.rowMetadata[id];
      return {
        matrix: data.rotationMatrix,
        position: [data.gridOffset.x, data.gridOffset.y, data.gridOffset.z],
        // Using HSL to ensure a good spread of distinct colors
        color: `hsl(${(i * 137.5) % 360}, 100%, 50%)`
      };
    });

    this.solution.set(pieces);
  }

  public clearSolution() {
    this.isAnimating = false; // Kill the loop
    this.solution.set([]);
  }

  public async setSolutionAnimated(rowIds: number[], delayMs: number = 100) {
    this.isAnimating = true;
    // 1. Clear any existing solution first
    this.solution.set([]);
  
    // 2. Map all IDs to their renderable data first
    const allPieces: RenderablePiece[] = rowIds.map((id, i) => {
      const data = this.rowMetadata[id];
      return {
        matrix: data.rotationMatrix,
        position: [data.gridOffset.x, data.gridOffset.y, data.gridOffset.z],
        color: `hsl(${(i * 137.5) % 360}, 100%, 50%)`
      };
    });
  
    // 3. Loop through and update the signal incrementally
    for (const piece of allPieces) {
      if (!this.isAnimating) break; // Stop if clear was called
      // Add the next piece to the existing array
      this.solution.update(current => [...current, piece]);
  
      // Wait for the specified delay before adding the next one
      await new Promise(resolve => setTimeout(resolve, this.delayMs()));
    }
  }

}


export function   getIndex(x: number, y: number, z: number, size: number): number {
  return x + (y * size) + (z * size * size);
}

export interface PlacementMetadata {
  rotationIndex: number;
  rotationMatrix: THREE.Matrix3;
  gridOffset: THREE.Vector3;
  cellIndices: number[]; // Optional, but helpful for reference
}

