import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';

@Component({
  selector: 'addon-change-version-dialog',
  templateUrl: './change-version-dialog.component.html',
  styleUrls: ['./change-version-dialog.component.scss']
})
export class ChangeVersionDialogComponent  {

  currentVersion;
  options = [];
  version;
  outputData = {callback: null, version: ''};

  constructor(private fb: FormBuilder,
      public dialogRef: MatDialogRef<EditDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public incoming: any) {
      this.options = incoming.content.versions;
      this.currentVersion = incoming.content.currentVersion;
  }

}
