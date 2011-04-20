// a one-way pointer with an arbitrary number of children to which it points
//   anything may point at it, but it won't know how to go it its parents
function Pointer(value) {
  this.name = "Pointer";
  this.value = value;
  this.children = [];
}
Pointer.prototype.toString = function toString() {
  return this.name + "(" + this.value + ")";
}
Pointer.prototype.addChild = function(anotherPointer) {
  this.children.push(anotherPointer); // no duplicates checking
}
Pointer.prototype.pointTo = function pointTo(anotherPointer) {
  if (!(anotherPointer instanceof Pointer)) {
    throw new Error("A Pointer can only point to another Pointer.");
  }
  this.addChild(anotherPointer);
}
OneWayPointer = Pointer; // for convenience's sake

// a two-way pointer with an arbitrary number of children and parents
function TwoWayPointer(value) {
  Pointer.call(this, value);
  this.parents = [];
  this.name = "TwoWayPointer";
}
TwoWayPointer.prototype = new Pointer();
TwoWayPointer.prototype.addParent = function(anotherPointer) {
  this.parents.push(anotherPointer); // no duplicates checking
}
TwoWayPointer.prototype.pointTo = function pointTo(anotherPointer) {
  Pointer.prototype.pointTo.call(this, anotherPointer);
  anotherPointer.addParent(this);
}

// a one-way pointer with only one child
function SingleOneWayPointer(value) {
  OneWayPointer.call(this, value);
  this.name = "SingleOneWayPointer";
}
SingleOneWayPointer.prototype = new OneWayPointer();
SingleOneWayPointer.prototype.pointTo = function pointTo(anotherPointer) {
  if (!(anotherPointer instanceof SingleOneWayPointer)) {
    throw new Error("A SingleOneWayPointer can only point to another SingleOneWayPointer.");
  }
  this.children[0] = anotherPointer;
}
SingleOneWayPointer.prototype.hasChild = function hasChild() {
  return (this.children.length > 0);
}
SingleOneWayPointer.prototype.child = function child() {
  if (!this.hasChild()) {
    throw new Error(this.name + " does not point to another " + this.name + ".");
  }
  return this.children[0];
}
// convenience function
SingleTwoWayPointer.prototype.next = SingleTwoWayPointer.prototype.child;

// a one-way pointer with one child and one parent
function SingleTwoWayPointer(value) {
  TwoWayPointer.call(this, value);
  this.name = "SingleTwoWayPointer";
}
SingleTwoWayPointer.prototype = new TwoWayPointer();
SingleTwoWayPointer.addChild = function addChild(anotherPointers) {
  this.children[0] = anotherPointer;
}
SingleTwoWayPointer.addParent = function addParent(anotherPointers) {
  this.parents[0] = anotherPointer;
}
SingleTwoWayPointer.prototype.pointTo = function pointTo(anotherPointer) {
  // break existing pointers
  if (this.hasChild()) {
    this.child().parents = [];
  }
  this.addChild(anotherPointer);
  anotherPointer.addParent(this);
}
SingleTwoWayPointer.prototype.hasChild = function hasChild() {
  return (this.children.length > 0);
}
SingleTwoWayPointer.prototype.child = function child() {
  if (!this.hasChild()) {
    throw new Error(this.name + " does not point to another " + this.name + ".");
  }
  return this.children[0];
}
SingleTwoWayPointer.prototype.hasParent = function hasParent() {
  return (this.parents.length > 0);
}
SingleTwoWayPointer.prototype.parent = function parent() {
  if (!this.hasParent()) {
    throw new Error(this.name + " does not point back to another " + this.name + ".");
  }
  return this.parents[0];
}
// convenience functions
SingleTwoWayPointer.prototype.next = SingleTwoWayPointer.prototype.child;
SingleTwoWayPointer.prototype.prev = SingleTwoWayPointer.prototype.previous = SingleTwoWayPointer.prototype.parent;

