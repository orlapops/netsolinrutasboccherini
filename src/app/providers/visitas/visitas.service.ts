import { Injectable } from '@angular/core';
import { VISITAS } from "./mock-visitas";
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { ParEmpreService } from '../../providers/par-empre.service';
import { NetsolinApp } from '../../shared/global';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ClienteProvider } from '../cliente.service';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';
import { Observable } from 'rxjs';

// import { MessageService } from '../message/message.service';
// import { ConsoleReporter } from 'jasmine';

@Injectable({
  providedIn: 'root'
})

export class VisitasProvider {
    //AQUI CAMBIAR PARA QUE TRAIGA LA BODEGA QUE LE PERTENECE A LA RUTA
    bodega = 'VEH';
    id_ruta: number = 0;
    // visitaclienteactual: AngularFirestoreDocument<any>;
    // visitaclienteactual: any;
    visitas: any;
    room: any;
    facturaCounter: number = 0;
    factura: Array<any> = [];
    profileUrl: Observable<string | null>;
    clienteFb: any;
    
    public cargo_ruta = false;
    public visitaTodas: any;
    public visitasProximas: any;
    public visitasCumplidas: any;
    public visitasUltimas: any;
    public error_cargarruta = false;
    public men_errorcargarruta = "";
    visitas_cumplidas: any[] = [];
    visitas_pendientes: any[] = [];
    visitas_incumplidas: any[] = [];
    visita_activa: any;
    cargoInventarioNetsolin = false;
    inventario: Array<any> = [];
    public userId: string;
    public cargoidperiodo = false;
    public id_periodo: string;
    public cargo_clienteact = false;
    public direc_actual: any;
    public id_visita_activa: any;
      
    
    constructor(private fbDb: AngularFirestore,
        private firestore: AngularFirestore,
        private afStorage: AngularFireStorage,
        private http: HttpClient,
        public _cliente: ClienteProvider,
        // public _message: MessageService,
        public _parempre: ParEmpreService) {
        this.visitas = VISITAS;
    }

    // inicializarVisitaActual(id){
    //     console.log('inicializarVisitaActual id',id);
    //     this.getVisitaActual(id).subscribe((datos: any) => {
    //         console.log('inicializarVisitaActual getVisitaActual datos:', datos);                
    //         this.visitaclienteactual = datos;
    //         console.log('inicializarVisitaActual getVisitaActual this.visitaclienteactual:', this.visitaclienteactual);                
    //       });        
    //     console.log('visitaclienteactual: ', this.visitaclienteactual);
    //   }
      //trae de firebase la visita actual como obervable

