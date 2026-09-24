"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MagazineResourcePreloader = MagazineResourcePreloader;
function MagazineResourcePreloader(_a) {
    var _b, _c, _d;
    var resources = _a.resources;
    if (!resources)
        return null;
    return (<>
      {(_b = resources.fonts) === null || _b === void 0 ? void 0 : _b.filter(function (font) { return font.preload && font.src; }).map(function (font) { return (<link key={"font-".concat(font.id)} rel="preload" href={font.src} as="font" crossOrigin="anonymous"/>); })}
      {(_c = resources.images) === null || _c === void 0 ? void 0 : _c.filter(function (image) { return image.preload; }).map(function (image) {
            var _a;
            return (<link key={"image-".concat(image.id)} rel="preload" href={image.src} as="image" fetchPriority={(_a = image.fetchPriority) !== null && _a !== void 0 ? _a : "auto"}/>);
        })}
      {(_d = resources.styles) === null || _d === void 0 ? void 0 : _d.map(function (style) { return style.href
            ? <link key={"style-".concat(style.id)} rel="stylesheet" href={style.href}/>
            : style.cssText ? <style key={"style-".concat(style.id)}>{style.cssText}</style> : null; })}
    </>);
}
