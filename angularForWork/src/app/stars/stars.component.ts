import { Component, OnInit,OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-stars',
  templateUrl: './stars.component.html',
  styleUrls: ['./stars.component.css']
})
export class StarsComponent implements OnInit {
  @Input()
  private rating:number = 0

  private stars:boolean[]

  @Output()
  private ratingChange:EventEmitter<number> = new EventEmitter()
  @Input()
  private isReadOnly:boolean = true

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes:SimpleChanges):void{
    this.stars = []
    for(let i =1; i <=5 ;i++){
      this.stars.push(i>this.rating)
    }
  }

  clickStar(index:number){
    if(!this.isReadOnly){
      this.rating = index + 1
      this.ratingChange.emit(this.rating)
    }
  }
}