import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmptyRouteComponent } from './components/empty-route/empty-route.component';
import { AppComponent } from './app.component';
// import * as config from '../../../addon.config.json';

const routes: Routes = [
    {
        path: `settings/:addon_uuid/:editor_name`,
        component: AppComponent
        // children: [
        //     {
        //         path: ':editor_name',
        //         component: AppComponent
        //     },
        //     {
        //         path: ':editor_name/:tab_id',
        //         component: AppComponent
        //     }
        // ]
    },
    {
        path: '**',
        component: EmptyRouteComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
