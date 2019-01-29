import { Component, OnInit } from "@angular/core";
import { NavController, ToastController } from "@ionic/angular";
import { TranslateProvider } from "../../providers";
import { ActivatedRoute, Router } from "@angular/router";
import { ClienteProvider } from "../../providers/cliente.service";
import { RecibosService } from "../../providers/recibos/recibos.service";

@Component({
  selector: "app-recibo-detail",
  templateUrl: "./recibo-detail.page.html",
  styleUrls: ["./recibo-detail.page.scss"]
})
export class ReciboDetailPage implements OnInit {
  oblshop: any;
  num_obliga: any = this.route.snapshot.paramMap.get("id");
  valor_abono = 0;
  dcto_duchas = 0;
  dcto_otros = 0;
  retencion = 0;
  total_t: number;
  oblenRecibo: any;
  constructor(
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    private translate: TranslateProvider,
    public _recibo: RecibosService,
    public route: ActivatedRoute,
    public _cliente: ClienteProvider,
    public router: Router
  ) {
    _recibo.inicializaRecibos();
  }

  ngOnInit() {
    console.log("ngonit recibo detalle num_obliga", this.num_obliga);
    this.oblshop = this._recibo.getOblCartera(this.num_obliga);
    console.log("ngonit recibo detalle ", this.oblshop);
    //traer el registro si esta en lista de lo que se va a facturar
    this.oblenRecibo = this._recibo.getitemRecibo(this.num_obliga);
    console.log('ngonit oblshop,oblenrecibo:',this.oblshop, this.oblenRecibo)
    if (this.oblenRecibo) {
      console.log('encontro en recibo');
      if (this.oblenRecibo.abono === 0){
        this.valor_abono = this.oblenRecibo.saldo;
        this.dcto_duchas = 0;
        this.dcto_otros = 0;
        this.retencion = 0;
      } else {
        this.valor_abono = this.oblenRecibo.abono;
        this.dcto_duchas = this.oblenRecibo.dcto_duchas;
        this.dcto_otros = this.oblenRecibo.dcto_otros;
        this.retencion = this.oblenRecibo.retencion;
      }
      this.total_t = this.oblenRecibo.saldo;
    } else {
      this.valor_abono =   this.oblshop.saldo;
      this.total_t = this.oblshop.saldo;
      this.dcto_duchas = 0;
      this.dcto_otros = 0;
      this.retencion = 0;
  }
  }

  checkout(oblshopID: number, obligID: number) {
    this.navCtrl.navigateForward(`recibo-checkout/${oblshopID}/${obligID}`);
  }

  total() {
    this.total_t = 0;
    this.total_t = this.valor_abono;
    return this.total_t;
  }

  async addrecibo(item) {
    this._recibo.addrecibocaja(item, this.valor_abono, this.dcto_duchas, this.dcto_otros, this.retencion).then(async property => {
      const toast = await this.toastCtrl.create({
        showCloseButton: true,
        message: "Item adicionado a el recibo.",
        duration: 2000,
        position: "bottom"
      });

      toast.present();
    });
  }
}
