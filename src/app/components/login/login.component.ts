import {Component, Inject, OnInit, OnDestroy} from '@angular/core';
import myAppConfig from '../../config/my-app-config';
import OktaAuth from '@okta/okta-auth-js';
import {OKTA_AUTH} from '@okta/okta-angular';
import OktaSignIn from '@okta/okta-signin-widget';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  // Type the oktaSignin property properly
  private oktaSignin: any;

  constructor(@Inject(OKTA_AUTH) private readonly oktaAuthService: OktaAuth) {
    // Initialize oktaSignin in constructor with memoized config
    const baseUrl = myAppConfig.oidc.issuer.split('/oauth2')[0];
    this.oktaSignin = new OktaSignIn({
      logo: '/images/logo.png',
      baseUrl,
      clientId: myAppConfig.oidc.clientId,
      redirectUri: myAppConfig.oidc.redirectUri,
      useClassicEngine: true,
      authParams: {
        pkce: true,
        issuer: myAppConfig.oidc.issuer,
        scopes: myAppConfig.oidc.scopes
      }
    });
  }

  ngOnInit(): void {
    // Clean up any existing widgets first
    this.oktaSignin.remove();

    // Use async/await pattern for better error handling
    this.renderWidget();
  }

  ngOnDestroy(): void {
    // Cleanup widget when component is destroyed
    this.oktaSignin.remove();
  }

  private async renderWidget(): Promise<void> {
    try {
      const response = await this.oktaSignin.renderEl({
        el: '#okta-sign-in-widget'
      });

      if (response.status === 'SUCCESS') {
        await this.oktaAuthService.signInWithRedirect();
      }
    } catch (error) {
      console.error('Error rendering Okta widget:', error);
      throw error;
    }
  }
}
