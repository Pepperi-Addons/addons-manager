import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { PepNgxLibModule, PepAddonService, PepFileService } from '@pepperi-addons/ngx-lib';
import { PepAttachmentModule } from '@pepperi-addons/ngx-lib/attachment';
import { PepCheckboxModule } from '@pepperi-addons/ngx-lib/checkbox';
import { PepColorModule } from '@pepperi-addons/ngx-lib/color';
import { PepDateModule } from '@pepperi-addons/ngx-lib/date';
import { PepGroupButtonsModule } from '@pepperi-addons/ngx-lib/group-buttons';
import { PepImageModule } from '@pepperi-addons/ngx-lib/image';
import { PepImagesFilmstripModule } from '@pepperi-addons/ngx-lib/images-filmstrip';
import { PepQuantitySelectorModule } from '@pepperi-addons/ngx-lib/quantity-selector';
import { PepRichHtmlTextareaModule } from '@pepperi-addons/ngx-lib/rich-html-textarea';
import { PepSelectModule } from '@pepperi-addons/ngx-lib/select';
import { PepSeparatorModule } from '@pepperi-addons/ngx-lib/separator';
import { PepSignatureModule } from '@pepperi-addons/ngx-lib/signature';
import { PepSizeDetectorModule } from '@pepperi-addons/ngx-lib/size-detector';
import { PepTextareaModule } from '@pepperi-addons/ngx-lib/textarea';
import { PepTextboxModule } from '@pepperi-addons/ngx-lib/textbox';
import { PepListModule } from '@pepperi-addons/ngx-lib/list';
import { PepMenuModule } from '@pepperi-addons/ngx-lib/menu';
import { PepDialogModule } from '@pepperi-addons/ngx-lib/dialog';
import { PepPageLayoutModule } from '@pepperi-addons/ngx-lib/page-layout';

import {
    PepIconModule,
    PepIconRegistry,
    pepIconSystemBolt,
    pepIconNoImage,
    pepIconArrowTwoWaysVerT,
    pepIconArrowDown,
    pepIconArrowUp,
    pepIconArrowRightAlt,
    pepIconArrowLeftAlt,
    pepIconArrowDownAlt,
    pepIconArrowUpAlt,
    pepIconNumberNumber,
    pepIconNumberPlus,
    pepIconSystemBin,
    pepIconSystemEdit,
    pepIconSystemClose,
    pepIconSystemFilter,
    pepIconSystemMenu,
    pepIconSystemHome,
    pepIconSystemSettings,
    pepIconSystemQuestion,
    pepIconSystemAvatar,
    pepIconSystemDoor,
    pepIconSystemPrint,
    pepIconSystemSearch,
    pepIconSystemSpinner,
    pepIconSystemInfo,
    pepIconShoppingCart,
    pepIconTimeCal,
    pepIconViewCardLg,
    pepIconViewCardMd,
    pepIconViewCardSm,
    pepIconViewTable,
    pepIconViewMatrix,
    pepIconViewLine
} from '@pepperi-addons/ngx-lib/icon';
const pepIcons = [
    pepIconSystemBolt,
    pepIconNoImage,
    pepIconArrowTwoWaysVerT,
    pepIconArrowDown,
    pepIconArrowUp,
    pepIconArrowRightAlt,
    pepIconArrowLeftAlt,
    pepIconArrowDownAlt,
    pepIconArrowUpAlt,
    pepIconNumberNumber,
    pepIconNumberPlus,
    pepIconSystemBin,
    pepIconSystemEdit,
    pepIconSystemClose,
    pepIconSystemFilter,
    pepIconSystemMenu,
    pepIconSystemHome,
    pepIconSystemSettings,
    pepIconSystemQuestion,
    pepIconSystemAvatar,
    pepIconSystemDoor,
    pepIconSystemPrint,
    pepIconSystemSearch,
    pepIconSystemSpinner,
    pepIconSystemInfo,
    pepIconShoppingCart,
    pepIconTimeCal,
    pepIconViewCardLg,
    pepIconViewCardMd,
    pepIconViewCardSm,
    pepIconViewTable,
    pepIconViewMatrix,
    pepIconViewLine
];

const pepperiComponentsModules = [
    PepAttachmentModule,
    PepCarouselModule,
    PepButtonModule,
    PepCheckboxModule,
    PepColorModule,
    PepDateModule,
    PepGroupButtonsModule,
    PepImageModule,
    PepImagesFilmstripModule,
    PepListModule,
    PepCheckboxModule,
    PepQuantitySelectorModule,
    PepRichHtmlTextareaModule,
    PepSearchModule,
    PepSelectModule,
    PepSeparatorModule,
    PepSignatureModule,
    PepSizeDetectorModule,
    PepTextareaModule,
    PepTextboxModule,
    PepIconModule,
    PepMenuModule,
    PepTopBarModule,
    PepFormModule,
    PepDialogModule,
    PepPageLayoutModule
];

import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepCarouselModule } from '@pepperi-addons/ngx-lib/carousel';
import { PepFormModule } from '@pepperi-addons/ngx-lib/form';
import { PepSearchModule } from '@pepperi-addons/ngx-lib/search';
import { PepTopBarModule } from '@pepperi-addons/ngx-lib/top-bar';
@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        PepNgxLibModule,
        pepperiComponentsModules,
        TranslateModule.forChild()
    ],
    exports: [
        PepNgxLibModule,
        pepperiComponentsModules
    ]
})
export class PepUIModule {

    constructor(
        translate: TranslateService,
        private pepperiIconRegistry: PepIconRegistry,
        private pepAddonService: PepAddonService
    ) {
        this.pepperiIconRegistry.registerIcons(pepIcons);
        this.pepAddonService.setDefaultTranslateLang(translate);
    }
}
