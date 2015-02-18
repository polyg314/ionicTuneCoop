
var stack = new Stack();

var Stack = function() {
		size = 0;
		push = function(contents){
			this[size] = contents;
			size ++;
		}

		pop = function(){
			size --
			var value =  this[size] 
			delete this[size]
			return value
		}
}




var queue = new Queue();

var Queue = function() {
		size = 0;
		enqueue = function(contents){
			this[size] = contents;
			size ++;
		}
		dequeue = function(){
			var first = size - this.length;
			delete this[first]
		}
}


var Queue = function(){
	this.storage = {};
	this.size = 0;
}

Queue.prototype.enqueue = function(value){
	size ++;
	this.storage[this.size] = value;
}

Queue.prototype.dequeue= function(){
	var first = this.size - this.storage.length;
	delete this[first]
	size --
};

