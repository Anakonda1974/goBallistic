
export class Modifier {
  apply(x, y, z, prevHeight, context) {
    return prevHeight;
  }
}

export class FBMModifier extends Modifier {
  constructor(fnlInstance, amplitude = 1.0, frequency = 1.0, octaves = 5) {
    super();
    this.fnl = fnlInstance;
    this.amplitude = amplitude;
    this.frequency = frequency;
    this.octaves = octaves;
  }

  apply(x, y, z, prevHeight, context) {
    let value = 0;
    let amp = this.amplitude;
    let freq = this.frequency;

    let sx = x;
    let sy = y;
    let sz = z;
    if (context.warped) {
      sx = context.warped.x;
      sy = context.warped.y;
      sz = context.warped.z;
    }

    for (let i = 0; i < this.octaves; i++) {
      value += this.fnl.GetNoise(sx * freq, sy * freq, sz * freq) * amp;
      freq *= 2;
      amp *= 0.5;
    }

    return prevHeight + value;
  }
}

export class DomainWarpModifier extends Modifier {
  constructor(fnlInstance, intensity = 0.2) {
    super();
    this.fnl = fnlInstance;
    this.intensity = intensity;
  }

  apply(x, y, z, prevHeight, context) {
    const warp = this.fnl.GetNoise(x, y, z) * this.intensity;
    context.warped = { x: x + warp, y: y + warp, z: z + warp };
    return prevHeight;
  }
}

export class TerraceModifier extends Modifier {
  constructor(steps = 5, heightRange = 1.0) {
    super();
    this.steps = steps;
    this.heightRange = heightRange;
  }

  apply(x, y, z, prevHeight, context) {
    const normalized = (prevHeight + 1) / 2;
    const stepped =
      Math.round(normalized * (this.steps - 1)) / (this.steps - 1);
    return (stepped * 2 - 1) * this.heightRange;
  }
}

export class CliffModifier extends Modifier {
  constructor(slopeThreshold = 0.3, cliffBoost = 2.0) {
    super();
    this.threshold = slopeThreshold;
    this.boost = cliffBoost;
  }

  apply(x, y, z, prevHeight, context) {
    const slope = Math.abs((context.prevHeight ?? prevHeight) - prevHeight);
    if (slope > this.threshold) {
      return prevHeight * this.boost;
    }
    return prevHeight;
  }
}

export class PlateauModifier extends Modifier {
  constructor(threshold = 0.6, plateauFactor = 0.3) {
    super();
    this.threshold = threshold;
    this.factor = plateauFactor;
  }

  apply(x, y, z, prevHeight) {
    if (prevHeight > this.threshold) {
      return this.threshold + (prevHeight - this.threshold) * this.factor;
    }
    return prevHeight;
  }
}

export default class HeightmapStack {
  constructor(seed) {
    this.seed = seed;
    this.modifiers = [];
    this.context = {};
  }

  add(modifier) {
    this.modifiers.push(modifier);
  }

  getHeight(x, y, z) {
    const context = { ...this.context };
    let height = 0;
    for (const mod of this.modifiers) {
      context.prevHeight = height;
      height = mod.apply(x, y, z, height, context);
    }
    // Clamp to a sane range so later layers receive meaningful values
    // and geometry does not collapse or explode.
    return Math.max(-1, Math.min(1, height));
  }
}
