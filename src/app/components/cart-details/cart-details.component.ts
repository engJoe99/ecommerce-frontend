import {Component, OnInit} from '@angular/core';
import {CartItem} from '../../common/cart-item';
import {CartService} from '../../services/cart.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart-details',
  standalone: false,

  templateUrl: './cart-details.component.html',
  styleUrl: './cart-details.component.css'
})
export class CartDetailsComponent implements OnInit{

  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalQuantity: number = 0;

  constructor(private cartService: CartService) {
  }

  ngOnInit(): void {
    this.cartDetails();
  }

  private cartDetails() {

    // get a handle to the cart items
    this.cartItems = this.cartService.cartItems;
    this.cartEmpty();


    // subscribe to the cart totalPrice
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

    // subscribe to the cart totalQuantity
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );

    // compute cart total price and quantity
    this.cartService.computeCartTotals();

  }



  // Handle the increment anf the decrement buttons:

  incrementQuantity(theCartItem: CartItem) {
    this.cartService.addToCart(theCartItem);
  }

  decrementQuantity(theCartItem: CartItem) {
    this.cartService.decrementQuantity(theCartItem);

  }

  remove(theCartItem: CartItem) {
    this.cartService.remove(theCartItem);
    this.productRemoved();
  }










  // ------------- SweetAlert Methods -----------------
  private cartEmpty(){
    if(this.cartItems.length === 0) {
      Swal.fire({
        title: 'Empty Cart',
        text: 'Your shopping cart is empty',
        icon: 'info',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  private productRemoved() {
    Swal.fire({
      title: 'Removed!',
      text: `Product removed from cart`,
      icon: 'warning',
      timer: 1500,
      showConfirmButton: false
    });
  }

}
