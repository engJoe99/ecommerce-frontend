import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Luv2shopFormService} from '../../services/luv2shop-form.service';
import {Country} from '../../common/country';
import {State} from '../../common/state';
import {CartService} from '../../services/cart.service';
import {Luv2ShopValidators} from '../../validators/luv2-shop-validators';
import {CheckoutService} from '../../services/checkout.service';
import {Router} from '@angular/router';
import {Order} from '../../common/order';
import {OrderItem} from '../../common/order-item';
import {Purchase} from '../../common/purchase';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  standalone: false,

  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit{

  chechoutFormGroup: FormGroup =  new FormGroup({});

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];


  constructor(private formBuilder: FormBuilder,
              private cartService: CartService,
              private luv2shopFormService: Luv2shopFormService,
              private checkoutService: CheckoutService,
              private router: Router
              ) {}

  ngOnInit(): void {
    this.chechoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',
                                  [Validators.required,
                                    Validators.minLength(2),
                                    Luv2ShopValidators.notOnlyWhiteSpace]),

        lastName: new FormControl('',
                                  [Validators.required,
                                    Validators.minLength(2),
                                    Luv2ShopValidators.notOnlyWhiteSpace]),

        email: new FormControl('', [Validators.required,
                                    Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
                                    Luv2ShopValidators.notOnlyWhiteSpace]
        )
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required,
                                      Validators.minLength(2),
                                      Luv2ShopValidators.notOnlyWhiteSpace]),

        city: new FormControl('', [Validators.required,
                                    Validators.minLength(2),
                                    Luv2ShopValidators.notOnlyWhiteSpace]),

        state: new FormControl('', [Validators.required]),

        country: new FormControl('', [Validators.required]),

        zipCode: new FormControl('', [Validators.required,
                                    Validators.minLength(2),
                                    Luv2ShopValidators.notOnlyWhiteSpace]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required,
                                      Validators.minLength(2),
                                      Luv2ShopValidators.notOnlyWhiteSpace]),

        city: new FormControl('', [Validators.required,
                                    Validators.minLength(2),
                                    Luv2ShopValidators.notOnlyWhiteSpace]),

        state: new FormControl('', [Validators.required]),

        country: new FormControl('', [Validators.required]),

        zipCode: new FormControl('', [Validators.required,
                                      Validators.minLength(2),
                                      Luv2ShopValidators.notOnlyWhiteSpace]),
      }),
        creditCard: this.formBuilder.group({

        cardType: new FormControl('', [Validators.required]),

        nameOnCard: new FormControl('', [Validators.required,
                                         Validators.minLength(2),
                                         Luv2ShopValidators.notOnlyWhiteSpace]),

        cardNumber: new FormControl('', [Validators.required,
                                         Validators.pattern('[0-9]{16}'),
                                         Luv2ShopValidators.notOnlyWhiteSpace]),

        securityCode: new FormControl('', [Validators.required,
                                           Validators.pattern('[0-9]{3}'),
                                           Luv2ShopValidators.notOnlyWhiteSpace]),

        expirationMonth: new FormControl('', [Validators.required]),

        expirationYear: new FormControl('', [Validators.required]),
      })
    });


    // populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    console.log("startMonth: " + startMonth);

    this.luv2shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved Credit Card Months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    // populate credit card years
    this.luv2shopFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Retrieved Credit Card Years: " + JSON.stringify(data));
        this.creditCardYears = data;
      }
    )

    // populate countries
    this.luv2shopFormService.getCountries().subscribe(
      data => {
        console.log("Retrieved countries: " + JSON.stringify(data));
        this.countries = data;
      }
    );

    // order Summary
    this.reviewCartDetails();

  }

  onSubmit() {
    console.log("Handling the submit button");

    if(this.chechoutFormGroup.invalid) {
      this.chechoutFormGroup.markAllAsTouched();
      return;
    }



    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    // - long way
    /*
    let orderItems: OrderItem[] = [];
    for (let i=0; i < cartItems.length; i++) {
      orderItems[i] = new OrderItem(cartItems[i]);
    }
    */

    // - short way of doing the same thingy
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.chechoutFormGroup.controls['customer'].value;

    // populate purchase - shipping address
    purchase.shippingAddress = this.chechoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress = this.chechoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call REST API via the CheckoutService
this.checkoutService.placeOrder(purchase).subscribe({
      next: response => {
        // reset cart
        this.cartService.cartItems = [];
        this.cartService.totalPrice.next(0);
        this.cartService.totalQuantity.next(0);

        // reset the form
        this.chechoutFormGroup.reset();

        // Show success message
        this.orderSuccess(response.orderTrackingNumber);
      },
      error: err => {
        this.orderFailed();
        console.log(`error occured: ${err.message}`);
      }
    });
  }





  copyShippingAddressToBillingAddress(event: Event) {
        if ((event.target as HTMLInputElement).checked) {
          this.chechoutFormGroup.get('billingAddress')
            ?.setValue(this.chechoutFormGroup.get('shippingAddress')?.value);

          // bug fix for states
          this.billingAddressStates = this.shippingAddressStates;
        }
        else {
          this.chechoutFormGroup.get('billingAddress')?.reset();

          // bug fix for states
          this.billingAddressStates = [];
        }

  }


  handleMonthsAndYears() {

    const creditCardCardFormGroup = this.chechoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardCardFormGroup?.value.expirationYear);

    // if the current year equals the selected year, then start with the current month
    let startMonth: number;

    if(currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.luv2shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved Credit Card Months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    )
  }


  getStates(formGroupName: string) {

    const formGroup = this.chechoutFormGroup.get(formGroupName);

    const countryId: number = formGroup?.get('country')?.value?.id ?? 0;
    const countryName: string = formGroup?.value?.country?.name ?? '';


    console.log(`${formGroupName} country id: ${countryId}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.luv2shopFormService.getStatesByCountryId(countryId).subscribe(
      data => {

        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        }
        else {
          this.billingAddressStates = data;
        }

        // select first item by default
        formGroup?.get('state')?.setValue(data[0]);

      }
    );
  }


  private reviewCartDetails() {

    // subscribe to the cart totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );

    // subscribe to the cart totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

  }

/*  private resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    // reset the form
    this.chechoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");
  }*/



  //
  //------------------->>> SweetAlerts <<<------------------
  //

  private orderSuccess(orderTrackingNumber: string) {
    Swal.fire({
      icon: 'success',
      title: 'Order Placed Successfully!',
      html: `<br>
             <strong>Order Tracking Number:</strong><br>
             <span style="font-size: 1.2em; color: #28a745; font-weight: bold">${orderTrackingNumber}</span>`,
      showConfirmButton: true,
      showCancelButton: false,
      confirmButtonText: 'Back to Products',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigateByUrl('/products');
      }
    })
  }

  private orderFailed() {
    // Show error message with enhanced styling and options
    Swal.fire({
      icon: 'error',
      title: 'Order Failed',
      text: `Error occurred while processing your order. Please try again.`,
      showConfirmButton: true,
      confirmButtonText: 'Try Again',
      showCancelButton: false,
      cancelButtonText: 'Return to Cart',
      reverseButtons: true,
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-secondary'
      },
    })
  }




}
