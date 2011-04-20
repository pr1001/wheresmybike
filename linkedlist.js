function LinkedList() {
  this.pointers = null; // using null instead of an empty SingleOneWayPointer so that we can extend our LinkedList later and create a CircularLinkedList
  this.__first = new SingleOneWayPointer();
  this.__last = new SingleOneWayPointer();
  this.__current = new SingleOneWayPointer();
  this.length = 0;
}
LinkedList.prototype.toString = function toString() {
  return "LinkedList of length " + this.length;
}
LinkedList.prototype.append = function append(anotherPointer) {
  if (!(anotherPointer instanceof SingleOneWayPointer)) {
    throw new Error("LinkedLists can only consist of SingleOneWayPointers.");
  }
  // special case for first pointer
  if (this.pointers === null) {
    // assign it as the first pointer
    this.pointers = anotherPointer;
    // set our internal pointers to point to it
    this.__current.pointTo(anotherPointer);
    this.__first.pointTo(anotherPointer);
    this.__last.pointTo(anotherPointer);
  } else {
    // have the pointer pointed to by the internal pointer point to the new pointer (ie append it to the list)
    this.__last.child().pointTo(anotherPointer);
    // have the intenral pointer point to the next pointer
    this.__last.pointTo(anotherPointer);
  }
  this.length += 1;
}
LinkedList.prototype.current = function current() {
  if (!this.__current.hasChild()) {
    throw new Error("LinkedList is empty.");
  }
  return this.__current.child();
}
LinkedList.prototype.hasNext = function hasNext() {
  return (this.__current.child().hasChild());
}
LinkedList.prototype.next = function next() {
  if (!this.__current.child().hasChild()) {
    throw new Error("LinkedList doesn't have another item.");
  }
  // point to what it currently points to is pointing to
  this.__current.pointTo(this.__current.child().child());
  return this.__current.child();
}

function CircularLinkedList() {
  this.pointers = null; // using null instead of an empty SingleOneWayPointer so that we can extend our LinkedList later and create a CircularLinkedList
  this.__current = new SingleOneWayPointer();
  this.length = 0;
}
CircularLinkedList.prototype.toString = function toString() {
  return "CircularLinkedList of length " + this.length;
}
CircularLinkedList.prototype.append = function append(anotherPointer) {
  if (!(anotherPointer instanceof SingleOneWayPointer)) {
    throw new Error("CircularLinkedLists can only consist of SingleOneWayPointers.");
  }
  // special case for first pointer
  if (this.pointers === null) {
    // assign it as the first pointer
    this.pointers = anotherPointer;
    // point to itself
    this.pointers.pointTo(this.pointers);
    // set our internal pointer to point to it
    this.__current.pointTo(anotherPointer);
  } else {
    // keep the circle going by having the new pointer point to the next item
    anotherPointer.pointTo(this.__current.child().child());
    // and then have the pointer that the current pointer points to point to the new pointer
    this.__current.child().pointTo(anotherPointer);
    // and then move the current poitner to the new pointer
    this.__current.pointTo(anotherPointer);
  }
  this.length += 1;
}
CircularLinkedList.prototype.current = function current() {
  if (!this.__current.hasChild()) {
    throw new Error("CircularLinkedList is empty.");
  }
  return this.__current.child();
}
CircularLinkedList.prototype.next = function next() {
  if (!this.__current.child().hasChild()) {
    throw new Error("CircularLinkedList doesn't have another item.");
  }
  // point to what it currently points to is pointing to
  this.__current.pointTo(this.__current.child().child());
  return this.__current.child();
}