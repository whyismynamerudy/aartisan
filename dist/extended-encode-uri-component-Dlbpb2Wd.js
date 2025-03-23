function extendedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
        return "%" + c.charCodeAt(0).toString(16).toUpperCase();
    });
}

export { extendedEncodeURIComponent as e };
//# sourceMappingURL=extended-encode-uri-component-Dlbpb2Wd.js.map
