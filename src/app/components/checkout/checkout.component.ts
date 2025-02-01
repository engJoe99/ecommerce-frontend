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
import {PaymentInfo} from '../../common/payment-info';
import {loadStripe} from '@stripe/stripe-js';

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

  storage: Storage = sessionStorage;

  // initialize stripe API
  stripe = new Stripe('pk_test_51QnizSK5urZJZjKhk5JZOJ7c0swIT3brhPnOANxTehnppE5C6NfozpGhoXqE0i8uokP1nXgRhVu61CzTwuZnfr9G00pa2yPsPg');
  // stripePromise = loadStripe('pk_test_51QnizSK5urZJZjKhk5JZOJ7c0swIT3brhPnOANxTehnppE5C6NfozpGhoXqE0i8uokP1nXgRhVu61CzTwuZnfr9G00pa2yPsPg');


  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = "";

  isDisabled: boolean = false;



  constructor(private formBuilder: FormBuilder,
              private cartService: CartService,
              private luv2shopFormService: Luv2shopFormService,
              private checkoutService: CheckoutService,
              private router: Router
  ) {}




  ngOnInit(): void {

    // setup Stripe Payment form
    this.setupStripePaymentForm();

    // order Summary
    this.reviewCartDetails();

    // read the user's email address from browser storage
    const theEmail = JSON.parse(<string>this.storage.getItem('userEmail'));


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

        email: new FormControl(theEmail, [Validators.required,
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






    // -------------- NO need after integration with Stripe -----------------------------
    /*
    // populate credit card years
    this.luv2shopFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Retrieved Credit Card Years: " + JSON.stringify(data));
        this.creditCardYears = data;
      }
    )

      // populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    console.log("startMonth: " + startMonth);

    this.luv2shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved Credit Card Months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
    */




    // populate countries
    this.luv2shopFormService.getCountries().subscribe(
      data => {
        console.log("Retrieved countries: " + JSON.stringify(data));
        this.countries = data;
      }
    );



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

    // compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";



    // if valid form then
    // - create payment intent
    // - confirm card payment
    // - place order

    // Check if the form is valid and there are no card validation errors
    if (!this.chechoutFormGroup.invalid && this.displayError.textContent === "") {

      this.isDisabled = true;

      // Create a payment intent on the server side by calling our REST API
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          // Use Stripe to confirm the card payment using the client secret
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement, // Pass the card element containing user's card details
                billing_details: {
                  email: purchase.customer.email,
                  name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                  address: {
                    line1: purchase.billingAddress.street,
                    city: purchase.billingAddress.city,
                    state: purchase.billingAddress.state,
                    country: purchase.billingAddress.country,
                    postal_code: purchase.billingAddress.zipCode
                  }
                }
              }
            }, { handleActions: false })
            .then((result: any) => {
              if (result.error) {
                // Payment failed - show error message to user
                alert(`There was an error: ${result.error.message}`);
                this.isDisabled = false;
              } else {
                // Payment successful - place the order via REST API
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: (response: any) => {
                    // reset cart
                    this.cartService.cartItems = [];
                    this.cartService.totalPrice.next(0);
                    this.cartService.totalQuantity.next(0);
                    this.cartService.persistCartItems();
                    this.isDisabled = false;

                    // reset the form
                    this.chechoutFormGroup.reset();

                    // Show success message
                    this.orderSuccess(response.orderTrackingNumber);
                  },
                  error: err => {
                    // Show error if order placement fails
                    alert(`There was an error: ${err.message}`);
                    this.isDisabled = false;
                  }
                })
              }
            })
        }
      );
    } else {
      // Form is invalid - mark all fields as touched to trigger validation display
      this.chechoutFormGroup.markAllAsTouched();
      return;
    }





    // ============> Before Integrating with Stripe <=================
    // call REST API via the CheckoutService
    /*
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
    */
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


  // ------------------ NO need after Stripe integration ------------------------------
  /*
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
  */


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

  private resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    // reset the form
    this.chechoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");
  }


  setupStripePaymentForm() {

    // get a handle to stripe elements
    var elements = this.stripe.elements();

    // Create a card element ... and hide the zip-code field
    this.cardElement = elements.create('card', { hidePostalCode: true });

    // Add an instance of card UI component into the 'card-element' div
    this.cardElement.mount('#card-element');

    // Add event binding for the 'change' event on the card element
    this.cardElement.on('change', (event: any) => {

      // get a handle to card-errors element
      this.displayError = document.getElementById('card-errors');

      if (event.complete) {
        this.displayError.textContent = "";
      } else if (event.error) {
        // show validation error to customer
        this.displayError.textContent = event.error.message;
      }
    });
  }


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
