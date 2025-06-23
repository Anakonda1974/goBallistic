# Exporting Planet Geometry

You can export the geometry of a face chunk using the built-in OBJ exporter. This allows inspection or further processing of the generated terrain in external tools.

```
import PlanetManager from './src/PlanetManager.js';
import { exportChunkOBJ } from './src/utils/ExportUtils.js';

const manager = new PlanetManager(scene);
const chunk = manager.chunks[0];
const objText = exportChunkOBJ(chunk);
console.log(objText);
```

The returned string follows the standard OBJ format and can be saved to a file or downloaded in the browser.
