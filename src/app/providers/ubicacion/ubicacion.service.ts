import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Subscription } from 'rxjs/Subscription';
import { ParEmpreService } from '../par-empre.service';

@Injectable()
export class UbicacionProvider {

  usuario: AngularFirestoreDocument<any>;
  private watch: Subscription;


  constructor( private afDB: AngularFirestore,
               private geolocation: Geolocation,
               public _parEmpre: ParEmpreService) {
    
    // this.usuario = afDB.doc(`/usuarios/${ _usuarioProv.clave }`);
  }

  //apunta a firebase dato general personal usuario para cambio de ubicacion
  inicializarUsuario(){
    this.usuario = this.afDB.collection(`/personal/`).doc(this._parEmpre.usuario.cod_usuar);
  }

  iniciarGeoLocalizacion() {
 console.log('inicia geoloca');
    this.geolocation.getCurrentPosition().then((resp) => {
        console.log('en geoloca  resp');
        console.log(resp.coords);
        // resp.coords.latitude
      // resp.coords.longitude

      this.usuario.update({
        latitud: resp.coords.latitude,
        longitud: resp.coords.longitude
      });

      this.watch = this.geolocation.watchPosition()
              .subscribe((data) => {
                  // data can be a set of coordinates, or an error (if an error occurred).
                  // data.coords.latitude
                  // data.coords.longitude
                  console.log('watch ubica');
                  console.log(data);
                  this.usuario.update({
                    latitud: data.coords.latitude,
                    longitud: data.coords.longitude
                  });
          

          console.log( this.usuario );

      });



     }).catch((error) => {
       console.log('Error getting location', error);
     });

  }

  detenerUbicacion() {

    try {
      this.watch.unsubscribe();
    } catch(e){
      console.log(JSON.stringify(e));
    }


  }

}
