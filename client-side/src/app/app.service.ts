import { Injectable } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AddonsSearch } from './app.model';
import { PepHttpService, PepSessionService, PepUtilitiesService, PepRowData } from '@pepperi-addons/ngx-lib'
import { Observable, of, throwError, interval, timer, Subject, forkJoin } from 'rxjs';
import { tap, share, finalize, catchError, mergeMap, switchMap, repeatWhen, takeLast, switchMapTo, take, takeWhile, last, first, debounceTime, skipWhile, map, takeUntil } from 'rxjs/operators';

import { ComparisionType } from './common/enums/comparision-type.enum';


@Injectable({
    providedIn: 'root'
})
export class AppService {
    // subscription: any;
    // accessToken = '';
    // apiBaseURL = '';
    // svgIcons;
    // pluginUUID = '';
    // version = 'V1.0';
    private _addonsList: any[] = [];
    private _pepRowDataAddons: PepRowData[] = [];
    private _addonsList$: Observable<any>;
    private _permissionList: any[] = [];
    private _permissionList$: Observable<any>;

    constructor(
        private http: PepHttpService,
        private session: PepSessionService,
        // public userService: UserService,
        private utilities: PepUtilitiesService,
        public dialog: MatDialog
    ) {
        // this.svgIcons = this.userService.svgIcons;
    }

    set addons(val: PepRowData[]) {
        this._pepRowDataAddons = val;
    }

    get addons() {
        return this._pepRowDataAddons;
    }
    /*
        getList(listType = '', ListCustomizationParams = '', listTabName = '', indexStart: number = 0
            , indexEnd: number = 100, searchTxt: any = '', func = null, additionalFilter: string = '', showGlobalLoading: boolean = true
            , useWebWorker: boolean = false, dateFilter: string = '') {
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
                SearchText: typeof searchTxt === 'object' ? searchTxt.Value : searchTxt,
                SmartSearch: [],
                AdditionalFilter: additionalFilter,
                RetrieveCount: true,
                DateFilter: dateFilter,
                RetrieveDeleted: false
            });
    
            // this.userService.httpPost(
            this.http.postWapiApiCall('Service1.svc/v1/list/' + listType + '/Search', body).subscribe(res => func(res));
        }
    
        updateSystemData(body: any, successFunc, errorFunc = null) {
            this.http.postPapiApiCall('/addons/installed_addons', body).subscribe(res => successFunc(res), err => errorFunc(err));
        } */

    updateAdditionalData(additionalData: any, successFunc, errorFunc = null) {
        const body = ({
            'Addon': { 'UUID': '' },
            'AdditionalData': JSON.stringify(additionalData)
        });
        this.http.postPapiApiCall('/addons/installed_addons', body).subscribe(res => successFunc(res), err => errorFunc(err));
    }

    getInstalledAddOnsList(func: Function) {
        this.http.getPapiApiCall('/addons/installed_addons').subscribe(res => func(res));
    }

    getInstalledAddOn(uuid, func: Function) {
        this.http.getPapiApiCall(`/addons/installed_addons/${uuid}`)
            .subscribe(res => func(res));

    }

