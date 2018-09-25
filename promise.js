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
        // setTimeout(function() {
            // _this.onFullfilled();
            _this.onFullfilledCallBacks.forEach(function(onFullfilled) {
                onFullfilled(_this.value);
            });
        // });
    }
    function reject(error) {
        _this.error = error;
        _this.status = 'rejected';
        // setTimeout(function() {
            // _this.onRejected();
            _this.onRejectedCallBacks.forEach(function(onRejected) {
                onRejected(_this.error);
            });
        // });
    }
    fn(resovle, reject);
}
MyPromise.prototype.then = function(onFullfilled, onRejected) {
    let bridgePromise;
    let _this = this;
    onFullfilled = typeof onFullfilled === 'function' ? onFullfilled : function() {};
    onRejected = typeof onRejected === 'function' ? onRejected: function(error) {throw error};
    if (this.status === 'pending') {
        // this.onFullfilled = onFullfilled;
        // this.onRejected = onRejected;
        // this.onFullfilledCallBacks.push(onFullfilled);
        // this.onRejectedCallBacks.push(onRejected);
        return bridgePromise = new MyPromise(function(resolve, reject) {
            _this.onFullfilledCallBacks.push(function(value) {
                try {
                    let p = onFullfilled(value);
                    resolveBridgePromise(bridgePromise, p, resolve, reject);
                } catch(e) {
                    reject(e);
                }
            });
            _this.onRejectedCallBacks.push(function(error) {
                try {
                    let p = onRejected(error);
                    resolveBridgePromise(bridgePromise, p, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });

        });
    } else if (this.status === 'fillfilled') { // 状态一旦变化就不可逆， 再加上回调，value结果不变
        // onFullfilled(this.value);
        return bridgePromise = new MyPromise(function(resolve, reject) {
            setTimeout(function() {
                try {
                    let p = onFullfilled(_this.value);
                    resolveBridgePromise(bridgePromise, p , resolve, reject);
                } catch(e) {
                    reject(e);
                }
            }, 0);
        });
    } else {
        // onRejected(this.error)
        return bridgePromise = new MyPromise(function(resolve, reject) {
            setTimeout(function() {
                try {
                    let p = onRejected(_this.value);
                    resolveBridgePromise(bridgePromise, p, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            }, 0);
        });
    }
    // return this;
}
MyPromise.prototype.catch = function (reject) {
    this.then(null, reject);
}
function resolveBridgePromise(bridgePromise, p , resolve, reject) {
    if (p === bridgePromise) { // 什么情况下会出现？
        throw new Error('Circular reference'); // 循环引用
    }
    if (p instanceof MyPromise) {
        if (p.status === 'pending') {
            p.then(function(pp) {
                resolveBridgePromise(bridgePromise, pp , resolve, resolve);
            }, function(error){
                reject(error);
            });
        } else {
            p.then(resolve, reject);
        }
    } else {
        resolve(p);
    }
}
// 执行测试用例需要用到的代码
MyPromise.deferred = function() {
    let defer = {};
    defer.promise = new MyPromise((resolve, reject) => {
        defer.resolve = resolve;
        defer.reject = reject;
    });
    return defer;
}
module.exports = MyPromise;

// var p = new MyPromise(function(resolve, reject) {
//     setTimeout(function() {
//         console.log(111);
//     }, 1000);
//     resolve(1);
// }).then(function() {
//     console.log(2);
// }).then(function() {
//     console.log(3);
// });