import { useRef, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import PatternSwatch from './PatternSwatch';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from './ui/label';
import { Card } from './ui/card';
import { blendPixels } from '@/utils';

type ProductCustomizerProps = {
    productImage: string;
    patterns: string[];
};

const ProductCustomizer = ({ productImage, patterns }: ProductCustomizerProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
    const [patternSize, setPatternSize] = useState<number>(50);
    const [blendingMode, setBlendingMode] = useState('screen');

    const resizeCanvas = () => {
        if (productImage && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            const img = new Image();
            img.onload = () => {
                const maxWidth = Math.min(800, window.innerWidth * 0.8);
                const maxHeight = 500;
                const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);

                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                ctx?.clearRect(0, 0, canvas.width, canvas.height);
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = productImage;
        }
    };

    const applyPattern = (patternImage: string) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!ctx || !canvas) return;

        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            if (!tempCtx) return;
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;

            const pattern = new Image();
            pattern.onload = () => {

                const originalPatternWidth = pattern.width;
                const originalPatternHeight = pattern.height;

                const basePatternSize = 300; // This will be the consistent pattern size
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

    const [, drop] = useDrop({
        accept: 'pattern',
        drop: (item: { pattern: string }) => {
            setSelectedPattern(item.pattern);
            applyPattern(item.pattern);
        },
    });

    const handlePatternSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPatternSize(Number(e.target.value));
    };

    const handleMouseUp = () => {
        // Apply the pattern when the user releases the mouse after resizing
        if (selectedPattern) {
            applyPattern(selectedPattern);
        }
    };

    const handlePatternSelect = (pattern: string) => {
        setSelectedPattern(pattern);
        applyPattern(pattern);
    };

    useEffect(() => {
        if (selectedPattern) {
            applyPattern(selectedPattern);
        }
    }, [blendingMode]);

    useEffect(() => {
        setSelectedPattern(null);
        resizeCanvas();
    }, [productImage]);

    return (
        <div className="container max-w-4xl p-5 mx-auto">
            <div
                className="flex flex-col items-start justify-around gap-5 mt-5 lg:flex-row"
                style={{ maxWidth: '1000px' }}
            >
                <div>

                    <div
                        className="p-2 border-2 border-gray-300 border-dashed"
                        ref={drop}
                        style={{ maxWidth: '100%', maxHeight: '600px' }}
                    >
                        <canvas ref={canvasRef} />

                    </div>

                </div>

                <Card className="flex flex-col w-full gap-3 p-5 mt-10 sm:mt-0 sm:max-w-sm">
                    <div>

                        <Label htmlFor="blending-mode">Blending Mode</Label>
                        <Select value={blendingMode} onValueChange={(value) => setBlendingMode(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue id='blending-mode' placeholder="Blending Mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Blending Mode</SelectLabel>
                                    <SelectItem value="screen">Screen</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1 pb-5 mt-2 border-b">
                        <Label htmlFor="pattern-size">Pattern Size</Label>

                        <input
                            id="pattern-size"
                            type="range"
                            min="10"
                            max="200"
                            value={patternSize}
                            onChange={handlePatternSizeChange}
                            onMouseUp={handleMouseUp}
                            onTouchEnd={handleMouseUp}
                            className="w-full lg:w-auto"
                        />
                    </div>
                    <h2 className="text-lg font-semibold ">Patterns</h2>
                    <div className="flex flex-wrap gap-5">
                        {patterns.map((pattern) => (
                            <PatternSwatch key={pattern} pattern={pattern} onPatternSelect={handlePatternSelect} />
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ProductCustomizer;
