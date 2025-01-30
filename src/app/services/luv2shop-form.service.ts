import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Country} from '../common/country';
import {State} from '../common/state';

@Injectable({
  providedIn: 'root'
})

export class Luv2shopFormService {




  constructor(private httpClient: HttpClient) { }


  // Retrieves a list of countries from the backend API
  getCountries(): Observable<Country[]>  {
    const searchUrl = `https://localhost:8443/api-countries/countries`;
    return this.httpClient.get<Country[]>(searchUrl);
  }

  // Returns a list of states for a given country ID from the backend API
  getStatesByCountryId(theCountryId: number) : Observable<State[]> {
    const searchUrl = `https://localhost:8443/api-states/statesByCountryId/${theCountryId}`;
    return this.httpClient.get<State[]>(searchUrl);
  }

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = [];

    // build an array for "Month" dropdown list
    // - start at current month and loop until
    for(let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }

    // the "of" operator form rxjs will wrap an object as an Observable
    return of(data);
  }


  getCreditCardYears(): Observable<number[]> {
    let data: number[] = [];

    //build an array for "Year" dropdown list
    // - start at current year and loop for the next 10 years
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;

    for(let theYear = startYear; theYear <= endYear; theYear++) {
      data.push(theYear);
    }

    return of(data);
  }



}
