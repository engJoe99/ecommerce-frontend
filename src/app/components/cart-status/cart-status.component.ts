import {Component, OnInit} from '@angular/core';
import {CartService} from '../../services/cart.service';
import Swal from 'sweetalert2';

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
        this.addSuccess();
      }
    );

    // subscribe to the cart totalQuantity
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );

  }

  private addSuccess() {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Product added to cart',
        text: `Cart total: $${this.totalPrice.toFixed(2)}`,
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
  }



}
