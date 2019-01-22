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
  lastUpdateTime = null;
  minFrequency = 60 * 5 * 1000 ;
  ultlatitud = 0;
  ultlongitud = 0;

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
                  this.ultlatitud = data.coords.latitude;
                  this.ultlongitud = data.coords.longitude;
                  //Actualizar recorrido si han pasado 5 minutos
                  const now = new Date();
                  //extraemos el día mes y año 
                  const dia = now.getDate();
                  // const mes = parseInt(now.getMonth()) + 1;
                  const mes = now.getMonth() + 1;
                  const ano = now.getFullYear();
                  const hora = now.getHours();
                  const minutos = now.getMinutes();
                  const id = hora.toString() + ':' + minutos.toString();
                  console.log('watch ubica 2');
                  // /personal/1014236804/recorrido/ano/mes/1/dia/1/historial/h1
                  const lruta = `/personal/${this._parEmpre.usuario.cod_usuar}/recorrido/${ano}/${mes}/${dia}/historial`;
                  console.log("Actualizar recorrido", lruta);
                  if (this.lastUpdateTime == null) {
                    this.lastUpdateTime = now;
                    console.log("Actualizar recorrido inicial", data.coords);                      
                      this.lastUpdateTime = now;
                      const lfechahora = now.toLocaleString();
                      const lif = lfechahora.replace('/' , '_');
                      const usuariorecorrido = this.afDB.collection(lruta).doc(id);
                      usuariorecorrido.set({
                        latitud: data.coords.latitude,
                        longitud: data.coords.longitude
                      });
                  }
                if (this.lastUpdateTime && now.getTime() - this.lastUpdateTime.getTime() > this.minFrequency){
                      console.log("Actualizar recorrido");                      
                      this.lastUpdateTime = now;
                      const lfechahora = now.toLocaleString();
                      const lif = lfechahora.replace('/' , '_');
                      const usuariorecorrido = this.afDB.collection(lruta).doc(id);
                      usuariorecorrido.set({
                        latitud: data.coords.latitude,
                        longitud: data.coords.longitude
                      });
                  }

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
