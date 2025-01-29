import {Customer} from './customer';
import {Address} from './address';
import {Order} from './order';
import {OrderItem} from './order-item';

export class Purchase {

  public customer: Customer = new Customer;
  public shippingAddress: Address = new Address;
  public billingAddress: Address = new Address;
  public order: Order = new Order;
  public orderItems: OrderItem[] = [];

}
