import { Injectable, EventEmitter } from '@angular/core';
import { Http,URLSearchParams} from '../../../node_modules/@angular/http';
import { Observable } from '../../../node_modules/rxjs';
import 'rxjs/add/operator/map' 

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  searchEvent:EventEmitter<ProductSearchParams> = new EventEmitter()
   
  constructor(private http:Http) { }

  getProducts():Observable<Product[]>{
    return this.http.get("/api/products").map(res=>res.json())
  }

  getProduct(id:number):Observable<Product>{
    return this.http.get("/api/product/"+id).map(res=>res.json())
  }

  getCommentsByProductId(id:number):Observable<Comment[]>{
    return this.http.get("/api/product/"+id+"/comments").map(res=>res.json())
  }

  getAllType():string[]{
    return ["图书","电器","衣服","生活用品"]
  }

  search(params: ProductSearchParams): Observable<Product[]> {
    return this.http.get("/api/products", {search: this.encodeParams(params)}).map(res => res.json());
  }

  private encodeParams(params: ProductSearchParams) {
    
    return Object.keys(params)
      .filter(key => params[key])
      .reduce((sum:URLSearchParams, key:string) => {
        sum.append(key, params[key]);
        return sum;
      }, new URLSearchParams());

  }

}
export class ProductSearchParams{
  constructor(
    public title:string,
    public price:number,
    public type:string
  ){}
}

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

