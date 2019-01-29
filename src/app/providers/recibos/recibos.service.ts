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
  addrecibocaja(item, abono, dcto_duchas, dcto_otros, retencion) {
    console.log("add item addrecibocaja item llega:", item);
    let exist = false;

    if (this.recibocaja && this.recibocaja.length > 0) {
      this.recibocaja.forEach((val, i) => {
        if (val.item.num_obliga === item.num_obliga) {
          val.item.abono = abono;
          val.item.dcto_duchas = dcto_duchas;
          val.item.dcto_otros = dcto_otros;
          val.item.retencion = retencion;
          val.item.saldoini = item.saldo;
          val.item.saldo = item.saldo - abono;
          val.item.neto_recibir = abono - dcto_duchas - dcto_otros - retencion;
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
        dcto_duchas: dcto_duchas,
        dcto_otros: dcto_otros,
        retencion: retencion,
        neto_recibir: abono - dcto_duchas - dcto_otros - retencion,
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
    // let idruta = this._visitas.visita_activa.datosgen.id_ruta;
    // let idvisiact = this._visitas.visita_activa.datosgen.id_visita;
    const idruta = this._visitas.visita_activa_copvdet.id_ruta;
    const idvisiact = this._visitas.visita_activa_copvdet.id_visita;
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

  public borrar_storage_recibo() {
    const idruta = this._visitas.visita_activa_copvdet.id_ruta;
    const idvisiact = this._visitas.visita_activa_copvdet.id_visita;
    const idirecibo = idruta.toString() + idvisiact.toString();
    this.recibocaja = [];
    if (this.platform.is("cordova")) {
      // dispositivo
      this.storage.remove("itemrecibo" + idirecibo);
    } else {
      // computadora
      localStorage.removeItem("itemrecibo" + idirecibo);
    }
  }
   
  genera_recibo_netsolin(total_recibo, tdcto_duchas, tdcto_otros, tretencion, tneto_recibir, pag_efectivo, 
    pag_cheq1, pag_ch1banco, pag_ch1cuenta, pag_numcheq1, pag_fechach1,
    pag_cheq2, pag_ch2banco, pag_ch2cuenta, pag_numcheq2, pag_fechach2) {
    console.log('dataos para generar recibo this._visitas.visita_activa_copvdet:', this._visitas.visita_activa_copvdet);
    console.log('Recibo a genera this.recibo): ', this.recibocaja);
    // return new Promise((resolve, reject) => {
    //   resolve(true);
    // });
    this._visitas.visita_activa_copvdet.grb_recibo = false;
    this._visitas.visita_activa_copvdet.resgrb_recibo = '';
    this._visitas.visita_activa_copvdet.recibo_grabado = null;
    this._visitas.visita_activa_copvdet.errorgrb_recibo = false;
    return new Promise((resolve, reject) => {
      let paramgrab = {
        // datos_gen: this._visitas.visita_activa_copvdet.datosgen,
        datos_gen: this._visitas.visita_activa_copvdet,
        items_recibo: this.recibocaja,
        total_recibo: total_recibo,
        tdcto_duchas: tdcto_duchas,
        tdcto_otros: tdcto_otros,
        tretencion: tretencion,
        tneto_recibir: tneto_recibir,
        pag_efectivo: pag_efectivo,
        pag_cheq1: pag_cheq1,
        pag_ch1banco: pag_ch1banco,
        pag_ch1cuenta: pag_ch1cuenta,
        pag_cheq2: pag_cheq2,
        pag_ch2banco: pag_ch2banco,
        pag_ch2cuenta: pag_ch2cuenta,
        pag_numcheq1: pag_numcheq1,
        pag_fechach1: pag_fechach1,
        pag_numcheq2: pag_numcheq2,
        pag_fechach2: pag_fechach2,
        usuario: this._parempre.usuario
      };
      NetsolinApp.objenvrest.filtro = '';
      NetsolinApp.objenvrest.parametros = paramgrab;
      let url =
        this._parempre.URL_SERVICIOS +
        "netsolin_servirestgo.csvc?VRCod_obj=APPGENRECCAJA";
      this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
        console.log(" genera_recibo_netsolin data:", data);
        if (data.error) {
          this._visitas.visita_activa_copvdet.errorgrb_recibo = true;
          this._visitas.visita_activa_copvdet.grb_recibo = false;
          this._visitas.visita_activa_copvdet.resgrb_recibo = data.men_error;      
          this._visitas.visita_activa_copvdet.menerrorgrb_recibo = data.men_error;
          console.error(" genera_recibo_netsolin ", data.men_error);
          // this.cargoInventarioNetsolinPed = false;
          // this.inventarioPed = null;
          resolve(false);
        } else {
          if (data.isCallbackError || data.error) {
            this._visitas.visita_activa_copvdet.errorgrb_recibo = true;
            this._visitas.visita_activa_copvdet.grb_recibo = false;
            this._visitas.visita_activa_copvdet.resgrb_recibo = data.messages;      
            this._visitas.visita_activa_copvdet.menerrorgrb_recibo = data.messages[0].menerror;
            console.error(" Error genera_recibo_netsolin ", data.messages[0].menerror);
            resolve(false);
          } else {
          this._visitas.visita_activa_copvdet.errorgrb_recibo = false;
          this._visitas.visita_activa_copvdet.grb_recibo = true;
          this._visitas.visita_activa_copvdet.resgrb_recibo = 'Se grabo recibo';      
          this._visitas.visita_activa_copvdet.recibo_grabado = data;
          console.log("Datos traer genera_recibo_netsolin ",data);
          const objrecibogfb ={
            cod_docume : data.cod_docume,
            num_docume : data.num_docume,
            fecha : data.fecha,
            cod_usuar : this._parempre.usuario.cod_usuar,
            id_visita : this._visitas.visita_activa_copvdet.id_visita,
            direccion : this._visitas.visita_activa_copvdet.direccion,
            id_dir : this._visitas.visita_activa_copvdet.id_dir,
            txt_imp : data.txt_imp,
            detalle : data.recibo_grabado
          };
            this.guardarreciboFb(data.cod_tercer, data.cod_docume.trim() + data.num_docume.trim(), objrecibogfb).then(res => {
              console.log('Recibo guardada res: ', res);
              resolve(true);
            })
            .catch((err) => {
                console.log('Error guardando recibo en Fb', err);
                resolve(false);
            });
            // resolve(true);
          }
        }
        console.log(" genera_recibo_netsolin 4");
      });
    });
  }
    // Actualiza url firestorage en Netsolin, para cuando se traiga sea màs rapido
    guardarreciboFb(cod_tercer, id, objrecibo) {
      console.log('guardarreciboFb cod_tercer:', cod_tercer);
      console.log('guardarreciboFb id:', id);
      console.log('guardarreciboFb objrecibo:', objrecibo);
      console.log(`/clientes/${cod_tercer}/recibos/`);
      return this.fbDb.collection(`/clientes/${cod_tercer}/recibos/`).doc(id).set(objrecibo);
      // return this.fbDb
      // tslint:disable-next-line:max-line-length
      // .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${this._visitas.visita_activa_copvdet.id_visita}/recibos`)
      // .doc(id).set(objrecibo);
      // .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${this._visitas.visita_activa_copvdet.id_visita}/recibos`)
      // .doc(id).set(objrecibo);
    }
    public getIdRegRecibo(Id: string) {
      console.log('en getIdRegRecibo');
    return this.fbDb
      .collection(`/clientes/${this._visitas.visita_activa_copvdet.cod_tercer}/recibos`)
     .doc(Id).valueChanges();
    }
    
    
    public getUltRecibosClienteDirActual() {
      // tslint:disable-next-line:max-line-length
      console.log('getUltRecibosClienteDirActual:', `/clientes/${this._visitas.visita_activa_copvdet.cod_tercer}/recibos`);
        // return this.fbDb.collection('rutas_d', ref => ref.where('id_reffecha', '==', fechaid).orderBy('fecha_in')).valueChanges();
        return this.fbDb.collection(`/clientes/${this._visitas.visita_activa_copvdet.cod_tercer}/recibos`, ref => 
          ref.where('id_dir', '==', this._visitas.visita_activa_copvdet.id_dir)
          .orderBy('fecha', 'desc')
          .limit(10))
          .snapshotChanges();
            // .where('id_ruta','==',idruta).orderBy('fecha_in')).snapshotChanges();
        }
  
}
