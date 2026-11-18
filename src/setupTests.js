// Polyfill JSDOM agar Toast UI Editor / Viewer dapat diuji di Vitest.
import '@testing-library/jest-dom/vitest'

// Canvas: dipakai Toast UI untuk mengukur teks.
HTMLCanvasElement.prototype.getContext = () => ({
  measureText: () => ({ width: 0 }),
  fillRect: () => {},
  clearRect: () => {},
  getImageData: () => ({ data: [] }),
  putImageData: () => {},
  createImageData: () => [],
  setTransform: () => {},
  drawImage: () => {},
  save: () => {},
  restore: () => {},
  fillText: () => {},
  scale: () => {},
  rotate: () => {},
  translate: () => {},
})

// matchMedia: tema gelap/terang.
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})

// Selection & Range: dipakai ProseMirror (WYSIWYG).
const emptyRect = { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }
Range.prototype.getBoundingClientRect = () => emptyRect
Range.prototype.getClientRects = () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] })
Element.prototype.scrollIntoView = () => {}

const selection = {
  rangeCount: 0,
  anchorNode: null,
  focusNode: null,
  addRange: () => {},
  removeAllRanges: () => {},
  getRangeAt: () => document.createRange(),
  collapse: () => {},
  extend: () => {},
  toString: () => '',
}
window.getSelection = () => selection
document.getSelection = () => selection
