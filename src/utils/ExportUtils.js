import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';

export function exportChunkOBJ(chunk) {
  if (!chunk.mesh) {
    chunk.createMesh();
  }
  const exporter = new OBJExporter();
  return exporter.parse(chunk.mesh);
}
