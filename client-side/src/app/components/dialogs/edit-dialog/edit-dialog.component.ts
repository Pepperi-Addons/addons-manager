import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, Inject, ViewChild, OnDestroy, Injectable, ViewEncapsulation } from '@angular/core';
// @ts-ignore
import { PepperiSelectComponent} from 'pepperi-select';
// @ts-ignore
import { PepperiCheckboxComponent} from 'pepperi-checkbox';
import { BehaviorSubject } from 'rxjs';


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
  selector: 'edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditDialogComponent implements OnInit, OnDestroy {

    public editorOptions = {
      theme: 'vs-lite',
      language: 'json',
      automaticLayout: true,
      minimap: {
        enabled: false
      },
      rules: [
        { token: 'comment', foreground: 'ffa500', fontStyle: 'italic underline' },
        { token: 'comment.js', foreground: 'Red', fontStyle: 'bold' },
        { token: 'comment.css', foreground: '0000ff' } // will inherit fontStyle from `comment` above
      ]

    };

    // pepperiSelect = PepperiSelectComponent;
    // @ViewChild("pepperiSelectAddOnComp", {static: false}) pepperiSelectAddOnComp: DynamicComponent;
    // pepperiSelectTypeInputs;
    // pepperiSelectTypeOutputs;
    // versions = [];

    // pepperiCheckbox = PepperiCheckboxComponent;
    // @ViewChild("pepperiCheckboxComp", {static: false}) pepperiCheckboxComp: DynamicComponent;
    // pepperiCheckboxInputs;
    // pepperiCheckboxOutputs;

    dialogData;
    svgIcons;

    automaticUpgrade = false
    outputData = { automaticUpgrade: false };

    constructor(private fb: FormBuilder,
        public dialogRef: MatDialogRef<EditDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.outputData.automaticUpgrade = data.content.automaticUpgrade;
    }

    ngOnInit() {

    }

    onConfirm() {

    }

    pepperiCheckboxOnInit(compRef, inputs, outputs, key, label, value) {
        // const self = this;
        // this[inputs] = {
        //     key: key,
        //     label: label,
        //     rowSpan: '3',
        //     xAlignment: '1',
        //     emptyOption: false,
        //     value: value
        // };
        // this[outputs] = {
        //     valueChanged: (event) => self.onValueChanged(event)
        // };
    }

    ngOnDestroy(){
        this.dialogData = null;
    }

}
