import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';
import { BulkUpgradeResponse, AddonError } from '../../../app.model';

@Component({
  selector: 'addon-upgrade-all-dialog',
  templateUrl: './upgrade-all-dialog.component.html',
  styleUrls: ['./upgrade-all-dialog.component.scss']
})
export class UpgradeAllDialogComponent {
  status = 0;
  generalError = '';
  addonErrors: AddonError[] = [];
 
  outputData = { callback: null, version: '' };

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<UpgradeAllDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      console.log('dialog data', data);
      this.status = data.content.status;
      if (data.content.generalError) {
        this.generalError = data.content.generalError;
      }      
      if (data.content.addonErrorList.length) {
        this.addonErrors = data.content.addonErrorList;
      }
    /*this.options = incoming.content.versions;
    this.currentVersion = incoming.content.currentVersion; */
  }

  onDialogClose() {
    this.dialogRef.close();
  }

}
