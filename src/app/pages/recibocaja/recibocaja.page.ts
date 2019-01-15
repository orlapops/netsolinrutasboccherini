import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { VisitasProvider } from '../../providers/visitas/visitas.service';
import { ParEmpreService } from '../../providers/par-empre.service';
import { RecibosService } from '../../providers/recibos/recibos.service';

@Component({
  selector: 'app-recibocaja',
  templateUrl: './recibocaja.page.html',
  styleUrls: ['./recibocaja.page.scss'],
})

export class RecibocajaPage implements OnInit {
  recibocaja: Array<any> = [];
  total_recibo: Number = 0;
  constructor(
    public _parEmpre: ParEmpreService,
    public navCtrl: NavController,
    private translate: TranslateProvider,
    public _visitas: VisitasProvider,
    public _recibos: RecibosService,
  ) { }

  ngOnInit() {
    this.getRecibocaja();
  }

  deleteItem(item) {
    this._recibos.borraritemrecibo(item)
      .then(() => {
        this.getRecibocaja();
      })
      .catch(error => alert(JSON.stringify(error)));
  }

  getRecibocaja() {
    this._recibos.getRecibocaja()
      .then(data => {
        console.log('Recibo data', data);
         this.recibocaja = data; 
         this.actualizar_totalrecibo();
        });
  }
  total(item, i){
    console.log('en total item llega:', i, item, this.recibocaja);
    this.recibocaja[i].item.saldo = this.recibocaja[i].item.saldoini - this.recibocaja[i].item.abono;
    this.actualizar_totalrecibo();
    this._recibos.guardar_storage_recibo();
  }  
  actualizar_totalrecibo(){
    this.total_recibo = 0;
    for( let itemr of this.recibocaja ){
      this.total_recibo += itemr.item.abono;
      console.log("SUMA");
      console.log (this.total_recibo);
    }
  }

}

