import { Component, ElementRef, ViewChild, AfterViewInit, signal, input } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LatticeComponent } from '../lattice/lattice.component';
import { TetrominoComponent } from '../tetromino/tetromino.component';
import { GridStateService } from '../../services/grid-state.service';

@Component({
  selector: 'app-game-scene',
  standalone: true,
  imports: [LatticeComponent, TetrominoComponent],
  // template: `
  //   <div #canvasContainer class="scene-container"></div>
    
  //   @if (sceneSignal(); as scene) {
  //     <app-lattice [scene]="scene"></app-lattice>
      
  //     <app-tetromino 
  //   [scene]="scene" 
  //   [rotationMatrix]="rotationMatrix()" 
  //   [position]="[0, 0, 0]">
  // </app-tetromino>
  //   }
  // `,
  // template: './game-scene.component.html',
  // styles: [`
  //   .scene-container { width: 100%; height: 600px; display: block; }
  // `]

    templateUrl: './game-scene.component.html',
  styleUrl: './game-scene.component.scss'
})
export class GameSceneComponent implements AfterViewInit {
  @ViewChild('canvasContainer') containerRef!: ElementRef;
  
  // Signal to notify children when the scene is ready
  sceneSignal = signal<THREE.Scene | null>(null);

// 1. Define the input here to receive the matrix from the Root/Parent
rotationMatrix = input.required<THREE.Matrix3>();

  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;

  constructor(public gridStateService: GridStateService){

  }

  ngAfterViewInit() {
    this.initThree();
    this.animate();
  }

  private initThree() {
    const width = this.containerRef.nativeElement.clientWidth;
    const height = this.containerRef.nativeElement.clientHeight;

    // 1. Setup Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x202020); // Dark grey background

    // 2. Setup Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.set(-10, 10, 10); // Look from a corner

    // 3. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.containerRef.nativeElement.appendChild(this.renderer.domElement);

    // 4. Controls & Light
    new OrbitControls(this.camera, this.renderer.domElement);
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 10, 7);
    this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0x404040));

    // 5. Notify children that scene is ready
    this.sceneSignal.set(this.scene);
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  
  
}