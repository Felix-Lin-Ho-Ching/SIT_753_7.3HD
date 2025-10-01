class Statement {
    run(params, cb) { if (typeof params === "function") { cb = params; } if (cb) cb(null); return this; }
    get(params, cb) { if (typeof params === "function") { cb = params; } if (cb) cb(null, null); }
    all(params, cb) { if (typeof params === "function") { cb = params; } if (cb) cb(null, []); }
    finalize(cb) { if (cb) cb(null); }
}
class Database {
    constructor() { }
    serialize(cb) { if (cb) cb(); }
    run(sql, params, cb) { if (typeof params === "function") { cb = params; } if (cb) cb(null); return new Statement(); }
    get(sql, params, cb) { if (typeof params === "function") { cb = params; } if (cb) cb(null, null); }
    all(sql, params, cb) { if (typeof params === "function") { cb = params; } if (cb) cb(null, []); }
    prepare(sql) { return new Statement(); }
    close(cb) { if (cb) cb(null); }
}
module.exports = { Database, verbose: () => module.exports };
