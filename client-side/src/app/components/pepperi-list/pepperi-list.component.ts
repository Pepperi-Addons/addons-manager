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
  //@Input() addonsList = [];

  //protected paramsSubscription: Subscription;
  //protected locationSubscription: SubscriptionLike;

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
  // addonEditors = [];
  existPermissions = [];
  enableAddonAutomaticUpgrade = false;
  currentApiVersion = '';
  // addonUUID = '';
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

    // this.listActions = this.getListActions();
    // this.isSupportUser =  this.routeParams.snapshot.queryParams.support_user;
    // this.addonData.Addon.UUID =  this.routeParams.snapshot.params.addon_uuid;

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

  ngOnChanges(changes) {
    //('ngOnChanges');
    /*  if (changes?.apiEndpoint?.currentValue)
        this.loadPage(); */
  }

  /*
    pepperiListOnInit(compRef: ComponentRef<any>, apiEndpoint) {
  
  
      // this.pepperiListOutputs = {
      //   notifyListChanged: event => this.onListChange(event),
      //   notifySortingChanged: event => this.onListSortingChange(event),
      //   notifyFieldClicked: event => this.onCustomizeFieldClick(event),
      //   notifySelectedItemsChanged: event => this.selectedRowsChanged(event)
      // };
  
    }
  
    
    onListChange(event) {
  
    } */

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

  /*onListSortingChange(event) {
    const searchObj: AddonsSearch = {
      Asc: event.isAsc,
      SortBy: event.sortBy,
      ListType: 'all',
      UUID: this.addonData.Addon.UUID
    };
    this.pluginService.getData(searchObj).subscribe(res => {}, error => {});
  } */
  /*
    onCustomizeFieldClick(event) {
  
    }
  
    selectedRowsChanged(selectedRowsCount) {
      const selectData = this.pepList.getSelectedItemsData(true);
      let rowData;
  
      if (selectData && selectData.rows && selectData.rows[0] !== '' && selectData.rows.length == 1) {
  
        const uuid = selectData.rows[0];
        rowData = this.pepList.getItemDataByID(uuid);
        this.addonUUID = rowData.Fields[0].AdditionalValue;
      }
  
      this.listActions = selectedRowsCount > 0 && rowData ? this.getListActions(rowData) : [];
      const numOfHiddens = (this.listActions.filter(action => action.hidden === true)).length;
      if (this.listActions.length === numOfHiddens) {
        this.listActions = [];
      }
      // this.topBarComp.componentRef.instance.listActionsData = this.listActions;
      // this.topBarComp.componentRef.instance.showListActions = this.listActions ? true : false;
      // this.cd.detectChanges();
    }*/

  /*
loadPage() {
  this.topBarTitle = this.apiEndpoint === 'addons' ? 'AddonManager_All_List' : 'AddonManager_Permissions_List'
  if (this.apiEndpoint === 'permissions') {
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
          this.loadPermissions();
        
        }
      }
    });
  }
} */
  /*
    topBarOnInit(compRef: ComponentRef<any>) {
      if (this.apiEndpoint === 'permissions') {
        //   const btn = new TopBarButton(this.translate.instant('AddonManager_Add_Permission'), () => this.openPermissionsDialog(),
        //   'number-plus', ICON_POSITION.End, true, 'updateBtn', 'pepperi-button mat-button strong color-main lg');
  
        //   this.topBarInputs.rightButtons.push(btn);
        //this.topBarInputs.listChooserData = this.profilesList;
      }
  
      // this.topBarOutputs = {
      //   actionClicked: event => this.onActionClicked(event),
      //   searchStringChanged: event => this.searchChanged(event),
      //   selectedListChanged: event => this.profileListChanged(event)
      // };
      // });
  
    } 
  
    actionDisabled(operation, rowData) {
      let res = false;
      // const versions = rowData && rowData.Fields ? rowData.Fields.filter( field => field.ApiName === 'Version')[0] : {};
      // const allVersions = versions && versions.OptionalValues && versions.OptionalValues.length > 0 ? versions.OptionalValues : [];
      // const currentVersionIndex = allVersions.findIndex( version => version.Version === versions.FormattedValue);
  
      switch (operation) {
        case 'Edit': {
          res = true;
          break;
        }
        case 'Install': {
          res = false;
          break;
        }
        case 'Upgrade': {
          // res = allVersions.filter(version => version.Phased && Date.parse(version.StartPhasedDateTime) >
          // Date.parse(allVersions[currentVersionIndex].StartPhasedDateTime)).length > 1;
          break;
        }
        case 'Downgrade':
        case 'ChangeVersion': {
          res = true;
          break;
        }
        case 'Uninstall': {
          res = false;
          break;
        }
        default:
          {
            res = false;
            break;
          }
      }
      return res;
    } 
 
  getListActions(rowData = null): Array<PepMenuItem> {
    const retVal = new Array<PepMenuItem>();
    if (this.apiEndpoint === 'addons') {
      let action: PepMenuItem;
      let isLatestPhased = true;
      let isLatestAvailable = true;
      let hasVersions = true;
      let isInstalled = false;
      let isAddonSystemType = true;

      if (rowData) {
        const jsonString = rowData.Fields.filter(field => field.ApiName === 'Version')[0].AdditionalValue;
        const additionalValue = this.utilities.isJsonString(jsonString) ? JSON.parse(jsonString) : {};
        isLatestPhased = additionalValue.LatestPhased;
        isLatestAvailable = additionalValue.LatestAvailable;
        isInstalled = additionalValue.Installed;
        hasVersions = additionalValue.HasVersions;
        isAddonSystemType = rowData?.Fields ? rowData.Fields
          .filter(field => field.ApiName === 'Description')[0].AdditionalValue === "1" : false;
      }

      action = new PepMenuItem({
        key: 'Install', text: this.translate.instant('Install'),
        hidden: isInstalled
      });
      retVal.push(action);

      action = new PepMenuItem({
        key: 'Uninstall', text: this.translate.instant('Uninstall'),
        hidden: !isInstalled || isAddonSystemType
      });
      retVal.push(action);

      action = new PepMenuItem({
        key: 'Upgrade', text: this.translate.instant('Upgrade'),
        hidden: (isLatestPhased || !isInstalled)
      });
      retVal.push(action);

      action = new PepMenuItem({
        key: 'ChangeVersion', text: this.translate.instant('AddonsManager_ChangeVersion_Header'),
        hidden: !isInstalled || !this.isSupportUser
      });
      retVal.push(action);

    } else if (this.apiEndpoint === 'permissions') {
      let action: PepMenuItem;
      action = new PepMenuItem({ key: 'DeletePermission', text: this.translate.instant('Delete'), hidden: false });
      retVal.push(action);
    }
    return retVal;


  } 

  updateInstalledAddonsList(additionalData): any {
    this.pluginService.updateAdditionalData(additionalData, res => {
      return res.Addon;
    }, null);
  }

  
  loadAddonsList(res: any) {
    //     write your code here
    if (res && res.length > 0) {
      this.setAddonList.emit(res);

      const tableData = new Array<PepRowData>();
      res.forEach((addon: InstalledAddon) => {
        const userKeys = ['Name', 'Description', 'Version', 'LastUpgradeDateTime'];
        const supportUserKeys = this.isSupportUser === 'true' ? ['Type'] : [];//DI-18767
        const allKeys = [...userKeys, ...supportUserKeys];
        tableData.push(this.convertAddonToPepperiRowData(addon, allKeys));
      });
      const uiControl = this.pepData.getUiControl(tableData[0]);
      const pepperiListObj = this.pepData.convertListData(tableData);
      this.pepList.initListData(uiControl, pepperiListObj.length, pepperiListObj);
    }
  } 

  sortByKeys(array, key, secondKey) {
    return array.sort((a, b) => {
      const w = a[key].split(';')[1];
      const x = b[key].split(';')[1];
      const y = a[secondKey].split(';')[2];
      const z = b[secondKey].split(';')[2];
      return ((w < x) ? -1 : ((w > x) ? 1 : (y < z) ? -1 : (y > z) ? 1 : 0));
    });
  } */

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
    /*
    const searchObj: AddonsSearch = {
      Asc: true,
      SortBy: 'Name',
      ListType: 'addons',
      UUID: this.addonData.Addon.UUID
    };

    this.pluginService.getAddonList(searchObj).pipe(first()).subscribe(res => {
      if (res?.length) {
        this.setAddonList.emit(res);
        const tableData = new Array<PepRowData>();
        res.forEach((addon: InstalledAddon) => {
          const userKeys = ['Name', 'Description', 'Version', 'LastUpgradeDateTime'];
          const supportUserKeys = this.isSupportUser === 'true' ? ['Type'] : [];//DI-18767
          const allKeys = [...userKeys, ...supportUserKeys];
          tableData.push(this.convertAddonToPepperiRowData(addon, allKeys));
        });
        const uiControl = this.pepData.getUiControl(tableData[0]);
        console.log('uiControl', uiControl);
        const pepperiListObj = this.pepData.convertListData(tableData);
        this.pepList.initListData(uiControl, pepperiListObj.length, pepperiListObj);
      }
    }, error => { });

    */
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
    /*
    if (this.selectedProfile) {
      this.noDataMsg = 'AddonManager_NoPermissions';
      this.setPermissionsDataSource();
      
      this.pluginService.getPermissionsList(this.selectedProfile).pipe(first()).subscribe(res => {
        if (res?.length && res[0].Fields?.length) {
          if (res[0]?.Fields?.length) {
            this.existPermissions = this.sortByKeys(res[0].Fields, 'FieldID', 'Title');
          } else {
            this.existPermissions = [];
          }
          const tableData = new Array<PepRowData>();
          const userKeys = ['FieldID', 'Title'];
          this.existPermissions.forEach((permission: InstalledAddon) => tableData.push(this.convertPermissionToPepperiRowData(permission, userKeys)));
          const pepperiListObj = this.pepData.convertListData(tableData);
          const uiControl = this.pepData.getUiControl(tableData[0]);
          this.pepList.initListData(uiControl, pepperiListObj.length, pepperiListObj);
        } else {
          this.existPermissions = [];
          this.pepList.initListData(null, 0, []);
        } 
      }, error => { }); 
    } */
  }

  loadAddonActions() {
    this.actions = {
      get: async (data: PepSelectionData) => {
        //console.log('actions data', data);
        let actions: any[] = [];

        if (data?.rows.length === 1 && data.selectionType !== 0) {
          const uuid = data.rows[0];
          const rowData = this.genericlist.getItemById(uuid);
          // this.addonUUID = rowData.Fields[0].AdditionalValue;
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
        //console.log('permission actions data', data);
        let actions: any[] = [];

        if (data?.rows.length === 1 && data.selectionType !== 0) {
          const uuid = data.rows[0];
          const rowData = this.genericlist.getItemById(uuid);
          // this.addonUUID = rowData.Fields[0].AdditionalValue;
          //console.log('permission rowData in', rowData);

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
          //console.log('found bigger than', isInstalled && phasedType === ComparisionType.BiggerThan);
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
            //console.log('orig addons', res);
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
            //console.log('addons', data);
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
              // this.existPermissions = this.sortByKeys(res[0].Fields, 'FieldID', 'Title');

              this.existPermissions.forEach((permission: InstalledAddon) => {
                data.push(this.convertPermissionToPepperiRowData(permission, userKeys));
              });
              if (params.sorting) {
                this.sortGrid(data, params.sorting.sortBy, params.sorting.isAsc);
              }
            } else {
              this.existPermissions = [];
            }
            //console.log('permissions', data);
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

  /*loadlist(apiEndpoint, needToReload = true) {
    this.noDataMsg = apiEndpoint === 'permissions' ? 'AddonManager_NoPermissions' : 'AddonManager_NoAddons';
  
    apiEndpoint = apiEndpoint && apiEndpoint !== '' ? apiEndpoint : 'addons';
    if (apiEndpoint === 'addons') {
      const searchObj: AddonsSearch = {
        Asc: true,
        SortBy: 'Name',
        ListType: apiEndpoint,
        UUID: this.addonData.Addon.UUID
      };
      this.pluginService.getAddonList(searchObj).pipe(first()).subscribe(res => {
        this.loadAddonsList(res);
      }, error => { });
  
    } else if (apiEndpoint === 'permissions') {
      this.pluginService.getPermissionsList(this.selectedProfile, res => {
        if (res && res.length && res[0].Fields && res[0].Fields.length > 0) {
          this.existPermissions = this.sortByKeys(res[0].Fields, 'FieldID', 'Title');
          const tableData = new Array<PepRowData>();
          const userKeys = ['FieldID', 'Title'];
          this.existPermissions.forEach((permission: InstalledAddon) => tableData.push(this.convertPermissionToPepperiRowData(permission, userKeys)));
          const pepperiListObj = this.pepData.convertListData(tableData);
          const uiControl = this.pepData.getUiControl(tableData[0]);
          this.pepList.initListData(uiControl, pepperiListObj.length, pepperiListObj);
        } else {
          this.existPermissions = [];
          this.pepList.initListData(null, 0, []);
        }
      }, error => { });
    }
  } 
  
  setProfiles(callBack: Function) {
    this.pluginService.getProfiles().pipe(first()).subscribe(res => {
      this.profilesList = [];
      if (res) {
        this.profilesList = res.filter(profile => {
          return profile.Name !== 'Admin';
        }).map(profile => {
          return {
            key: profile.InternalID,
            text: profile.Name,
            view_type: profile.InternalID
          };
        });
  
        this.selectedProfile = this.profilesList[0];
  
        //callBack();
      }
    });
  } */

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
        //  dataRowField.Value = addonType;
        dataRowField.Value = addonType;
        break;
      case 'Description':
        dataRowField.ColumnWidth = 25;
        dataRowField.AdditionalValue = addon.Addon.Type.toString();
        //dataRowField.FormattedValue = addon.Addon[key] ? addon.Addon[key] : '';
        dataRowField.Value = addon.Addon[key] ? addon.Addon[key] : '';
        break;
      case 'Name':
        dataRowField.ColumnWidth = 15;
        dataRowField.AdditionalValue = addon.Addon.UUID;
        //dataRowField.FormattedValue = addon.Addon[key] ? addon.Addon[key] : '';
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
        /*
      if (!installed) {
        dataRowField.Value = `${this.translate.instant('NotInstalled')}`;
      } else if (installed) {
        dataRowField.Value = (addon && addon.LatestPhased === false) ?
          `${addon[key]} ${this.translate.instant('UpdateAvailable')}` : `${addon[key]}`;
      } */

        break;
      case 'AutomaticUpgrade':
        dataRowField.FieldType = FIELD_TYPE.Boolean;
        //dataRowField.FormattedValue = addon.AutomaticUpgrade ? "1" : "0";
        dataRowField.Value = addon.AutomaticUpgrade ? "1" : "0";
        break;
      case 'LastUpgradeDateTime':
        dataRowField.FieldType = FIELD_TYPE.DateAndTime;
        dataRowField.ColumnWidth = 17;
        // THIS IS A HACK! we don't support date formatting
        // dataRowField.FormattedValue = addon.LastUpgradeDateTime ? (new Date(addon.LastUpgradeDateTime)).toLocaleString() : '';
        break
      /*default:
        dataRowField.FormattedValue = addon[key] ? addon[key].toString() : ''; 
        break; */
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
  /*
    isLatestPhased(addon) {
      const systemData = this.utilities.isJsonString(addon.Addon.SystemData) ? JSON.parse(addon.Addon.SystemData.toString()) : {};
      const latestPhasedVer = systemData.CurrentPhasedVersion;
      const installedVer = addon.Version;
  
      return installedVer === latestPhasedVer;
    }
  
    phasedType(addon): ComparisionType {
      const systemData = this.utilities.isJsonString(addon.Addon.SystemData) ? JSON.parse(addon.Addon.SystemData.toString()) : {};
      const currentPhasedVer = systemData.CurrentPhasedVersion;
      const installedVer = addon.Version;
  
      if (currentPhasedVer && installedVer) {
        return this.compareVersions(currentPhasedVer, installedVer);
      } else {
        return ComparisionType.EqualTo;
      }
    }
  
    compareVersions(v1: string, v2: string) {
      const v1Octets = v1.split('.');
      const v2Octets = v2.split('.');
      const len = Math.min(v1Octets.length, v2Octets.length);
  
      for (let i = 0; i < len; ++i) {
        const num1 = parseInt(v1Octets[i], 10);
        const num2 = parseInt(v2Octets[i], 10);
        if (num1 > num2) return ComparisionType.BiggerThan;
        if (num1 < num2) return ComparisionType.SmallerThan;
      }
  
      return v1Octets.length === v2Octets.length ? ComparisionType.EqualTo : (v1Octets.length < v2Octets.length ? ComparisionType.SmallerThan : ComparisionType.BiggerThan);
    }
  
    
      addNew() {
     
        if (this.addonsList.length === 0) {
          this.pluginService.getAddOnsList(results => {
            if (results) {
              results.forEach((addon: Addon) => {
                // if (this.installedAddonsList && this.installedAddonsList.find((ia: InstalledAddon) => ia.Addon.UUID === addon.UUID)) {
                //     continue;
                // }
     
                addon.SystemData = this.utilities.isJsonString(addon.SystemData) ? JSON.parse(addon.SystemData) : {};
                this.addonsList.push(addon);
              });
            }
     
          });
        }
      } 
    
    onActionClicked(e) {
    
      const selectData = this.pepList.getSelectedItemsData(true);
      if (selectData.rows.length === 1) {
    
        const uid = selectData.rows[0];
        const rowData = this.pepList.getItemDataByID(uid);
        switch (e.source.key) {
          case 'Edit': {
            this.openEditDialog(rowData);
            break;
          }
          case 'Install': {
            this.editRow('install', 'InstallAddon_Header', { Text: 'InstallAddon_Body', Data: {} }, '', rowData);
            break;
          }
          case 'Upgrade': {
            this.editRow('upgrade', 'UpgradeAddon_Header', { Text: 'UpgradeAddon_Body', Data: {} }, '', rowData);
            break;
          }
    
          // case 'UpgradeLatest': {
          //   const versions = rowData.Fields[2].OptionalValues.filter( version => version);
          //   const latestCreationDate = Math.max.apply(null, versions.map(e =>  Date.parse(e.CreationDateTime)));
          //   const latest = versions.filter(version => Date.parse(version.CreationDateTime) === latestCreationDate)[0];
          //   this.editRow('upgrade', 'UpgradeAddon_Header', {Text: 'UpgradeAddon_Body', Data: {}}, latest.Version, rowData);
          //   break;
          // }
          case 'ChangeVersion': {
            this.openChangeVersionDialog(rowData);
            break;
          }
          case 'Uninstall': {
            this.editRow('uninstall', 'UninstallAddon_Header', { Text: 'UninstallAddon_Body', Data: {} }, '', rowData);
            break;
          }
          case 'DeletePermission': {
            this.showDeletePermissionModal(rowData);
            break;
          }
    
          default:
            {
              const actionButton = {
                title: this.translate.instant('Close'),
                callback: null,
                className: '',
                icon: null
              };
              const title = this.translate.instant('Alert');
              const content = this.translate.instant('NotSupported');
              const data = new PepDialogData({ title, content });
              const config = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'regular');
              this.dialog.openDefaultDialog(data, config);
            }
        }
    
      }
    } */

  editRow(action = '', dialogTitle = '', dialogContent = { Text: '', Data: {} },
    version = '', rowData = null, buttonsTitles = ['Confirm', 'Cancel']) {

    const startAction = () => this.pluginService.editAddon(action, rowData.Fields[0].AdditionalValue,
      res => this.pollExecution(this.translate.instant(dialogTitle), this.translate.instant(dialogContent.Text, dialogContent.Data), res.ExcecutionUUID || res.ExecutionUUID),
      error => {
        const data = new PepDialogData({ title: this.translate.instant('General_Error'), content: error.fault.faultstring });
        const config = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'regular');
        this.dialog.openDefaultDialog(data, config);
      }
      , version);
    const data = new PepDialogData({
      title: this.translate.instant(dialogTitle),
      content: this.translate.instant(dialogContent.Text, dialogContent.Data),
      actionsType: 'cancel-continue'
    });

    const config = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'regular');
    this.dialog.openDefaultDialog(data, config).afterClosed().subscribe(performAction => {
      performAction ? startAction() : null;
    });
  }

  private bulkUpgrade(rowsData) {
    const data = new PepDialogData({
      title: this.translate.instant('UpgradeAllAddons_Header'),
      content: this.translate.instant('UpgradeAllAddons_Body'),
      actionsType: 'cancel-continue'
    });
    const config = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'regular');
    this.dialog.openDefaultDialog(data, config).afterClosed().subscribe(async performAction => {
      if (performAction) {
        // start
        /*
        const executionDataDialog = new PepDialogData({
          title: this.translate.instant('UpgradeAllAddons_Header'),
          content: this.translate.instant('AddonInstallation_Progress'),
          actionsType: 'custom',
          showClose: false
        });
        const executionConfigDialog = this.dialog.getDialogConfig({ minWidth: '30rem' }, 'regular');
        const dialogRef = this.dialog.openDefaultDialog(executionDataDialog, executionConfigDialog);
        this.executeBulkUpgrade(rowsData); 
        //TODO - change dialog content with result
        const interval = window.setInterval(() => {
          this.pluginService.getExecutionLog(executionUUID, logRes => {
            if (dialogRef) {
              dialogRef
                .afterClosed()
                .subscribe(result => {
                  window.clearInterval(interval);
                })
            }
            if (logRes && logRes.Status && logRes.Status.Name !== 'InProgress') {
              const content = logRes.Status.ID
                ? `${this.translate.instant('Addon_SuccessfulOperation')}<br><br><br><br>`
                : `${this.translate.instant('Addon_FailedOperation')}<span>${logRes.AuditInfo.ErrorMessage}</span><br><br>`;
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
          });
        }, 2000);
    
        */
        // end
        const exceRes = await this.executeBulkUpgrade2(rowsData);
        console.log('exceRes', exceRes);
      }
    });
  }

  private async executeBulkUpgrade2(rowsData: any[]) {
    let upgradeResponse: { Status: number, ErrorMessage?: string, ResendAddons?: any[] } = { Status: 0 };
    let dependentAddons: any[] = [];

    this.pluginService.bulkUpgrade(rowsData).subscribe(addons => {
      //  console.log('what the heck', res);
      console.log('sub it all', addons);
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
                upgradeResponse.ErrorMessage = 'Some error';//this.translate.instant('Addon_FailedOperation');
              }
            }
          } else {
            //TODO - is it valid?
          }
        })
        if (dependentAddons.length) {
          return this.executeBulkUpgrade2(dependentAddons);
        }

        return Promise.resolve(upgradeResponse);
      } else {
        //handle ERROR
        upgradeResponse.Status = 1;
        upgradeResponse.ErrorMessage = 'no addons error';//this.translate.instant('Addon_FailedOperation');
        return Promise.reject(upgradeResponse);
      }
    }, error => {
      upgradeResponse.Status = 1;
      upgradeResponse.ErrorMessage = error;
      return Promise.reject(upgradeResponse);
    });
  }

  private executeBulkUpgrade(rowsData: any) {
    let upgradeRequests: any[] = [];
    let executionLogRequests: any[] = [];
    let upgradeResponse: { Status: number, ErrorMessage?: string } = { Status: 0 };

    rowsData.forEach((item: any) => {
      upgradeRequests.push(this.pluginService.editAddon2('upgrade', item.Fields[0].AdditionalValue, ''))
    });
    forkJoin(
      upgradeRequests
    ).subscribe((res: any) => {
      res.forEach((item: any) => {
        executionLogRequests.push(this.pluginService.getExecutionLog2(item.ExecutionUUID || item.ExcecutionUUID));
      });
      forkJoin(
        executionLogRequests
      ).subscribe(logRes => {
        //TOFO - tap to manage data and return observable with status    
        let dependentAddons: any[] = [];
        logRes.forEach((addon: any) => {
          if (addon?.Status?.Name && addon.AuditInfo?.ErrorMessage) {
            if (addon.Status.Name === 'Failure') {
              if (addon.AuditInfo.ErrorMessage.includes('dependencies')) {
                const dependentAddon = rowsData.find(item => item.Fields[0].AdditionalValue === addon.AuditInfo.Addon?.UUID);
                if (dependentAddon) {
                  dependentAddons.push(dependentAddon);
                }
              } else {
                upgradeResponse.Status = 1;
                upgradeResponse.ErrorMessage = this.translate.instant('Addon_FailedOperation');
              }
            }
          } else {
            //TODO - is it possible?
          }
        });
        /*if (dependentAddons.length) {
          upgradeResponse = this.executeBulkUpgrade(dependentAddons);
        }     
        return Promise.resolve(upgradeResponse);  */
      }, error => {
        //console.log('log result error', error);
        /*return {
          Status: 1,
          ErrorMessage: error
        }*/
      })
    }, error => {
      //console.log('join result error', error);
      /* return {
         Status: 1,
         ErrorMessage: error
       }*/
    });
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
    //TODo - test delete permission
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

  /*
  public searchChanged(searchString: string) {
    this.searchString = searchString;
    //   this.initListLoad();
  } */

  public profileListChanged(profile: any) {
    this.selectedProfile = profile;
    this.setPermissionsDataSource();
    //this.loadPermissions();
  }

  /*
  chooseList(codeJobUUID = '', executionUUID = '', type = '') {
    return {};
  } 

  getExecutionLog(uuid): Observable<any> {
    return interval(2000).pipe(
      mergeMap(() => this.pluginService.getExecutionLog2(uuid)),
      catchError(err => {
        throw `Error while upgrading addon: ${err}`;
      }),
      takeWhile(res => res?.Status && res.Status.Name === 'InProgress')
    )
  } */

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
      this.pluginService.getExecutionLog(executionUUID, logRes => {
        if (dialogRef) {
          dialogRef
            .afterClosed()
            .subscribe(result => {
              window.clearInterval(interval);
            })
        }
        if (logRes && logRes.Status && logRes.Status.Name !== 'InProgress') {
          const content = logRes.Status.ID
            ? `${this.translate.instant('Addon_SuccessfulOperation')}<br><br><br><br>`
            : `${this.translate.instant('Addon_FailedOperation')}<span>${logRes.AuditInfo.ErrorMessage}</span><br><br>`;
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
      });
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
              this.pluginService.editAddon(actionName, rowData.Fields[0].AdditionalValue, res => {
                this.pollExecution(
                  this.translate.instant('AddonsManager_ChangeVersion_Header'),
                  this.translate.instant('AddonsManager_ChangeVersion_Body'),
                  res.ExcecutionUUID || res.ExecutionUUID);
              }, null, dialogResult.version);
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
