import { Injectable } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AddonsSearch } from './app.model';
import { PepHttpService, PepSessionService} from '@pepperi-addons/ngx-lib'


@Injectable()
export class AppService {
    subscription: any;
    accessToken = '';
    apiBaseURL = '';
    svgIcons;
    pluginUUID = '';
    version = 'V1.0';

    constructor(
        private http: PepHttpService,
        private session: PepSessionService,
        // public userService: UserService,
        public dialog: MatDialog
    ) {
        // this.svgIcons = this.userService.svgIcons;
}

    getList(listType = '', ListCustomizationParams = '', listTabName = '', indexStart: number = 0
    ,       indexEnd: number = 100, searchTxt: any = '', func = null, additionalFilter: string = '', showGlobalLoading: boolean = true
    ,       useWebWorker: boolean = false, dateFilter: string = '') {
		let self = this;
		const body = JSON.stringify({
			ListType: listType,
			// ListCustomizationParams: '{"Prefix":"CodeJob","Path":"code_jobs","AdditionalApiNames":["ModificationDateTime","CreationDateTime"]}',
			// ListTabName: '[GL#dff55bbc-a623-43be-ada5-b88173f56a48]ListView',
			ListCustomizationParams,
			ListTabName: listTabName,
			IndexStart: indexStart,
			IndexEnd: indexEnd,
			OrderBy: 'CreationDateTime',
			Ascending: false,
			SearchText: typeof searchTxt ===  'object' ? searchTxt.Value : searchTxt,
			SmartSearch: [],
			AdditionalFilter: additionalFilter,
			RetrieveCount: true,
			DateFilter: dateFilter,
			RetrieveDeleted: false
		});

		// this.userService.httpPost(
        this.http.postWapiApiCall( 'Service1.svc/v1/list/' + listType + '/Search', body).subscribe(res => func(res));
	}

	updateSystemData(body: any, successFunc, errorFunc = null) {
		this.http.postPapiApiCall('/addons/installed_addons', body).subscribe(res => successFunc(res),err => errorFunc(err));
	}

    updateAdditionalData(additionalData: any, successFunc, errorFunc = null) {
        const body = ({
          'Addon': {'UUID': this.pluginUUID},
          'AdditionalData': JSON.stringify(additionalData)
        });
        this.http.postPapiApiCall('/addons/installed_addons', body).subscribe(res => successFunc(res), err => errorFunc(err));
    }

    getAddOnsList(func: Function) {
        this.http.getPapiApiCall('/addons').subscribe(res => func(res));
    }

    getInstalledAddOnsList(func: Function) {
        this.http.getPapiApiCall('/addons/installed_addons').subscribe( res => func(res));
    }

    getInstalledAddOn(uuid, func: Function) {
        this.http.getPapiApiCall(`/addons/installed_addons/${uuid}`)
        .subscribe(res => func(res));

    }

    isAllowInstallAddon(addonUUID: string, enableKey: string, func: Function) {
        if (enableKey && enableKey.length > 0) {
            this.http.getPapiApiCall( '/company/flags/' + enableKey).subscribe(res => func(res));
        } else {
            func(true);
        }
    }

    editAddon(action = '', addonUUID = null, successFunc: Function = null, errorFunc = null, version = '') {
        // this.userService.setShowLoading(true);
        // const ver = action === 'upgrade' ? `/${version}` : '' ;
        const body = {
            UUID: addonUUID,
            Version: version
        };
        let url = '';
        if (version) {
            url = `/addons/installed_addons/${addonUUID}/${action}/${version}`;
            body.Version = version;
        } else {
            url = `/addons/installed_addons/${addonUUID}/${action}`;
        }
        this.http.postPapiApiCall( url, body).subscribe(res => successFunc(res),  err => {});


        // if (version) {
        //     body.Version = version
        // }
        // url = `http://localhost:4400/api/${action}`;
        // return this.http.post(url, body, { 'headers': {'Authorization': 'Bearer ' + this.userService.getUserToken() }}).subscribe(
        //         res => successFunc(res),
        //         error => errorFunc(error),
        //         () => this.userService.setShowLoading(false)
        //     );


    }

