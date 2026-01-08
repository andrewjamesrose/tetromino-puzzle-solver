import { IDENTITY, NamedRotation, Rx90, Ry90, Rz90 } from "../app/constants/rotationMatrices";

export function generateOctahedralGroup(): NamedRotation[] {  
    const generators = [
      Rx90,
      Ry90,
      Rz90
    ];
  
    const identity = IDENTITY;
    const discovered: NamedRotation[] = [identity];
    const queue: NamedRotation[] = [identity];
  
    let head = 0;
    while (head < queue.length) {
      const current = queue[head++];
  
      for (const gen of generators) {
        const nextMat = current.matrix.clone().multiply(gen.matrix.clone());
        
        // Sanitize matrix to pure integers (0, 1, -1)
        const te = nextMat.elements;
        for(let i=0; i<9; i++) te[i] = Math.round(te[i]) === 0 ? 0 : Math.round(te[i]);
  
        if (!discovered.some(existing => existing.equals(nextMat))) {
          const nextLabel = current.generatorPath === "Id" ? gen.generatorPath : `${current.generatorPath}*${gen.generatorPath}`;
          const nextRot = new NamedRotation(nextMat, nextLabel);
          
          discovered.push(nextRot);
          queue.push(nextRot);
        }
      }
    }
  
    return discovered;
  }