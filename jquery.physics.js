/*
 * jPhysics 0.4 BETA
 * By Rafael C.P. (a.k.a. Kurama_Youko)
 * http://www.inf.ufrgs.br/~rcpinto/physics
 * http://plugins.jquery.com/project/jphysics
 * Created: 2008-11-01
 * Last Modified: 2010-27-02
 * Licensed under GPL v3
 * 
 * ------------------------------------------------
 * 
 * What's New:
 * - Initialize vectors with an array of elements
 * - Elementwise multiplication and division
 * - Scalar addition and subtraction
 * - Basic 3D physics with z-index
 * - Viscosity
 * - Buoyancy
 * - Collision detection
 * - Basic collision response
 * 
 * To Do:
 * - More vector operations (fromPolar (constructor), getAngle, getLength, distance, toUnity, dot, cross, etc...)
 * - Adding fixed accelerations to each element (like gravity, which doesn't change with different mass)
 * - Containers for simulations
 * - Collision response
 * - Friction
 * - More physics properties (elasticity, hardness, durability, etc...)
 * - Springs
 * - Joints
 * 
 * Help is always welcome! =)
 * Hope you'll enjoy this plugin!
 * Let me know if you make any interesting application with it.
 */

//----------------------------------------------------
// Vector Class
//----------------------------------------------------
jQuery.Vector = function() {
	//----------------------------------------------------
	// Initialization
	//----------------------------------------------------
	//0-dimension vector
	if (arguments.length == 0)
		var v = [];
	//Argument is the number of dimensions
	//Initializes with zeroes
	else if (arguments.length == 1 && !isNaN(arguments[0])) {
		var v = [];
		for (var i = 0; i < arguments[0]; ++i) {
			v[i] = 0;
		}
	}
	//Argument is an array with elements
	else if (arguments.length == 1 && arguments[0].length && !arguments[0].add) {
		var v = [];
		for (var i = 0; i < arguments[0].length; ++i) {
			v[i] = arguments[0][i];
		}
	}
	//Each argument is a vector element
	else
		var v = jQuery.makeArray(arguments);
		
	//----------------------------------------------------
	// Methods
	//----------------------------------------------------
	//Copies the vector
	v.copy = function() {
		var v2 = new $.Vector();
		$(v).each(function(i){v2[i] = v[i]});
		return v2;
	};
	//Is it a null vector? (made only of zeroes)
	v.isNull = function() {
		for (var i in v) {
			if (v[i] != 0) return false;
		}
		return true;
	};
	//Sum of 2 vectors or scalar addition to all elements
	v.add = function (v2) {
		var v3 = v.copy();
		//If v2 is a scalar, returns v with v2 added to all elements
		if (!isNaN(v2)) {
			$(v).each(function(i){v3[i] += v2});
			return v3;
		}
		//If v2 is a null vector, returns v copy
		if (v2.isNull()) return v3;
		//If v is a null vector, returns v2 copy
		if (v.isNull()) return v2.copy();
		//Else, normal sum
		$(v).each(function(i){v3[i] += v2[i]});
		return v3;
	};
	//Difference of 2 vectors or scalar subtraction from all elements
	v.sub = function (v2) {
		var v3 = v.copy();
		//If v2 is a scalar, returns v with v2 subtracted from all elements
		if (!isNaN(v2)) {
			$(v).each(function(i){v3[i] -= v2});
			return v3;
		}
		//If v2 is a null vector, returns v copy
		if (v2.isNull()) return v3;
		//If v is a null vector, returns v2 copy
		if (v.isNull()) return v2.copy();
		//Else, normal subtraction
		$(v).each(function(i){v3[i] -= v2[i]});
		return v3;
	};
	//Vector scalar multiplication or elementwise vector multiplication
	v.mul = function (x) {
		//If x == 0, return null vector with same dimensions of v
		if (x == 0) return new $.Vector(v.length);
		var v2 = v.copy();
		//If x == 1, return copy of v
		if (x == 1) return v2;
		//If x is a vector, elementwise multiplication
		if (x.length == v.length) {
			$(v).each(function(i){v2[i] *= x[i]});
			return v2;
		}
		//Else, normal multiplication
		$(v).each(function(i){v2[i] *= x});
		return v2;
	};
	//Vector scalar division or elementwise vector division
	v.div = function (x) {
		//If x == 0, return null
		if (x == 0) return null;
		//If x is a vector, elementwise division
		if (x.length == v.length) {
			var v2 = v.copy();
			$(v).each(function(i){v2[i] /= x[i]});	//May have undefined element with division by zero
			return v2;
		}
		//Else, return mul(1/x)
		return v.mul(1/x);
	};
	//Elementwise maximum between 2 vectors
	v.max = function (v2) {
		var v3 = v.copy();
		$(v).each(function(i){v3[i] = Math.max(v[i],v2[i])});
		return v3;
	};
	//Elementwise minimum between 2 vectors
	v.min = function (v2) {
		var v3 = v.copy();
		$(v).each(function(i){v3[i] = Math.min(v[i],v2[i])});
		return v3;
	};
	//Bounds the vector by 2 other limiting vectors
	v.bound = function (min,max) {
		return v.min(max).max(min);
	};
	return v;
};

