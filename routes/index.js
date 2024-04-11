const combineRouters = require("koa-combine-routers");

const index = require("./index/");

const router = combineRouters(index);

module.exports = router;
