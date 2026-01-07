import { Component, input, OnInit, inject } from '@angular/core';
import * as THREE from 'three';
import { GridStateService } from '../../services/grid-state.service';

@Component({
  selector: 'app-lattice',
  standalone: true,
  template: '' // No HTML, this is a logic component
})
export class LatticeComponent implements OnInit {
  scene = input.required<THREE.Scene>();
  private gridService = inject(GridStateService);

  ngOnInit() {
    this.createLattice();
  }

  private createLattice() {
    const size = this.gridService.SIZE;
    const count = this.gridService.TOTAL_CELLS;
    
    // 1. Create Geometry & Material
    // slightly smaller than 1.0 to leave a gap between cells
    const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95); 
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05, // Very faint "ghost" effect
      depthWrite: false, // Prevents z-fighting with the tetrominoes
    });

    // 2. Create InstancedMesh
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    
    // 3. Position every instance
    const dummy = new THREE.Object3D();
    let i = 0;

    // Offset to center the grid around (0,0,0)
    const offset = (size - 1) / 2; 

    for (let z = 0; z < size; z++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          // Position relative to center
          dummy.position.set(x - offset, y - offset, z - offset);
          dummy.updateMatrix();
          
          mesh.setMatrixAt(i, dummy.matrix);
          i++;
        }
      }
    }

    this.scene().add(mesh);
  }
}