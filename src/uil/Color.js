UIL.Color = function( o ){
    
    UIL.Proto.call( this, o );

    this.autoHeight = true;

    this.type = o.type || 'array';
    this.width = this.sb;
    this.oldWidth = 0;

    // color up or down
    this.side = o.side || 'down';
    this.holdTop = 0;
    
    this.wheelWidth = this.width*0.1;
    this.decal = this.h + 2;
    
    this.radius = (this.width - this.wheelWidth) * 0.5 - 1;
    this.square = Math.floor((this.radius - this.wheelWidth * 0.5) * 0.7) - 1;
    this.mid = Math.floor(this.width * 0.5 );
    this.markerSize = this.wheelWidth * 0.3;

    this.oldh = this.h;

    this.c[2] = UIL.DOM('UIL text', 'div',  'height:'+(this.h-4)+'px;' + 'border-radius:6px; pointer-events:auto; cursor:pointer; border:1px solid '+ UIL.Border );
 

    if(this.side === 'up'){
        this.decal = 5;
        this.c[2].style.top = 'auto';
        this.c[2].style.bottom = '2px';
    }

    this.c[3] = UIL.DOM('UIL', 'div', 'display:none' );
    this.c[4] = UIL.DOM('UIL', 'canvas', 'display:none;');
    this.c[5] = UIL.DOM('UIL', 'canvas', 'pointer-events:auto; cursor:pointer; display:none;');

    if(this.side === 'up') this.c[5].style.pointerEvents = 'none';

    this.c[4].width = this.c[4].height = this.width;
    this.c[5].width = this.c[5].height = this.width;

    this.ctxMask = this.c[4].getContext('2d');
    this.ctxOverlay = this.c[5].getContext('2d');
    this.ctxMask.translate(this.mid, this.mid);
    this.ctxOverlay.translate(this.mid, this.mid);

    this.hsl = null;
    this.value = '#ffffff';
    if( o.value !== undefined ){
        if(o.value instanceof Array) this.value = UIL.rgbToHex( o.value );
        else if(!isNaN(o.value)) this.value = UIL.hexToHtml( o.value );
        else this.value = o.value;
    }
    this.bcolor = null;
    this.isDown = false;
    this.isShow = false;

    this.c[2].events = [ 'click' ];
    this.c[5].events = [ 'mousedown', 'mousemove', 'mouseup', 'mouseout' ];

    this.setColor( this.value );

    this.init();

};

UIL.Color.prototype = Object.create( UIL.Proto.prototype );
UIL.Color.prototype.constructor = UIL.Color;

UIL.Color.prototype.handleEvent = function( e ) {

    e.preventDefault();
    e.stopPropagation();

    switch( e.type ) {
        case 'click': this.click(e); break;
        case 'mousedown': this.down(e); break;
        case 'mousemove': this.move(e); break;
        case 'mouseup': this.up(e); break;
        case 'mouseout': this.out(e); break;
    }

};

/////

UIL.Color.prototype.click = function( e ){

    if( !this.isShow ) this.show();
    else this.hide();

};

UIL.Color.prototype.up = function( e ){

    this.isDown = false;

};

UIL.Color.prototype.out = function( e ){

    this.hide();

};

UIL.Color.prototype.down = function( e ){

    if(!this.isShow) return;
    this.isDown = true;
    this.move( e );
    return false;

};

UIL.Color.prototype.move = function( e ){

    if(!this.isDown) return;

    this.offset = this.c[5].getBoundingClientRect();
    var pos = { x: e.pageX - this.offset.left - this.mid, y: e.pageY - this.offset.top - this.mid };
    this.circleDrag = Math.max(Math.abs(pos.x), Math.abs(pos.y)) > (this.square + 2);

    if ( this.circleDrag ) {
        var hue = Math.atan2(pos.x, -pos.y) / 6.28;
        this.setHSL([(hue + 1) % 1, this.hsl[1], this.hsl[2]]);
    } else {
        var sat = Math.max(0, Math.min(1, -( pos.x / this.square * 0.5) + .5) );
        var lum = Math.max(0, Math.min(1, -( pos.y / this.square * 0.5) + .5) );
        this.setHSL([this.hsl[0], sat, lum]);
    }

};


//////

