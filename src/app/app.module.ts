import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { provideHttpClient} from '@angular/common/http';
import {ProductService} from './services/product.service';
import {RouterModule, Routes} from '@angular/router';
import { ProductCategoryMenuComponent } from './components/product-category-menu/product-category-menu.component';
import { SearchComponent } from './components/search/search.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { CartStatusComponent } from './components/cart-status/cart-status.component';


// Routes configuration:
// - 'category/:id' - Shows products for a specific category
// - 'category' - Shows all categories
// - 'products' - Shows all products
// - '' - Redirects an empty path to products page
// - '**' - Redirects any unknown paths to products page
const routes: Routes = [
  { path: 'products/:id', component: ProductDetailsComponent},
  { path: 'search/:keyword', component: ProductListComponent},
  { path: 'category/:id', component: ProductListComponent },
  { path: 'category', component: ProductListComponent },
  { path: 'products', component: ProductListComponent },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: '**', redirectTo: '/products', pathMatch: 'full' }
];



@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    ProductCategoryMenuComponent,
    SearchComponent,
    ProductDetailsComponent,
    CartStatusComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(routes),
    NgbModule,

  ],
  providers: [provideHttpClient(), ProductService],
  bootstrap: [AppComponent]
})
export class AppModule { }

