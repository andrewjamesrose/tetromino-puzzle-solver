import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatrixDisplayComponent } from './components/matrix-display/matrix-display.component';
import * as THREE from 'three';
import { BASE_IDENTITY, BASE_R_X_90, BASE_R_Y_90, BASE_R_Z_90 } from './constants/rotationMatrices';
import { generateOctahedralGroup } from '../ultilities/octahedral-rotations';
import { GridStateService } from './components/services/grid-state.service';
import { GameSceneComponent } from './components/components/scene/scene.component';

@Component({
  selector: 'app-root',
  imports: [MatrixDisplayComponent, GameSceneComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  // Generate the 24 unique rotations once
  readonly matrixOptions = generateOctahedralGroup();

  // 1. Create signals for the coordinates, initialized to 2
  readonly posX = signal<number>(2);
  readonly posY = signal<number>(2);
  readonly posZ = signal<number>(2);

  constructor(public gridStateService: GridStateService) {
    this.updateInitialSelection(this.selectedLabel(), this.posX(), this.posY(), this.posZ());
  }

  // Track the currently selected label
  private selectedLabel = signal<string>(this.matrixOptions[0].generatorPath);

  // Computed signal to get the actual NamedRotation object
  readonly activeRotation = computed(() =>
    this.matrixOptions.find(opt => opt.generatorPath === this.selectedLabel()) || this.matrixOptions[0]
  );

  // Provided for your sub-components
  readonly activeMatrix = computed(() => this.activeRotation().matrix);


  onMatrixChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedLabel.set(selectElement.value);
  }

  solve() {
    this.gridStateService.solve()
  }

  clearSolution() {
    this.gridStateService.clearSolution()
  }

  animateSolution() {
    this.gridStateService.animateSolution()
  }

  updateSpeed(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridStateService.delayMs.set(parseInt(value, 10));
  }

  updateInitialSelection(generatorPath: string, x: number, y: number, z: number) {
    this.selectedLabel.set(generatorPath)
    this.posX.set(x);
    this.posY.set(y);
    this.posZ.set(z);
    this.gridStateService.selectInitialPiece(generatorPath, x, y, z)
  }

}
