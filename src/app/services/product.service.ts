import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Product } from '../common/product';
import {map, Observable} from 'rxjs';
import {ProductCategory} from '../common/product-category';
import {Page} from '../models/page';

@Injectable({
  providedIn: 'root'
})

export class ProductService {

  private baseUrl = 'http://localhost:8080/api/products';
  private categoryUrl = 'http://localhost:8080/category/all'



  constructor(private httpClient: HttpClient) { }

  // This method returns an Observable of Product array by making an HTTP GET request to the baseUrl
  // It fetches the list of products from the backend API endpoint
  getProductList(theCategoryId: number): Observable<Product[]> {
      const searchUrl = `http://localhost:8080/api/category/${theCategoryId}`;
      return this.httpClient.get<Product[]>(searchUrl);
  }


  // This method searches for products based on a given keyword
  // It constructs a search URL using the keyword and makes an HTTP GET request to the baseUrl
  // Returns an Observable that emits an array of Product objects
  searchProducts(keyword: string): Observable<Product[]> {
    const searchUrl = `http://localhost:8080/api/products/search/${keyword}`;
    return this.httpClient.get<Product[]>(searchUrl);
  }



  // This method retrieves a list of product categories from the backend API
  // It makes an HTTP GET request to the categoryUrl endpoint
  // Returns an Observable that emits an array of ProductCategory objects
  getProductCategories() : Observable<ProductCategory[]> {
      return this.httpClient.get<ProductCategory[]>(this.categoryUrl);
  }


  // Retrieves a single product by its ID
  // @param theProductId - The ID of the product to fetch
  // @returns Observable<Product> - An Observable that emits the requested product
  getProduct(theProductId: number): Observable<Product> {
    const productUrl =`http://localhost:8080/api/products/${theProductId}`
    return this.httpClient.get<Product>(productUrl);
  }



  // This method retrieves a paginated list of products for a specific category
  // @param thePage - The page number to retrieve (zero-based)
  // @param thePageSize - The number of items per page
  // @param theCategoryId - The ID of the product category to filter by
  // @returns Observable<Page<Product>> - An Observable that emits a Page object containing the paginated products
  getProductListPaginate(thePage: number,
                           thePageSize: number,
                           theCategoryId: number): Observable<Page<Product>> {
      const searchUrl = `http://localhost:8080/api/${theCategoryId}/productsPaging?page=${thePage}&size=${thePageSize}`;
      return this.httpClient.get<Page<Product>>(searchUrl);
  }



  // This method performs a paginated search for products based on a keyword
  // @param thePage - The page number to retrieve (zero-based)
  // @param thePageSize - The number of items per page
  // @param keyword - The search term to filter products by
  // @returns Observable<Page<Product>> - An Observable that emits a Page object containing the paginated search results
  searchProductsPaginate(thePage: number,
                          thePageSize: number,
                          keyword: string): Observable<Page<Product>> {
    const searchUrl = `http://localhost:8080/api/${keyword}/paging?page=${thePage}&size=${thePageSize}`;
    return this.httpClient.get<Page<Product>>(searchUrl);
  }




}







