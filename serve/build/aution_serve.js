"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var ws_1 = require("ws");
var app = express();
var Product = /** @class */ (function () {
    function Product(id, title, price, rating, desc, type) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.rating = rating;
        this.desc = desc;
        this.type = type;
    }
    return Product;
}());
exports.Product = Product;
var Comment = /** @class */ (function () {
    function Comment(id, productId, timestamp, user, rating, content) {
        this.id = id;
        this.productId = productId;
        this.timestamp = timestamp;
        this.user = user;
        this.rating = rating;
        this.content = content;
    }
    return Comment;
}());
exports.Comment = Comment;
var comments = [
    new Comment(1, 1, '2018-06-05', '张三', 4, '东西不错哟1111'),
    new Comment(2, 2, '2018-06-07', '李四', 3, '东西不错哟2222'),
    new Comment(3, 3, '2018-07-05', '张三', 4, '东西不错哟3333'),
    new Comment(4, 4, '2018-08-15', '李四', 4, '东西不错哟4444'),
    new Comment(5, 5, '2018-02-25', '张三', 4, '东西不错哟5555'),
    new Comment(6, 6, '2018-02-25', '李四', 4, '东西不错哟6666'),
    new Comment(7, 1, '2018-06-09', '王五', 4, '东西不错哟1122'),
];
var products = [
    new Product(1, "产品1", 199, 3.5, "创建的第一个商品", ["图书"]),
    new Product(2, "产品2", 69, 4.5, "创建的第二个商品", ["电器"]),
    new Product(3, "产品3", 299, 3.0, "创建的第三个商品", ["衣服"]),
    new Product(4, "产品4", 169, 2.5, "创建的第四个商品", ["生活用品"]),
    new Product(5, "产品5", 139, 3.0, "创建的第五个商品", ["图书"]),
    new Product(6, "产品6", 129, 5.0, "创建的第六个商品", ["电器"]),
];
app.use('/', express.static(path.join(__dirname, '..', 'client')));
app.get('/api/products', function (req, res) {
    var result = products;
    var params = req.query;
    if (params.title) {
        result = result.filter(function (p) { return p.title.indexOf(params.title) !== -1; });
    }
    if (params.price && result.length > 0) {
        result = result.filter(function (p) { return p.price <= parseInt(params.price); });
    }
    if (params.type && params.type !== "-1" && result.length > 0) {
        result = result.filter(function (p) { return p.type.indexOf(params.type) !== -1; });
    }
    res.json(result);
});
app.get('/api/product/:id', function (req, res) {
    res.json(products.find(function (product) { return product.id == req.params.id; }));
});
app.get('/api/product/:id/comments', function (req, res) {
    res.json(comments.filter(function (comment) { return comment.productId == req.params.id; }));
});
var server = app.listen(3000, "localhost", function () {
    console.log("服务器正常启动，访问地址localhost:3000");
});
var subscriptions = new Map();
var wsServer = new ws_1.Server({ port: 8085 });
wsServer.on("connection", function (websocket) {
    websocket.on('message', function (message) {
        var messageObj = JSON.parse(message);
        var productIds = subscriptions.get(websocket) || [];
        subscriptions.set(websocket, productIds.concat([messageObj.productId]));
    });
});
var currentBids = new Map();
setInterval(function () {
    products.forEach(function (p) {
        var currentBid = currentBids.get(p.id) || p.price;
        var newBid = currentBid + Math.random() * 5;
        if (newBid > 1000) {
            newBid = 10;
        }
        currentBids.set(p.id, newBid);
    });
    subscriptions.forEach(function (productIds, ws) {
        if (ws.readyState === 1) {
            var newBids = productIds.map(function (pid) { return ({
                productId: pid,
                bid: currentBids.get(pid)
            }); });
            ws.send(JSON.stringify(newBids));
        }
        else {
            subscriptions.delete(ws);
        }
    });
}, 2000);
