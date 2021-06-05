import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';
import { Observable, Observer, Subject } from 'rxjs';
import { DialogEditProductComponent } from './dialog-edit-product/dialog-edit-product.component';
import { Product } from './product.module';
import { ProductsService } from './products.service';
import { filter, switchMap, take, takeUntil, takeWhile } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app-client';

  simpleReqProdutsObs: Observable<Product[]>;
  productsErrorhandling: Product[];
  productsLoading: Product[];
  productsId: Product[];
  newlyProducts: Product[] = [];
  productstoDelete: Product[] = [];
  productstoEdit: Product[] = [];
  bLoading: boolean = false;
  private unsubscribeAll$: Subject<any> = new Subject<any>();
  constructor(
    private productService: ProductsService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }
  ngOnInit() {
    this.productService.getProdutos().subscribe((prods) => { console.log(prods) })
  }

  getSimpleHttpRequest() {
    this.simpleReqProdutsObs = this.productService.getProdutos();
  }

  getProductsErrro() {
    this.productService.getProductsErr().subscribe(
      (prods) => {
        this.productsErrorhandling = prods
      },
      (err) => {
        console.log(err)
        let config = new MatSnackBarConfig();
        config.duration = 2000;
        config.panelClass = ['snack_Err'];
        if (err.status == 0)
          this.snackBar.open("Cloud not connect the server", '', config);
        else
          this.snackBar.open(err.error.msg, '', config);
      }
    )
  }
  getProductsOK() {
    this.productService.getProductsDelay().subscribe(
      (prods) => {
        this.productsErrorhandling = prods

        let config = new MatSnackBarConfig();
        config.duration = 2000;
        config.panelClass = ['snack_ok'];
        this.snackBar.open("Products Sucess Loaded", '', config);
      },
      (err) => {
        console.log(err)

      }
    )
  }

  getProductsLoading() {
    this.bLoading = true;
    this.productService.getProductsDelay().subscribe(
      (prods) => {
        this.productsLoading = prods
        this.bLoading = false;
      },
      (err) => {
        console.log(err)

      }
    )
  }

  getProductsIds() {
    this.productService.getProductsIds().subscribe((ids) => {

      this.productsId = ids.map(id => ({ _id: id, name: '', department: '', price: 0 }));
    });
  }

  loadName(id: string) {
    this.productService.getProductName(id).subscribe((name) => {
      let index = this.productsId.findIndex(p => p._id === id);
      if (index >= 0) {
        this.productsId[index].name = name;
      }
    });
  }
  saveProduct(name: string, department: string, price: number) {
    //this.newlyProducts

    let p = { name, department, price };
    this.productService.saveProduct(p).subscribe((p: Product) => {
      this.newlyProducts.push(p);
      this.snackMessage("Product Saved", 'snack_ok', 200);
    }, (err) => {

      if (err.status == 0)
        this.snackMessage("Cloud not connect the server", 'snack_Err', 200);
      else
        this.snackMessage(err.error.msg, 'snack_Err', 200);
    });
  };

  loadProductsToDelete() {
    this.productService.getProdutos().subscribe((prods) => this.productstoDelete = prods)
  };

  deleteProduct(p: Product) {
    this.productService.removeProduct(p).subscribe((res) => {
      let i = this.productstoDelete.findIndex(prod => p._id == prod._id);
      if (i >= 0) {
        this.productstoDelete.splice(i, 1);
        this.snackMessage("Product Deleted", 'snack_ok', 400);
      }
    }, (err) => {
      if (err.status == 0)
        this.snackMessage("Cloud not connect the server", 'snack_Err', 200);
      else
        this.snackMessage(err.error.msg, 'snack_Err', 200);
    })
  }

  snackMessage(message: string, pannelClass: string, time: number) {
    let config = new MatSnackBarConfig();
    config.duration = time;
    config.horizontalPosition = 'right';
    config.panelClass = pannelClass;
    this.snackBar.open(message, '', config);
  }

  loadProductsToEdit() {
    this.productService.getProdutos().subscribe((prods) => this.productstoEdit = prods)
  }

  editProduct(p: Product) {
    let newProduct: Product = { ...p };
    let diolegRef = this.dialog.open(DialogEditProductComponent, { width: '400px', data: newProduct });

    diolegRef.afterClosed().pipe(
      filter((prod: Product) => prod != undefined),
      switchMap((prod: Product) => this.productService.editProduct(prod)), 
      takeUntil(this.unsubscribeAll$)).subscribe((resp) => {
        let i = this.productstoEdit.findIndex(prod => p._id == prod._id);
        if (i >= 0) {
          this.snackMessage("Product Edited", 'snack_ok', 1000);
          this.productstoEdit[i] = resp;
        };
      }, (err) => {
        console.error(err);
      });
  }
  ngOnDestroy() {
      this.unsubscribeAll$.next();
  }

};
