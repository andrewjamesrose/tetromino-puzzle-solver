// Dancing Links Solver

import { PlacementMetadata } from "../components/services/grid-state.service";

export class Node {
    up: Node = this;
    down: Node = this;
    left: Node = this;
    right: Node = this;
    column: ColumnNode;
    rowId: number; // Index to map back to our rotation/position data
  
    constructor(column: ColumnNode, rowId: number) {
      this.column = column;
      this.rowId = rowId;
    }
  }
  
  export class ColumnNode extends Node {
    size: number = 0;
    name: string;
  
    constructor(name: string) {
      super(null as any, -1);
      this.column = this;
      this.name = name;
    }
  
    cover() {
      this.right.left = this.left;
      this.left.right = this.right;
      for (let i = this.down; i !== this; i = i.down) {
        for (let j = i.right; j !== i; j = j.right) {
          j.down.up = j.up;
          j.up.down = j.down;
          j.column.size--;
        }
      }
    }
  
    uncover() {
      for (let i = this.up; i !== this; i = i.up) {
        for (let j = i.left; j !== i; j = j.left) {
          j.column.size++;
          j.down.up = j;
          j.up.down = j;
        }
      }
      this.right.left = this;
      this.left.right = this;
    }
  }

  export function buildDLX(validPlacements: number[][], totalColumns: number): ColumnNode {
    const root = new ColumnNode("root");
    const columnNodes: ColumnNode[] = [];
  
    // Create column headers
    let lastColumn = root;
    for (let i = 0; i < totalColumns; i++) {
      const col = new ColumnNode(`C${i}`);
      col.left = lastColumn;
      col.right = root;
      lastColumn.right = col;
      root.left = col;
      columnNodes.push(col);
      lastColumn = col;
    }
  
    // Create nodes for each row
    validPlacements.forEach((row, rowId) => {
      let firstInRow: Node | null = null;
      row.forEach(colIndex => {
        const col = columnNodes[colIndex];
        const newNode = new Node(col, rowId);
  
        // Link vertically
        newNode.down = col;
        newNode.up = col.up;
        col.up.down = newNode;
        col.up = newNode;
        col.size++;
  
        // Link horizontally
        if (!firstInRow) {
          firstInRow = newNode;
        } else {
          newNode.left = firstInRow.left;
          newNode.right = firstInRow;
          firstInRow.left.right = newNode;
          firstInRow.left = newNode;
        }
      });
    });
  
    return root;
  }

  // export function solveWithSymmetry(root: ColumnNode, solution: number[] = [], rowMetadata: PlacementMetadata[]): number[] | null {
  //   // 1. Pick the first actual column (Cell 0)
  //   const firstCol = root.right as ColumnNode;
  //   if (firstCol === root) return [];
  
  //   // 2. Identify all rows that cover Cell 0
  //   // We want to filter these so we only pick rows using ONE specific rotation.
  //   // We'll use Rotation Index 0 as our "canonical" orientation.
  //   firstCol.cover();
  
  //   for (let row = firstCol.down; row !== firstCol; row = row.down) {
  //     // --- SYMMETRY BREAKING FILTER ---
  //     // Assuming you stored 'rotationId' on your row or node.
  //     // We only allow the search to start if the first piece is in Rotation 0.
  //     // If you don't have rotationId, you can skip rows based on a custom property.
  //     if (rowMetadata[row.rowId].rotationIndex !== 0) {
  //         continue; 
  //     }
  //     // --------------------------------
  
  //     solution.push(row.rowId);
  
  //     for (let node = row.right; node !== row; node = node.right) {
  //       node.column.cover();
  //     }
  
  //     // Now proceed with the standard recursive solver for the rest of the grid
  //     const result = solve(root, solution);
  //     if (result) return result;
  
  //     // Backtrack
  //     for (let node = row.left; node !== row; node = node.left) {
  //       node.column.uncover();
  //     }
  //     solution.pop();
  //   }
  
  //   firstCol.uncover();
  //   return null;
  // }

  function findNodeForRow(root: ColumnNode, rowId: number): Node | null {
    // Iterate through columns until we find a row matching our ID
    for (let col = root.right as ColumnNode; col !== root; col = col.right as ColumnNode) {
      for (let row = col.down; row !== col; row = row.down) {
        if (row.rowId === rowId) return row;
      }
    }
    return null;
  }

  export function solveWithSymmetry(
    root: ColumnNode, 
    rowMetadata: PlacementMetadata[],
    preSelectedRowId?: number // Optional: The rowId the user fixed in the UI
  ): number[] | null {
    
    const solution: number[] = [];
  
    // --- PRE-FIXED PIECE LOGIC ---
    if (preSelectedRowId !== undefined) {
      // Find any node in the DLX that belongs to this rowId
      const targetNode = findNodeForRow(root, preSelectedRowId);
      
      if (targetNode) {
        solution.push(preSelectedRowId);
        
        // Manually cover the columns occupied by this fixed piece
        targetNode.column.cover();
        for (let node = targetNode.right; node !== targetNode; node = node.right) {
          node.column.cover();
        }
        
        // Proceed directly to standard solve, skipping symmetry breaking 
        // because the user has already defined the "first" piece.
        const result = solve(root, solution);
        
        // Important: If you want to allow the UI to reset, 
        // you don't necessarily need to uncover here if the 
        // whole DLX is rebuilt on each solve attempt.
        return result;
      }
    }
  
    // --- STANDARD SYMMETRY BREAKING START (If no fixed piece) ---
    const firstCol = root.right as ColumnNode;
    if (firstCol === root) return [];
    firstCol.cover();
  
    for (let row = firstCol.down; row !== firstCol; row = row.down) {
      if (rowMetadata[row.rowId].rotationIndex !== 0) continue; 
  
      solution.push(row.rowId);
      for (let node = row.right; node !== row; node = node.right) {
        node.column.cover();
      }
  
      const result = solve(root, solution);
      if (result) return result;
  
      for (let node = row.left; node !== row; node = node.left) {
        node.column.uncover();
      }
      solution.pop();
    }
  
    firstCol.uncover();
    return null;
  }

export function solve(root: ColumnNode, solution: number[] = []): number[] | null {
    // If no columns left, we found a perfect cover!
    if (root.right === root) return [ ...solution ];
  
    // Choose the "best" column to reduce branching
    let col = chooseColumn(root);
    col.cover();
  
    for (let row = col.down; row !== col; row = row.down) {
      solution.push(row.rowId);
  
      for (let node = row.right; node !== row; node = node.right) {
        node.column.cover();
      }
  
      const result = solve(root, solution);
      if (result) return result; // Return first solution found
  
      // Backtrack
      for (let node = row.left; node !== row; node = node.left) {
        node.column.uncover();
      }
      solution.pop();
    }
  
    col.uncover();
    return null;
  }
  
  function chooseColumn(root: ColumnNode): ColumnNode {
    let minCol = root.right as ColumnNode;
    for (let c = root.right.right as ColumnNode; c !== root; c = c.right as ColumnNode) {
      if (c.size < minCol.size) minCol = c;
    }
    return minCol;
  }