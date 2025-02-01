import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Purchase} from '../common/purchase';
import {Observable} from 'rxjs';
import {PaymentInfo} from '../common/payment-info';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private purchaseUrl = 'https://localhost:8443/checkout/purchase';

  private paymentIntentUrl = 'https://localhost:8443/checkout/payment-intent'

  constructor(private httpClient: HttpClient) { }

  // Makes HTTP POST request to create a new order with the given purchase data
  // Returns an Observable that emits the response from the server
  placeOrder(purchase: Purchase): Observable<any> {
    return this.httpClient.post<Purchase>(this.purchaseUrl, purchase);
  }


  // Makes HTTP POST request to create a payment intent with Stripe using the given payment info
  // Returns an Observable that emits the payment intent response from the server
  createPaymentIntent(paymentInfo: PaymentInfo): Observable<any> {
    return this.httpClient.post<PaymentInfo>(this.paymentIntentUrl, paymentInfo);
  }


}
