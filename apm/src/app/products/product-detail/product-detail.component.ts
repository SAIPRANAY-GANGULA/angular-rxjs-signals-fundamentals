import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';

import { NgIf, NgFor, CurrencyPipe, AsyncPipe } from '@angular/common';
import { Product } from '../product';
import {
  EMPTY,
  Subject,
  Subscription,
  catchError,
  concatMap,
  filter,
  mergeMap,
  never,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ProductService } from '../product.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, AsyncPipe],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  errorMessage = '';
  private readonly productService = inject(ProductService);
  private readonly destroyed = new Subject<void>();

  // Product to display
  product: Product | null = null;
  product$: Observable<Product | null> = of(null);

  // Set the page title
  pageTitle = this.product
    ? `Product Detail for: ${this.product.productName}`
    : 'Product Detail';

  ngOnInit(): void {
    // Nested Subscriptions

    // this.productService
    //   .getSelectedProductId$()
    //   .pipe(
    //     tap(console.error),
    //     catchError((err) => {
    //       this.errorMessage = err;
    //       return EMPTY;
    //     }),
    //     takeUntil(this.destroyed)
    //   )
    //   .subscribe((id) => {
    //     this.productService
    //       .getProduct(id)
    //       .pipe(
    //         tap((productWithoutReviews) =>
    //           console.error('productWithoutReviews', productWithoutReviews)
    //         ),
    //         takeUntil(this.destroyed)
    //       )
    //       .subscribe((product) => {
    //         this.productService
    //           .getProductWithReviews(product)
    //           .pipe(
    //             tap((productWithReviews) =>
    //               console.error('productWithReviews', productWithReviews)
    //             ),
    //             takeUntil(this.destroyed)
    //           )
    //           .subscribe((product) => {
    //             this.product = product;
    //           });
    //       });
    //   });

    this.product$ = this.productService.getSelectedProductId$().pipe(
      tap(console.error),
      switchMap((id) => this.productService.getProduct(id)),
      tap((productWithoutReviews) =>
        console.error('productWithoutReviews', productWithoutReviews)
      ),
      switchMap((product) =>
        this.productService.getProductWithReviews(product)
      ),
      tap((productWithReviews) =>
        console.error('productWithReviews', productWithReviews)
      ),
      catchError((err) => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

    // this.product$ = this.productService.getSelectedProductId$().pipe(
    //   switchMap((id) => this.productService.getProduct(id)),
    //   switchMap((product) =>
    //     this.productService.getProductWithReviews(product)
    //   ),
    //   catchError((err) => {
    //     this.errorMessage = err;
    //     return EMPTY;
    //   })
    // );
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  addToCart(product: Product) {}
}
