export default class ChunkLODController {
  constructor(levelDistances = [50, 25, 10, 5]) {
    this.levelDistances = levelDistances;
  }

  getTargetLevel(distance) {
    for (let i = 0; i < this.levelDistances.length; i++) {
      if (distance > this.levelDistances[i]) return i;
    }
    return this.levelDistances.length;
  }
}
