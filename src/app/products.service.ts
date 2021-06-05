import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from './product.module';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  readonly url: string = 'http://localhost:3000/';

  constructor(private http: HttpClient) { }

  getProdutos(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.url}products`);
  }

  getProductsErr(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.url}productserr`);
  }

  getProductsDelay(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.url}productsdelay`);
  }
  
  getProductsIds(): Observable<string[]>{
    return this.http.get<string[]>(`${this.url}prducts_ids`);
  }

  getProductName(id:string): Observable<string>{
    return this.http.get(`${this.url}prducts/name/${id}`,{responseType:"text"});
  }

  saveProduct(p:Product): Observable<Product>{
    return this.http.post<Product>(`${this.url}insProduct`,p);
  }

  removeProduct(p:Product){
    return this.http.delete(`${this.url}products/${p._id}`);
  }

  editProduct(p:Product): Observable<Product>{
    return this.http.patch<Product>(`${this.url}products/${p._id}`,p);
  }

}
