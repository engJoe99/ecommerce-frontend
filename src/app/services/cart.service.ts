import { Injectable } from '@angular/core';
import {CartItem} from '../common/cart-item';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

// Storage for cart items using session storage
//storage: Storage = sessionStorage;
storage: Storage = localStorage;


  constructor() {

    // read data from storage
    let data =  JSON.parse(<string>this.storage.getItem('cartItems'));

    if(data != null) {
      this.cartItems = data;

      // compute total based on the data that is read from Storage
      this.computeCartTotals();
    }

  }


  addToCart(theCartItem: CartItem) {
    // check if we already have the item in our cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem | undefined;

    if(this.cartItems.length > 0) {  // Fixed the comma to a period

      // find the item in the cart based on the id
      /*for (let tempCartItem of this.cartItems) {
        if(tempCartItem.id === theCartItem.id) {
          existingCartItem = tempCartItem;
          break;
        }
      }*/
      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id);

      // check if we found it
      alreadyExistsInCart = (existingCartItem != undefined);
    }

    // TODO: Add logic to either:
    // 1. Update quantity if item exists
    // 2. Add new item if it doesn't exist
    if(alreadyExistsInCart && existingCartItem) {
      existingCartItem.quantity++;
    }
    else {
      this.cartItems.push(theCartItem);
    }

    this.computeCartTotals();


  }


  computeCartTotals() {

    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for(let currCartItem of this.cartItems) {
      totalPriceValue += currCartItem.quantity * currCartItem.unitPrice;
      totalQuantityValue += currCartItem.quantity;
    }

    // publish the new values … all subscribers will receive the new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    // log cart data just for debugging purposes
    this.logCartData(totalPriceValue, totalQuantityValue);

    // persist cart data
    this.persistCartItems();
  }

  // Saves the current cart items to session storage
  // Converts cart items array to JSON string before storing
  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }



  logCartData(totalPriceValue: number, totalQuantityValue: number ) {
    console.log('===> contents of the cart: ');
    for (let tempCartItem of this.cartItems) {
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity: ${tempCartItem.quantity},
                    unitPrice: ${tempCartItem.unitPrice}, subTotalPrice: ${subTotalPrice}`)
    }

    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
    console.log('-----');
  }



  decrementQuantity(theCartItem: CartItem) {

    theCartItem.quantity--;

    if (theCartItem.quantity == 0) {
      this.remove(theCartItem);
    }
    else {
      this.computeCartTotals();
    }
  }

  remove(theCartItem: CartItem) {

    // get index of item in the array
    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id == theCartItem.id)

    // if found. remove it
    if(itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);

      this.computeCartTotals();
    }
  }


}
