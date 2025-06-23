# Exporting Planet Geometry

You can export the geometry of a face chunk using the built-in OBJ or GLTF exporters. This allows inspection or further processing of the generated terrain in external tools.

```
import PlanetManager from './src/PlanetManager.js';
import { exportChunkOBJ } from './src/utils/ExportUtils.js';

const manager = new PlanetManager(scene);
const chunk = manager.chunks[0];
const objText = exportChunkOBJ(chunk);
console.log(objText);
```

To export as [GLTF](https://github.com/KhronosGroup/glTF) instead:

```
import { exportChunkGLTF } from './src/utils/ExportUtils.js';

const gltfText = await exportChunkGLTF(chunk);
console.log(gltfText);
```

The returned string can be saved to a file or downloaded in the browser. For GLTF exports the text represents the glTF JSON document.
