import * as express from 'express'
import * as path from 'path'
import {Server} from 'ws'
const app = express()

export class Product {
    constructor(
      public id:number,
      public title:string,
      public price:number,
      public rating:number,
      public desc:string,
      public type:Array<string>
    ){}
}
export class Comment{
    constructor(
      public id:number,
      public productId:number,
      public timestamp:string,
      public user:string,
      public rating:number,
      public content:string
    ){}
}
const comments:Comment[] = [
    new Comment(1,1,'2018-06-05','张三',4,'东西不错哟1111'),
    new Comment(2,2,'2018-06-07','李四',3,'东西不错哟2222'),
    new Comment(3,3,'2018-07-05','张三',4,'东西不错哟3333'),
    new Comment(4,4,'2018-08-15','李四',4,'东西不错哟4444'),
    new Comment(5,5,'2018-02-25','张三',4,'东西不错哟5555'),
    new Comment(6,6,'2018-02-25','李四',4,'东西不错哟6666'),
    new Comment(7,1,'2018-06-09','王五',4,'东西不错哟1122'),
]
const products:Product[] = [
    new Product(1,"产品1",199,3.5,"创建的第一个商品",["图书"]),
    new Product(2,"产品2",69,4.5,"创建的第二个商品",["电器"]),
    new Product(3,"产品3",299,3.0,"创建的第三个商品",["衣服"]),
    new Product(4,"产品4",169,2.5,"创建的第四个商品",["生活用品"]),
    new Product(5,"产品5",139,3.0,"创建的第五个商品",["图书"]),
    new Product(6,"产品6",129,5.0,"创建的第六个商品",["电器"]),
]

app.use('/',express.static(path.join(__dirname,'..','client')))

app.get('/api/products',(req,res)=>{
    let result = products;
    let params = req.query;

    if(params.title){
        result = result.filter((p) => p.title.indexOf(params.title) !== -1);
    }

    if(params.price && result.length > 0){
        result = result.filter((p) => p.price <= parseInt(params.price));
    }

    if(params.type && params.type !== "-1" && result.length > 0){
        result = result.filter((p) => p.type.indexOf(params.type) !== -1);
    }

    res.json(result);
})

app.get('/api/product/:id',(req,res)=>{
    res.json(products.find((product)=>product.id == req.params.id))
})

app.get('/api/product/:id/comments',(req,res)=>{
    res.json(comments.filter((comment:Comment) =>comment.productId ==  req.params.id))
})

const server = app.listen(3000,"localhost",()=>{
    console.log("服务器正常启动，访问地址localhost:3000")
})

const subscriptions = new Map<any, number[]>();

const wsServer = new Server({port:8085});
wsServer.on("connection", websocket => {
    websocket.on('message', message => {
        let messageObj = JSON.parse(message);
        let productIds = subscriptions.get(websocket) || [];
        subscriptions.set(websocket, [...productIds, messageObj.productId]);
    });
});

const currentBids = new Map<number, number>();

setInterval(() => {

    products.forEach( p => {
        let currentBid = currentBids.get(p.id) || p.price;
        let newBid = currentBid + Math.random() * 5;
        if(newBid > 1000){
            newBid = 10;
        }
        currentBids.set(p.id, newBid);
    });

    subscriptions.forEach((productIds: number[], ws) => {
        if(ws.readyState === 1) {
            let newBids = productIds.map( pid => ({
                productId: pid,
                bid: currentBids.get(pid)
            }));
            ws.send(JSON.stringify(newBids));
        }else{
            subscriptions.delete(ws);
        }

    });

}, 2000);