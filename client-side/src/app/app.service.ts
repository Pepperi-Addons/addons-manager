import { Injectable } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AddonsSearch } from './app.model';
import { PepHttpService, PepSessionService, PepUtilitiesService, PepRowData } from '@pepperi-addons/ngx-lib'
import { Observable, of, throwError, interval, timer, Subject, forkJoin } from 'rxjs';
import { tap, share, finalize, catchError, mergeMap, switchMap, repeatWhen, takeLast, switchMapTo, take, takeWhile, last, first, debounceTime, skipWhile, map, takeUntil } from 'rxjs/operators';

import { ComparisionType } from './common/enums/comparision-type.enum';

class Customer {

}

@Injectable({
    providedIn: 'root'
})
export class AppService {
    private _addonsList: any[] = [];
    private _pepRowDataAddons: PepRowData[] = [];
    private _addonsList$: Observable<any>;
    private _permissionList: any[] = [];
    private _permissionList$: Observable<any>;
    //TEMP

    private _subject = new Subject<Customer>();
    readonly customer$ = this._subject.asObservable();

    getCustomer(customerId: string) {
        return this.http.getPapiApiCall(`/api/customer/${customerId}`)
            .pipe(
                tap((res: Customer) => {
                    this._subject.next(res);
                })
            )
    }


    //TEMP
    constructor(
        private http: PepHttpService,
        private session: PepSessionService,
        private utilities: PepUtilitiesService,
        public dialog: MatDialog
    ) {
        //
    }

    set addons(val: PepRowData[]) {
        this._pepRowDataAddons = val;
    }

    get addons() {
        return this._pepRowDataAddons;
    }

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

    editAddon(action: string, addonUUID: string, version: string): Observable<any> {
        const body = {
            UUID: addonUUID,
            Version: version
        };
        const url = version ? `/addons/installed_addons/${addonUUID}/${action}/${version}` :
            `/addons/installed_addons/${addonUUID}/${action}`;

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

    getExecutionLog(executionUUID) {
        return this.http.getPapiApiCall(`/audit_logs/${executionUUID}`);
    }

    geCompletedExecutionStatus(executionUUID) {
        return timer(0, 3000)
            .pipe(
                switchMap(() => this.getExecutionLog(executionUUID)),
                takeWhile(res => res && res.Status && res.Status.Name === 'InProgress', true)                
            )
    }

    bulkUpgrade(addons: any[]) {
        let upgradeRequests: any[] = [];

        addons.forEach((addon: any) => {
            upgradeRequests.push(this.editAddon('upgrade', addon.Data.Fields[0].AdditionalValue, ''))
        });
        return forkJoin(upgradeRequests)
            .pipe(
                switchMap(res => {
                    let executionLogRequests: any[] = [];
                    res.forEach((item: any) => {
                        executionLogRequests.push(this.geCompletedExecutionStatus(item.ExecutionUUID || item.ExcecutionUUID));
                    });
                    return forkJoin(executionLogRequests);
                })
            )
    }

    setSystemData(uuid, AutomaticUpgrade: boolean, callback) {
        const body = {
            Addon: { UUID: uuid },
            AutomaticUpgrade
        };
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
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.data = data;
        dialogConfig.panelClass = ['pepperi-dialog', panelClass];
    }

    getMaintenance(func: Function) {
        this.http.getPapiApiCall('/distributor').subscribe(res => func(res));
    }

    publishMaintenance(body: any, successFunc: Function) {
        this.http.postPapiApiCall('/distributor', body).subscribe(res => successFunc(res));
    }

    async updateAllAddons(addonUUID, successFunc: Function) {
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