    deleteAddon(addonUUID: string, func: Function) {
        const url = `/addons/installed_addons/${addonUUID}/install`;
        this.http.getPapiApiCall(url).subscribe(res => func(res));
    }

    downloadAddonFiles(addonId: string, versionId: string, func: Function) {
        const url = '/addons/' + addonId + '/versions/' + versionId;
        this.http.getPapiApiCall(url).subscribe(res => func(res));
    }

    getProfiles(func: Function) {
        this.http.getPapiApiCall('/profiles').subscribe(res => func(res));
    }

    getData(searchObject: AddonsSearch, successFunc, errorFunc) {
        // this.userService.setShowLoading(true);
        const endpoint = searchObject.ListType;

        // --- Work live in sandbox upload api.js file to plugin folder
        const url = `/addons/api/${searchObject.UUID}/api/${endpoint}`;
        this.http.postPapiApiCall(url, searchObject).subscribe(res => successFunc(res), err => errorFunc(err));

        // // --- Work localhost
        // const url = `http://localhost:4400/api/${endpoint}`;
        // this.http.postHttpCall(url, searchObject).subscribe(
        //     res => successFunc(res), error => errorFunc(error), () => {}
        // );
    }

    getAddonVersions(uuid, successFunc, errorFunc) {
        // this.userService.setShowLoading(true);
        // const endpoint = searchObject.ListType === 'all' ? 'addons' : 'updates';
        // --- Work live in sandbox upload api.js file to plugin folder
        // const url = `/addons/api/${uuid}/api/addon_versions`;
        // this.http.getPapiApiCall(url).subscribe(res => successFunc(res), err => errorFunc(err));

        // --- Work localhost
        const url = `http://localhost:4400/api/addon_versions`;
        this.http.postHttpCall(url, {UUID: uuid}, { 'headers': {'Authorization': 'Bearer ' + this.session.getIdpToken() }}).subscribe(
            res => successFunc(res),
            error => errorFunc(error),
            () => {}
        );

    }

    getExecutionLog(executionUUID, callback) {
              const url = `/audit_logs/${executionUUID}`;
              this.http.getPapiApiCall(url).subscribe(res => callback(res));

    }

    setSystemData(uuid, AutomaticUpgrade: boolean, callback) {
        const body = {
            Addon: { UUID: uuid},
            AutomaticUpgrade
        };
        // this.userService.setShowLoading(true);
        this.http.postPapiApiCall('/addons/installed_addons', body).subscribe(res => callback(res));
    }

    getPermissionsList(profile, successFunc, errorFunc) {
        if (profile){
            const internalId = profile?.key ? profile?.key : profile?.source?.key;
            const whereStr = `?where=Context.Name="AddonsPermissions" AND Context.Profile.InternalID=${internalId}`;
            const url = `${this.apiBaseURL}/meta_data/data_views${whereStr}`;
            this.http.getPapiApiCall(url).subscribe(res => successFunc(res), err => errorFunc(err));
        }

    }

    createPermission(body, successFunc, errorFunc = null) {
        const url = this.apiBaseURL + '/meta_data/data_views';
        this.http.postPapiApiCall('/meta_data/data_views', body).subscribe(res => successFunc(res), err => errorFunc(err));
    }

    openDialog(data, panelClass: string = 'pepperi-standalone', dlgHeight: string = 'auto', dlgMinWidth: string = '0', dlgMaxWidth: string = '100vw', dlgMaxHeight: string = '100vh') {

        const dialogConfig = new MatDialogConfig();
        dialogConfig.maxWidth = dlgMaxWidth;
        dialogConfig.maxHeight = dlgMaxHeight;
        dialogConfig.height = dlgHeight;
        dialogConfig.minWidth = dlgMinWidth;
        // dialogConfig.direction = this.isRTLlang ? 'rtl' : 'ltr';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;

        // dialogConfig.scrollStrategy = this.overlay.scrollStrategies.noop();

        dialogConfig.data = data;
        dialogConfig.panelClass = ['pepperi-dialog', panelClass];

        // const dialogRef = this.dialog.open(GlobalDialogComponent, dialogConfig);

        // dialogRef.afterClosed().subscribe(result => {
        //     if (result && result.callback) {
        //         result.callback(result);
        //     }
        // });

    }

}


