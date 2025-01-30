import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Page} from '../models/page';
import {OrderHistory} from '../common/order-history';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {



  constructor(private httpClient: HttpClient) { }

  // Retrieves order history for a given email with pagination
  // Parameters:
  //   theEmail: customer's email address
  //   thePage: page number to retrieve
  //   thePageSize: number of orders per page
  // Returns: Observable of Page containing OrderHistory items
  getOrderHistory(theEmail: string,
                  thePage: number,
                  thePageSize: number): Observable<Page<OrderHistory>> {
    const url = `https://localhost:8443/api-orders/${theEmail}/paging?page=${thePage}&size=${thePageSize}`;
    return this.httpClient.get<Page<OrderHistory>>(url);
  }


}
