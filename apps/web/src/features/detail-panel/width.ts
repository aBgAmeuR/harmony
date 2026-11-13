const KEY = "harmony-detail-width";

export const detailWidth = {
  read: () => Number(localStorage.getItem(KEY)) || 440,
  save: (pixels: number) => localStorage.setItem(KEY, String(Math.round(pixels))),
};
