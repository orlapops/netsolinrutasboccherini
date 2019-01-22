import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './pages/walkthrough/walkthrough.module#WalkthroughPageModule' },
  { path: 'home', loadChildren: './pages/home/home.module#HomePageModule' },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'licencia', loadChildren: './pages/licencia/licencia.module#LicenciaPageModule' },
  { path: 'register', loadChildren: './pages/register/register.module#RegisterPageModule' },
  { path: 'edit-profile', loadChildren: './pages/edit-profile/edit-profile.module#EditProfilePageModule' },
  { path: 'settings', loadChildren: './pages/settings/settings.module#SettingsPageModule' },
  { path: 'visita-list/:textbus/:fini/:ffin', loadChildren: './pages/visita-list/visita-list.module#VisitaListPageModule' },
  { path: 'visita-detail/:id', loadChildren: './pages/visita-detail/visita-detail.module#VisitaDetailPageModule' },
  { path: 'regactividades/:id', loadChildren: './pages/regactividades/regactividades.module#RegActividadesPageModule' },
  { path: 'prod-detail/:id', loadChildren: './pages/prod-detail/prod-detail.module#ProdDetailPageModule' },
  { path: 'prod-detail.ped/:id', loadChildren: './pages/prod-detail.ped/prod-detail.ped.module#ProdDetailPedPageModule' },
  { path: 'visita-nueva', loadChildren: './pages/modal/modal-nueva-visita/modal-nueva-visita.module#ModalNuevaVisitaPageModule'},  
  { path: 'factura', loadChildren: './pages/factura/factura.module#FacturaPageModule' },
  { path: 'pedido', loadChildren: './pages/pedido/pedido.module#PedidoPageModule' },
  { path: 'ultpedido', loadChildren: './pages/pedido.ult/ultpedido.module#UltPedidoPageModule' },
  { path: 'recibocaja', loadChildren: './pages/recibocaja/recibocaja.module#RecibocajaPageModule' },
  { path: 'recibo-detail/:id', loadChildren: './pages/recibo-detail/recibo-detail.module#ReciboDetailPageModule' },
  { path: 'about', loadChildren: './pages/about/about.module#AboutPageModule' },
  { path: 'support', loadChildren: './pages/support/support.module#SupportPageModule' },
  { path: 'messages', loadChildren: './pages/messages/messages.module#MessagesPageModule' },
  { path: 'message/:id', loadChildren: './pages/message/message.module#MessagePageModule' },
  { path: 'location', loadChildren: './pages/modal/location/location.module#LocationPageModule' },
  // { path: 'modalNuevaVisita', loadChildren: './modal/modal-nueva-visita/modal-nueva-visita.module#ModalNuevaVisitaPageModule' },
  // { path: 'modalNuevaVisita', loadChildren: './pages/modal/modal-nueva-visita/modal-nueva-visita.module#ModalNuevaVisitaPageModule' }
  // { path: 'walkthrough', loadChildren: './pages/walkthrough/walkthrough.module#WalkthroughPageModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
