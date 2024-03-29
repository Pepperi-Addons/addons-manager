import { Component, EventEmitter, Inject, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
// import { singleSpaPropsSubject } from 'src/single-spa/single-spa-props';
import { AppService } from './app.service';
//import { PEP_BROADCAST_SERVICE, BroadcastService } from '@pepperi-addons/ngx-broadcast';

@Component({
    selector: 'addon-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [ AppService ]
})
export class AppComponent  {
    @ViewChild('tabGroup') tabGroup;
    @Output() addEditors: EventEmitter<any> = new EventEmitter<any>();
    installing = false;
    addonsList = [];
    //public globalMenu; 
    //selectedTab: string;
    addonData: any;
    isSupportUser = false;

    constructor(
        public translate: TranslateService,
        private activatedRoute: ActivatedRoute,
        public pluginService: AppService,
        private router: Router,
        private dialog: PepDialogService
      //@Inject(PEP_BROADCAST_SERVICE) private broadcastService: BroadcastService
    ) {
        // let userLang = 'en';
        // translate.setDefaultLang(userLang);
        // const languages = translate.getBrowserLang().split('-')
        // userLang = languages[0]; // use navigator lang if available
        // translate.use(userLang);           
        
        // singleSpaPropsSubject.subscribe(props => {
        //     this.addonData = props['addon'];
        //     this.route = props['route'] ?  props['route'] : activatedRoute.snapshot;
        // });

        // this.broadcastService.publish({ type: 'RELOAD_SETTINGS_BAR', payload: null});
        if (window.location.search.indexOf('support_user=true') > 0) {
            this.isSupportUser = true;
        }
    }

    setAddonList(addons: any) {
        this.addonsList = addons;
    }
    tabClick(e) {
        // this.selectedTab = this.tabGroup.selectedIndex === 0 ? 'addons' : 'permission';
        // const self = this;
        // self.PepperiListContComponent.onListChange(this.tabGroup.selectedIndex);
    }
    refreshSettingsTree(e){
        //this.broadcastService.publish({ type: 'RELOAD_SETTINGS_BAR', payload: null});
        window.postMessage({ type: 'RELOAD_SETTINGS_BAR' }, '*');
        //   this.addEditors.emit();
    }
}
