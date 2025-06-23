# Rocky Layer

The **rocky** layer boosts heights on steep terrain using a slope threshold and
boost factor. When enabled, steep regions become jagged cliffs for a more rugged
look.

**Parameters**
- `threshold` – slope value above which boosting occurs.
- `boost` – multiplier applied to heights that exceed the threshold.

Use the "Cliff Threshold" and "Cliff Boost" sliders in the UI to adjust these
values interactively.


Slope values are derived using central differences of the final elevation so
cliff detection corresponds to the fully deformed terrain.

