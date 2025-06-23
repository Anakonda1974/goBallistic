import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export function exportChunkOBJ(chunk) {
  if (!chunk.mesh) {
    chunk.createMesh();
  }
  const exporter = new OBJExporter();
  return exporter.parse(chunk.mesh);
}

export function exportChunkGLTF(chunk, options = { binary: false }) {
  if (!chunk.mesh) {
    chunk.createMesh();
  }
  if (typeof FileReader === 'undefined') {
    global.FileReader = class {
      constructor() {
        this.onloadend = null;
        this.result = null;
      }
      readAsDataURL(blob) {
        blob.arrayBuffer().then(buf => {
          const b64 = Buffer.from(buf).toString('base64');
          this.result = `data:${blob.type || 'application/octet-stream'};base64,${b64}`;
          if (this.onloadend) this.onloadend();
        });
      }
      readAsArrayBuffer(blob) {
        blob.arrayBuffer().then(buf => {
          this.result = buf;
          if (this.onloadend) this.onloadend();
        });
      }
    };
  }
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      chunk.mesh,
      (result) => {
        if (options.binary && result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          resolve(typeof result === 'string' ? result : JSON.stringify(result));
        }
      },
      (error) => reject(error),
      options
    );
  });
}