      public getVisitaActual(id){
          return this.fbDb
          .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this.id_ruta}/periodos/${this.id_periodo}/visitas`)
          .doc(id).valueChanges();
      }
//   //Obtiene id de fecha referencia
//   public getIdFecha(fechaId: string) {
//     return this.fbDb.collection('manfechas').doc(fechaId).snapshotChanges();
//   }      
  //Obtiene todas las fechas
//   public getAllFechas() {
//     // return this.fbDb.collection('manfechas').snapshotChanges();
//     return this.fbDb.collection('manfechas').valueChanges();
//   }      
  
  //Obtiene la fecha que corresponde a usuario actual y una fecha dada en timestamp
//   public getFechaUsaurio(fechats) {
//     // return this.fbDb.collection('manfechas').snapshotChanges();
//     console.log('getFechaUsaurio');
//     console.log(fechats);
//     console.log(this._parempre.usuario.cod_usuar);
//     return this.fbDb.collection('manfechas', ref => ref.where('fecha', '==', fechats)).valueChanges();
//     //   .where('cod_person', '==', this._parempre.usuario.cod_usuar)).valueChanges();

// }

  //Obtiene la fecha que corresponde a usuario actual y una fecha dada en timestamp
//   public getVisitasidFecha(fechaid, idruta) {
//     // return this.fbDb.collection('manfechas').snapshotChanges();
//     console.log('getFechaUsaurio');
//     console.log(fechaid);
//     console.log(this._parempre.usuario.cod_usuar);
//     // return this.fbDb.collection('rutas_d', ref => ref.where('id_reffecha', '==', fechaid).orderBy('fecha_in')).valueChanges();
//     return this.fbDb.collection('rutas_d', ref => ref.where('id_reffecha', '==', fechaid)
//         .where('id_ruta','==',idruta).orderBy('fecha_in')).snapshotChanges();
//     //   .where('cod_person', '==', this._parempre.usuario.cod_usuar)).valueChanges();
    
//   }      
  
//Consulta en Netsolin el usuario con la fecha para saber que ruta y periodo le corresponde
cargaPeriodoUsuar(pcod_usuar){
    return new Promise((resolve,reject)=>{
      if (this.cargoidperiodo){
          resolve(true); 
       }
        NetsolinApp.objenvrest.filtro = pcod_usuar;
        let url= this._parempre.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=IDRUTAPERAPP";
        this.http.post( url, NetsolinApp.objenvrest )   
         .subscribe( (data:any) =>{ 
             console.log('cargo periodo en netsolin', data);
          if( data.error){
              console.error(" cargaPeriodoUsuar ", data.error);
            //   this._parempre.reg_log('Error en cargaPeriodoUsuar por netsolin ', 'data.error');
             this.cargoidperiodo = false;
             this.cargo_ruta = false;
             this.error_cargarruta = true;
             this.men_errorcargarruta = data.men_error;
             resolve(false);
            } else{
                // this._parempre.reg_log('coer', 'cargaPeriodoUsuar por netsolin ');
                this.cargoidperiodo = true;
              this.id_ruta = data.datos_ruta[0].id_ruta;
              this.id_periodo = data.datos_periodo[0].id_per;
              resolve(true);
            }
         });
       });
  }

  //Obtiene las visitas que corresponde a la fecha y ruta tomada de carga anterior en netsolin
  public getVisitasidrutper() {
      const lruta = `/personal/${this._parempre.usuario.cod_usuar}/rutas/${this.id_ruta}/periodos/${this.id_periodo}/visitas`;
    //   this._parempre.reg_log('getVisitasidrutper lruta ', lruta);
    return this.fbDb
    .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this.id_ruta}/periodos/${this.id_periodo}/visitas`)
    .snapshotChanges();
    
  }      
  
  public guardarVsita(id, visitaadd){
    //   console.log('guardarVsita id:' + id);
    //   console.log(visitaadd);
      return this.fbDb
      .collection('reg_visitas').doc(id).set(visitaadd);
    //   .collection('reg_visitas').doc(id).update({estado: 'e', otro: visitaadd});
    //   .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this.id_ruta}/periodos/${this.id_periodo}/visitas`)
    //   .doc(id).set(visitaadd);
    }
  
    public actualizarVisita(id, datosact){
        // console.log('actualizarVisita id:' + id);
        // console.log(datosact);
        return this.fbDb
      .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this.id_ruta}/periodos/${this.id_periodo}/visitas`)
      .doc(id).update(datosact);
    }
    
  //Obtiene visita por id de la visita
  public getIdRegVisita(visitaId: string) {
      console.log('en getIdRegVisita');
    return this.fbDb.collection('reg_visitas').doc(visitaId).valueChanges();
  }      
  
  //Carga la visita activa busca si esta creada en reg_visitas, si no la crea si esta la trae
  //recibe la visita activa con el id busca y carga cartera de netsolin si no lo ha echo
  cargaVisitaActiva(visitaAct: any){
    this.visita_activa = null;
    this.id_visita_activa = null;
    this.cargo_clienteact = false;
    this.direc_actual = null;

    // if (!this.cargocarteraNetsolin){
        //llamar a Netsolin para traer la cartera
        this._cliente.cargaClienteNetsolin(visitaAct.data.cod_tercer).then(cargo =>{
            // console.log('En cargaVisitaActiva 14 visitaAct.id:', visitaAct.id);
            // console.log('En cargaVisitaActiva cargo:', cargo);
            this.cargo_clienteact = true;
            this.getIdRegVisita(visitaAct.id).subscribe((datos: any) => {
                // console.log('En cargaVisitaActiva 1 datos:', datos);                
                if (datos) {
                    // console.log('En cargaVisitaActiva 2');
                    // console.log('obtuvo visita actual datos:', datos);
                    datos.cartera = this._cliente.clienteActual.cartera;
                    datos.datosgen = visitaAct.data;
                    //inicializa
                    datos.grb_pedido = false;
                    datos.resgrb_pedido = '';
                    datos.pedido_grabado = null;
                    datos.errorgrb_pedido = false;
                    datos.grb_factu = false;
                    datos.resgrb_factu = '';
                    datos.pedido_factu = null;
                    datos.errorgrb_factu = false;
                    datos.grb_recibo = false;
                    datos.resgrb_recibo = '';
                    datos.pedido_recibo = null;
                    datos.errorgrb_recibo = false;

                    this.visita_activa = datos;
                    this.id_visita_activa = visitaAct.id;
                    //recorrer dicciones para ubicar direc actual y retornarla
                    this._cliente.direcciones.forEach(itemdir => {
                        if (datos.datosgen.id_dir === itemdir.id_dir){
                            // console.log('asigno direccion actual', itemdir);
                            this.direc_actual = itemdir;
                        }                        
                    });
                    //actualizar firebase cloud cliente
                    this._cliente.guardarCliente(visitaAct.data.cod_tercer).then(res =>{
                        this._cliente.getUbicaActFb(visitaAct.data.cod_tercer, this.direc_actual.id_dir).subscribe((datosc: any) => {
                            console.log('susc datos cliente fb ', datosc);
                            this.direc_actual = datosc;
                        });
                        //  console.log('Cliente '+visitaAct.cod_tercer+' guardado en dbFB')
                    });
                    this._cliente.guardardireccionesCliente(visitaAct.data.cod_tercer);
                //     .then(res =>{
                //         console.log('Cliente '+visitaAct.cod_tercer+' guardado direcciones en dbFB')
                //    });
                   this.guardarVsita(visitaAct.id, this.visita_activa).then(res => {                       
                        console.log('Visita guardada');
                    });
                } else {
                    // console.log('En cargaVisitaActiva 3');
                    // console.log('no se ha creado la visita en reg_visitas');
                    const fh = Date.now();
                    const visitaadd = {
                        datosgen : visitaAct.data,
                        estado : '',
                        fechahora_ingreso : fh,
                        // cartera : this.cartera
                        cartera : null,
                        grb_pedido: false,
                        resgrb_pedido: '',
                        pedido_grabado: null,
                        errorgrb_pedido: false,
                        grb_factu:false,
                        resgrb_factu: '',
                        pedido_factu: null,
                        errorgrb_factu: false,
                        grb_recibo: false,
                        resgrb_recibo: '',
                        pedido_recibo: null,
                        errorgrb_recibo: false
                    };
                    this._cliente.guardarCliente(visitaAct.data.cod_tercer).then(res =>{
                        console.log('Cliente '+visitaAct.cod_tercer+' guardado en dbFB 2')
                        this._cliente.getUbicaActFb(visitaAct.data.cod_tercer, this.direc_actual.id_dir).subscribe((datosc: any) => {
                            console.log('susc datos cliente fb ', datosc);
                            if (datosc.length >0){

                            }
                        });

                   });
                    this.guardarVsita(visitaAct.id, visitaadd).then(res => {
                        // console.log('Visita guardada');
                    });
                }
            });
        })
        .catch(() => {
            console.log('error en carga visita activa');
        });
        // console.log('En cargaVisitaActiva 5');
    // }
  }
  cargaVisitas(){
    // console.log('Ingreso a cargo visitas');
    return new Promise( (resolve, reject) => {
        // console.log('cargaVisitas 1');
        this.getVisitasidrutper().subscribe((datosv: any) => {
                    //   console.log('lo que llega de visitas de un id de fecha');
                    //   console.log(datosv);
                    // this._parempre.reg_log('cargaVisitas 1 ', 'datosv');
                    if(datosv.length > 0) {
                        // this._parempre.reg_log('cargaVisitas 2 ', 'datosv1');
                        let itemdato = datosv[0];
                        // console.log(itemdato);
                        // console.log(itemdato.payload);
                        // console.log(itemdato.payload.doc);
                        // console.log(itemdato.payload.doc.data());
                        // console.log(itemdato.payload.doc.id);
  
                        // console.log('cambia a cargo ruta');
                          this.cargo_ruta = true;
                          this.error_cargarruta = false;
                        //   this.visitaTodas = datosv;
                        this.visitaTodas = [];
                        datosv.forEach((visiData: any) => {
                            this.visitaTodas.push({
                              id: visiData.payload.doc.id,
                              cargocartera: false,
                              data: visiData.payload.doc.data()
                            });
                          });   
                        //   console.log('Todas las visitas con id');
                        //   console.log(this.visitaTodas);                     
                          this.clasificaVisitas();
                          resolve(true);
                      } else {
                        // this._parempre.reg_log('cargaVisitas 3 falso no cargo ruta ', 'no tiene visitas');
                        console.log('no hay datos en este id');
                          this.cargo_ruta = false;
                          this.error_cargarruta = true;
                          this.visitaTodas = null;
                          this.men_errorcargarruta = "No tiene visitas asignadas para esta ruta";          
                          resolve(false);
                      }
                  });        
        }); 
  }

 
  // Carga Inventario de la bodega en Netsolin
// cargaInventarioNetsolin() {
//     return new Promise((resolve,reject)=>{
//     if (this.cargoInventarioNetsolin){
//         console.log('resolve true cargo inventario netsolin por ya estar inciada');
//         resolve(true); 
//      }
//       NetsolinApp.objenvrest.filtro = this._parempre.usuario.bod_factura;
//       console.log(" cargaInventarioNetsolin 1");
//       let url= this._parempre.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=INVXBODAPP";
//       console.log('cargaInventarioNetsolin url', url);
//       console.log('cargaInventarioNetsolin NetsolinApp.objenvrest', NetsolinApp.objenvrest);
//       this.http.post( url, NetsolinApp.objenvrest )   
//        .subscribe( (data:any) =>{ 
//         console.log(" cargaInventarioNetsolin data:", data);
//         if( data.error){
//             console.error(" cargaInventarioNetsolin ", data.error);
//            this.cargoInventarioNetsolin = false;
//            this.inventario = null;
//            resolve(false);
//           } else{
//             console.log('Datos traer cargaInventarioNetsolin ', data.inventario);
//             this.cargoInventarioNetsolin =true;
//             // this.menerror_usuar="";
//             this.inventario = data.inventario;
//             resolve(true);
//           }
//         console.log(" cargaInventarioNetsolin 4");
//        })
//      });
//   }
//   //guardar el inventario en firebase
//   public guardarInvdFB(id, inventario) {
//     console.log('guardarInvdFB id:', id, inventario);
//   return this.fbDb.collection('inventario').doc(id).set(inventario);
// }

//   //Obtiene inventario bodega de firebase
//   public getInvdFB(inventarId: string) {
//     console.log('en getInvdFB');
//   return this.fbDb.collection('inventario').doc(inventarId).valueChanges();
// }      

   //cargar de firebase el inventario suscribirse para que quede actualizado
//    cargaInventariodFB(bodega) {
//     this.getInvdFB(bodega).subscribe((datos: any) => {
//         console.log('En cargaInventariodFB 1 datos:', datos);                
//         if (datos) {
//             console.log('obtuvo inventario de firebase inventario antes:', this.inventario);
//             console.log('obtuvo inventario de firebase actual datos:', datos);
//             this.inventario = datos.inventario;
//             console.log('obtuvo inventario de firebase inventario despues:', this.inventario);
//         } 
//     });
//    }

  clasificaVisitas() {
    //   console.log('clasificando visitas 1');
      this.visitas_cumplidas = this.visitaTodas.filter(reg => reg.data.estado === 'C');
      this.visitas_pendientes = this.visitaTodas.filter(regP => regP.data.estado === 'P'
       || regP.data.estado === 'A' || regP.data.estado === '');
    // console.log('clasificando visitas 5');
    // console.log(this.visitas_pendientes);
    // console.log(this.visitas_cumplidas);
  }

  cargar_imagenb_firebase(id: string, imageURL: string): Promise<any> {
    const storageRef: AngularFireStorageReference = this.afStorage.ref
        ('fotos');
    return storageRef
      .putString(imageURL, 'base64', {
        contentType: 'image/jpg',
      })
      .then(() => {
        //   console.log('a a ctualizar foto en usuario ', this._parempre.usuario.cod_usuar);          
        return storageRef.getDownloadURL().subscribe((linkref: any) => {
            // console.log(linkref);
            this.fbDb.collection('personal').doc(this._parempre.usuario.cod_usuar).update({foto: linkref});
        }); 
    });
        
        
    //     this.fbDb
    //     // .collection(`/personal/${this._parempre.usuario.cod_usuar}`)
    //     .collection('personal')
    //     .doc(this._parempre.usuario.cod_usuar).update({
    //       foto: storageRef.getDownloadURL()
    //     });
    //   });
  }

// traerimagenducha(){
//     console.log('En traer imagenes ducha prueba 0114');
//     let larchivo = `/imagenes/0114.jpg`;
//     // let larchivo = `/imagenes/`;
//     // let dbRef = this.afStorage.ref("imagenes");

//     const ref = this.afStorage.ref(larchivo);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref.getDownloadURL.length);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref.getDownloadURL());
//     ref.getDownloadURL().subscribe((data: any) =>  {
//         console.log('En traer imagenes ducha suscribe data:' + larchivo, data);        
//     });
//     // let larchivo = `/imagenes/noexis0114.jpg`;
//     // const ref = this.afStorage.ref(larchivo);
//     // console.log('En traer imagenes ducha prueba ref:' + larchivo, ref);
//     // console.log('En traer imagenes ducha prueba ref:' + larchivo, ref.getDownloadURL.length);
//     // console.log('En traer imagenes ducha prueba ref:' + larchivo, ref.getDownloadURL());
//     // ref.getDownloadURL().subscribe((data: any) =>  {
//     //     console.log('En traer imagenes ducha suscribe data no existe:' + larchivo, data);        
//     // });
//     // if (ref.getDownloadURL.length <=0){
//     //     console.log('archivo '+larchivo+' no existe en firestorage');        
//     // } else {
//     //     console.log('archivo '+larchivo+' Existe en firestorage');        
//     // }
//     // this.profileUrl = ref.getDownloadURL();
//     // console.log('En traer imagenes ducha prueba profileUrl:',  this.profileUrl);
//     return ref.getDownloadURL();
//     // console.log('En traer imagenes ducha prueba profileUrl:',  this.profileUrl);

// }
//Busca imagen que seguro esta para retornar el link general de una imagen de productos
// traerlinkimgProd(){
//     const ref = this.afStorage.ref(`/imagenes/0114.jpg`);
//     return ref.getDownloadURL();
// }

traerlinkimgagenfb(cod_ref) {
    const ref = this.afStorage.ref(`/imagenes/`+ cod_ref.trim() + '.jpg');
    return ref.getDownloadURL();
}

//retorna el link valido de la imagen de una referencia almacenada en firestore
// genlinkimgProd(linkbase:string , cod_ref: string) {
//     let llinkimg: string;
//     llinkimg = linkbase.replace('0114', cod_ref.trim());
//     return llinkimg; 
// }
 getAll() {
        return this.visitas;
    }

    //Retorna una visita especidica para ser mostrada en detalle visitas
    getItem(id) {        
        // this.cargocarteraNetsolin = false;
        for (var i = 0; i < this.visitaTodas.length; i++) {
            if (this.visitaTodas[i].id === id) {
                //cargar visita activa
                // console.log('En getItem id:' + id);
                // console.log(this.visitaTodas[i]);
                this.cargaVisitaActiva(this.visitaTodas[i]);
                return this.visitaTodas[i];
            }
        }
        return null;
    }


    remove(item) {
        this.visitas.splice(this.visitas.indexOf(item), 1);
    }

    /////
    //For Search and factura
    ////
    findAll() {
        return Promise.resolve(this.visitas);
    }

    findById(id) {
        return Promise.resolve(this.visitas[id - 1]);
    }

    findByName(searchKey: string) {
        let key: string = searchKey.toUpperCase();
        return Promise.resolve(this.visitas.filter((property: any) =>
            (property.title + ' ' + property.address + ' ' + property.city + ' ' + property.description)
            .toUpperCase().indexOf(key) > -1));
    }

    buscarProducto(searchKey: string) {
        // console.log('buscarProducto searchKey:', searchKey);
        let key: string = searchKey.toUpperCase();
        // console.log('buscarProducto key:', key);
        // console.log(this.inventario);
         return Promise.resolve(this.inventario.filter((item: any) =>
            item.cod_refinv.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 
            || item.nombre.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 ));
    }


    findByCliente(searchKey: string) {
        // console.log('findByCliente searchKey:', searchKey);
        // console.log(this.visitaTodas);
         return Promise.resolve(this.visitaTodas.filter((item: any) =>
            item.data.nombre.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 
            || item.data.cod_tercer.toLowerCase().indexOf(searchKey.toLowerCase()) > -1));
    }


    // getFactura() {
    //     return Promise.resolve(this.factura);
    // }

    // //adiciona un item a factura
    // addfactura(item) {
    //     console.log('add item factura item llega:', item);
    //     this.facturaCounter = this.facturaCounter + 1;
    //     let exist = false;

    //     if (this.factura && this.factura.length > 0) {
    //         this.factura.forEach((val, i) => {
    //             if (val.item.cod_refinv === item.cod_refinv) {
    //                 exist = true;
    //             }
    //         });
    //     }

    //     if (!exist) {
    //         this.factura.push({ id: this.facturaCounter, item: item });
    //     }
    //     console.log('Factura lista :', this.factura);
        
    //     return Promise.resolve();
    // }


    // //saca un elemento de la factura
    // borraritemfactura(item) {
    //     let index = this.factura.indexOf(item);
    //     if (index > -1) {
    //         this.factura.splice(index, 1);
    //     }
    //     return Promise.resolve();
    // }


}