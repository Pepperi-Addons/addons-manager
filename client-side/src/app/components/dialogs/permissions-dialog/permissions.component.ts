import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, Inject, ViewChild, OnDestroy, Injectable,
        ViewEncapsulation, ComponentFactoryResolver, ViewContainerRef, TemplateRef } from '@angular/core';
// @ts-ignore
import { PepperiSelectComponent} from 'pepperi-select';
// @ts-ignore
// import { PepperiCheckboxComponent} from 'pepperi-checkbox';
import { PepperiSelectComponent} from 'pepperi-select';
import { BehaviorSubject } from 'rxjs';
// @ts-ignore
import { TranslateService } from '@ngx-translate/core';

export class PermissionObject {
    Resource;
    InternalID;
    Name = '';

    constructor(resource = 'AddonsPermissions', internalID = 0, name = '') {
        this.Resource = resource;
        this.InternalID = internalID;
        this.Name = name;
    }
}

export class PermissionObjectContextProfile {
    InternalID;
    Name = '';

    constructor(internalID = 0, name = '') {
        this.InternalID = internalID;
        this.Name = name;
    }
}

export class PermissionObjectContext {
    ScreenSize;
    Name;
    Profile;

    constructor(screenSize = '', profile = new PermissionObjectContextProfile()) {
        this.Name = 'AddonsPermissions';
        this.ScreenSize = screenSize;
        this.Profile = profile;
    }
}

export class PermissionObjectField {
    FieldID;
    Title;

    constructor(fieldID = '', title = '') {
        this.FieldID = fieldID;
        this.Title = title;
    }
}
export class AddonsPermissions {
    Context;
    Fields;
    Type;

    constructor(context = new PermissionObjectContext(), fields = []) {
                    this.Type = 'Menu';
                    this.Context = context;
                    this.Fields = fields;
                }
}

@Injectable({ providedIn: 'root' })
export class EditDialogService {

    private dataSource = new BehaviorSubject<any>('');
    data = this.dataSource.asObservable();

    constructor() { }

    getData(data: any) {
        this.dataSource.next(data);
    }
}
@Component({
  selector: 'addon-permissions-dialog',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss'],
  encapsulation: ViewEncapsulation.None
})
@Injectable()
export class PermissionsDialogComponent implements  OnDestroy {
    @ViewChild('selectEditorsTemplate') selectEditorsTemplate: TemplateRef<any>;
    @ViewChild('modalCont', { read: ViewContainerRef }) modalCont: ViewContainerRef;


    addonEditors = [];
    selectedEditor: any = '';

    installedAddons = [];
    selectedAddon: any = '';

    title;
    dialogData = {};
    svgIcons;
    currentVersion;
    callback;
    outputData = {
        callback: null,
        selectedAddon: null,
        selectedEditor: null,
    };

    constructor(
        public dialogRef: MatDialogRef<PermissionsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public incoming: any,
        public translate: TranslateService
        ) {
        this.installedAddons = incoming.content.installedAddons;
    }

    // pepperiSelectOnInit(compRef, inputs, outputs, key, options, initalValue = null) {
    //     const this = this;

    //     this[inputs] = {
    //         'key': key,
    //         'label': key === 'EditorSelect' ? this.translate.instant('AddonManager_SelectAnEditor') :
    //                                           this.translate.instant('AddonManager_SelectAnAddon'),
    //         'rowSpan': '3',
    //         'xAlignment': '1',
    //         'options': options,
    //         'emptyOption': true,
    //         'value': '', // initalValue ? initalValue.Key : options[0].Key,
    //         'formattedValue': '', // initalValue ?  initalValue.Value : options[0].Value,
    //         'disabled':  (key === 'EditorSelect' && options.length === 0)
    //     };

    //     this[outputs] = {
    //         // elementClicked: (event) => this.onElementClicked(event),
    //         valueChanged: (event) => this.onValueChanged(event)
    //     };

    //     if (key === 'AddonSelect') {
    //         this.modalCont.insert(this.selectEditorsTemplate.createEmbeddedView(null));
    //     }
    // }

    // pepperiCheckboxOnInit(compRef, inputs, outputs, key, label, value) {
    //     const this = this;
    //     this[inputs] = {
    //         key: key,
    //         label: label,
    //         rowSpan: '3',
    //         xAlignment: '1',
    //         emptyOption: false,
    //         value: value
    //     };
    //     this[outputs] = {
    //         // elementClicked: (event) => this.onElementClicked(event),
    //         valueChanged: (event) => this.onValueChanged(event)
    //     };
    // }

    onValueChanged(key, value) {
        switch (key) {
            case 'AddonSelect':
                if ( value === '') {
                    this.selectedAddon = this.selectedEditor = '';
                    this.addonEditors = [];

                } else {
                    const selAddon = this.installedAddons.filter(addon => addon.key === value);
                    this.outputData.selectedAddon = this.selectedAddon = value === '' ? '' : selAddon[0];
                    this.addonEditors = this.selectedAddon.Editors.map(editor => {
                        return { key: editor, value: editor.Description };
                    });
                }
                break;
            case 'EditorSelect':
                this.outputData.selectedEditor = this.selectedEditor = value;
                break;
        }
    }

    ngOnDestroy() {
        this.selectedAddon = null;
        this.selectedEditor = null;
        this.dialogData = null;
    }

}
