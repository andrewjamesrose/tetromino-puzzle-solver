import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { generateOctahedralGroup } from '../../../ultilities/octahedral-rotations';
import { buildDLX, solveWithSymmetry } from '../../solver/solver';

@Injectable({ providedIn: 'root' })
export class GridStateService {
  public readonly SIZE = 6;
  public readonly TOTAL_CELLS = 216;

  // Your L-tetromino "Source of Truth"
  private readonly DEFAULT_SHAPE = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 2, 0),
    new THREE.Vector3(1, 0, 0)
  ];

  /**
   * Generates all valid placements for the incidence matrix.
   * @param rotations The 24 unique Matrix3 octahedral rotations.
   */
  // private rowMetadata: number[] = []; 

  private rowMetadata: PlacementMetadata[] = []


  readonly matrixOptions =  generateOctahedralGroup();

// generateValidPositions(rotations: THREE.Matrix3[]): number[][] {
//   const validPlacements: number[][] = [];
//   const seenPlacements = new Set<string>();
//   this.rowMetadata = []; // Reset metadata

//   // Use the index 'rIdx' to track the rotation ID (0-23)
//   rotations.forEach((matrix, rIdx) => {
    
//     // 1. Pre-rotate the shape
//     const rotatedBlocks = this.DEFAULT_SHAPE.map(v => 
//       v.clone().applyMatrix3(matrix).round() 
//     );

//     for (let z = 0; z < this.SIZE; z++) {
//       for (let y = 0; y < this.SIZE; y++) {
//         for (let x = 0; x < this.SIZE; x++) {
          
//           const cellIndices: number[] = [];
//           let isValid = true;

//           for (const block of rotatedBlocks) {
//             const nx = x + block.x;
//             const ny = y + block.y;
//             const nz = z + block.z;

//             if (nx >= 0 && nx < this.SIZE && 
//                 ny >= 0 && ny < this.SIZE && 
//                 nz >= 0 && nz < this.SIZE) {
//               cellIndices.push(getIndex(nx, ny, nz, this.SIZE));
//             } else {
//               isValid = false;
//               break;
//             }
//           }

//           if (isValid) {
//             cellIndices.sort((a, b) => a - b);
//             const key = cellIndices.join(',');

//             if (!seenPlacements.has(key)) {
//               validPlacements.push(cellIndices);
//               // Store the rotation index for this specific row
//               this.rowMetadata.push(rIdx); 
//               seenPlacements.add(key);
//             }
//           }
//         }
//       }
//     }
//   });
//   return validPlacements;
// }

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

// generateValidPositions(){
//   const rotationMatrices = this.matrixOptions.map(namedRotation => namedRotation.matrix)
//   this.generateIncidenceMatrix(rotationMatrices)
// }

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
    const solution = solveWithSymmetry(dlxGraph, [], this.rowMetadata)
    
    console.log("solution array positions", solution)

    const solutionPositions = solution?.map(position => validPlacements[position])
    console.log("solution positions", solutionPositions)

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

