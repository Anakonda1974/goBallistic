import assert from 'assert';
import FaceChunk from '../src/FaceChunk.js';
import GeometryBuilder from '../src/GeometryBuilder.js';
import { exportChunkOBJ, exportChunkGLTF } from '../src/utils/ExportUtils.js';

const builder = new GeometryBuilder({ getHeight: () => 0 }, 1);
const chunk = new FaceChunk('px', builder, 2);
chunk.createMesh();
const obj = exportChunkOBJ(chunk);

assert(obj.includes('\nv '));
console.log('Export chunk OBJ test passed.');

const gltf = await exportChunkGLTF(chunk);
assert(gltf.includes('"asset"'));
console.log('Export chunk GLTF test passed.');
