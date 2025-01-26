import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Luv2shopFormService} from '../../services/luv2shop-form.service';
import {Country} from '../../common/country';
import {State} from '../../common/state';
import {CartService} from '../../services/cart.service';
import {Luv2ShopValidators} from '../../validators/luv2-shop-validators';

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
              private luv2shopFormService: Luv2shopFormService ) {}

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
    this.orderDetails();

  }

  onSubmit() {
    console.log("Handling the submit button");

    if(this.chechoutFormGroup.invalid) {
      this.chechoutFormGroup.markAllAsTouched();
    }

    console.log(this.chechoutFormGroup.get('customer')?.value);
    console.log(this.chechoutFormGroup.get('customer')?.value.email);

    console.log("Shipping Address Country: " +
      this.chechoutFormGroup.get('shippingAddress')?.value.country.name);

    console.log("Shipping Address State: " +
      this.chechoutFormGroup.get('shippingAddress')?.value.state.name);


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


  private orderDetails() {


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
}