// a one-way pointer with two children
function BinaryOneWayPointer(value) {
  OneWayPointer.call(this, value);
  this.name = "BinaryOneWayPointer";
}
BinaryOneWayPointer.prototype = new OneWayPointer();
BinaryOneWayPointer.prototype.pointTo = function pointTo() {
  throw new Error(this.name + "s are registered with pointLeft and pointRight.")
}
BinaryOneWayPointer.prototype.pointLeft = function pointLeft(anotherPointer) {
  if (!(anotherPointer instanceof BinaryOneWayPointer)) {
    throw new Error("A " + this.name + " can only point to another " + this.name + ".");
  }
  this.children[0] = anotherPointer;
}
BinaryOneWayPointer.prototype.pointRight = function pointRight(anotherPointer) {
  if (!(anotherPointer instanceof BinaryOneWayPointer)) {
    throw new Error("A " + this.name + " can only point to another " + this.name + ".");
  }
  this.children[1] = anotherPointer;
}
BinaryOneWayPointer.prototype.hasLeft = function hasLeft() {
  return (typeof this.children[0] != "undefined");
}
BinaryOneWayPointer.prototype.getLeft = function getLeft() {
  return this.children[0];
}
BinaryOneWayPointer.prototype.left = function left() {
  if (!this.hasLeft()) {
    throw new Error(this.name + " does not have a left " + this.name + ".");
  }
  return this.getLeft();
}
BinaryOneWayPointer.prototype.hasRight = function hasRight() {
  return (typeof this.children[1] != "undefined");
}
BinaryOneWayPointer.prototype.getRight = function getRight() {
  return this.children[1];
}
BinaryOneWayPointer.prototype.right = function right() {
  if (!this.hasRight()) {
    throw new Error(this.name + " does not have a right " + this.name + ".");
  }
  return this.getRight();
}

// a two-way pointer with two children and one parent
function BinaryTwoWayPointer(value) {
  TwoWayPointer.call(this, value);
  this.name = "BinaryTwoWayPointer";
}
BinaryTwoWayPointer.prototype = new TwoWayPointer();
BinaryTwoWayPointer.prototype.pointTo = function pointTo() {
  throw new Error(this.name + "s are registered with pointLeft and pointRight.")
}
BinaryTwoWayPointer.prototype.pointLeft = function pointLeft(anotherPointer) {
  if (!(anotherPointer instanceof BinaryTwoWayPointer)) {
    throw new Error("A " + this.name + " can only point to another " + this.name + ".");
  }
  this.children[0] = anotherPointer;
  anotherPointer.addParent(this);
}
BinaryTwoWayPointer.prototype.pointRight = function pointRight(anotherPointer) {
  if (!(anotherPointer instanceof BinaryTwoWayPointer)) {
    throw new Error("A " + this.name + " can only point to another " + this.name + ".");
  }
  this.children[1] = anotherPointer;
  anotherPointer.addParent(this);
}
BinaryTwoWayPointer.prototype.hasLeft = function hasLeft() {
  return (typeof this.children[0] != "undefined");
}
BinaryTwoWayPointer.prototype.getLeft = function getLeft() {
  return this.children[0];
}
BinaryTwoWayPointer.prototype.left = function left() {
  if (!this.hasLeft()) {
    throw new Error(this.name + " does not have a left " + this.name + ".");
  }
  return this.getLeft();
}
BinaryTwoWayPointer.prototype.hasRight = function hasRight() {
  return (typeof this.children[1] != "undefined");
}
BinaryTwoWayPointer.prototype.getRight = function getRight() {
  return this.children[1];
}
BinaryTwoWayPointer.prototype.right = function right() {
  if (!this.hasRight()) {
    throw new Error(this.name + " does not have a right " + this.name + ".");
  }
  return this.getRight();
}
BinaryTwoWayPointer.prototype.hasParent = function hasParent() {
  return (this.parents.length > 0);
}
BinaryTwoWayPointer.prototype.parent = function parent() {
  if (!this.hasParent()) {
    throw new Error(this.name + " does not point back to another " + this.name + ".");
  }
  return this.parents[0];
}
// convenience functions
BinaryTwoWayPointer.prototype.prev = BinaryTwoWayPointer.prototype.previous = BinaryTwoWayPointer.prototype.parent;