UIL.Color.prototype.redraw = function(){
    this.oldWidth = this.width;
    this.drawCircle();
    this.drawMask();
    this.drawMarkers();
};

UIL.Color.prototype.show = function(){

    if(this.oldWidth!==this.width) this.redraw();
    this.isShow = true;
    this.h = this.width + this.oldh + 10;
    this.c[0].style.height = this.h+'px';

    if(this.side=='up'){ 
        this.holdTop = this.c[0].style.top.substring(0,this.c[0].style.top.length-2) * 1 || 'auto';
        if(!isNaN(this.holdTop)) this.c[0].style.top = (this.holdTop-(this.h-20))+'px';
        setTimeout(function(){this.c[5].style.pointerEvents = 'auto';}.bind(this), 100);
    }

    this.c[3].style.display = 'block';
    this.c[4].style.display = 'block';
    this.c[5].style.display = 'block';

    if( this.isUI ) UIL.main.calc( this.h-this.oldh );

};

UIL.Color.prototype.hide = function(){

    if( this.isUI ) UIL.main.calc( -(this.h-this.oldh) );
    this.isShow = false;
    this.h = this.oldh;
    if(this.side=='up'){ 
        if(!isNaN(this.holdTop)) this.c[0].style.top = (this.holdTop)+'px';
        this.c[5].style.pointerEvents = 'none';
    }
    this.c[0].style.height = this.h+'px';
    this.c[3].style.display = 'none';
    this.c[4].style.display = 'none';
    this.c[5].style.display = 'none';
    
};

UIL.Color.prototype.update = function( up ){
    this.invert = (this.rgb[0] * 0.3 + this.rgb[1] * .59 + this.rgb[2] * .11) <= 0.6;

    this.c[3].style.background = UIL.rgbToHex( UIL.hslToRgb([this.hsl[0], 1, 0.5]) );

    this.drawMarkers();
    
    this.value = this.bcolor;

    this.c[2].style.background = this.bcolor;
    this.c[2].textContent = UIL.htmlToHex(this.bcolor);

    
    var cc = this.invert ? '#fff' : '#000';
    
    this.c[2].style.color = cc;

    if(!up) return;

    if( this.type === 'array' ) this.send( this.rgb );
    if( this.type === 'rgb' ) this.send( UIL.htmlRgb( this.rgb ) );
    if( this.type === 'hex' ) this.send( UIL.htmlToHex( this.value ) );
    if( this.type === 'html' ) this.send();

};

UIL.Color.prototype.setColor = function( color ){

    var unpack = UIL.unpack(color);
    if (this.bcolor != color && unpack) {
        this.bcolor = color;
        this.rgb = unpack;
        this.hsl = UIL.rgbToHsl( this.rgb );
        this.update();
    }
    return this;

};

UIL.Color.prototype.setHSL = function( hsl ){

    this.hsl = hsl;
    this.rgb = UIL.hslToRgb( hsl );
    this.bcolor = UIL.rgbToHex( this.rgb );
    this.update( true );
    return this;

};

UIL.Color.prototype.calculateMask = function(sizex, sizey, outputPixel){
    var isx = 1 / sizex, isy = 1 / sizey;
    for (var y = 0; y <= sizey; ++y) {
        var l = 1 - y * isy;
        for (var x = 0; x <= sizex; ++x) {
            var s = 1 - x * isx;
            var a = 1 - 2 * Math.min(l * s, (1 - l) * s);
            var c = (a > 0) ? ((2 * l - 1 + a) * .5 / a) : 0;
            outputPixel(x, y, c, a);
        }
    }
};

UIL.Color.prototype.drawMask = function(){
    var size = this.square * 2, sq = this.square;
    var sz = Math.floor(size / 2);
    var buffer = document.createElement('canvas');
    buffer.width = buffer.height = sz + 1;
    var ctx = buffer.getContext('2d');
    var frame = ctx.getImageData(0, 0, sz + 1, sz + 1);

    var i = 0;
    this.calculateMask(sz, sz, function (x, y, c, a) {
        frame.data[i++] = frame.data[i++] = frame.data[i++] = c * 255;
        frame.data[i++] = a * 255;
    });

    ctx.putImageData(frame, 0, 0);
    this.ctxMask.drawImage(buffer, 0, 0, sz + 1, sz + 1, -sq, -sq, sq * 2, sq * 2);
};

