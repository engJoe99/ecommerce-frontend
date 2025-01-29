import {CartItem} from './cart-item';

export class OrderItem {

  public imageUrl: string = '';
  public quantity: number = 0;
  public unitPrice: number = 0;
  public productId: number = 0;

  constructor(cartItem: CartItem) {

    this.imageUrl = cartItem.imageUrl;
    this.quantity = cartItem.quantity;
    this.unitPrice = cartItem.unitPrice;
    this.productId = cartItem.id;
  }


}
