"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/* eslint-disable import/no-anonymous-default-export */

global.SkiaViewApi = {
  views: {},
  web: true,
  registerView(nativeId, view) {
    this.views[nativeId] = view;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setJsiProperty(nativeId, name, value) {
    if (name === "picture") {
      this.views[`${nativeId}`].setPicture(value);
    }
  },
  requestRedraw(nativeId) {
    this.views[`${nativeId}`].redraw();
  },
  makeImageSnapshot(nativeId, rect) {
    return this.views[`${nativeId}`].makeImageSnapshot(rect);
  },
  makeImageSnapshotAsync(nativeId, rect) {
    return new Promise((resolve, reject) => {
      const result = this.views[`${nativeId}`].makeImageSnapshot(rect);
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Failed to make image snapshot"));
      }
    });
  }
};

// eslint-disable-next-line import/no-default-export
var _default = exports.default = {};
//# sourceMappingURL=NativeSkiaModule.web.js.map