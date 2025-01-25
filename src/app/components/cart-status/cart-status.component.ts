import {Component, OnInit} from '@angular/core';
import {CartService} from '../../services/cart.service';
import Swal from 'sweetalert2';
import {CartItem} from '../../common/cart-item';

@Component({
  selector: 'app-cart-status',
  standalone: false,

  templateUrl: './cart-status.component.html',
  styleUrl: './cart-status.component.css'
})
export class CartStatusComponent implements OnInit{



  totalPrice: number = 0;
  totalQuantity: number = 0;

  constructor(private cartService: CartService) {
  }

  ngOnInit(): void {
    this.updateCartStatus();
  }

  private updateCartStatus() {

    // subscribe to the cart totalPrice
    this.cartService.totalPrice.subscribe(
      data => {
        this.totalPrice = data;
      }
    );

    // subscribe to the cart totalQuantity
    this.cartService.totalQuantity.subscribe(
      data => {
        this.totalQuantity = data;
        // Show notification when cart is updated
        //this.addSuccess();
      }
    );

  }



}
