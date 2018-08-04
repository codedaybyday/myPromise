function MyPromise(fn) {
    var _this = this;
	_this.value = null;
    _this.error = null;
    _this.status = 'pending';
    _this.onFullfilled = null;
    _this.onRejected = null;
    _this.onFullfilledCallBacks = []; // 链式操作，队列
    _this.onRejectedCallBacks = [];

    function resovle(value) {
        _this.value = value;
        _this.status = 'fillfilled';
        setTimeout(function() {
            // _this.onFullfilled();
            _this.onFullfilledCallBacks.forEach(function(onFullfilled) {
                onFullfilled();
            });
        });
    }
    function reject(error) {
        _this.error = error;
        _this.status = 'rejected';
        setTimeout(function() {
            // _this.onRejected();
            _this.onRejectedCallBacks.forEach(function(onRejected) {
                onRejected();
            });
        });
    }
    fn(resovle, reject);
}
MyPromise.prototype.then = function(onFullfilled, onRejected) {
    if (this.status === 'pending') {
        // this.onFullfilled = onFullfilled;
        // this.onRejected = onRejected;
        this.onFullfilledCallBacks.push(onFullfilled);
        this.onRejectedCallBacks.push(onRejected);
    } else if (this.status === 'fullfill') { // 状态一旦变化就不可逆， 再加上回调，value结果不变
        this.onFullfilled(this.value);
    } else {
        this.onRejected(this.error)
    }
    return this;
}