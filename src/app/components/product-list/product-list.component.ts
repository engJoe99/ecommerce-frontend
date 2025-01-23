import {Component, OnInit} from '@angular/core';
import {ProductService} from '../../services/product.service';
import {Product} from '../../common/product';
import {ActivatedRoute, Router} from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list-grid.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit{

  products: Product[] = [];
  currentCategoryId: number = 1;
  private previousCategoryId: number = 1;
  searchMode: boolean = false;




  //new properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 10;
  theTotalElements: number = 0;

  previousKeyword: string = '';
  


  constructor(private productService: ProductService,
              private route: ActivatedRoute,
              private router: Router) {}



  ngOnInit() {

  // This code listens for changes in the URL parameters (route parameters)
  // When any route parameter changes, it triggers a callback function
  // The callback function calls listProducts() to refresh the product list
  // This ensures the product list updates whenever the route changes
  this.route.paramMap.subscribe(() => {
        this.listProducts();
      });
  }




  listProducts() {

    // Check if the current route has a 'keyword' parameter, indicating search mode
    // If in search mode, call handleSearchProducts() to handle the search functionality
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    if(this.searchMode) {
      this.handleSearchProducts();

    }else {
      // If not in search mode, handle listing products based on the currentCategoryId
      this.handleListProducts();
    }

  }



  handleSearchProducts() {

    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

    // if we have a different keyword than previous
    // then set thePageNumber back to 1
    if(this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;
    console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);

    // now search for the products using keyword
    this.productService.searchProductsPaginate(
      this.thePageNumber  - 1,
      this.thePageSize,
      theKeyword).subscribe(
      data => {
        console.log('Products: ' + JSON.stringify(data));
        this.products = data.content;
        this.thePageNumber = data.pageable.pageNumber + 1;
        this.thePageSize = data.pageable.pageSize;
        this.theTotalElements = data.totalElements;
        this.checkProducts();
      }
    );

  }



  // method of the alert
  checkProducts() {
    if (this.products.length === 0) {
      Swal.fire({
        title: 'No Products Found',
        icon: 'warning',
        confirmButtonText: 'Back to Home'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/products']);
        }
      });
    }
  }




  handleListProducts() {

    // Check if the route has a 'id' parameter
    // If it does, update the currentCategoryId with the parameter value
    this.route.paramMap.subscribe((params) => {
      this.currentCategoryId = +params.get('id')!;

      // If the currentCategoryId is not a valid number, set it to 1
      if (!this.currentCategoryId) {
        this.currentCategoryId = 1;
      }

      // Check if we have a different category than previous
      // Note: Angular will reuse a component if it is currently being viewed
      //
      // if we have a different category id than previous
      // then set thePageNumber back to 1
      if (this.previousCategoryId != this.currentCategoryId) {
        this.thePageNumber = 1;
      }
      this.previousCategoryId = this.currentCategoryId;
      console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);

      // now get the products for the given category id
      this.productService.getProductListPaginate(
        this.thePageNumber - 1,
        this.thePageSize,
        this.currentCategoryId)
        .subscribe(
          data => {
            console.log('Products: ' + JSON.stringify(data));
            this.products = data.content;
            this.thePageNumber = data.pageable.pageNumber + 1;
            this.thePageSize = data.pageable.pageSize;
            this.theTotalElements = data.totalElements;
            // Add checkProducts() call here to check for empty results in category listing
            this.checkProducts();
          }
        );
      }


    );

  }


  // Updates the page size, resets to page 1, and refreshes the product list
  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

















}
