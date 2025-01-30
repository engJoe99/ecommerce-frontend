import {Component, OnInit} from '@angular/core';
import {OrderHistory} from '../../common/order-history';
import {OrderHistoryService} from '../../services/order-history.service';

@Component({
  selector: 'app-order-history',
  standalone: false,

  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit{

  orderHistoryList: OrderHistory[] = [];
  storage: Storage = sessionStorage;           // reference in the web browser session storage


  constructor(private orderHistoryService: OrderHistoryService) {
  }

  ngOnInit(): void {
    this.handleOrderHistory();
  }

  private handleOrderHistory() {
    // Get the email from session storage
    const email = JSON.parse(<string>this.storage.getItem('userEmail'));
    // const email = "john.doe@luv2code.com";

    // Get the order history for the email
    this.orderHistoryService.getOrderHistory(email, 0, 10).subscribe(data => {
      this.orderHistoryList = data.content;
    });
  }










}
