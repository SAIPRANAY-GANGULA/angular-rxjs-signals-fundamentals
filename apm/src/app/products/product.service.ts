import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  delay,
  map,
  of,
  retry,
  switchMap,
  tap,
  throwError,
  timer,
} from 'rxjs';
import { Product } from './product';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';

  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);
  private selectedProductId$ = new Subject<number>();

  getSelectedProductId$(): Observable<number> {
    return this.selectedProductId$.asObservable();
  }

  setSelectedProductId(id: number): void {
    this.selectedProductId$.next(id);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl).pipe(
      tap(() => console.log('In http.get pipeline')),
      catchError((err) => this.handleError(err))
    );
  }

  getProduct(id: number): Observable<Product> {
    const productUrl = this.productsUrl + '/' + id;
    return this.http
      .get<Product>(productUrl)
      .pipe(
        //retry backoff algorithm
        retry({
          count: 5,
          delay: (error: any, retryCount: number) => {
            console.error(error);
            console.error(`retryCount:`, retryCount);
            return timer(retryCount * 1000);
          },
          resetOnSuccess: true
        }),
        catchError((err) => this.handleError(err)));
  }

  getProductWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http
        .get<Review[]>(this.reviewService.getReviewUrl(product.id))
        .pipe(
          // delay(3000),
          map((reviews) => ({ ...product, reviews } as Product))
        );
    } else {
      return of(product);
    }
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.errorService.formatError(err);
    return throwError(() => formattedMessage);
    // throw formattedMessage;
  }
}