//----------------------------------------------------
// $(selector).physics(obj)
// Applies physics properties to selected elements
//----------------------------------------------------
jQuery.fn.physics = function(params) {
	this.each(function(i){
		//Defaults for first time (without physics properties) (when not in 'params')
		if (!this.position) {
			this.style.position = 'absolute';
			if (!params.position) this.position = new $.Vector(parseFloat($(this).css('left')),parseFloat($(this).css('top')));
			if (!params.velocity) this.velocity = new $.Vector(0,0);
			if (!params.acceleration) this.acceleration = new $.Vector(0,0);
			if (!params.minPosition) this.minPosition = new $.Vector(-Infinity,-Infinity);
			if (!params.maxPosition) this.maxPosition = new $.Vector(Infinity,Infinity);
			if (!params.minVelocity) this.minVelocity = new $.Vector(-Infinity,-Infinity);
			if (!params.maxVelocity) this.maxVelocity = new $.Vector(Infinity,Infinity);
			if (!params.minAcceleration) this.minAcceleration = new $.Vector(-Infinity,-Infinity);
			if (!params.maxAcceleration) this.maxAcceleration = new $.Vector(Infinity,Infinity);
			if (!params.mass) this.mass = 1;
			if (!params.viscosity) this.viscosity = 0;
			//Methods
			this.getSize = function() {
				return {width: parseFloat($(this).css('width')), height: parseFloat($(this).css('height'))};
			}
			this.getVolume = function() {
				var size = this.getSize();
				return size.width * size.height;
			}
			this.getDensity = function() {
				return this.mass / this.getVolume();
			}
			this.getBounds = function() {
				var size = this.getSize();
				return {left: this.position[0], top: this.position[1], right: this.position[0] + size.width - 1, bottom: this.position[1] + size.height - 1};
			}
			this.getOverlapWith = function(obj) {
				var bounds1 = this.getBounds();
				var bounds2 = obj.getBounds();
				var l = Math.max(bounds1.left,bounds2.left);
				var r = Math.min(bounds1.right,bounds2.right);
				var t = Math.max(bounds1.top,bounds2.top);
				var b = Math.min(bounds1.bottom,bounds2.bottom);
				var w = r - l + 1;
				var h = b - t + 1;
				var v = w * h;
				return {left: l, top: t, right: r, bottom: b, width: w, height: h, volume: v};
			}
		}
		//Use 'params' where possible
		if (params.position) this.position = params.position;
		if (params.velocity) this.velocity = params.velocity;
		if (params.acceleration) this.acceleration = params.acceleration;
		if (params.minPosition) this.minPosition = params.minPosition;
		if (params.maxPosition) this.maxPosition = params.maxPosition;
		if (params.minVelocity) this.minVelocity = params.minVelocity;
		if (params.maxVelocity) this.maxVelocity = params.maxVelocity;
		if (params.minAcceleration) this.minAcceleration = params.minAcceleration;
		if (params.maxAcceleration) this.maxAcceleration = params.maxAcceleration;
		if (params.mass) this.mass = params.mass;
		if (params.viscosity) this.viscosity = params.viscosity;
		if (!this.position[0] || isNaN(this.position[0])) this.position[0] = 0;
		if (!this.position[1] || isNaN(this.position[1])) this.position[1] = 0;
		this.style.left = Math.round(this.position[0])+'px';
		this.style.top = Math.round(this.position[1])+'px';
	});
	return this;
};

