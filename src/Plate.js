export default class Plate {
  constructor(id, center, vector, type = 'oceanic') {
    this.id = id;
    this.center = center;
    this.vector = vector;
    this.type = type;
    this.vertices = [];
  }
}
