import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatrixDisplayComponent } from './components/matrix-display/matrix-display.component';
import * as THREE from 'three';
import { BASE_IDENTITY, BASE_R_X_90, BASE_R_Y_90, BASE_R_Z_90 } from './constants/rotationMatrices';
import { GameSceneComponent } from './components/components/game-scene/game-scene.component';
import { generateOctahedralGroup } from '../ultilities/octahedral-rotations';
import { GridStateService } from './components/services/grid-state.service';

@Component({
  selector: 'app-root',
  imports: [ MatrixDisplayComponent, GameSceneComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
// export class AppComponent {
//   title = 'tetromino-puzzle-solver';

//   // 1. The "Source of Truth" for the UI display
//   public activeMatrix = signal(new THREE.Matrix3().identity());

//   // 2. Define the dropdown options
//   public matrixOptions = [
//     { label: 'Identity', value: BASE_IDENTITY },
//     { label: 'Rx(90)',   value: BASE_R_X_90 },
//     { label: 'Ry(90)',   value: BASE_R_Y_90 },
//     { label: 'Rz(90)',   value: BASE_R_Z_90 }
//   ];

//   // 3. Handle the selection
//   onMatrixChange(event: Event) {
//     const selectElement = event.target as HTMLSelectElement;
//     const selectedIndex = selectElement.selectedIndex;
    
//     // Get the matrix from our options array based on index
//     const selectedMatrix = this.matrixOptions[selectedIndex].value;
    
//     // Update the signal with a clone to ensure reactivity
//     this.activeMatrix.set(selectedMatrix.clone());
//   }
// }

export class AppComponent {
  // Generate the 24 unique rotations once
  readonly matrixOptions = generateOctahedralGroup();

  constructor(private gridStateService: GridStateService){

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

  // generateValidPositions(){
  //   const matrixOptions = this.matrixOptions.map(namedRotation => namedRotation.matrix)
  //   console.log(this.gridStateService.generateIncidenceMatrix(matrixOptions))
  // }

  generateDLXGraph(){
    this.gridStateService.generateDLXGraph()
  }

  solve(){
    this.gridStateService.solve()
  }
}
