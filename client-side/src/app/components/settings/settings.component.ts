import { ObjectSingleData, PepDataConvertorService, PepFieldData } from '@pepperi-addons/ngx-lib';
// Main Imports
import { Component, EventEmitter, OnInit, Input, ComponentRef, ViewChild, Output, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Subscription, SubscriptionLike } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from 'src/app/app.service';
import { PepDialogActionButton, PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';

export class _maintenance {
    AutomaticUpgradeAfter: string; // Date
    AutomaticUpgradeAfterPercentage: string; // Percentage
    MaintenanceWindow: string; // Hour
    MaintenanceMinDate: Date;
    MaintenanceMaxDate: Date;
    updateOnHoldSince: string = '';

    constructor(updateOnHoldDate = '', date = '', percentage = '0', hour = '') {
        // The date cannot be bigger than current date+3 months DI-17686
        this.MaintenanceMinDate = new Date();
        this.MaintenanceMaxDate = new Date();
        this.MaintenanceMaxDate.setMonth(this.MaintenanceMaxDate.getMonth() + +3);                
        this.AutomaticUpgradeAfter = date;
        this.AutomaticUpgradeAfterPercentage = percentage !== '' ? percentage : '0';
        this.MaintenanceWindow = hour;
        this.updateOnHoldSince = updateOnHoldDate;
    }

    private setFutureDate(maintenanceObj){//DI-18766
        if(typeof maintenanceObj.updateOnHoldSince != 'undefined' && maintenanceObj.updateOnHoldSince != null && maintenanceObj.updateOnHoldSince!== ''){
            let currentDate: any = new Date(),
                currentDatePlus3m : any = this.MaintenanceMaxDate,
                updateOnHoldDate: any = new Date(maintenanceObj.updateOnHoldSince),    
                updateOnHoldDatePlus6m : any = new Date(maintenanceObj.updateOnHoldSince);

            updateOnHoldDatePlus6m.setMonth(updateOnHoldDate.getMonth() + +6);         
            
            const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds                      
            const updateOnHold_diffDays = Math.abs((updateOnHoldDatePlus6m - updateOnHoldDate) / oneDay);
            const threeMonths_diffDays =  Math.abs((currentDatePlus3m - currentDate) / oneDay);
            
            if(updateOnHold_diffDays < threeMonths_diffDays){
                this.MaintenanceMaxDate = updateOnHoldDatePlus6m;
            }

        }

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
    private userLang = 'en';
    public maintenanceDatemsg  = '';
    public upgradeAllmsg = '';
    public maintenance ;   
    public globalMenu;  
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
  
        //let userLang = 'en';
        translate.setDefaultLang(this.userLang);
        this.userLang = translate.getBrowserLang().split('-')[0]; // use navigator lang if available
        translate.use(this.userLang);

        this.pluginService.getMaintenance(res => {

            this.distributor = res;
            if (res && res.Maintenance) {
                this.setMaintenanceData(res.Maintenance);               
            }
      });
  
    }  
  
    setMaintenanceData(res){        

        let hour = '';

        if(res.MaintenanceWindow && res.MaintenanceWindow != ''){
            const tmp = res.MaintenanceWindow.split(':');
            hour = tmp[0] + ':' + tmp[1];
        }

        this.maintenance = new _maintenance(res.AutomaticUpgradeOnHoldSince, res.AutomaticUpgradeAfter, res['AutomaticUpgradeAfterX%'], hour);               
        this.maintenance.setFutureDate(this.maintenance);                                
        this.maintenanceDatemsg = this.translate.instant('AddonsManager_Maintenance_date') ;
        this.globalMenu =  [ { "key": "updateAll","text": this.translate.instant('AddonsManager_Maintenance_updateAll'),"parent": null,"selected": false }];

        if(this.maintenance?.updateOnHoldSince && typeof this.maintenance.updateOnHoldSince != 'undefined' && this.maintenance.updateOnHoldSince !== ''){          
            //DI-18766                                  
            if(this.maintenance?.MaintenanceMaxDate < new Date())
            {
                this.upgradeAllmsg = this.translate.instant('AddonsManager_Maintenance_upgradeAll');
            }                  

            if(this.maintenance.AutomaticUpgradeAfter != ''){
                this.maintenanceDatemsg  += ' (' + this.translate.instant('AddonsManager_Maintenance_freezestartdate') + ' ' 
                                              + new Date(this.maintenance.updateOnHoldSince).toLocaleDateString(this.userLang) + ')';      
            }
        }                               

    }

    onMaintenanceValueChanged(key, value){
        switch(key){
            case 'MaintenanceDate': {
                this.maintenance['AutomaticUpgradeAfter'] = value;
                if(typeof this.maintenance.updateOnHoldSince == 'undefined' || this.maintenance.updateOnHoldSince == null || this.maintenance.updateOnHoldSince == ''){//DI-18766
                    this.maintenance.updateOnHoldSince = new Date().toLocaleDateString(this.userLang);
                    
                }
                break;
            }
            case 'percentage': {
                if(value >= 0 && value <= 99){
                    this.maintenance['AutomaticUpgradeAfterPercentage'] = value;
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
                this.maintenance['MaintenanceWindow'] = value;
                break;
            }
        }       
        
    }

    menuItemClick(e){
        const modalTitle = this.translate.instant('AddonsManager_Maintenance_updateAllModalTitle');
        const content = this.translate.instant('AddonsManager_Maintenance_updateAllModalMessage');
        const actionButtons = [
          new PepDialogActionButton(
              this.translate.instant('AddonManager_Cancel')
          ),
          new PepDialogActionButton(
              this.translate.instant('AddonManager_Ok'),
              'strong',
              () => this.updateAllAddons())
        ];
    
        const data = new PepDialogData({title: modalTitle, actionsType: 'custom', content, actionButtons});    
        this.dialog.openDefaultDialog(data);
    
      }
    
      updateAllAddons(){
            const body = {};              
            this.pluginService.updateAllAddons(body, res => {
                if(res){    
                    this.maintenance.updateOnHoldSince = '';
                    if(new Date(this.maintenance.AutomaticUpgradeAfter) > new Date())//has a future date 
                    {
                        this.maintenance.updateOnHoldSince = new Date().toLocaleDateString(this.userLang);

                    }

                    this.publishMaintenanceData();

                    const modalTitle = null; //this.translate.instant('');
                    const content = this.translate.instant('AddonsManager_Maintenance_UpdateAllSuccess');
                    const data = new PepDialogData({title: modalTitle, content, actionButtons:[null]});
                    const config = this.dialog.getDialogConfig({minWidth: '30rem'}, 'regular');
                    this.dialog.openDefaultDialog(data, config);
                }
            });
     
      }


    publishMaintenanceData() {  
        const obj = {
            'InternalID': this.distributor.InternalID || null,
            'UUID': this.distributor.UUID || null,            
            'Maintenance': this.distributor.Maintenance
        } 
      
        obj.Maintenance.AutomaticUpgradeAfter = this.maintenance['AutomaticUpgradeAfter'];
        obj.Maintenance['AutomaticUpgradeAfterX%'] = this.maintenance['AutomaticUpgradeAfterPercentage'];
        obj.Maintenance.MaintenanceWindow = this.maintenance['MaintenanceWindow'];
        obj.Maintenance.AutomaticUpgradeOnHoldSince = this.maintenance.updateOnHoldSince;

       this.pluginService.publishMaintenance(obj, res => {
           if(res){

                this.setMaintenanceData(res.Maintenance);                
                const modalTitle = null; //this.translate.instant('');
                const content = this.translate.instant('Addon_SuccessfulOperation');
                const data = new PepDialogData({title: modalTitle, content, actionButtons:[null]});
                const config = this.dialog.getDialogConfig({minWidth: '30rem'}, 'regular');
                this.dialog.openDefaultDialog(data, config);
           }
       });
    }
}
  