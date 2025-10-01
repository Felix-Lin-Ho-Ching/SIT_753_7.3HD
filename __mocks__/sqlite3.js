class Database {
    constructor() { }
    serialize(fn) { if (typeof fn === 'function') fn(); return this; }
    run() { return this; }
    get(_sql, _params, cb) { if (typeof _params === 'function') cb = _params; if (cb) cb(null, null); }
    all(_sql, _params, cb) { if (typeof _params === 'function') cb = _params; if (cb) cb(null, []); }
    close(cb) { if (cb) cb(null); }
}
module.exports = {
    verbose() { return module.exports; },
    Database
};
