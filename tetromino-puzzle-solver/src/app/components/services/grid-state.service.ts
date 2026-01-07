import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GridStateService {
  public readonly SIZE = 6;
  public readonly TOTAL_CELLS = this.SIZE ** 3;

  // Converts a 3D coordinate (x, y, z) into a flat array index
  getIndex(x: number, y: number, z: number): number {
    return x + (y * this.SIZE) + (z * this.SIZE * this.SIZE);
  }

  // Converts a flat index back to 3D coordinates
  getCoords(index: number): { x: number, y: number, z: number } {
    const z = Math.floor(index / (this.SIZE * this.SIZE));
    const y = Math.floor((index - z * this.SIZE * this.SIZE) / this.SIZE);
    const x = index % this.SIZE;
    return { x, y, z };
  }
}