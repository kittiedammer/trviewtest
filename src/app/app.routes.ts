import { Routes } from '@angular/router';
import { TradingViewComponent } from './trading-view/trading-view.component';
import { NotPermitedComponent } from './not-permited/not-permited.component';
import { LoadComponent } from './load/load.component';

export const routes: Routes = [
  { path: '', component: LoadComponent },
  { path: 'trading', component: TradingViewComponent },
  { path: 'not-permited', component: NotPermitedComponent },
  { path: '**', redirectTo: '' }
];
