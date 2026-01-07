import { Component, input, OnInit, OnChanges, inject, SimpleChanges } from '@angular/core';
import * as THREE from 'three';
import { GridStateService } from '../../services/grid-state.service';

@Component({
  selector: 'app-tetromino',
  standalone: true,
  template: ''
})
export class TetrominoComponent implements OnInit, OnChanges {
  scene = input.required<THREE.Scene>();
  rotationMatrix = input.required<THREE.Matrix3>(); // New Input from Parent
  position = input.required<number[]>(); 

  private gridService = inject(GridStateService);
  private group = new THREE.Group();
  private blocks: THREE.Mesh[] = [];

  // The "Default" L-shape coordinates (Source of Truth)
  private readonly DEFAULT_SHAPE = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 2, 0),
    new THREE.Vector3(1, 0, 0)
  ];

  ngOnInit() {
    this.initBlocks();
    this.scene().add(this.group);
    this.applyTransformations();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Re-apply if either rotation or position changes
    if (changes['rotationMatrix'] || changes['position']) {
      this.applyTransformations();
    }
  }

  private initBlocks() {
    const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const material = new THREE.MeshPhongMaterial({ color: 0xffa500 });

    // Create 4 physical meshes and store them
    for (let i = 0; i < 4; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      this.blocks.push(mesh);
      this.group.add(mesh);
    }
  }

  private applyTransformations() {
    const matrix = this.rotationMatrix();
    const [gx, gy, gz] = this.position();
    const gridOffset = (this.gridService.SIZE - 1) / 2;

    // 1. Position the Group in the Grid
    this.group.position.set(gx - gridOffset, gy - gridOffset, gz - gridOffset);

    // 2. Rotate each block locally based on the Matrix3
    this.DEFAULT_SHAPE.forEach((defaultPos, index) => {
      const transformedPos = defaultPos.clone().applyMatrix3(matrix);
      this.blocks[index].position.copy(transformedPos);
    });
  }
}