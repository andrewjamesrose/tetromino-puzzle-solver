import * as THREE from 'three';

// Rotation around X-axis: 
// y -> z, z -> -y
export const BASE_R_X_90 = new THREE.Matrix3().set(
    1,  0,  0,
    0,  0, -1,
    0,  1,  0
  );
  
  // Rotation around Y-axis: 
  // x -> -z, z -> x
  export const BASE_R_Y_90 = new THREE.Matrix3().set(
    0,  0,  1,
    0,  1,  0,
   -1,  0,  0
  );
  
  // Rotation around Z-axis: 
  // x -> y, y -> -x
  export const BASE_R_Z_90 = new THREE.Matrix3().set(
    0, -1,  0,
    1,  0,  0,
    0,  0,  1
  );
  
  // Identity Matrix
  export const BASE_IDENTITY = new THREE.Matrix3().identity();

  export class NamedRotation {
    public signedPermutation: string;
    public schoenflies: string;
  
    constructor(
      public matrix: THREE.Matrix3,
      public generatorPath: string
    ) {
      this.signedPermutation = this.deriveSignedPermutation();
      this.schoenflies = this.deriveSchoenflies();
    }
  
    /**
     * Converts the matrix into a string like (+y, -x, +z)
     * This shows how the basis vectors are remapped.
     */
    private deriveSignedPermutation(): string {
      const e = this.matrix.elements;
      // THREE.Matrix3 elements are column-major:
      // [0] [3] [6]  <- Row 1 (x' result)
      // [1] [4] [7]  <- Row 2 (y' result)
      // [2] [5] [8]  <- Row 3 (z' result)
      
      const axes = ['x', 'y', 'z'];
      const result: string[] = [];
  
      // Check each row to see which original axis (column) it maps to
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const val = e[col * 3 + row];
          if (Math.round(val) === 1) result.push(`+${axes[col]}`);
          if (Math.round(val) === -1) result.push(`-${axes[col]}`);
        }
      }
      return `(${result.join(', ')})`;
    }
  
    /**
     * Uses the Trace and Axis to find the Schoenflies symbol (e.g., C4, C3, C2)
     */
    private deriveSchoenflies(): string {
      const e = this.matrix.elements;
      const trace = e[0] + e[4] + e[8];
      const roundedTrace = Math.round(trace);
  
      if (roundedTrace === 3) return "E"; // Identity
  
      // Trace = 1 + 2cos(theta)
      // If Trace = 1, cos(theta) = 0 -> 90 degrees (C4)
      if (roundedTrace === 1) return "C4"; 
      
      // If Trace = 0, cos(theta) = -0.5 -> 120 degrees (C3)
      if (roundedTrace === 0) return "C3";
      
      // If Trace = -1, cos(theta) = -1 -> 180 degrees (C2)
      if (roundedTrace === -1) {
          // Distinguish between C2 (face-centered) and C2' (edge-centered)
          // Face-centered 180s have a '1' on the diagonal
          const hasDiagonalOne = Math.round(e[0]) === 1 || Math.round(e[4]) === 1 || Math.round(e[8]) === 1;
          return hasDiagonalOne ? "C2" : "C2'";
      }
  
      return "Unknown";
    }
  
    equals(other: THREE.Matrix3, epsilon = 0.0001): boolean {
      const te = this.matrix.elements;
      const me = other.elements;
      for (let i = 0; i < 9; i++) {
        if (Math.abs(te[i] - me[i]) > epsilon) return false;
      }
      return true;
    }
  }

  export const Rx90 = new NamedRotation(
    BASE_R_X_90, 
    "Rx(90)"
  );
  export const Ry90 = new NamedRotation(
    BASE_R_Y_90, 
    "Ry(90)"
  );
  export const Rz90 = new NamedRotation(
    BASE_R_Z_90, 
    "Rz(90)"
  );
  export const IDENTITY = new NamedRotation(
    BASE_IDENTITY, 
    "Id"
  );
  

/**
 * Multiplies an array of NamedRotations.
 * Returns a new NamedRotation with combined product, path, permutation, and Schoenflies labels.
 */
export function multiplySequence(rotations: NamedRotation[]): NamedRotation {
    // If the array is empty, return a fresh Identity
    if (rotations.length === 0) {
      return new NamedRotation(new THREE.Matrix3().identity(), "Id");
    }
  
    // Start with a clone of the first matrix to avoid mutating original constants
    const resultMatrix = rotations[0].matrix.clone();
    const pathParts: string[] = [rotations[0].generatorPath];
  
    for (let i = 1; i < rotations.length; i++) {
      // Three.js multiply: resultMatrix = resultMatrix * nextMatrix
      resultMatrix.multiply(rotations[i].matrix);
      
      // Handle the "Id" label so we don't end up with "Id * Rx"
      if (rotations[i].generatorPath !== "Id") {
        pathParts.push(rotations[i].generatorPath);
      }
    }
  
    // Sanitize floating point errors before creating the new NamedRotation
    const te = resultMatrix.elements;
    for (let i = 0; i < 9; i++) {
      te[i] = Math.round(te[i]) === 0 ? 0 : Math.round(te[i]);
    }
  
    // Determine the final label string
    const finalPath = pathParts.filter(p => p !== "Id").join(" * ") || "Id";
  
    // The constructor will automatically derive signedPermutation and schoenflies
    return new NamedRotation(resultMatrix, finalPath);
  }