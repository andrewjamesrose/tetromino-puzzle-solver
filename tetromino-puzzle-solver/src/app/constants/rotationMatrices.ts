import * as THREE from 'three';

// Rotation around X-axis: 
// y -> z, z -> -y
export const R_X_90 = new THREE.Matrix3().set(
    1,  0,  0,
    0,  0, -1,
    0,  1,  0
  );
  
  // Rotation around Y-axis: 
  // x -> -z, z -> x
  export const R_Y_90 = new THREE.Matrix3().set(
    0,  0,  1,
    0,  1,  0,
   -1,  0,  0
  );
  
  // Rotation around Z-axis: 
  // x -> y, y -> -x
  export const R_Z_90 = new THREE.Matrix3().set(
    0, -1,  0,
    1,  0,  0,
    0,  0,  1
  );
  
  // Identity Matrix
  export const IDENTITY = new THREE.Matrix3().identity();