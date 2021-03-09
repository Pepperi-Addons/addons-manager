import { ObjectSingleData, PepDataConvertorService, PepFieldData, PepUtilitiesService } from '@pepperi-addons/ngx-lib';
// Main Imports
import { Component, EventEmitter, OnInit, Input, ComponentRef,
    ViewChild, Output, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Subscription, SubscriptionLike } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

// Internal Import
import { AppService } from '../../app.service';
import { AddonsSearch, InstalledAddon, DataRowField,
      Addon, AddonType } from '../../app.model';
import {PermissionObjectContextProfile, PermissionsDialogComponent, AddonsPermissions,
    PermissionObjectField, PermissionObjectContext } from '../dialogs/permissions-dialog/permissions.component';
import { EditDialogComponent } from '../dialogs/edit-dialog/edit-dialog.component';
import { ChangeVersionDialogComponent } from '../dialogs/change-version-dialog/change-version-dialog.component';

// External Import
import { PepRowData, FIELD_TYPE } from '@pepperi-addons/ngx-lib';
import { PepDialogService, PepDialogData, PepDialogSizeType, PepDialogActionButton } from '@pepperi-addons/ngx-lib/dialog';
import { PepMenuItem } from '@pepperi-addons/ngx-lib/menu';
import { PepListComponent, PepListViewType } from '@pepperi-addons/ngx-lib/list';
import { PepTopBarComponent } from '@pepperi-addons/ngx-lib/top-bar';
import { MatDialogConfig } from '@angular/material/dialog';


@Component({
  selector: 'pep-list-cont',
  templateUrl: './pepperi-list.component.html',
  styleUrls: ['./pepperi-list.component.scss'],
  providers: [ AppService ]
})
export class PepperiListContComponent {

  @ViewChild(PepListComponent, { static: false })
  pepList: PepListComponent;
  @ViewChild(PepTopBarComponent, { static: false })
  pepTopBar: PepTopBarComponent;
  topBarComp
  @Output() setAddonList: EventEmitter<any> = new EventEmitter<any>();
  @Output() refreshSettingsTree: EventEmitter<any> = new EventEmitter<any>();

  @Input() pluginPath: string;
  @Input() addonData: any;
  @Input() addonsList = [];

  protected paramsSubscription: Subscription;
  protected locationSubscription: SubscriptionLike;



  listActions: Array<PepMenuItem> = [];
  currentList = {ListType: '', ListCustomizationParams: '', ListTabName: '',  ListFilterStr: ''};
  totalRows = 0;
  view: any;
  installing = false;
  searchString = '';
  updateAvailable = false;
  @Input() apiEndpoint = '';
  @Input() isSupportUser = '';

