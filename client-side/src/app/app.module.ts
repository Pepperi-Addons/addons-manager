import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DoBootstrap, Injector, NgModule } from '@angular/core';

import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { PepUIModule } from './modules/pepperi.module';
import { MaterialModule } from './modules/material.module';
import { PepperiListContComponent } from './components/pepperi-list/pepperi-list.component';
import { SettingsContComponent } from './components/settings/settings.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PepGenericListModule } from '@pepperi-addons/ngx-composite-lib/generic-list';
// import { HttpClient } from '@angular/common/http';
// import { MatCardModule } from '@angular/material/card';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatDialogModule } from '@angular/material/dialog';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatIconModule } from '@angular/material/icon';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatTabsModule } from '@angular/material/tabs';

import { ChangeVersionDialogComponent } from './components/dialogs/change-version-dialog/change-version-dialog.component';
import { EditDialogComponent } from './components/dialogs/edit-dialog/edit-dialog.component';
import { PermissionsDialogComponent } from './components/dialogs/permissions-dialog/permissions.component';
import { UpgradeAllDialogComponent } from './components/dialogs/upgrade-all-dialog/upgrade-all-dialog.component';
// import { PepperiTableComponent } from './components/pepperi-list/pepperi-table.component';
// import { BroadcastService } from '@pepperi-addons/ngx-broadcast';
import { AppService } from './app.service';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { PepAddonService } from '@pepperi-addons/ngx-lib';
import { PepRemoteLoaderModule } from '@pepperi-addons/ngx-lib/remote-loader';

import { config } from './addon.config';

@NgModule({
    declarations: [
        AppComponent,
        PepperiListContComponent,
        SettingsContComponent,
        EditDialogComponent,
        ChangeVersionDialogComponent,
        PermissionsDialogComponent,
        UpgradeAllDialogComponent,
        // PepperiTableComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        PepUIModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        PepGenericListModule,
        PepRemoteLoaderModule,
        AppRoutingModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (addonService: PepAddonService) => 
                    PepAddonService.createMultiTranslateLoader(config.AddonUUID, addonService, ['ngx-lib', 'ngx-composite-lib']),
                deps: [PepAddonService]
            }
        })
    ],
    providers: [
        TranslateStore,
        AppService
    ],
    bootstrap: [
        // AppComponent
    ]
})
export class AppModule implements DoBootstrap {
    constructor(
        private injector: Injector,
        translate: TranslateService,
        private pepAddonService: PepAddonService
    ) {
        this.pepAddonService.setDefaultTranslateLang(translate);
    }

    ngDoBootstrap() {
        this.pepAddonService.defineCustomElement(`settings-element-${config.AddonUUID}`, AppComponent, this.injector);
    }
}



