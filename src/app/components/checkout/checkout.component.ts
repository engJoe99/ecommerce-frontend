import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

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

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.chechoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: ['']
      }),
      shippingAddress: this.formBuilder.group({
        street:[''],
        city:[''],
        state:[''],
        country:[''],
        zipCode:[''],
      }),
      billingAddress: this.formBuilder.group({
        country: [''],
        street: [''],
        city: [''],
        state: [''],
        zipCode: [''],
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: [''],
      })
    });
  }

  onSubmit() {
    console.log("Handling the submit button");
    console.log(this.chechoutFormGroup.get('customer')?.value);
    console.log(this.chechoutFormGroup.get('customer')?.value.email);
  }


  copyShippingAddressToBillingAddress(event: Event) {
    if ((event.target as HTMLInputElement).checked) {
          this.chechoutFormGroup.get('billingAddress')
            ?.setValue(this.chechoutFormGroup.get('shippingAddress')?.value);
        }
        else {
          this.chechoutFormGroup.get('billingAddress')?.reset();
    }
  }


}