//----------------------------------------------------
// $(selector).applyForces()
// Applies forces to selected elements
//----------------------------------------------------
jQuery.fn.applyForces = function() {
	//Passing an array of forces
	if (arguments.length == 1 && arguments[0].length && !arguments[0].add)
		var forces = arguments[0];
	//Passing each force as a parameter
	else
		var forces = $.makeArray(arguments);
	//No forces, nothing to do
	if (forces.length == 0) return this;
	//Sums up all forces
	var result_force = new $.Vector(forces[0].length);
	$(forces).each(function(){
		result_force = result_force.add(this);
	});
	//Applies result_force to each selected element
	// a = F/m
	this.each(function(){
		if (this.mass != 0)
			this.acceleration = result_force.div(this.mass).bound(this.minAcceleration,this.maxAcceleration);
	});
	return this;
};

//----------------------------------------------------
// $(selecto).addAccelerations()
// Adds accelerations to selected elements
//----------------------------------------------------
jQuery.fn.addAccelerations = function() {
	//Passing an array of accelerations
	if (arguments.length == 1 && arguments[0].length && !arguments[0].add)
		var accels = arguments[0];
	//Passing each accel as a parameter
	else
		var accels = $.makeArray(arguments);
	//No accels, nothing to do
	if (accels.length == 0) return this;
	//Sums up all accels
	var result_accel = new $.Vector(accels[0].length);
	$(accels).each(function(){
		result_accel = result_accel.add(this);
	});
	//Applies accels to each selected element
	this.each(function(){
		this.acceleration = this.acceleration.add(result_accel.bound(this.minAcceleration,this.maxAcceleration));
	});
	return this;
};

//----------------------------------------------------
// $(selector).updatePhysics(time)
// Updates physics properties for selected elements
//----------------------------------------------------
jQuery.fn.updatePhysics = function(time) {
	if (!time) time = 1;	//Default time step = 1
	//Updates element CSS position based on its physics position
	var halfTime = time*0.5;
	this.each(function(i){
		var old_velocity = this.velocity.copy();
		// v = v0 + a*t
		this.velocity = this.velocity.add(this.acceleration.mul(time)).bound(this.minVelocity,this.maxVelocity);
		// s = s0 + t/2(v0+v)
		this.position = this.position.add(this.velocity.add(old_velocity).mul(halfTime)).bound(this.minPosition,this.maxPosition);
		//this.position = this.position.add(old_velocity.mul(time).add(this.acceleration.mul(time*time/2))).bound(this.minPosition,this.maxPosition);
	});
	return this;
};

//----------------------------------------------------
// $(selector).updatePhysicsCSS()
// Updates styles of physics enabled elements
//----------------------------------------------------
jQuery.fn.updatePhysicsCSS = function() {
	this.each(function(i){
		var elm = $(this);
		var oldx = elm.css('left');
		var oldy = elm.css('top');
		var newx = Math.round(this.position[0])+'px';
		var newy = Math.round(this.position[1])+'px';
		var obj = {};
		//Ensures only modified values are updated
		if (oldx != newx) obj.left = newx;
		if (oldy != newy) obj.top = newy;
		if (obj.left || obj.top) elm.css(obj);
	});
	return this;
}

//----------------------------------------------------
// $(selector).setCollisionHandler(handler)
// Set elements collision handler function ( handler(obj) )
//----------------------------------------------------
jQuery.fn.setCollisionHandler = function(handler) {
	this.each(function(i){
		this.onCollision = handler;
	});
	return this;
}

