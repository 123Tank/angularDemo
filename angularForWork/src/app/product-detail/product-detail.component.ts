import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '../../../node_modules/@angular/router';
import { ProductService, Product, Comment } from '../shared/product.service';
import { WebSocketService } from '../shared/web-socket.service';
import { Subscription } from '../../../node_modules/rxjs';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

  product:Product

  comments:Comment[]

  newRating:number = 5
  newComment:string = ""

  isCommentHide = true
  isWatched:boolean = false;

  currentBid:number;

  subscription: Subscription;

  constructor(private routeInfo:ActivatedRoute,private productService:ProductService,private wsService:WebSocketService) { }

  ngOnInit() {
    let productId:number = this.routeInfo.snapshot.params['productId']
    this.productService.getProduct(productId).subscribe(
      product=>this.product = product
    )
    this.productService.getCommentsByProductId(productId).subscribe(
      comment=>this.comments = comment
    )
  }

  addComment(){
    let comment = new Comment(0,this.product.id,new Date().toISOString(),'hsc',this.newRating,this.newComment)
    this.comments.unshift(comment)

    let sum = this.comments.reduce((sum,comment) => sum + comment.rating, 0)
    this.product.rating = sum/this.comments.length

    this.newComment = null
    this.newRating = 5
    this.isCommentHide = true
  }

  watchProduct(){
    if(this.subscription){
      this.subscription.unsubscribe();
      this.isWatched = false;
      this.subscription = null;
    }else{
      this.isWatched = true;
      var wsUrl = "ws://localhost:8085";
      this.subscription = this.wsService.createObservableSocket(wsUrl, this.product.id)
        .subscribe(
          products => {
            let product = products.find(p => p.productId === this.product.id);
            this.currentBid = product.bid;
          }
        );
    }
  }
}
