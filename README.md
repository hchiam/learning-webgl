# Learning WebGL

Just one of the things I'm learning. <https://github.com/hchiam/learning>

Tutorials: <https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial> and <https://webglfundamentals.org>

Use your GPU to draw/animate 2D and 3D stuff in a `<canvas>`. More math-y 3D stuff (compared to just using the `canvas` API).

Examples: <https://github.com/mdn/webgl-examples/tree/gh-pages/tutorial>

`three.js` is a framework that makes it easier to build 3D apps and games by encapsulating WebGL: <https://threejs.org>

2 key things for WebGL: **positions** and **colours**.

GPU <- WebGL = rasterization engine <- vertex shader function (**positions**) + fragment shader function (**colours**) <- data <- 4 ways to give data to a shader:

1. buffers (binary data) and attributes (how to interpret the buffers)
2. uniforms (global variables)
3. textures (random-access arrays of data)
4. varyings (way for a vertex shader to pass data to be interpolated while running the fragment shader)

"Positions" are given in terms of "clip space" coordinates: (-1 to 1; -1 to 1).

## Try the demo

```bash
open index.html
```
