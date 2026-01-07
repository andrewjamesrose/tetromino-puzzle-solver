import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatrixDisplayComponent } from './components/matrix-display/matrix-display.component';
import * as THREE from 'three';
import { IDENTITY, R_X_90, R_Y_90, R_Z_90 } from './constants/rotationMatrices';
import { GameSceneComponent } from './components/components/game-scene/game-scene.component';

@Component({
  selector: 'app-root',
  imports: [ MatrixDisplayComponent, GameSceneComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tetromino-puzzle-solver';

  // 1. The "Source of Truth" for the UI display
  public activeMatrix = signal(new THREE.Matrix3().identity());

  // 2. Define the dropdown options
  public matrixOptions = [
    { label: 'Identity', value: IDENTITY },
    { label: 'Rx(90)',   value: R_X_90 },
    { label: 'Ry(90)',   value: R_Y_90 },
    { label: 'Rz(90)',   value: R_Z_90 }
  ];

  // 3. Handle the selection
  onMatrixChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = selectElement.selectedIndex;
    
    // Get the matrix from our options array based on index
    const selectedMatrix = this.matrixOptions[selectedIndex].value;
    
    // Update the signal with a clone to ensure reactivity
    this.activeMatrix.set(selectedMatrix.clone());
  }
}
