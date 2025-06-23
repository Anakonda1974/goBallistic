# PlateauModifier

The `PlateauModifier` flattens terrain above a given threshold to create broad plateau regions.

**Parameters**
- `threshold` – height value above which the plateau effect starts.
- `factor` – how strongly heights above the threshold are compressed toward the threshold.

```
new PlateauModifier(0.5, 0.3);
```

This modifier is useful for generating tabletop mountains or mesas.
