import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { singleSpaPropsSubject } from 'src/single-spa/single-spa-props';


@Component({
    selector: 'addon-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent  {
    @ViewChild('tabGroup') tabGroup;
    @Output() addEditors: EventEmitter<any> = new EventEmitter<any>();
    installing = false;
    addonsList = [];
    //selectedTab: string;
    addonData: any;
    route;
    constructor(
      public translate: TranslateService,
      private activatedRoute: ActivatedRoute,
      private router: Router
    ) {
      let userLang = 'en';
      translate.setDefaultLang(userLang);
      const languages = translate.getBrowserLang().split('-')
      userLang = languages[0]; // use navigator lang if available
      translate.use(userLang);
      singleSpaPropsSubject.subscribe(props => {
          this.addonData = props['addon'];
          this.route = props['route'] ?  props['route'] : activatedRoute.snapshot;
        });
      debugger;


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
      this.addEditors.emit();
  }



}
