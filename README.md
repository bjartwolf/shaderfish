# shaderfish

This started as a tesselation for fish using three.js, but somehow
it turned into a workshop for fragment shaders and ray marching...

Not sure how it happened.

Escher-fish-tesselation using bezier curves and vertex shaders in three.js

# Run

## Install deps

```npm install```

## Run

```npm run dev```

Just edit the shaders (the glsl files) and the results will reload automatically.

# Resources

On volumetric ray marching and ray marching in general:
<https://blog.maximeheckel.com/posts/real-time-cloudscapes-with-volumetric-raymarching/>

On three.js:
<https://threejs.org/manual/>

Ray marching
<https://michaelwalczyk.com/blog-ray-marching.html>

Fragment shaders in three js
<https://threejs.org/manual/#en/shadertoy>

<https://www.packtpub.com/product/learn-threejs-fourth-edition/9781803233871>

On threejs vertex shaders:
<https://github.com/mollerse/3d-visualization-workshop>

ook of shaders:
<https://thebookofshaders.com/>

Book on designing tesselations:
<https://www.amazon.com/Designing-Tessellations-Secrets-Interlocking-Patterns/dp/0809228661j>

The shader god

<https://iquilezles.org/>

## Cat demo

Design doc for cat demo:
I use this to allow for playing audio in the cat demo while developing.
The idea for the cat demo in the longer run is that it will be a sort of C64 inspired sprite
cat with the same color pallette. I should make it a C64 sprite which is 24x21 and allow for the
color pallette as the C64. The sound should also be C64 like, not a very strict SID emulation, but
all generated and when possible use timings and settings that is possible on the C64, max three
channes etc. The cat should also move restricted to resolution as if it moved in a C64 space,but
it might have some more freedom. It should move in "steps" locked to foot movement, but it could
be that it gets more or less pixels to move in...

The "modern" aspect of it will be mainly driven by two things:

- Using physics to simulate things going on by solving differential equations, ideally
with high accuracy, probably chaotic systems.
- Combining it with ray marching and smilar techniques to make the C64 cat experience things it never saw.

```powershell
 &"C:\Program Files\Google\Chrome\Application\chrome.exe" --autoplay-policy=no-user-gesture-required
```