//----------------------------------------------------
// $(selector).handleCollisionsWith(selector,[callbackBefore],[callbackAfter])
// Handle colliding elements
//----------------------------------------------------
jQuery.fn.handleCollisionsWith = function(selector,callbackBefore,callbackAfter) {
	var i, j, elm1, elm2, colliders = $(selector), l1, r1, t1, b1, w1, h1, l2, r2, t2, b2, w2, h2, overlap, bounds1, bounds2, size1, size2;
	for (i = 0; i < this.size(); i++) {
		elm1 = this.get(i);
		//Excludes massless objects
		if (!elm1.mass) continue;
		bounds1 = elm1.getBounds();
		size1 = elm1.getSize();
		l1 = bounds1.left;
		w1 = size1.width;
		r1 = bounds1.right;
		t1 = bounds1.top;
		h1 = size1.height;
		b1 = bounds1.bottom;
		for (j = 0; j < colliders.size(); j++) {
			elm2 = colliders.get(j);
			if (!elm2.mass || (elm1 == elm2)) continue;

			if (elm1.onCollision) elm1.onCollision(elm2);
			if (elm2.onCollision) elm2.onCollision(elm1);

			//callbackBefore may return false to cancel default handling
			if (callbackBefore && !callbackBefore(elm1,elm2)) continue;
			
			overlap = elm1.getOverlapWith(elm2);
			bounds2 = elm2.getBounds();
			size2 = elm2.getSize();

			l2 = bounds2.left;
			w2 = size2.width;
			r2 = bounds2.right;
			t2 = bounds2.top;
			h2 = size2.height;
			b2 = bounds2.bottom;
			if (
				//X
				(l1 <= r2+1) && (r1 >= l2-1) &&
				//Y
				(t1 <= b2+1) && (b1 >= t2-1)
			) { 

				//Buoyancy
				if (elm2.viscosity < 1) {
					var immh = Math.min(overlap.height,h1);
					var immvol = immh * w1;
					var d2 = elm2.getDensity();
					var displacedweight = immvol * d2 * -elm1.acceleration[1];
					var buoyancy_acc = new $.Vector(0,displacedweight/elm1.mass);
					elm1.acceleration = elm1.acceleration.add(buoyancy_acc).bound(elm1.minAcceleration,elm1.maxAcceleration);
				}
				//Viscosity
				if (elm2.viscosity > 0 && elm2.viscosity < 1) {
					var viscosity_acc = elm1.velocity.mul(-elm2.viscosity/elm1.mass);
					elm1.acceleration = elm1.acceleration.add(viscosity_acc).bound(elm1.minAcceleration,elm1.maxAcceleration);
				}
				//Overlap handling
				if (elm2.viscosity == 1) {	//Solid
					var distleft = r1 - l2;
					var distright = r2 - l1;
					var disttop = b1 - t2;
					var distbottom = b2 - t1;
					var least = Math.min(distleft,distright,disttop,distbottom);
					var side;
					if (least == distleft && elm1.velocity[0] > 0) side = 'left';
					else if (least == distright && elm1.velocity[0] < 0) side = 'right';
					else if (least == disttop && elm1.velocity[1] > 0) side = 'top';
					else if (least == distbottom && elm1.velocity[1] < 0) side = 'bottom';
					switch (side) {
						case 'left':
							elm1.position[0] = l2 - w1;
							elm1.velocity[0] = 0;
							elm1.acceleration[0] = 0;
							break;
						case 'top':
							elm1.position[1] = t2 - h1;
							elm1.velocity[1] = 0;
							elm1.acceleration[1] = 0;
							break;
						case 'right':
							elm1.position[0] = r2 + 1;
							elm1.velocity[0] = 0;
							elm1.acceleration[0] = 0;
							break;
						case 'bottom':
							elm1.position[1] = b2 + 1;
							elm1.velocity[1] = 0;
							elm1.acceleration[1] = 0;
							break;
					}
					//document.title = elm1.id+' - '+elm2.id+':'+side;//+' / '+elm1.acceleration[1]+' / '+elm1.velocity[1]+' / '+elm1.position[1]+' / '+$(elm1).css('top');
				}

				if (callbackAfter) callbackAfter(elm1,elm2,side);
			}
			//else if (elm2.id == 'lwall')document.title += 'X';
		}
	}
	return this;
}
