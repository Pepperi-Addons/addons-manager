import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';

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
import { PepperiTableComponent } from './components/pepperi-list/pepperi-table.component';
// import { BroadcastService } from '@pepperi-addons/ngx-broadcast';
import { AppService } from './app.service';

@NgModule({
    declarations: [
        AppComponent,
        PepperiListContComponent,
        SettingsContComponent,
        EditDialogComponent,
        ChangeVersionDialogComponent,
        PermissionsDialogComponent,
        PepperiTableComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        PepUIModule,
        MaterialModule,
        // MatTabsModule,
        // MatIconModule,
        // MatInputModule,
        // MatCheckboxModule,
        // MatFormFieldModule,
        // MatDialogModule,
        // MatCardModule,
        // MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        PepGenericListModule
    ],
    providers: [
        AppService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}