    isAllowInstallAddon(addonUUID: string, enableKey: string, func: Function) {
        if (enableKey && enableKey.length > 0) {
            this.http.getPapiApiCall('/company/flags/' + enableKey).subscribe(res => func(res));
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
        this.http.postPapiApiCall(url, body).subscribe(res => successFunc(res), err => { });

    }

    editAddon2(action: string, addonUUID: string, version: string): Observable<any> {
        const body = {
            UUID: addonUUID,
            Version: version
        };
        const url = version ? `/addons/installed_addons/${addonUUID}/${action}/${version}` : `/addons/installed_addons/${addonUUID}/${action}`;

        return this.http.postPapiApiCall(url, body);
    }

    deleteAddon(addonUUID: string, func: Function) {
        const url = `/addons/installed_addons/${addonUUID}/install`;
        this.http.getPapiApiCall(url).subscribe(res => func(res));
    }

    downloadAddonFiles(addonId: string, versionId: string, func: Function) {
        const url = '/addons/' + addonId + '/versions/' + versionId;
        this.http.getPapiApiCall(url).subscribe(res => func(res));
    }

    getProfiles(): Observable<any> {
        return this.http.getPapiApiCall('/profiles');
        //this.http.getPapiApiCall('/profiles').subscribe(res => func(res));
    }

    getAddonList(searchObject: AddonsSearch): Observable<any> {
        if (this._addonsList.length) {
            return of(this._addonsList);
        } else if (this._addonsList$) {
            return this._addonsList$;
        } else {
            const endpoint = searchObject.ListType;
            const url = `/addons/api/${searchObject.UUID}/api/${endpoint}`;
            this._addonsList$ = this.http.postPapiApiCall(url, searchObject).pipe(
                tap(res => {
                    this._addonsList = res;
                }),
                catchError(err => {
                    throw `Error while retrieving addons: ${err}`
                }),
                share(),
                finalize(() => {
                    this._addonsList$ = null;
                }));
            return this._addonsList$;
        }
    }

    clearAddonList() {
        this._addonsList = [];
    }

    getData(searchObject: AddonsSearch): Observable<any> {


        // this.userService.setShowLoading(true);
        const endpoint = searchObject.ListType;

        // --- Work live in sandbox upload api.js file to plugin folder
        // const url = `/addons/api/${searchObject.UUID}/api/${endpoint}`;
        // this.http.postPapiApiCall(url, searchObject).subscribe(
        //     res => successFunc(res), 
        //     err => errorFunc(err));
        const url = `/addons/api/${searchObject.UUID}/api/${endpoint}`;
        return this.http.postPapiApiCall(url, searchObject);

        // --- Work localhost
        /*const url = `http://localhost:4400/api/${endpoint}`;
        this.http.postHttpCall(url, searchObject).subscribe(
            res => successFunc(res), error => errorFunc(error), () => {}
        );*/
        /*const url = `http://localhost:4400/api/${endpoint}`;
         return this.http.postHttpCall(url, searchObject);*/
    }

    getAddonVersions(uuid, successFunc, errorFunc) {
        // this.userService.setShowLoading(true);
        // const endpoint = searchObject.ListType === 'all' ? 'addons' : 'updates';
        // --- Work live in sandbox upload api.js file to plugin folder
        // const url = `/addons/api/${uuid}/api/addon_versions`;
        // this.http.getPapiApiCall(url).subscribe(res => successFunc(res), err => errorFunc(err));

        // --- Work localhost
        const url = `http://localhost:4400/api/addon_versions`;
        this.http.postHttpCall(url, { UUID: uuid }, { 'headers': { 'Authorization': 'Bearer ' + this.session.getIdpToken() } }).subscribe(
            res => successFunc(res),
            error => errorFunc(error),
            () => { }
        );

    }

    getExecutionLog(executionUUID, callback) {
        const url = `/audit_logs/${executionUUID}`;
        this.http.getPapiApiCall(url).subscribe(res => callback(res));
    }

    getExecutionLog2(executionUUID) {
        return timer(0, 3000).pipe(
            switchMap(() => this.http.getPapiApiCall(`/audit_logs/${executionUUID}`)),
            takeWhile(res => res && res.Status && res.Status.Name === 'InProgress', true),
            last()
        )
    }

    bulkUpgrade(rowsData: any[]) {
        let upgradeRequests: any[] = [];
        let executionLogRequests: any[] = [];
        let upgradeResponse: { Status: number, ErrorMessage?: string, ResendAddons?: any[] } = { Status: 0 };

        rowsData.forEach((item: any) => {
            upgradeRequests.push(this.editAddon2('upgrade', item.Fields[0].AdditionalValue, ''))
        });
        return forkJoin(upgradeRequests)
            .pipe(
                switchMap(res => {
                    console.log('merged inner', res);
                    let dependentAddons: any[] = [];
                    res.forEach((item: any) => {
                        /*this.getExecutionLog2(item.ExecutionUUID || item.ExcecutionUUID)
                            .pipe(
                                tap(addon => {
                                    if (addon?.Status?.Name && addon.AuditInfo?.ErrorMessage) {
                                        if (addon.Status.Name === 'Failure') {
                                            if (addon.AuditInfo.ErrorMessage.includes('dependencies')) {
                                                const dependentAddon = rowsData.find(item => item.Fields[0].AdditionalValue === addon.AuditInfo.Addon?.UUID);
                                                if (dependentAddon) {
                                                    dependentAddons.push(dependentAddon);
                                                }
                                            } else {
                                                upgradeResponse.Status = 1;
                                                upgradeResponse.ErrorMessage = 'Some error';//this.translate.instant('Addon_FailedOperation');
                                            }
                                        }
                                    } else {
                                        //TODO - is it possible?
                                    }
                                    if (dependentAddons.length) {
                                        upgradeResponse.ResendAddons = dependentAddons;
                                    }
                                   // return upgradeResponse;
                                })
                            ) */
                        
                        this.getExecutionLog2(item.ExecutionUUID || item.ExcecutionUUID).subscribe(addon => {
                            if (addon?.Status?.Name && addon.AuditInfo?.ErrorMessage) {
                                if (addon.Status.Name === 'Failure') {
                                    if (addon.AuditInfo.ErrorMessage.includes('dependencies')) {
                                        const dependentAddon = rowsData.find(item => item.Fields[0].AdditionalValue === addon.AuditInfo.Addon?.UUID);
                                        if (dependentAddon) {
                                            dependentAddons.push(dependentAddon);
                                        }
                                    } else {
                                        upgradeResponse.Status = 1;
                                        upgradeResponse.ErrorMessage = 'Some error';//this.translate.instant('Addon_FailedOperation');
                                    }
                                }
                            } else {
                                //TODO - is it possible?
                            }
                            if (dependentAddons.length) {
                                upgradeResponse.ResendAddons = dependentAddons;
                            }
                        }); 
                    });
                   
                    return of(upgradeResponse);
                })
            )
    }

    setSystemData(uuid, AutomaticUpgrade: boolean, callback) {
        const body = {
            Addon: { UUID: uuid },
            AutomaticUpgrade
        };
        // this.userService.setShowLoading(true);
        this.http.postPapiApiCall('/addons/installed_addons', body).subscribe(res => callback(res));
    }

    getPermissionsList(profile, useExistingData: boolean): Observable<any> {
        if (useExistingData) {
            return of(this._permissionList);
        } else {
            if (this._permissionList$) {
                return this._permissionList$;
            } else {
                const internalId = profile?.key ? profile.key : profile?.source?.key;
                const whereStr = `?where=Context.Name="AddonsPermissions" AND Context.Profile.InternalID=${internalId}`;
                const url = `/meta_data/data_views${whereStr}`;
                this._permissionList$ = this.http.getPapiApiCall(url).pipe(
                    tap(res => {
                        this._permissionList = res;
                    }),
                    catchError(err => {
                        throw `Error while retrieving permissions: ${err}`
                    }),
                    share(),
                    finalize(() => {
                        this._permissionList$ = null;
                    }));
                return this._permissionList$;
            }
        }
    }

    createPermission(body, successFunc, errorFunc = null) {
        const url = '/meta_data/data_views';
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

    getMaintenance(func: Function) {
        this.http.getPapiApiCall('/distributor').subscribe(res => func(res));
    }

    publishMaintenance(body: any, successFunc: Function) {
        this.http.postPapiApiCall('/distributor', body).subscribe(res => successFunc(res));
    }

    async updateAllAddons(addonUUID, successFunc: Function) {
        //const url = `api/update_alladdons`;
        //await this.http.postPapiApiCall(url, {"InitiateDistributor": true}).subscribe(res => successFunc(res));

        await this.http.postPapiApiCall(`/addons/api/${addonUUID}/api/update_alladdons`, { "InitiateDistributor": true }).subscribe(res => successFunc(res));


    }

    getPhasedType(addon) {
        const systemData = this.utilities.isJsonString(addon.Addon.SystemData) ? JSON.parse(addon.Addon.SystemData.toString()) : {};
        const currentPhasedVer = systemData.CurrentPhasedVersion;
        const installedVer = addon.Version;

        if (currentPhasedVer && installedVer) {
            const v1Octets = currentPhasedVer.split('.');
            const v2Octets = installedVer.split('.');
            const len = Math.min(v1Octets.length, v2Octets.length);

            for (let i = 0; i < len; ++i) {
                const num1 = parseInt(v1Octets[i], 10);
                const num2 = parseInt(v2Octets[i], 10);
                if (num1 > num2) return ComparisionType.BiggerThan;
                if (num1 < num2) return ComparisionType.SmallerThan;
            }

            return v1Octets.length === v2Octets.length ? ComparisionType.EqualTo : (v1Octets.length < v2Octets.length ? ComparisionType.SmallerThan : ComparisionType.BiggerThan);
        } else {
            return ComparisionType.EqualTo;
        }
    }



}


