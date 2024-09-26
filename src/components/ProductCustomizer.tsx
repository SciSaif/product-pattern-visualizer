import { useRef, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import PatternSwatch from './PatternSwatch';

type ProductCustomizerProps = {
    productImage: string;
    patterns: string[];
};

const ProductCustomizer = ({ productImage, patterns }: ProductCustomizerProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
    const [patternSize, setPatternSize] = useState<number>(50); // Default pattern size
    const [blendingMode, setBlendingMode] = useState<string>('screen');

    // Function to resize canvas when the window resizes
    const resizeCanvas = () => {
        if (productImage && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            const img = new Image();
            img.onload = () => {
                const maxWidth = Math.min(800, window.innerWidth * 0.8); // Adjust maxWidth according to screen size
                const maxHeight = 500; // Set your desired max height
                const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);

                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                ctx?.clearRect(0, 0, canvas.width, canvas.height); // Clear previous canvas content
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw the product image
            };
            img.src = productImage;
        }
    };

    useEffect(() => {
        // Reset pattern when the product changes
        setSelectedPattern(null);
        resizeCanvas();
    }, [productImage]);

    const blendPixels = (src: number, dest: number, mode: string) => {
        switch (mode) {
            case 'screen':
                return 255 - ((255 - src) * (255 - dest)) / 255;
            case 'overlay':
                return src < 128
                    ? (src * dest * 2) / 255
                    : 255 - (2 * (255 - src) * (255 - dest)) / 255;

            default:
                return (src + dest) / 2; // Normal blending
        }
    };

    const applyPattern = (patternImage: string) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!ctx || !canvas) return;

        // Redraw the product image to remove the old pattern
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Create a temporary canvas to generate the pattern
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            if (!tempCtx) return;
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;

            const pattern = new Image();
            pattern.onload = () => {

                // Get the original dimensions of the pattern
                const originalPatternWidth = pattern.width;
                const originalPatternHeight = pattern.height;

                // Set a base pattern size (e.g., 50px) and scale based on the original size
                const basePatternSize = 300; // This will be your consistent pattern size
                const scaleX = basePatternSize / originalPatternWidth;
                const scaleY = basePatternSize / originalPatternHeight;

                // Adjust the scaling based on the user-selected pattern size
                const adjustedScaleX = scaleX * (patternSize / 100);
                const adjustedScaleY = scaleY * (patternSize / 100);

                // Scale and repeat the pattern to cover the canvas
                tempCtx.scale(adjustedScaleX, adjustedScaleY);
                const patternStyle = tempCtx.createPattern(pattern, 'repeat');
                if (patternStyle) {
                    tempCtx.fillStyle = patternStyle;
                    tempCtx.fillRect(0, 0, tempCanvas.width / adjustedScaleX, tempCanvas.height / adjustedScaleY);

                    const patternData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // Blend the pattern with the product image
                    for (let i = 0; i < data.length; i += 4) {
                        if (data[i + 3] > 0) { // Only modify non-transparent pixels
                            data[i] = blendPixels(data[i], patternData[i], blendingMode);
                            data[i + 1] = blendPixels(data[i + 1], patternData[i + 1], blendingMode);
                            data[i + 2] = blendPixels(data[i + 2], patternData[i + 2], blendingMode);
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);
                }
            };
            pattern.src = patternImage;
        };
        img.src = productImage;
    };

    useEffect(() => {
        if (selectedPattern) {
            applyPattern(selectedPattern);
        }
    }, [blendingMode]);

    const [, drop] = useDrop({
        accept: 'pattern',
        drop: (item: { pattern: string }) => {
            setSelectedPattern(item.pattern);
            applyPattern(item.pattern);
        },
    });

    const handlePatternSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPatternSize(Number(e.target.value)); // Update pattern size as slider changes
    };

    const handleMouseUp = () => {
        // Apply the pattern when the user releases the mouse after resizing
        if (selectedPattern) {
            applyPattern(selectedPattern);
        }
    };

    return (
        <div className="container max-w-4xl p-5 mx-auto">
            <div
                className="flex flex-col items-start justify-around mt-5 lg:flex-row"
                style={{ maxWidth: '1000px' }} // Set max width for the customizer
            >
                <div>

                    <div
                        className="p-2 border-2 border-gray-300 border-dashed"
                        ref={drop}
                        style={{ maxWidth: '100%', maxHeight: '600px' }}
                    >
                        <canvas ref={canvasRef} />

                    </div>
                    <div className="flex items-center mt-10 lg:mt-10 gap-x-5">
                        <label htmlFor="blendingMode" className="mr-2">
                            Blending Mode:
                        </label>
                        <select
                            id="blendingMode"
                            value={blendingMode}
                            onChange={(e) => setBlendingMode(e.target.value)}
                            className="p-2 border rounded-md"
                        >
                            <option value="screen">Screen</option>
                            <option value="normal">Normal</option>
                        </select>
                    </div>

                    <div className="mt-2">
                        <label htmlFor="patternSize" className="mr-2">Pattern Size:</label>
                        <input
                            id="patternSize"
                            type="range"
                            min="10"
                            max="200"
                            value={patternSize}
                            onChange={handlePatternSizeChange}
                            onMouseUp={handleMouseUp} // Apply pattern after resizing
                            className="w-full lg:w-auto"
                        />
                    </div>
                </div>

                <div className="max-w-sm p-5 mt-5 lg:mt-0">
                    <h2 className="mb-2 text-xl font-semibold">Patterns</h2>
                    <div className="flex flex-wrap gap-5">
                        {patterns.map((pattern) => (
                            <PatternSwatch key={pattern} pattern={pattern} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCustomizer;
