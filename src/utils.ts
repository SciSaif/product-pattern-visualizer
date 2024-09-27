export const blendPixels = (src: number, dest: number, mode: string) => {
    switch (mode) {
        case "screen":
            return 255 - ((255 - src) * (255 - dest)) / 255;
        case "overlay":
            return src < 128
                ? (src * dest * 2) / 255
                : 255 - (2 * (255 - src) * (255 - dest)) / 255;

        default:
            return (src + dest) / 2;
    }
};

