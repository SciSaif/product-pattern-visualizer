# Product pattern visualizer

## Overview

This Product pattern visualizer is a React-based web application that allows users to apply patterns to product images.
Users can drag and drop pattern swatches onto a product image, adjust the pattern size, and choose different blending modes to customize the appearance of the product.

## Features

-   Drag and drop pattern application
-   Adjustable pattern size
-   Multiple blending modes
-   Pattern wrapping simulation

## Core Algorithm: Pattern Application

The core of this application is the applyPattern function, which uses several techniques to apply a pattern to a product image:

1. Canvas Manipulation: The function uses multiple canvas elements to manipulate images:

-   A main canvas for the product image
-   A temporary canvas for pattern scaling and repetition
-   Another temporary canvas for the actual blending process

2. Pattern Scaling: The pattern is scaled based on a user-defined size (controlled by a slider):
```ts
const basePatternSize = 300;
const scaleX = basePatternSize / originalPatternWidth;
const scaleY = basePatternSize / originalPatternHeight;
const adjustedScaleX = scaleX * (patternSize / 100);
const adjustedScaleY = scaleY * (patternSize / 100);
```

3. Pattern Repetition: The scaled pattern is repeated to cover the entire canvas:
```ts
const patternStyle = tempCtx.createPattern(pattern, 'repeat');
```

4. Pixel-by-Pixel Blending: The function iterates over each pixel of the product image and blends it with the corresponding pixel from the pattern:
```ts
for (let i = 0; i < data.length; i += 4) {
  if (data[i + 3] > 0) { // Only modify non-transparent pixels
    data[i] = blendPixels(data[i], patternData[i], blendingMode);
    data[i + 1] = blendPixels(data[i + 1], patternData[i + 1], blendingMode);
    data[i + 2] = blendPixels(data[i + 2], patternData[i + 2], blendingMode);
  }
}
```

5. Blending Modes: The blendPixels function (imported from a utilities file) applies different blending algorithms based on the selected mode:

- Screen mode: result = 255 - ((255 - top) * (255 - bottom)) / 255
- Normal mode: Simple alpha blending

6. Transparency Handling: The algorithm only modifies non-transparent pixels of the product image, preserving the original shape and any transparent areas.


## Limitations and Future Improvements
The current implementation applies patterns uniformly across the product image, which may not realistically represent how a pattern would wrap around a 3D object. Future improvements could include:

1. Normal Map Integration: Using a normal map of the product to distort the pattern based on the surface orientation.
2. Displacement Mapping: Applying a height map to create more realistic texture wrapping.
3. UV Mapping: Implementing UV coordinates for more accurate pattern placement on complex shapes.
4. AI: Using machine learning algorithms to predict how a pattern would wrap around a 3D object based on a limited set of input images.

