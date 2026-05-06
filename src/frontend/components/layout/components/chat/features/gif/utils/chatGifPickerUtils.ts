import type { GiphyGif } from "../../../../../../../services/GiphyService";

export const GIF_SEARCH_DEBOUNCE_MS = 350;
export const GIF_SCROLL_ROOT_MARGIN = "120px 0px";

export const getGifAspectRatio = (gif: GiphyGif) => {
    if (gif.width > 0 && gif.height > 0) {
        return `${gif.width} / ${gif.height}`;
    }

    return "1 / 1";
};