  installedAddonsList = [];
  installedAddonsWithEditor = [];
  // addonEditors = [];
  existPermissions = [];
  enableAddonAutomaticUpgrade = false;
  currentApiVersion = '';
  addonUUID = '';
  profilesList = [];
  selectedProfile = null;
  topBarTitle = '';
  noDataMsg = '';
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
    //   this.loadPage();
    this.loadlist(this.apiEndpoint);
  }

  ngOnChanges(changes) {
    if (changes?.apiEndpoint?.currentValue)
    this.loadPage();
  }

  pepperiListOnInit(compRef: ComponentRef<any>, apiEndpoint) {


    // this.pepperiListOutputs = {
    //   notifyListChanged: event => this.onListChange(event),
    //   notifySortingChanged: event => this.onListSortingChange(event),
    //   notifyFieldClicked: event => this.onCustomizeFieldClick(event),
    //   notifySelectedItemsChanged: event => this.selectedRowsChanged(event)
    // };

  }

  onListChange(event) {

  }

  onListSortingChange(event) {
    const searchObj: AddonsSearch = {
      Asc: event.isAsc,
      SortBy: event.sortBy,
      ListType: 'all',
      UUID: this.addonData.Addon.UUID
    };
    this.pluginService.getData(searchObj, res => {}, error => {});
  }

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
    // this.topBarComp.componentRef.instance.listActionsData = this.listActions;
    // this.topBarComp.componentRef.instance.showListActions = this.listActions ? true : false;
    // this.cd.detectChanges();
  }

  loadPage() {
    this.topBarTitle = this.apiEndpoint === 'addons' ? 'AddonManager_All_List' : 'AddonManager_Permissions_List'
    if (this.apiEndpoint === 'addons') {
        // this.topBarOnInit(compRef);
    } else if (this.apiEndpoint === 'permissions') {
      this.setProfiles(() => {
        // this.topBarOnInit(compRef);
        this.loadlist(this.apiEndpoint);
      });
    }
  }

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
      case 'ChangeVersion' : {
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
        const jsonString = rowData.Fields.filter( field => field.ApiName === 'Version')[0].AdditionalValue;
        const additionalValue = this.utilities.isJsonString(jsonString) ? JSON.parse(jsonString) : {};
        isLatestPhased = additionalValue.LatestPhased;
        isLatestAvailable = additionalValue.LatestAvailable;
        isInstalled = additionalValue.Installed;
        hasVersions = additionalValue.HasVersions;
        isAddonSystemType = rowData?.Fields ? rowData.Fields
          .filter( field => field.ApiName === 'Description')[0].AdditionalValue === "1" : false;
      }

      action = new PepMenuItem({ key: 'Edit', text: this.translate.instant('Edit'),
      hidden: !isInstalled || (!this.isSupportUser && !this.enableAddonAutomaticUpgrade)});
      retVal.push(action);

      action = new PepMenuItem({ key: 'Install', text: this.translate.instant('Install'),
      hidden:  isInstalled });
      retVal.push(action);

      action = new PepMenuItem({ key: 'Uninstall', text: this.translate.instant('Uninstall'),
             hidden: !isInstalled || isAddonSystemType});
      retVal.push(action);

      action = new PepMenuItem({ key: 'Upgrade', text: this.translate.instant('Upgrade'),
             hidden: (isLatestPhased || !isInstalled)});
      retVal.push(action);

      action = new PepMenuItem({
          key: 'ChangeVersion', text: this.translate.instant('AddonsManager_ChangeVersion_Header'),
          hidden:  !isInstalled || !this.isSupportUser} );
      retVal.push(action);

    } else if (this.apiEndpoint === 'permissions') {
        let action: PepMenuItem;
        action = new PepMenuItem({key: 'DeletePermission',text: this.translate.instant('Delete'),hidden: false});
        retVal.push(action);
    }
    return retVal;


  }

  updateInstalledAddonsList(additionalData): any {

  this.pluginService.updateAdditionalData(additionalData,  res => {
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
            const supportUserKeys = this.isSupportUser === 'true' ? ['Type', 'AutomaticUpgrade' ] : [];
            const allKeys = [ ...userKeys,  ...supportUserKeys];
            tableData.push(this.convertAddonToPepperiRowData(addon, allKeys));
        });
      const uiControl = this.pepData.getUiControl(tableData[0]);
      const pepperiListObj = this.pepData.convertListData(tableData);
      this.pepList.initListData(uiControl, pepperiListObj.length, pepperiListObj, 'table', '', true);
    }
  }

  sortByKeys(array, key, secondKey) {
    return array.sort((a, b) => {
        const w = a[key].split(';')[1];
        const x = b[key].split(';')[1];
        const y = a[secondKey].split(';')[2];
        const z = b[secondKey].split(';')[2];
        // return ((w < x) ? -1 : ((w > x) ? 1 : 0));
        return ((w < x) ? -1 : ((w > x) ? 1 : (y < z) ? -1 : (y > z) ? 1 : 0));
    });
  }

  loadlist(apiEndpoint, needToReload = true) {
     this.noDataMsg = apiEndpoint === 'permissions' ? 'AddonManager_NoPermissions' : 'AddonManager_NoAddons';

      apiEndpoint = apiEndpoint && apiEndpoint !== '' ? apiEndpoint : 'addons';
      if (apiEndpoint === 'addons') {
        if (this.addonsList.length === 0 || needToReload) {
          const searchObj: AddonsSearch = {
            Asc: true,
            SortBy: 'Name',
            ListType: apiEndpoint,
            UUID: this.addonData.Addon.UUID
          };
          this.pluginService.getData(searchObj, res => {
            this.loadAddonsList(res);

          }, error => {});
        } else {
        this.loadAddonsList(this.addonsList);
      }
      } else if (apiEndpoint === 'permissions') {
        this.pluginService.getPermissionsList(this.selectedProfile, res => {
            if (res && res.length && res[0].Fields && res[0].Fields.length > 0) {
                this.existPermissions = this.sortByKeys(res[0].Fields , 'FieldID', 'Title');
                const tableData = new Array<PepRowData>();
                const userKeys = ['FieldID', 'Title'];
                this.existPermissions.forEach((permission: InstalledAddon) => tableData.push(this.convertPermissionToPepperiRowData(permission, userKeys)));
                const pepperiListObj = this.pepData.convertListData(tableData);
                const uiControl = this.pepData.getUiControl(tableData[0]);
                this.pepList.initListData(uiControl, pepperiListObj.length, pepperiListObj, 'table', '', true);
            } else {
              this.existPermissions = [];
              this.pepList.initListData(null, 0, [], 'table', '', true);
            }
        }, error => {});
      }
  }

  setProfiles(callBack: Function) {
    this.pluginService.getProfiles(results => {
      this.profilesList = [];
      if (results) {
        this.profilesList = results.filter(profile => {
          return profile.Name !== 'Admin';
        }).map( profile => {
          return {
              key: profile.InternalID,
              text: profile.Name,
              view_type: profile.InternalID
            };
        });

        this.selectedProfile = this.profilesList[0];

        callBack();
      }
    });
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
        const config = this.dialog.getDialogConfig({minWidth: '30rem'}, 'regular');
        const content = { installedAddons: this.installedAddonsWithEditor };
        const data = new PepDialogData( {content});
        const dialogRef = this.dialog.openDialog(PermissionsDialogComponent, data, config);
        dialogRef.afterClosed().subscribe(dialogData => {
            if  (dialogData) {
              const fieldID = dialogData.selectedAddon.key + ';' + dialogData.selectedAddon.value;
              const Title =  dialogData.selectedAddon.key + ';' +
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
                const data2 = new PepDialogData({title: modalTitle, content, actionButtons:[null]});
                const config = this.dialog.getDialogConfig({minWidth: '30rem'}, 'regular');
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
      this.loadlist('permissions');
    }, (error) => {

    });
  }

  convertAddonToPepperiRowData(addon: InstalledAddon, customKeys = null) {
      const row = new PepRowData();
      row.Fields = [];
      const keys = customKeys ? customKeys : Object.keys(addon);
      keys.forEach(key => row.Fields.push(this.initDataRowField(addon, key)));
      return row;
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
        FormattedValue: key === 'FieldID' ? value[1] : value[2],
        Value: key === 'FieldID' ? value[0] : value[1],
        ColumnWidth: 10,
        AdditionalValue: '',
        OptionalValues: [],
        FieldType: FIELD_TYPE.TextBox,
        ReadOnly: true,
        Enabled: false
    };
    return dataRowField;
  }

  initDataRowField(addon: InstalledAddon, key): PepFieldData {
        const dataRowField: PepFieldData = {
            ApiName: key,
            Title: this.translate.instant(key),
            XAlignment: 1,
            FormattedValue: addon[key] ? addon[key].toString() : '',
            Value:  addon[key] ? addon[key].toString() : '',
            ColumnWidth: 10,
            AdditionalValue: '',
            OptionalValues: [],
            FieldType: FIELD_TYPE.TextBox

        };
        addon.Addon.UUID === '00000000-0000-0000-0000-000000000a91' ? this.currentApiVersion = addon.Version : null;
        const installed = addon.UUID !== '';
        const systemData = this.utilities.isJsonString(addon.SystemData.toString()) ? JSON.parse(addon.SystemData.toString()) : {};

        switch (key) {
            case 'Type':
                const addonType = addon.Addon && addon.Addon[key] &&  AddonType[addon.Addon[key]] ? AddonType[addon.Addon[key]] : '';
                dataRowField.FormattedValue = addonType;
                // dataRowField.AdditionalValue =
                dataRowField.Value = addonType;
                break;
            case 'Description':
                dataRowField.ColumnWidth = 25;
                dataRowField.AdditionalValue = addon.Addon.Type.toString();
                dataRowField.FormattedValue = addon.Addon[key] ? addon.Addon[key] : '';
                dataRowField.Value =  addon.Addon[key] ? addon.Addon[key] : '';
                break;
            case 'Name':
                dataRowField.ColumnWidth = 15;
                dataRowField.AdditionalValue = addon.Addon.UUID;
                dataRowField.FormattedValue =  addon.Addon[key] ? addon.Addon[key] : '';
                dataRowField.Value =  addon.Addon[key] ? addon.Addon[key] : '';
                break;
            case 'Version':
                dataRowField.ColumnWidth = 15;
                addon.LatestPhased = (addon.Addon.SystemData && addon.Addon.SystemData.indexOf('CurrentPhasedVersion') > -1) ?
                this.isLatestPhased(addon) : true;

                dataRowField.AdditionalValue = JSON.stringify(
                    { LatestPhased: addon.LatestPhased,
                      /*LatestPhased: addon.LatestPhased === true,*/
                      LatestAvailable: true,
                      HasVersions: addon.HasVersions === true,
                      Installed: installed
                    });

                if (!installed) {
                    dataRowField.FormattedValue = `${this.translate.instant('NotInstalled')}`;
                } else if (installed) {
                    dataRowField.FormattedValue = (addon && addon.LatestPhased === false) ?
                                `${addon[key]} ${this.translate.instant('UpdateAvailable')}` : `${addon[key]}`;
                }

                break;

            case 'AutomaticUpgrade':
                dataRowField.FieldType = FIELD_TYPE.Boolean;
                dataRowField.FormattedValue = addon.AutomaticUpgrade ? "1" : "0";
                dataRowField.Value = addon.AutomaticUpgrade ? "1" : "0";
                dataRowField.ReadOnly = true;
                dataRowField.Enabled = false;

                break;
            case 'LastUpgradeDateTime':
                dataRowField.FieldType = FIELD_TYPE.DateAndTime;
                dataRowField.ColumnWidth = 17;
                // THIS IS A HACK! we don't support date formatting
                // dataRowField.FormattedValue = addon.LastUpgradeDateTime ? (new Date(addon.LastUpgradeDateTime)).toLocaleString() : '';
                break
            default:
                dataRowField.FormattedValue = addon[key] ? addon[key].toString() : '';
                break;
        }
        return dataRowField;

  }

  isLatestPhased(addon) {
    const systemData = this.utilities.isJsonString(addon.Addon.SystemData) ? JSON.parse(addon.Addon.SystemData.toString()) : {};
    const latestPhasedVer = systemData.CurrentPhasedVersion;
    const installedVer = addon.Version;

    return installedVer === latestPhasedVer;
    // const CreationDateTime = Date.parse(addon.CreationDateTime);
  }

  addNew() {

      if (this.addonsList.length === 0) {
        this.pluginService.getAddOnsList(results => {
            if (results) {
                  results.forEach( (addon: Addon) => {
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
      const rowData = this.pepList.getItemDataByID( uid );
      switch (e.source.key) {
        case 'Edit': {
          this.openEditDialog(rowData);
          break;
        }
        case 'Install': {
          this.editRow('install', 'InstallAddon_Header', {Text: 'InstallAddon_Body', Data: {}}, '', rowData);
          break;
        }
        case 'Upgrade': {
          this.editRow('upgrade', 'UpgradeAddon_Header', {Text: 'UpgradeAddon_Body', Data: {}}, '', rowData);
          break;
        }

        // case 'UpgradeLatest': {
        //   const versions = rowData.Fields[2].OptionalValues.filter( version => version);
        //   const latestCreationDate = Math.max.apply(null, versions.map(e =>  Date.parse(e.CreationDateTime)));
        //   const latest = versions.filter(version => Date.parse(version.CreationDateTime) === latestCreationDate)[0];
        //   this.editRow('upgrade', 'UpgradeAddon_Header', {Text: 'UpgradeAddon_Body', Data: {}}, latest.Version, rowData);
        //   break;
        // }
        case 'ChangeVersion' : {
          this.openChangeVersionDialog(rowData);
          break;
        }
        case 'Uninstall': {
          this.editRow('uninstall', 'UninstallAddon_Header', {Text: 'UninstallAddon_Body', Data: {}}, '', rowData);
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
          const data = new PepDialogData({title, content});
          const config = this.dialog.getDialogConfig({minWidth: '30rem'}, 'regular');
          this.dialog.openDefaultDialog(data, config);
        }
      }

    }
  }

  editRow(action = '', dialogTitle = '', dialogContent = {Text: '', Data: {}},
          version = '', rowData = null, buttonsTitles = ['Confirm', 'Cancel']) {

      const startAction = () =>  this.pluginService.editAddon(action, rowData.Fields[0].AdditionalValue,
        res =>  this.pollExecution( this.translate.instant(dialogTitle), this.translate.instant(dialogContent.Text, dialogContent.Data), res.ExcecutionUUID || res.ExecutionUUID ),
        error => {
            const data = new PepDialogData({title: this.translate.instant('General_Error'), content:  error.fault.faultstring});
            const config = this.dialog.getDialogConfig({minWidth: '30rem'}, 'regular');
            this.dialog.openDefaultDialog(data, config);
        }
        , version);
      const data = new PepDialogData({
        title: this.translate.instant(dialogTitle),
        content: this.translate.instant(dialogContent.Text, dialogContent.Data),
        type: 'cancel-continue'});

        const config = this.dialog.getDialogConfig({minWidth: '30rem'}, 'regular');
        this.dialog.openDefaultDialog(data, config).afterClosed().subscribe(performAction => {
          performAction ? startAction() : null;
      });
  }

  showDeletePermissionModal(rowData: any) {
    const data = new PepDialogData({
        title: this.translate.instant('AddonManager_DeletePermissionTitle'),
        content: this.translate.instant('AddonManager_DeletePermissionMsg'),
        type: 'cancel-delete'
    });
    const config = this.dialog.getDialogConfig({minWidth: '30rem'}, 'regular');
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

  public searchChanged(searchString: string) {
      this.searchString = searchString;
    //   this.initListLoad();
  }

  public profileListChanged(profile: any) {
    this.selectedProfile = profile;
    this.loadlist('permissions');
  }

  chooseList(codeJobUUID = '', executionUUID = '', type = '') {
      return {};
  }

  pollExecution(title, content, executionUUID) {


    const pollData = new PepDialogData({
        title,
        content: this.translate.instant('AddonInstallation_Progress'),
        type:  'custom',
        showClose: false
    });
    const config = this.dialog.getDialogConfig({minWidth: '30rem'}, 'regular');
    const dialogRef = this.dialog.openDefaultDialog(pollData, config);
    const interval = window.setInterval(() => {
        this.pluginService.getExecutionLog(executionUUID, logRes => {
            if (dialogRef){
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
            this.loadlist('addons');
            // this.refreshSettingsTree.emit();
            window.clearInterval(interval);

          }
        });
      }, 2000);

  }

  openEditDialog(rowData) {
    this.pluginService.getInstalledAddOn(this.addonUUID, installedAddon => {
        const data = new PepDialogData({content: {automaticUpgrade: installedAddon.AutomaticUpgrade ? "1" : "0"}});
        const dialogRef = this.dialog.openDialog(EditDialogComponent, data);
        dialogRef.afterClosed().subscribe(dialogData => {
                if  (dialogData) {
                  const automaticUpgrade =  dialogData.automaticUpgrade;
                  this.pluginService.setSystemData(installedAddon.Addon.UUID, automaticUpgrade, () => this.loadlist(''));
                }
            });
    });

  }

  openChangeVersionDialog(rowData) {
    const selectedAddon = rowData.Fields[0].AdditionalValue;
    const searchObj: AddonsSearch = {
        ListType: 'addon_versions',
        UUID: this.addonData.Addon.UUID,
        RowUUID: selectedAddon
    };
    this.pluginService.getData(searchObj,
        versions => {

            if (versions && versions.length) {
                const filterdVersions = versions.filter( version => version.Available);
                const sortedVersions = filterdVersions.sort((a, b) => a.CreationDateTime > b.CreationDateTime ? 1 : -1);
                let options = [];
                sortedVersions.forEach( option => {
                    const value = `${option?.Version}${option?.Phased ? ' | Phased' : ' | Available'}${option?.Description ? ' | ' + option?.Description : ''}`;
                    options.push({key: option?.Version, value});
                });
                const currentVersionId = rowData.Fields[2].Value;
                const data = new PepDialogData({
                    content: {
                        versions: options,
                        currentVersion: currentVersionId
                    }
                });
                const config = this.dialog.getDialogConfig({minWidth: '30rem'}, 'regular');
                const dialogRef = this.dialog.openDialog(ChangeVersionDialogComponent, data);
                dialogRef.afterClosed().subscribe(dialogResult => {
                    if (dialogResult){
                        const versionToChange = versions.find(version => version.Version === dialogResult.version);
                        const currentVersion = versions.find(version => version.Version === currentVersionId);
                        const actionName = versionToChange && currentVersion ?
                                          (Date.parse(versionToChange.CreationDateTime) < Date.parse(currentVersion.CreationDateTime)
                                      ? 'downgrade' : 'upgrade') : null;
                        if (versionToChange && actionName) {
                          this.pluginService.editAddon(actionName, rowData.Fields[0].AdditionalValue, res => {
                              this.pollExecution(
                                  this.translate.instant('AddonsManager_ChangeVersion_Header'),
                                  this.translate.instant('AddonsManager_ChangeVersion_Body'),
                                  res.ExcecutionUUID || res.ExecutionUUID );
                            }, null, dialogResult.version);
                        }
                        else {
                            const content = 'Installed addon is corrupted, please contact support.';
                            const data = new PepDialogData({content});
                            const config = this.dialog.getDialogConfig({minWidth: '30rem'}, 'regular');
                            this.dialog.openDefaultDialog(data, config);
                        }
                    }



                })
            } else {
              const content = 'Versions not available';
              const data = new PepDialogData({content});
              const config = this.dialog.getDialogConfig({minWidth: '30rem'}, 'regular');
              this.dialog.openDefaultDialog(data, config);
            }
    }, null);



  }

  onListChanged(e) {
  }

}
