import {
  ObjectSingleData, PepDataConvertorService, PepFieldData,
  PepUtilitiesService, ObjectsDataRow
} from '@pepperi-addons/ngx-lib';
// Main Imports
import {
  Component, EventEmitter, OnInit, OnDestroy, Input, ComponentRef,
  ViewChild, Output, ChangeDetectorRef, ElementRef, ComponentFactoryResolver
} from '@angular/core';
import { of, Subscription, SubscriptionLike, zip, forkJoin, interval, Observable } from 'rxjs';
//import { forkJoin } from 'rxjs/index';
import { map, first, last, catchError, switchMap, tap, share, mergeMap, takeWhile, take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

// Internal Import
import { AppService } from '../../app.service';
import {
  AddonsSearch, InstalledAddon, DataRowField,
  Addon, AddonType
} from '../../app.model';
import {
  PermissionObjectContextProfile, PermissionsDialogComponent, AddonsPermissions,
  PermissionObjectField, PermissionObjectContext
} from '../dialogs/permissions-dialog/permissions.component';
import { EditDialogComponent } from '../dialogs/edit-dialog/edit-dialog.component';
import { ChangeVersionDialogComponent } from '../dialogs/change-version-dialog/change-version-dialog.component';
import {
  IPepGenericListDataSource,
  IPepGenericListParams,
  IPepGenericListPager,
  IPepGenericListActions,
  IPepGenericListInitData,
  PepGenericListService

} from '@pepperi-addons/ngx-composite-lib/generic-list';
//import { AddonPhasedType } from '../../common/enums/addon-phased-type.enums';
import { ComparisionType } from '../../common/enums/comparision-type.enum';

// External Import
import { PepRowData, FIELD_TYPE } from '@pepperi-addons/ngx-lib';
import { PepDialogService, PepDialogData, PepDialogSizeType, PepDialogActionButton } from '@pepperi-addons/ngx-lib/dialog';
import { PepMenuItem } from '@pepperi-addons/ngx-lib/menu';
import { PepListComponent, PepSelectionData } from '@pepperi-addons/ngx-lib/list';
import { PepTopBarComponent } from '@pepperi-addons/ngx-lib/top-bar';
import { GridDataView, GridDataViewField, DataViewFieldType } from '@pepperi-addons/papi-sdk/dist/entities/data-view';
import { GenericListComponent } from '@pepperi-addons/ngx-composite-lib/generic-list';

import Semver from "semver";


@Component({
  selector: 'pep-list-cont',
  templateUrl: './pepperi-list.component.html',
  styleUrls: ['./pepperi-list.component.scss']
})
export class PepperiListContComponent {
  @ViewChild('glist') genericlist: GenericListComponent | undefined;

  @ViewChild(PepListComponent, { static: true })
  pepList: PepListComponent;
  @ViewChild(PepTopBarComponent, { static: true })
  pepTopBar: PepTopBarComponent;

  //topBarComp
  @Output() setAddonList = new EventEmitter<any>();
  @Output() refreshSettingsTree = new EventEmitter<any>();

  @Input() pluginPath: string;
  @Input() addonData: any;

  @Input() apiEndpoint = '';
  @Input() isSupportUser = '';

  listActions: Array<PepMenuItem> = [];
  currentList = { ListType: '', ListCustomizationParams: '', ListTabName: '', ListFilterStr: '' };
  dataSource: IPepGenericListDataSource;
  actions: IPepGenericListActions;
  pager: IPepGenericListPager = {
    type: 'pages',
    size: 15,
    index: 0
  };
  totalRows = 0;
  view: any;
  installing = false;
  searchString = '';
  updateAvailable = false;
  installedAddonsList = [];
  installedAddonsWithEditor = [];
  existPermissions = [];
  enableAddonAutomaticUpgrade = false;
  currentApiVersion = '';
  profilesList = [];
  selectedProfile = null;
  topBarTitle = '';
  listDescription = '';
  noDataMsg = '';
  //

  addonsMenuActions: Array<PepMenuItem> = [];
  addonsMenuActionsHandlers: { [key: string]: (obj: any) => Promise<void> } = {};

  constructor(
    public pluginService: AppService,
    public cd: ChangeDetectorRef,
    public translate: TranslateService,
    public pepData: PepDataConvertorService,
    private dialog: PepDialogService,
    private utilities: PepUtilitiesService
  ) {

    let userLang = 'en';
    translate.setDefaultLang(userLang);
    userLang = translate.getBrowserLang().split('-')[0]; // use navigator lang if available
    translate.use(userLang);
    this.topBarTitle = 'AddonManager_All_List';
  }

  ngOnInit(): void {
    if (this.apiEndpoint === 'permissions') {
      this.loadPermissions();
      this.loadPermissionsActions();
    } else {
      this.loadAddons();
      this.loadAddonActions();
    }
  }

  private getAddonsDataView(): GridDataView {
    return {
      Context: {
        Name: '',
        Profile: { InternalID: 0 },
        ScreenSize: 'Landscape'
      },
      Type: 'Grid',
      Fields: [
        this.getDataViewField('Name'),
        this.getDataViewField('Description'),
        this.getDataViewField('Version'),
        this.getDataViewField('LastUpgradeDateTime', 'Last Update', 'DateAndTime')
      ],
      Columns: [
        { Width: 20 },
        { Width: 30 },
        { Width: 20 },
        { Width: 20 }
      ],
      FrozenColumnsCount: 0,
      MinimumColumnWidth: 0
    }
  }

  private getPermissionsDataView(): GridDataView {
    return {
      Context: {
        Name: '',
        Profile: { InternalID: 0 },
        ScreenSize: 'Landscape'
      },
      Type: 'Grid',
      Fields: [
        this.getDataViewField('FieldID', 'Addon'),
        this.getDataViewField('Title', 'Editor')
      ],
      Columns: [
        { Width: 40 },
        { Width: 60 }
      ],
      FrozenColumnsCount: 0,
      MinimumColumnWidth: 0
    }
  }

  private getDataViewField(name: string, title: string = name, type: DataViewFieldType = 'TextBox') {
    return {
      FieldID: name,
      Type: type,
      Title: title,
      Mandatory: false,
      ReadOnly: true
    }

  }

  sortGrid(array: Array<PepRowData>, key: string, isAsc: boolean) {
    array.sort((a, b) => {
      const first = a.Fields?.find((field) => field.ApiName === key)?.Value;
      const second = b.Fields?.find((field) => field.ApiName === key)?.Value;
      if (first !== null && second !== null) {
        if (first < second) {
          return isAsc ? 1 : -1;
        } else if (first > second) {
          return isAsc ? -1 : 1;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    });
  }

  loadAddons() {
    this.noDataMsg = 'AddonManager_NoAddons';
    this.listDescription = 'AddonManager_addonSecTitle';
    this.setAddonsDataSource();
  }

  loadPermissions() {
    this.noDataMsg = 'AddonManager_NoPermissions';
    this.listDescription = 'AddonManager_permissionSecTitle';
    this.pluginService.getProfiles().pipe(first()).subscribe(res => {
      this.profilesList = [];
      if (res) {
        this.profilesList = res.filter(profile => profile.Name !== 'Admin').map(profile => {
          return {
            key: profile.InternalID,
            text: profile.Name,
            view_type: profile.InternalID
          };
        });
        this.selectedProfile = this.profilesList[0];
        if (this.selectedProfile) {
          this.setPermissionsDataSource();
        }
      }
    });
  }

  loadAddonActions() {
    this.actions = {
      get: async (data: PepSelectionData) => {
        let actions: any[] = [];

        if (data?.rows.length === 1 && data.selectionType !== 0) {
          const uuid = data.rows[0];
          const rowData = this.genericlist.getItemById(uuid);
          if (rowData?.Fields) {
            let phasedType: ComparisionType = ComparisionType.EqualTo;
            let isLatestAvailable = true;
            let isInstalled = false;
            let hasVersions = true;
            let isAddonSystemType = true;

            const version = rowData.Fields.find(field => field.ApiName === 'Version');
            if (version) {
              const jsonString = version.AdditionalValue;
              const additionalValue = this.utilities.isJsonString(jsonString) ? JSON.parse(jsonString) : {};
              phasedType = additionalValue.PhasedType;
              isLatestAvailable = additionalValue.LatestAvailable;
              isInstalled = additionalValue.Installed;
              hasVersions = additionalValue.HasVersions;
              const desc = rowData.Fields.find(field => field.ApiName === 'Description');
              if (desc) {
                isAddonSystemType = desc.AdditionalValue === '1';
              }
            }

            if (!isInstalled) {
              const action = {
                title: this.translate.instant('Addonmanager_Action_Install'),
                handler: async (params) => {
                  this.editRow('install', 'InstallAddon_Header', { Text: 'InstallAddon_Body', Data: {} }, '', rowData);
                }
              }
              actions.push(action);
            }

            if (isInstalled && !isAddonSystemType) {
              const action = {
                title: this.translate.instant('Addonmanager_Action_Uninstall'),
                handler: async (params) => {
                  this.editRow('uninstall', 'UninstallAddon_Header', { Text: 'UninstallAddon_Body', Data: {} }, '', rowData);
                }
              }
              actions.push(action);
            }

            if (isInstalled && phasedType === ComparisionType.BiggerThan) {
              const action = {
                title: this.translate.instant('Addonmanager_Action_Upgrade'),
                handler: async (params) => {
                  this.editRow('upgrade', 'UpgradeAddon_Header', { Text: 'UpgradeAddon_Body', Data: {} }, '', rowData);
                }
              }
              actions.push(action);
            }

            if (isInstalled && this.isSupportUser) {
              const action = {
                title: this.translate.instant('AddonsManager_ChangeVersion_Header'),
                handler: async (params) => {
                  this.openChangeVersionDialog(rowData);
                }
              }
              actions.push(action);
            }
          }
        } else if (data?.rows.length > 1 && data.selectionType !== 0) {
          const upgradeAllItems = this.getUpgradeAllAction(data.rows);
          if (upgradeAllItems.length) {
            const action = {
              title: this.translate.instant('Addonmanager_Action_UpgradeAll'),
              handler: async (params) => {
                this.bulkUpgrade(upgradeAllItems);
              }
            }
            actions.push(action);
          }
        } else if (data.selectionType === 0) {
          let upgradeAllItems: any[] = [];
          let filteredAddons: any[] = [];
          if (data.rows.length) {
            //remove unselected items
            filteredAddons = this.pluginService.addons.filter(addon => addon.UUID && data.rows.indexOf(addon.UUID) === -1)
              .map(item => item.UUID);
          } else {
            filteredAddons = this.pluginService.addons.filter(addon => addon.UUID).map(item => item.UUID);
          }
          upgradeAllItems = this.getUpgradeAllAction(filteredAddons);
          if (upgradeAllItems.length) {
            const action = {
              title: this.translate.instant('Addonmanager_Action_UpgradeAll'),
              handler: async (params) => {
                this.bulkUpgrade(upgradeAllItems);
              }
            }
            actions.push(action);
          }
        }
        return actions;
      }
    }
  }

  loadPermissionsActions() {
    this.actions = {
      get: async (data: PepSelectionData) => {
        let actions: any[] = [];

        if (data?.rows.length === 1 && data.selectionType !== 0) {
          const uuid = data.rows[0];
          const rowData = this.genericlist.getItemById(uuid);
          if (rowData?.Fields) {
            const action = {
              title: this.translate.instant('Addonmanager_Action_Delete'),
              handler: async (params) => {
                this.showDeletePermissionModal(rowData);
              }
            }
            actions.push(action);
          }

          return actions;
        } else {
          return []
        }
      }
    }
  }

  getUpgradeAllAction(rows: any) {
    let upgradeItems: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rowData = this.genericlist.getItemById(rows[i]);
      if (rowData?.Fields) {
        let phasedType: ComparisionType;
        let isInstalled = false;
        const version = rowData.Fields.find(field => field.ApiName === 'Version');
        if (version) {
          const jsonString = version.AdditionalValue;
          const additionalValue = this.utilities.isJsonString(jsonString) ? JSON.parse(jsonString) : {};
          phasedType = additionalValue.PhasedType;
          isInstalled = additionalValue.Installed;
          if (isInstalled && phasedType === ComparisionType.BiggerThan) {
            upgradeItems.push(rowData);
          }
        }
      }
    }

    return upgradeItems;
  }

  private setAddonsDataSource() {
    const searchObj: AddonsSearch = {
      Asc: true,
      SortBy: 'Name',
      ListType: 'addons',
      UUID: this.addonData.Addon.UUID
    };

    this.dataSource = {
      init: async (params: IPepGenericListParams) => {
        return (this.pluginService.getAddonList(searchObj).pipe(
          map(res => {
            const data = new Array<PepRowData>();
            const userKeys = ['Name', 'Description', 'Version', 'LastUpgradeDateTime'];
            if (this.isSupportUser === 'true') {
              userKeys.push('Type');
            }
            if (params?.searchString) {
              res = res.filter((addon: InstalledAddon) =>
                addon.Addon.Name?.includes(params.searchString) ||
                addon.Addon.Description?.includes(params.searchString)
              );
            }
            res.forEach((addon: InstalledAddon) => {
              data.push(this.convertAddonToPepperiRowData(addon, userKeys));
            });
            if (params?.sorting) {
              this.sortGrid(data, params.sorting.sortBy, params.sorting.isAsc);
            }
            this.pluginService.addons = data;
            return {
              dataView: this.getAddonsDataView(),
              totalCount: data.length,
              items: data,
              isPepRowData: true
            }
          }),
          catchError(err => {
            throw {
              dataView: null,
              totalCount: 0,
              items: []
            }
          }),
          first(),
        ).toPromise()
        );
      },
      inputs: {
        selectionType: 'multi'
      }
    }
  }

  setPermissionsDataSource() {
    this.dataSource = {
      init: async (params: IPepGenericListParams) => {
        const useExistingData = params.searchString !== undefined || params.sorting !== undefined;
        return (this.pluginService.getPermissionsList(this.selectedProfile, useExistingData).pipe(
          map(res => {
            const data = new Array<PepRowData>();
            const userKeys = ['FieldID', 'Title'];
            if (res[0]?.Fields?.length) {
              if (params.searchString) {
                this.existPermissions = res[0].Fields.filter((permission: any) =>
                  permission.FieldID?.includes(params.searchString) ||
                  permission.Title?.includes(params.searchString)
                );
              } else {
                this.existPermissions = res[0].Fields;
              }
              this.existPermissions.forEach((permission: InstalledAddon) => {
                data.push(this.convertPermissionToPepperiRowData(permission, userKeys));
              });
              if (params.sorting) {
                this.sortGrid(data, params.sorting.sortBy, params.sorting.isAsc);
              }
            } else {
              this.existPermissions = [];
            }
            return {
              dataView: this.getPermissionsDataView(),
              totalCount: data.length,
              items: data,
              isPepRowData: true
            }
          }),
          catchError(err => {
            throw {
              dataView: null,
              totalCount: 0,
              items: []
            }
          }),
          first(),
        ).toPromise()
        );
      },
      inputs: {
        selectionType: 'single'
      }
    }
  }

  openPermissionsDialog() {
    this.pluginService.getInstalledAddOnsList(installedAddonsList => {
      this.installedAddonsWithEditor = installedAddonsList.filter(addon => {
        if (addon === null || addon.Addon === null) {
          return false; // skip
        }
        const systemData = this.utilities.isJsonString(addon.SystemData) ? JSON.parse(addon.SystemData.toString()) : {};
        if (systemData === undefined || systemData.Editors === undefined) {
          return false;
        }
        return true;
      }).map(addon => {
        const systemData = this.utilities.isJsonString(addon.SystemData) ? JSON.parse(addon.SystemData.toString()) : {};
        return {
          key: addon.Addon.UUID,
          value: addon.Addon.Name,
          Editors: systemData.Editors

        };
      });
      const config = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'regular');

      const content = { installedAddons: this.installedAddonsWithEditor };
      const data = new PepDialogData({ content: { installedAddons: this.installedAddonsWithEditor }, showClose: true });
      const dialogRef = this.dialog.openDialog(PermissionsDialogComponent, data, config);
      dialogRef.afterClosed().subscribe(dialogData => {
        if (dialogData) {
          const fieldID = dialogData.selectedAddon.key + ';' + dialogData.selectedAddon.value;
          const Title = dialogData.selectedAddon.key + ';' +
            dialogData.selectedEditor.PackageName + ';' +
            dialogData.selectedEditor.Description;

          let isExits = false;
          this.existPermissions.forEach(field => {
            if (field.FieldID === fieldID && field.Title === Title) {
              isExits = true;
            }
          });
          if (!isExits) {
            this.createPermissionUI(this.existPermissions, fieldID, Title); // new AddonsPermissions(context, fieldsArr);
          } else {
            const modalTitle = this.translate.instant('Alert');
            const content = this.translate.instant('AddonManager_PermissionAlreadyExist');
            const data2 = new PepDialogData({ title: modalTitle, content, actionButtons: [null] });
            const config = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'regular');
            this.dialog.openDefaultDialog(data2, config);
          }
        }
      })
    });

  }

  createPermissionUI(existPermissions = [], newfieldID = null, newTitle = null) {
    const selectedProfile = this.selectedProfile.source ? this.selectedProfile.source : this.selectedProfile;
    const profile = new PermissionObjectContextProfile(selectedProfile.key, selectedProfile.text);
    const context = new PermissionObjectContext('Tablet', profile);
    const permissionsField = new PermissionObjectField(newfieldID, newTitle);
    const fieldsArr = newfieldID && newTitle ? existPermissions.concat([permissionsField]) : existPermissions;
    const newPermission = new AddonsPermissions(context, fieldsArr);

    this.pluginService.createPermission(newPermission, () => {
      //this.loadPermissions();
      this.setPermissionsDataSource();
    }, (error) => {

    });
  }

  convertAddonToPepperiRowData(addon: InstalledAddon, customKeys = null) {
    const row = new PepRowData();
    row.UUID = addon.UUID;
    row.Fields = [];
    const keys = customKeys ? customKeys : Object.keys(addon);
    keys.forEach(key => row.Fields.push(this.initDataRowField(addon, key)));
    return row;
  }

  initDataRowField(addon: InstalledAddon, key): PepFieldData {
    const dataRowField: PepFieldData = {
      ApiName: key,
      Title: this.translate.instant(key),
      XAlignment: 1,
      FormattedValue: '',//addon[key] ? addon[key].toString() : '',
      Value: addon[key] ? addon[key].toString() : '',
      ColumnWidth: 10,
      AdditionalValue: '',
      OptionalValues: [],
      FieldType: FIELD_TYPE.TextBox,
      ReadOnly: true,
      Enabled: false
    };
    addon.Addon.UUID === '00000000-0000-0000-0000-000000000a91' ? this.currentApiVersion = addon.Version : null;
    const installed = addon.UUID !== '';
    const systemData = this.utilities.isJsonString(addon.SystemData.toString()) ? JSON.parse(addon.SystemData.toString()) : {};

    switch (key) {
      case 'Type':
        const addonType = addon.Addon && addon.Addon[key] && AddonType[addon.Addon[key]] ? AddonType[addon.Addon[key]] : '';
        dataRowField.Value = addonType;
        break;
      case 'Description':
        dataRowField.ColumnWidth = 25;
        dataRowField.AdditionalValue = addon.Addon.Type.toString();
        dataRowField.Value = addon.Addon[key] ? addon.Addon[key] : '';
        break;
      case 'Name':
        dataRowField.ColumnWidth = 15;
        dataRowField.AdditionalValue = addon.Addon.UUID;
        dataRowField.Value = addon.Addon[key] ? addon.Addon[key] : '';
        break;
      case 'Version':
        dataRowField.ColumnWidth = 15;
        let phasedType = this.pluginService.getPhasedType(addon);
        if (addon.Addon.SystemData && addon.Addon.SystemData.indexOf('CurrentPhasedVersion') > -1) {
          addon.PhasedType = phasedType;
        } else {
          addon.PhasedType = ComparisionType.EqualTo;
        }

        dataRowField.AdditionalValue = JSON.stringify(
          {
            Value: addon[key],
            PhasedType: addon.PhasedType,
            LatestAvailable: true,
            HasVersions: addon.HasVersions === true,
            Installed: installed
          });

        if (installed) {
          if (phasedType === ComparisionType.BiggerThan) {
            dataRowField.Value = `${addon[key]} ${this.translate.instant('UpdateAvailable')}`;
          } else if (phasedType === ComparisionType.SmallerThan) {
            dataRowField.Value = `${addon[key]} ${this.translate.instant('Unofficial')}`;
          }
        } else {
          dataRowField.Value = `${this.translate.instant('NotInstalled')}`;
        }

        break;
      case 'AutomaticUpgrade':
        dataRowField.FieldType = FIELD_TYPE.Boolean;
        dataRowField.Value = addon.AutomaticUpgrade ? "1" : "0";
        break;
      case 'LastUpgradeDateTime':
        dataRowField.FieldType = FIELD_TYPE.DateAndTime;
        dataRowField.ColumnWidth = 17;
        break;
    }

    return dataRowField;
  }

  convertPermissionToPepperiRowData(permission: any, customKeys = null) {
    const row = new PepRowData();
    row.Fields = [];
    const keys = customKeys ? customKeys : Object.keys(permission);
    keys.forEach(key => row.Fields.push(this.initPermissionDataRowField(permission, key)));
    return row;
  }

  initPermissionDataRowField(permission: any, key): PepFieldData {
    const str = key === 'FieldID' ? permission.FieldID : permission.Title;
    const value = str && str.split(';').length ? str.split(';') : ['', ''];
    const dataRowField: PepFieldData = {
      ApiName: key,
      Title: key === 'FieldID' ? this.translate.instant('Addon') : this.translate.instant('Editor'),
      XAlignment: 1,
      FormattedValue: '',//key === 'FieldID' ? value[1] : value[2],
      Value: key === 'FieldID' ? value[1] : value[2],
      ColumnWidth: 10,
      AdditionalValue: '',
      OptionalValues: [],
      FieldType: FIELD_TYPE.TextBox,
      ReadOnly: true,
      Enabled: false
    };
    return dataRowField;
  }

  async editRow(action = '', dialogTitle = '', dialogContent = { Text: '', Data: {} },
    version = '', rowData = null, buttonsTitles = ['Confirm', 'Cancel']) {
    const data = new PepDialogData({
      title: this.translate.instant(dialogTitle),
      content: this.translate.instant(dialogContent.Text, dialogContent.Data),
      actionsType: 'cancel-continue'
    });
    const config = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'regular');

    this.dialog.openDefaultDialog(data, config).afterClosed().subscribe(performAction => {
      if (performAction) {
        this.pluginService.editAddon(action, rowData.Fields[0].AdditionalValue, version).subscribe(res => {
          this.pollExecution(this.translate.instant(dialogTitle), this.translate.instant(dialogContent.Text, dialogContent.Data), res.ExcecutionUUID || res.ExecutionUUID);
        }, error => {
          const data = new PepDialogData({ title: this.translate.instant('General_Error'), content: error?.fault?.faultstring || '' });
          const config = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'regular');
          this.dialog.openDefaultDialog(data, config);
        });
      }
    });
  }

  private bulkUpgrade(rowsData) {
    const dialogData = new PepDialogData({
      title: this.translate.instant('UpgradeAllAddons_Header'),
      content: this.translate.instant('UpgradeAllAddons_Body'),
      actionsType: 'cancel-continue'
    });
    const dialogConfig = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'regular');
    this.dialog.openDefaultDialog(dialogData, dialogConfig).afterClosed().subscribe(async performAction => {
      if (performAction) {
        const bulkUpgradeResult: any = await this.executeBulkUpgrade(rowsData);
        const content = bulkUpgradeResult?.Status === 0 ? `${this.translate.instant('Addon_SuccessfulOperation')}<br><br><br><br>`
          : `${this.translate.instant('Addon_FailedOperation')}<span>${bulkUpgradeResult?.ErrorMessage}</span><br><br>`;
        const data = new PepDialogData({ content });
        this.dialog.openDefaultDialog(data, dialogConfig).afterClosed().subscribe(() => {
          this.pluginService.clearAddonList();
          this.loadAddons();
        })
      }
    });
  }

  private async executeBulkUpgrade(rowsData: any[]) {
    let upgradeResponse: { Status: number, ErrorMessage?: string } = { Status: 0 };
    let dependentAddons: any[] = [];

    return new Promise((resolve, reject) => {
      this.pluginService.bulkUpgrade(rowsData).subscribe(async addons => {
        if (addons?.length) {
          addons.forEach((addon: any) => {
            if (addon?.Status?.Name && addon.AuditInfo?.ErrorMessage) {
              if (addon.Status.Name === 'Failure') {
                if (addon.AuditInfo.ErrorMessage.includes('dependencies')) {
                  const dependentAddon = rowsData.find(item => item.Fields[0].AdditionalValue === addon.AuditInfo.Addon?.UUID);
                  if (dependentAddon) {
                    dependentAddons.push(dependentAddon);
                  }
                } else {
                  upgradeResponse.Status = 1;
                  upgradeResponse.ErrorMessage = addon.AuditInfo.ErrorMessage;
                }
              }
            }
          })
          if (dependentAddons.length) {
            const bulkUpgradeRes: any = await this.executeBulkUpgrade(dependentAddons);
            if (bulkUpgradeRes?.Status === 1) {
              upgradeResponse.Status = 1;
              upgradeResponse.ErrorMessage = bulkUpgradeRes.ErrorMessage;
            }
          }
          return resolve(upgradeResponse);
        } else {
          upgradeResponse.Status = 1;
          upgradeResponse.ErrorMessage = this.translate.instant('AddonsManager_GeneralError');
          return resolve(upgradeResponse);
        }
      }, error => {
        upgradeResponse.Status = 1;
        upgradeResponse.ErrorMessage = error;
        return reject(upgradeResponse);
      })
    })
  }

  showDeletePermissionModal(rowData: any) {
    const data = new PepDialogData({
      title: this.translate.instant('AddonManager_DeletePermissionTitle'),
      content: this.translate.instant('AddonManager_DeletePermissionMsg'),
      actionsType: 'cancel-delete'
    });
    const config = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'regular');
    const dialogRef = this.dialog.openDefaultDialog(data, config);
    dialogRef.afterClosed().subscribe(res => {
      this.deletePermission(rowData)
    })
  }

  deletePermission(rowData) {
    const uuid = rowData.Fields[0].Value;
    const addonName = rowData.Fields[0].FormattedValue;
    const editorName = rowData.Fields[1].FormattedValue;
    const editorPack = rowData.Fields[1].Value;

    const fieldID = uuid + ';' + addonName;
    const title = uuid + ';' + editorPack + ';' + editorName;

    const fieldsArr = this.existPermissions.filter(permission => permission.FieldID !== fieldID ||
      permission.Title !== title);

    this.createPermissionUI(fieldsArr);
  }

  public profileListChanged(profile: any) {
    this.selectedProfile = profile;
    this.setPermissionsDataSource();
  }

  pollExecution(title, content, executionUUID) {
    const pollData = new PepDialogData({
      title,
      content: this.translate.instant('AddonInstallation_Progress'),
      actionsType: 'custom',
      showClose: false
    });
    const config = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'regular');
    const dialogRef = this.dialog.openDefaultDialog(pollData, config);
    const interval = window.setInterval(() => {
      this.pluginService.getExecutionLog(executionUUID).subscribe(res => {
        if (dialogRef) {
          dialogRef
            .afterClosed()
            .subscribe(result => {
              window.clearInterval(interval);
            })
        }
        if (res && res.Status && res.Status.Name !== 'InProgress') {
          const content = res.Status.ID
            ? `${this.translate.instant('Addon_SuccessfulOperation')}<br><br><br><br>`
            : `${this.translate.instant('Addon_FailedOperation')}<span>${res.AuditInfo.ErrorMessage}</span><br><br>`;
          const actionButton = {
            title: this.translate.instant('Close'),
            callback: null,
            className: '',
            icon: null
          };
          dialogRef.componentInstance.data.actionButtons = [actionButton];
          dialogRef.componentInstance.data.content = content;
          this.pluginService.clearAddonList();
          this.loadAddons();
          this.refreshSettingsTree.emit();
          window.clearInterval(interval);

        }
      })      
    }, 2000);

  }

  /*
  openEditDialog(rowData) {
    this.pluginService.getInstalledAddOn(this.addonUUID, installedAddon => {
      const data = new PepDialogData({ content: { automaticUpgrade: installedAddon.AutomaticUpgrade ? "1" : "0" } });
      const dialogRef = this.dialog.openDialog(EditDialogComponent, data);
      dialogRef.afterClosed().subscribe(dialogData => {
        if (dialogData) {
          const automaticUpgrade = dialogData.automaticUpgrade;
          this.pluginService.setSystemData(installedAddon.Addon.UUID, automaticUpgrade, () => {
            this.pluginService.clearAddonList();
            this.loadAddons();
          });
        }
      });
    });
   
  }*/

  openChangeVersionDialog(rowData) {
    const selectedAddon = rowData.Fields[0].AdditionalValue;
    const searchObj: AddonsSearch = {
      ListType: 'addon_versions',
      UUID: this.addonData.Addon.UUID,
      RowUUID: selectedAddon
    };
    this.pluginService.getData(searchObj).pipe(first()).subscribe(versions => {
      if (versions && versions.length) {
        const filterdVersions = versions.filter(version => version.Available);
        const sortedVersions = filterdVersions;//.sort((a, b) =>Semver.lt(a.Version, b.Version) ? 1 : -1);                
        let options = [];
        sortedVersions.forEach(option => {
          const value = `${option?.Version}${option?.Phased ? ' | Phased' : ' | Available'}${option?.Description ? ' | ' + option?.Description : ''}`;
          options.push({ key: option?.Version, value });
        });
        const jsonString = rowData.Fields.filter(field => field.ApiName === 'Version')[0].AdditionalValue;
        const additionalValue = this.utilities.isJsonString(jsonString) ? JSON.parse(jsonString) : {};
        const currentVersionId = additionalValue.Value;
        const data = new PepDialogData({
          content: {
            versions: options,
            currentVersion: currentVersionId
          }
        });
        const config = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'regular');
        const dialogRef = this.dialog.openDialog(ChangeVersionDialogComponent, data);
        dialogRef.afterClosed().subscribe(dialogResult => {
          if (dialogResult) {
            const versionToChange = versions.find(version => version.Version === dialogResult.version);
            const currentVersion = versions.find(version => version.Version === currentVersionId);
            const actionName = versionToChange && currentVersion ?
              (Semver.lte(versionToChange.Version, currentVersion.Version) ? 'downgrade' : 'upgrade') : null;
            if (versionToChange && actionName) {              
              this.pluginService.editAddon(actionName, rowData.Fields[0].AdditionalValue, dialogResult.version).subscribe(res => {
                if (res) {
                  this.pollExecution(
                    this.translate.instant('AddonsManager_ChangeVersion_Header'),
                    this.translate.instant('AddonsManager_ChangeVersion_Body'),
                    res.ExcecutionUUID || res.ExecutionUUID);
                }
              });
            }
            else {
              const content = 'Installed addon is corrupted, please contact support.';
              const data = new PepDialogData({ content });
              const config = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'regular');
              this.dialog.openDefaultDialog(data, config);
            }
          }
        })
      } else {
        const content = 'Versions not available';
        const data = new PepDialogData({ content });
        const config = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'regular');
        this.dialog.openDefaultDialog(data, config);
      }
    }, error => { });
  }
}
