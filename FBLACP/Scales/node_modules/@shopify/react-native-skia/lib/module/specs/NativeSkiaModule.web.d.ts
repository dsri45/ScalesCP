import type { ISkiaViewApi } from "../views/types";
import type { SkiaPictureView } from "../views/SkiaPictureView.web";
export type ISkiaViewApiWeb = ISkiaViewApi & {
    views: Record<string, SkiaPictureView>;
    registerView(nativeId: string, view: SkiaPictureView): void;
};
declare const _default: {};
export default _default;
