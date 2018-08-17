import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../shared/product.service';
import { FormControl } from '../../../node_modules/@angular/forms';
import { Observable } from '../../../node_modules/rxjs';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  private imgUrl = 'http://placehold.it/320x150'
  
  private products:Observable<Product[]>
  
  private keyword:string
  
  private titleFilter:FormControl = new FormControl()

  constructor(private productService:ProductService) {
    this.titleFilter.valueChanges
    .subscribe(
      value => this.keyword = value
    )
  }

  ngOnInit() {
    this.products = this.productService.getProducts()
    this.productService.searchEvent.subscribe(
      params => this.products = this.productService.search(params)
    )
  }
  
}
