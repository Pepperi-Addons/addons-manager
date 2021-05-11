import { ObjectSingleData, PepDataConvertorService, PepFieldData } from '@pepperi-addons/ngx-lib';
// Main Imports
import { Component, EventEmitter, OnInit, Input, ComponentRef, ViewChild, Output, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Subscription, SubscriptionLike } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from 'src/app/app.service';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';

export class _maintenance {
    AutomaticUpgradeAfter: string; // Date
    AutomaticUpgradeAfterPercentage: string; // Percentage
    MaintenanceWindow: string; // Hour
    MaintenanceMinDate: Date;
    MaintenanceMaxDate: Date;

    constructor(date = '', percentage = '0', hour = '') {
        // The date cannot be bigger than current date+3 months DI-17686
        this.MaintenanceMinDate = new Date();
        this.MaintenanceMaxDate = new Date();
        this.MaintenanceMaxDate.setMonth(this.MaintenanceMaxDate.getMonth() + +3);

        this.AutomaticUpgradeAfter = date;
        this.AutomaticUpgradeAfterPercentage = percentage !== '' ? percentage : '0';
        this.MaintenanceWindow = hour;
    }
}

@Component({
    selector: 'settings-cont',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    providers: [ AppService ]
  })
  export class SettingsContComponent {
  
    @Input() isSupportUser = '';
    private distributor;
    public maintenance ;
    public timeOptions = [
        { key: "01:00", value: "01:00" },
        { key: "02:00", value: "02:00" },
        { key: "03:00", value: "03:00" },
        { key: "04:00", value: "04:00" },
        { key: "05:00", value: "05:00" },
        { key: "06:00", value: "06:00" },
        { key: "07:00", value: "07:00" },
        { key: "08:00", value: "08:00" },
        { key: "09:00", value: "09:00" },
        { key: "10:00", value: "10:00" },
        { key: "11:00", value: "11:00" },
        { key: "12:00", value: "12:00" },
        { key: "13:00", value: "13:00" },
        { key: "14:00", value: "14:00" },
        { key: "15:00", value: "15:00" },
        { key: "16:00", value: "16:00" },
        { key: "17:00", value: "17:00" },
        { key: "18:00", value: "18:00" },
        { key: "19:00", value: "19:00" },
        { key: "20:00", value: "20:00" },
        { key: "21:00", value: "21:00" },
        { key: "22:00", value: "22:00" },
        { key: "23:00", value: "23:00" },
        { key: "24:00", value: "24:00" }
    ];

    public percentageOptions = [
        { key: "0", value: "0" },
        { key: "25", value: "25" },
        { key: "50", value: "50" },
        { key: "75", value: "75" }
    ];

    public isDisableForSave = true;
    
    
    constructor(
        private dialog: PepDialogService,
        public pluginService: AppService,
        public cd: ChangeDetectorRef,
        public translate: TranslateService,
        public pepData: PepDataConvertorService
    ) {
  
        let userLang = 'en';
        translate.setDefaultLang(userLang);
        userLang = translate.getBrowserLang().split('-')[0]; // use navigator lang if available
        translate.use(userLang);

        this.pluginService.getMaintenance(res => {

            this.distributor = res;
            if (res && res.Maintenance) {
                res = res.Maintenance;

                let hour = '';

                if(res.MaintenanceWindow && res.MaintenanceWindow != ''){
                    const tmp = res.MaintenanceWindow.split(':');
                    hour = tmp[0] + ':' + tmp[1];
                }

                this.maintenance = new _maintenance(res.AutomaticUpgradeAfter, res['AutomaticUpgradeAfterX%'], hour);
            }
      });
  
    }

    onMaintenanceValueChanged(e){
        switch(e.key){
            case 'MaintenanceDate': {
                this.maintenance['AutomaticUpgradeAfter'] = e.value;
                break;
            }
            case 'percentage': {
                if(e.value >= 0 && e.value <= 99){
                    this.maintenance['AutomaticUpgradeAfterPercentage'] = e.value;
                }
                else{
                    this.maintenance['AutomaticUpgradeAfterPercentage'] = 0;
                    const modalTitle = this.translate.instant('Alert');
                    const content = this.translate.instant('AddonsManager_Maintenance_precents_not_valid');
                    const data = new PepDialogData({title: modalTitle, content, actionButtons:[null]});
                    const config = this.dialog.getDialogConfig({minWidth: '30rem'}, 'regular');
                    this.dialog.openDefaultDialog(data, config);
                }
                break;
            }
            case 'MaintenanceHour': {
                this.maintenance['MaintenanceWindow'] = e.value;
                break;
            }
        }
        
    }

    publishMaintenanceData() {
        const obj = {
            'InternalID': this.distributor.InternalID || null,
            'UUID': this.distributor.UUID || null,
            // 'Name': this.distributor.Name,
            // 'Email': this.distributor.Email,
            // 'Phone': this.distributor.Phone,
            // 'Street': this.distributor.Street,
            // 'ZipCode': this.distributor.ZipCode,
            'Maintenance': this.distributor.Maintenance
        } 
      
        obj.Maintenance.AutomaticUpgradeAfter = this.maintenance['AutomaticUpgradeAfter'];
        obj.Maintenance['AutomaticUpgradeAfterX%'] = this.maintenance['AutomaticUpgradeAfterPercentage'];
        obj.Maintenance.MaintenanceWindow = this.maintenance['MaintenanceWindow'];

       this.pluginService.publishMaintenance(obj, res => {
           if(res){
                const modalTitle = null; //this.translate.instant('');
                const content = this.translate.instant('Addon_SuccessfulOperation');
                const data = new PepDialogData({title: modalTitle, content, actionButtons:[null]});
                const config = this.dialog.getDialogConfig({minWidth: '30rem'}, 'regular');
                this.dialog.openDefaultDialog(data, config);
           }
       });
    }
}
  