UIL.Color.prototype.drawCircle = function(){
    var n = 24,r = this.radius, w = this.wheelWidth, nudge = 8 / r / n * Math.PI, m = this.ctxMask, a1 = 0, color1, d1;
    var ym, am, tan, xm, color2, d2, a2, ar;
    m.save();
    m.lineWidth = w / r;
    m.scale(r, r);
    for (var i = 0; i <= n; ++i) {
        d2 = i / n;
        a2 = d2 * Math.PI * 2;
        ar = [Math.sin(a1), -Math.cos(a1), Math.sin(a2), -Math.cos(a2)];
        am = (a1 + a2) * 0.5;
        tan = 1 / Math.cos((a2 - a1) * 0.5);
        xm = Math.sin(am) * tan, ym = -Math.cos(am) * tan;
        color2 = UIL.rgbToHex( UIL.hslToRgb([d2, 1, 0.5]) );
        if (i > 0) {
            var grad = m.createLinearGradient(ar[0], ar[1], ar[2], ar[3]);
            grad.addColorStop(0, color1);
            grad.addColorStop(1, color2);
            m.strokeStyle = grad;
            m.beginPath();
            m.moveTo(ar[0], ar[1]);
            m.quadraticCurveTo(xm, ym, ar[2], ar[3]);
            m.stroke();
        }
        a1 = a2 - nudge; 
        color1 = color2;
        d1 = d2;
    }
    m.restore();
};

UIL.Color.prototype.drawMarkers = function(){

    var m = this.markerSize, ra=this.radius, sz = this.width, lw = Math.ceil(m/ 4), r = m - lw + 1, c1 = this.invert ? '#fff' : '#000', c2 = this.invert ? '#000' : '#fff';
    var angle = this.hsl[0] * 6.28;
    var ar = [Math.sin(angle) * ra, -Math.cos(angle) * ra, 2 * this.square * (.5 - this.hsl[1]), 2 * this.square * (.5 - this.hsl[2]) ];
  
    var circles = [
        { x: ar[2], y: ar[3], r: m, c: c1,     lw: lw },
        { x: ar[2], y: ar[3], r: r, c: c2,     lw: lw + 1 },
        { x: ar[0], y: ar[1], r: m, c: '#fff', lw: lw },
        { x: ar[0], y: ar[1], r: r, c: '#000', lw: lw + 1 },
    ];
    this.ctxOverlay.clearRect(-this.mid, -this.mid, sz, sz);
    var i = circles.length;
    while(i--){
        var c = circles[i];
        this.ctxOverlay.lineWidth = c.lw;
        this.ctxOverlay.strokeStyle = c.c;
        this.ctxOverlay.beginPath();
        this.ctxOverlay.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
        this.ctxOverlay.stroke();
    }
};

UIL.Color.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    this.width = this.sb;
    this.wheelWidth = this.width*0.1;

    if( this.side === 'up' ) this.decal = 5;
    this.radius = (this.width - this.wheelWidth) * 0.5 - 1;
    this.square = Math.floor((this.radius - this.wheelWidth * 0.5) * 0.7) - 1;
    this.mid = Math.floor(this.width * 0.5 );
    this.markerSize = this.wheelWidth * 0.3;

    this.c[2].style.width = this.sb + 'px';
    this.c[2].style.left = this.sa + 'px';

    this.c[3].style.width = (this.square * 2 - 1) + 'px';
    this.c[3].style.height = (this.square * 2 - 1) + 'px';
    this.c[3].style.top = (this.mid+this.decal )-this.square + 'px';
    this.c[3].style.left = (this.mid+this.sa )-this.square + 'px';

    this.c[4].width = this.c[4].height = this.width;
    this.c[4].style.left = this.sa + 'px';
    this.c[4].style.top = this.decal + 'px';

    this.c[5].width = this.c[5].height = this.width;
    this.c[5].style.left = this.sa + 'px';
    this.c[5].style.top = this.decal + 'px';

    this.ctxMask.translate(this.mid, this.mid);
    this.ctxOverlay.translate(this.mid, this.mid);

    if( this.isShow ){ 
        this.redraw();
        this.h = this.width+30;
        this.c[0].height = this.h + 'px';
        if( this.isUI ) UIL.main.calc();
    }

};