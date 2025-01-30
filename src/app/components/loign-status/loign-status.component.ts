import {Component, Inject, OnInit} from '@angular/core';
import {OKTA_AUTH, OktaAuthStateService} from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';

@Component({
  selector: 'app-loign-status',
  standalone: false,

  templateUrl: './loign-status.component.html',
  styleUrl: './loign-status.component.css'
})
export class LoignStatusComponent implements OnInit{

  isAuthenticated: boolean = false;
  userFullName: string = '';

  storage: Storage = sessionStorage;

  constructor(private oktaAuthService: OktaAuthStateService,
              @Inject(OKTA_AUTH) private oktaAuth: OktaAuth){
  }

  ngOnInit(): void {

    // subscribe to authentication state changes
    this.oktaAuthService.authState$.subscribe(
      (result: any) => {
        this.isAuthenticated = result.isAuthenticated;
        this.getUserDetails();
      }
    );
  }


  private getUserDetails() {

    if (this.isAuthenticated) {
      // Fetch the logged-in user details(User's claims)
      //
      // user full name is exposed as a property name
      this.oktaAuth.getUser().then(
        (result: any) => {
          this.userFullName = result.name;

          // retrieve the user's email from authentication response
          const theEmail = result.email;

          // store the user's email in session storage
          this.storage.setItem('userEmail', JSON.stringify(theEmail));
        }
      );
    }
  }


  logout() {
    // terminates the session with Okta and remove the current tokens
    this.oktaAuth.signOut();
  }



}
