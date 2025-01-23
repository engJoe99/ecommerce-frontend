import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: false,

  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {

  constructor(private router: Router) {
  }

  ngOnInit(): void {
  }


  // Method to perform search based on the input value
  doSearch(value: string) {
    console.log('doSearch: ' + value);
    // Navigate to the search results page
    this.router.navigateByUrl(`/search/${value}`);
  }


}
