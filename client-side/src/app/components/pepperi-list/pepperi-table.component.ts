// import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
// import { PepDataConvertorService, FIELD_TYPE, ObjectSingleData, PepFieldData, PepRowData } from '@pepperi-addons/ngx-lib';
// import { PepListComponent } from '@pepperi-addons/ngx-lib/list';

// @Component({
//   selector: 'pep-table',
//   template: `<div class="list-container" #listContainer>
//   <pep-list
//       [firstFieldAsLink]="false"
//       [supportSorting]="true"
//       [supportResizing]="false"
//       [selectionTypeForActions]="'single'"
//       [noDataFoundMsg]="'No data'"
//       [parentScroll]="listContainer"
//       [viewType] = "'table'"
//       (listChange)="listChanged.emit($event)"
//       (sortingChange)="sortingChanged.emit($event)"
//       (fieldClick)="fieldClicked.emit($event)"
//       (selectedItemsChange)="selectedItemsChanged.emit($event)">
//   </pep-list>
// </div>`
// })
// export class PepperiTableComponent implements OnInit, OnChanges {


//     @Input() dataSource = null;
//     @Input() displayedColumns = null;
//     @Input() customizeTable = null;

//     @ViewChild(PepListComponent) customList: PepListComponent;

//     @Output() listChanged: EventEmitter<any> = new EventEmitter();
//     @Output() sortingChanged: EventEmitter<any> = new EventEmitter();
//     @Output() fieldClicked: EventEmitter<any> = new EventEmitter();
//     @Output() selectedItemsChanged: EventEmitter<any> = new EventEmitter();

//     constructor(
//         private translate: TranslateService,
//         private dataConvertorService: PepDataConvertorService
//     ) {

//     }

//     ngOnInit() {
//         // if (this.dataSource){
//         //     this.initPepList(this.dataSource, this.displayedColumns, this.customizeTable);
//         // }
//     }

//     ngOnChanges(changes: SimpleChanges) {
//         if (changes?.dataSource?.currentValue){
//             this.initPepList(this.dataSource, this.displayedColumns, this.customizeTable);
//         }

//     }

//     initPepList(dataSource, displayedColumns = null, customizeFn = null) {
//         if (this.customList && dataSource) {
//             const tableData = new Array<PepRowData>();
//             const uiControl = this.dataConvertorService.getUiControl(tableData[0]);
//             dataSource.forEach((addon: any) => {
//                 tableData.push(this.convertObjectToPepRowData(addon, displayedColumns, customizeFn));
//             });
//             const pepperiListObj = this.dataConvertorService.convertListData(tableData);
//             const buffer = [];
//             if (pepperiListObj) {
//                 pepperiListObj.forEach( row => {
//                     const osd = new ObjectSingleData(uiControl, row);
//                     buffer.push(osd);
//                 });
//             }

//             this.customList.initListData(uiControl, buffer.length, buffer);
//         }
//     }

//     convertObjectToPepRowData(object: any, displayedColumns = null, customizeFn = null) {
//         const row = new PepRowData();
//         row.Fields = [];
//         const keys = displayedColumns ? displayedColumns : Object.keys(object);
//         keys.forEach(key => row.Fields.push(this.initDataRowField(object, key, customizeFn)));
//         return row;
//     }

//     initDataRowField(object: any, key: any, customizeFn = null): PepFieldData {

//         const dataRowField: PepFieldData = {
//             ApiName: key,
//             Title: this.translate.instant(key),
//             XAlignment: 1,
//             FormattedValue: object[key] ? object[key].toString() : '',
//             Value:  object[key] ? object[key].toString() : '',
//             ColumnWidth: 10,
//             AdditionalValue: '',
//             OptionalValues: [],
//             FieldType: FIELD_TYPE.TextBox
//         };
//         if (customizeFn){
//             return customizeFn(object, key, dataRowField);
//         }
//         else {
//             return dataRowField;
//         }

//     }

//     getSelectedItemsData(){
//         return this.customList.getSelectedItemsData();
//     }

//     getItemDataByID(id: string){
//         return this.customList.getItemDataByID(id);
//     }


// }
