UIL.Knob = function( o ){

    UIL.Proto.call( this, o );

    //this.type = 'knob';
    this.autoWidth = false;

    this.setTypeNumber( o );

    this.mPI = Math.PI * 0.8;
    this.toDeg = 180 / Math.PI;
    this.cirRange = this.mPI * 2;

    this.radius = o.radius || 15;
    
    this.size = (this.radius*2)+20;

    if(o.size !== undefined){
        this.size = o.size;
        this.radius = ~~ (this.size-20)*0.5;
    }

    this.w = this.radius*2;
    this.height = this.radius*2;
    this.h = o.height || (this.height + 40);
    this.top = 0;

    this.c[0].style.width = this.size +'px';

    if(this.c[1] !== undefined) {

        this.c[1].style.width = this.size +'px';
        this.c[1].style.textAlign = 'center';
        this.top = 20;

    }

    this.percent = 0;

    this.c[2] = UIL.DOM('UIL text', 'div', 'text-align:center; top:'+(this.height+20)+'px; width:'+this.size+'px; color:'+ this.fontColor );

    this.c[3] = UIL.DOM('UIL svgbox', 'circle', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius-4, fill:'rgba(0,0,0,0.3)' });
    this.c[4] = UIL.DOM('UIL svgbox', 'circle', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; pointer-events:none;', { cx:this.radius, cy:this.radius*0.5, r:3, fill:this.fontColor });
    this.c[5] = UIL.DOM('UIL svgbox', 'path', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; pointer-events:none;', { d:this.makeGrad(), 'stroke-width':1, stroke:UIL.SVGC });
    
    UIL.DOM( null, 'circle', null, { cx:this.radius, cy:this.radius, r:this.radius*0.7, fill:UIL.bgcolor(UIL.COLOR, 1), 'stroke-width':1, stroke:UIL.SVGC }, this.c[3] );

    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.r = 0;

    this.init();

    this.update();

};

UIL.Knob.prototype = Object.create( UIL.Circular.prototype );
UIL.Knob.prototype.constructor = UIL.Knob;

UIL.Knob.prototype.move = function( e ){

    if( !this.isDown ) return;

    var x = this.radius - (e.clientX - this.rect.left);
    var y = this.radius - (e.clientY - this.rect.top);
    this.r = - Math.atan2( x, y );

    if( this.oldr !== null ) this.r = Math.abs(this.r - this.oldr) > Math.PI ? this.oldr : this.r;

    this.r = this.r > this.mPI ? this.mPI : this.r;
    this.r = this.r < -this.mPI ? -this.mPI : this.r;

    var steps = 1 / this.cirRange;
    var value = (this.r + this.mPI) * steps;

    var n = ( ( this.range * value ) + this.min ) - this.old;

    if(n >= this.step || n <= this.step){ 
        n = ~~ ( n / this.step );
        this.value = this.numValue( this.old + ( n * this.step ) );
        this.update( true );
        this.old = this.value;
        this.oldr = this.r;
    }

};

UIL.Knob.prototype.makeGrad = function(){

    var d = '';
    var startangle = Math.PI+this.mPI;
    var endangle = Math.PI-this.mPI;
    var step = (startangle-endangle)/this.radius;
    var r = this.radius;

    var a, x, y, x2, y2;

    for ( var i = 0; i <= this.radius; ++i ) {

        a = startangle-(step*i);
        x = r + Math.sin(a)*r;
        y = r + Math.cos(a)*r;
        x2 = r + Math.sin(a)*(r-3);
        y2 = r + Math.cos(a)*(r-3);
        d += 'M' + x + ' ' + y + ' L' + x2 + ' '+y2 + ' ';

    }

    return d;

};

UIL.Knob.prototype.update = function( up ){

    this.c[2].textContent = this.value;
    this.percent = (this.value - this.min) / this.range;

    this.rr = ( (this.percent*this.cirRange) - (this.mPI)) * this.toDeg;

    UIL.setSvg( this.c[4], 'transform', 'rotate('+this.rr+' '+this.radius+' '+this.radius+')' );

    if( up ) this.send();
    
};