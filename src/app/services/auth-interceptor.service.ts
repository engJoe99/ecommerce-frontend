import {Inject, Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {from, lastValueFrom, Observable} from 'rxjs';
import {OKTA_AUTH} from '@okta/okta-angular';
import {OktaAuth} from '@okta/okta-auth-js';


@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor{



  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) { }

  // This method intercepts HTTP requests before they are sent to the server
  // It converts the async handleAccess method into an Observable using 'from'
  // This allows the interceptor to handle authentication by adding access tokens when needed
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(req, next));
  }


   private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
      // Array of URLs that require authentication
      const securedEndpoints = ['https://localhost:8443/api-orders2'];

      // Check if the request URL matches any of the secured endpoints
      if(securedEndpoints.some(url => request.urlWithParams.startsWith(url))) {

        // Get the OAuth access token from Okta
        const accessToken = this.oktaAuth.getAccessToken();
        if(!accessToken) {
          console.warn('No access Token available');
        }

        // Clone the request and add the Authorization header with the access token
        request = request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + accessToken
          }
        });
      }

      // Forward the request to the next handler and convert the Observable to a Promise
      return await lastValueFrom(next.handle(request));
   } catch(error: any) {
    console.error('Auth interceptor error: ', error);
    throw error;
  }



}
