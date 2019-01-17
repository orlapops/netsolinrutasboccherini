import { Component, OnInit } from "@angular/core";
import { Injectable } from "@angular/core";
import { NetsolinApp } from "../../shared/global";
import { ParEmpreService } from "../par-empre.service";
import { AngularFirestore } from "@angular/fire/firestore";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from "@angular/common/http";
import { Platform } from "@ionic/angular";
// Plugin storage
import { Storage } from "@ionic/storage";
import { VisitasProvider } from "../visitas/visitas.service";
import { ClienteProvider } from "../cliente.service";

@Injectable({
  providedIn: "root"
})
export class RecibosService implements OnInit {
  cargocarteraNetsolin = false;
  cartera: Array<any> = [];
  recibocajaCounter: number = 0;
  recibocaja: Array<any> = [];

  constructor(
    public _parempre: ParEmpreService,
    private fbDb: AngularFirestore,
    private platform: Platform,
    private storage: Storage,
    private http: HttpClient,
    public _visitas: VisitasProvider,
    public _cliente: ClienteProvider
  ) {

    
  }
  ngOnInit() {

  }
  inicializaRecibos(){
    console.log("cosntructor prod service recibos");
    this.cartera = this._cliente.clienteActual.cartera;
    console.log('cartera:', this.cartera);
  }
  // // Verifica usuario en url de empresa en Netsolin
  // cargaCarteraNetsolin(cod_tercer: string) {
  //   let promesa = new Promise((resolve, reject) => {
  //     if (this.cargocarteraNetsolin) {
  //       console.log("resolve true cargo cartera netsolin por ya estar inciada");
  //       resolve(true);
  //     }
  //     NetsolinApp.objenvrest.filtro = cod_tercer;
  //     console.log(" verificausuarioNetsolin 1");
  //     let url =
  //       this._parempre.URL_SERVICIOS +
  //       "netsolin_servirestgo.csvc?VRCod_obj=CARTEXCLIEAPP";
  //     console.log(url);
  //     console.log(NetsolinApp.objenvrest);
  //     console.log(" cargaCarteraNetsolin 2");
  //     this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
  //       console.log(" cargaCarteraNetsolin 3");
  //       console.log(data);
  //       if (data.error) {
  //         console.log(" cargaCarteraNetsolin 31");
  //         // Aqui hay un problema
  //         console.log("data.messages");
  //         console.log(data.menerror);
  //         this.cargocarteraNetsolin = false;
  //         //    this.menerror_usuar="Error llamando servicio cargaCarteraNetsolin en Netsolin "+data.menerror;
  //         this.cartera = null;
  //         resolve(false);
  //       } else {
  //         console.log(" cargaCarteraNetsolin 32");
  //         console.log("Datos traer cargaCarteraNetsolin");
  //         this.cargocarteraNetsolin = true;
  //         // this.menerror_usuar="";
  //         this.cartera = data.cartera;
  //         console.log(data.cartera);
  //         resolve(true);
  //       }
  //       console.log(" cargaCarteraNetsolin 4");
  //     });
  //     console.log(" cargaCarteraNetsolin 5");
  //   });
  //   return promesa;
  // }

  //retorna array reciobo de caja
  getRecibocaja() {
    return Promise.resolve(this.recibocaja);
  }

  //adiciona un item a factura
  addrecibocaja(item, abono) {
    console.log("add item addrecibocaja item llega:", item);
    let exist = false;

    if (this.recibocaja && this.recibocaja.length > 0) {
      this.recibocaja.forEach((val, i) => {
        if (val.item.num_obliga === item.num_obliga) {
          val.item.abono = abono;
          val.item.saldoini = item.saldo;
          val.item.saldo = item.saldo - abono;
          exist = true;
        }
      });
    }

    if (!exist) {
      this.recibocajaCounter = this.recibocajaCounter + 1;
      const itemAdi = {
        num_obliga: item.num_obliga,
        fecha_obl: item.fecha_obl,
        abono: abono,
        saldoini: item.saldo,
        saldo: item.saldo - abono,
        dias_venci: item.dias_venci
      };
      console.log("Item a adicionar:", itemAdi);
      this.recibocaja.push({ id: this.recibocajaCounter, item: itemAdi });
    }
    console.log("REcibo lista :", this.recibocaja);
    this.guardar_storage_recibo();
    return Promise.resolve();

    // console.log("add item recibio item llega:", item);
    // this._cliente.chequeacliente();
    // this.recibocajaCounter = this.recibocajaCounter + 1;
    // let exist = false;

    // if (this.recibocaja && this.recibocaja.length > 0) {
    //   this.recibocaja.forEach((val, i) => {
    //     console.log('addrecibo val en for:', val);
    //     if (val.item.num_obliga === item.num_obliga) {
    //       val.item.abono = abono;
    //       val.item.total = abono;
    //       exist = true;
    //     }
    //   });
    // }

    // if (!exist) {
    //   this.recibocaja.push({ id: this.recibocajaCounter, item: item });
    // }
    // console.log("REcibo lista :", this.recibocaja);

    // return Promise.resolve();
  }

  getOblCartera(id) {
    console.log('getOblCartera id:', id, this.cartera)
    for (let i = 0; i < this.cartera.length; i++) {
      if (this.cartera[i].num_obliga === id) {
        console.log('concontro');
        return this.cartera[i];
      }
    }
    console.log('No concontro');
    return null;
  }

  getitemRecibo(id) {
    console.log('buscando en recibo: ', id, this.recibocaja);
    for (let i = 0; i < this.recibocaja.length; i++) {
      if (this.recibocaja[i].item.num_obliga === id) {
        return this.recibocaja[i].item;
      }
    }
    return null;
  }

  //saca un elemento del recibo
  borraritemrecibo(item) {
    let index = this.recibocaja.indexOf(item);
    if (index > -1) {
      this.recibocaja.splice(index, 1);
    }
    this.recibocajaCounter = this.recibocajaCounter - 1;
    this.guardar_storage_recibo();
    return Promise.resolve();
  }
  public guardar_storage_recibo() {
    let idruta = this._visitas.visita_activa.datosgen.id_ruta;
    let idvisiact = this._visitas.visita_activa.datosgen.id_visita;
    let idirecibo = idruta.toString() + idvisiact.toString();
    if (this.platform.is("cordova")) {
      // dispositivo
      this.storage.set("itemrecibo" + idirecibo, this.recibocaja);
    } else {
      // computadora
      localStorage.setItem("itemrecibo" + idirecibo, JSON.stringify(this.recibocaja));
    }
  }
  cargar_storage_recibo(idruta, idvisiact) {
    console.log("cargar_storage_recibo 1", this._visitas);
    let idirecibo = idruta.toString() + idvisiact;
    console.log("cargar_storage_recibo 4", idirecibo);
    this.recibocaja = [];
    let promesa = new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        // dispositivo
        this.storage.ready().then(() => {
          this.storage.get("itemrecibo" + idirecibo).then(items => {
            if (items) {
              this.recibocaja = items;
            }
            resolve();
          });
        });
      } else {
        // computadora
        console.log("carga del cargar_storage_recibo  0 ");
        if (localStorage.getItem("itemrecibo" + idirecibo)) {
          //Existe items en el localstorage
          console.log("carga del storage cargar_storage_recibo 1");
          this.recibocaja = JSON.parse(localStorage.getItem("itemrecibo" + idirecibo));
          console.log("carga del storage cargar_storage_recibo 2: ", this.recibocaja);
        }
        resolve();
      }
    });
    return promesa;
  }  
}
