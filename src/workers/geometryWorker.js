import GeometryBuilder from '../GeometryBuilder.js';
import HeightmapStack, { FBMModifier, DomainWarpModifier, TerraceModifier, PlateauModifier, CliffModifier } from '../HeightmapStack.js';
import FastNoiseLite from 'fastnoise-lite';

self.onmessage = async (e) => {
  const { face, resolution, radius, seed } = e.data;
  const fnl = new FastNoiseLite(seed);
  fnl.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);
  const stack = new HeightmapStack(seed);
  stack.add(new DomainWarpModifier(fnl, 0.2));
  stack.add(new FBMModifier(fnl, 1.0, 1.2, 5));
  stack.add(new TerraceModifier(8, 0.8));
  stack.add(new PlateauModifier(0.5, 0.3));
  const builder = new GeometryBuilder(stack, radius);
  const progressCallback = (p) => self.postMessage({ progress: p });
  const geom = await builder.buildFaceAsync(face, resolution, progressCallback);
  const data = {
    position: geom.getAttribute('position').array,
    index: geom.getIndex().array,
  };
  self.postMessage({ done: true, ...data }, [data.position.buffer, data.index.buffer]);
};
