
// UUID generator
var uuid = (function() {
    var t = [];
    for (var i=0; i<256; i++) {
        t[i] = (i<16 ? '0' : '') + (i).toString(16);
    }
    return function () {
        var a = Math.random() * 0xffffffff|0;
        var b = Math.random() * 0xffffffff|0;
        var c = Math.random() * 0xffffffff|0;
        var d = Math.random() * 0xffffffff|0;
        return t[a&0xff] + t[a>>8&0xff] + t[a>>16&0xff] + t[a>>24&0xff] + '-' + 
            t[b&0xff] + t[b>>8&0xff] + '-' + t[b>>16&0x0f|0x40] + t[b>>24&0xff] + '-' + 
            t[c&0x3f|0x80] + t[c>>8&0xff] + '-' + t[c>>16&0xff] + t[c>>24&0xff] + 
            t[d&0xff] + t[d>>8&0xff] + t[d>>16&0xff] + t[d>>24&0xff];
    }
}());


