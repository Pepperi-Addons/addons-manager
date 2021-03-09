

export class AddonsSearch {
    SortBy?: string;
    Asc?: boolean;
    UUID: string;
    ListType: string;
    RowUUID?: string;
}

export class KeyValuePair<T> {
    Key: number;
    Value: T;
}

export class SystemData{
    Versions?: string[];
    EnableKey?: string;
    AngularPlugin?: boolean;
    EditorName?: string;

}

export enum AddonType {
    System = 1,
    Public = 2,
    Distributor = 3,
    Dev = 4
}

export class Addon {
    UUID: string;
    Name: string;
    Description: string;
    SystemData: any;

    // CreationDate: string;
    // ModificationDate: string;
    Hidden: boolean;
    Type: number;
    constructor(uuid = '', name: any = '', description = '', systemData =  {Versions: []}) {
        this.UUID = uuid;
        this.Name = name;
        this.Description = description;
        this.SystemData = systemData;

    }
}

export class InstalledAddon {
    AutomaticUpgrade: boolean;
    UUID: string;
    Addon: Addon;
    Version?: string;
    SystemData?: SystemData;
    // CreationDate: string;
    // ModificationDate: string;
    LastUpgradeDateTime?: string;
    AdditionalData: string;
    Hidden: string;
    LatestPhased?: any;
    HasVersions?: any;
    constructor(uuid = '', addon: Addon = null, additionalData = '{}', systemData =  {Versions: []}) {
        this.UUID = uuid;
        this.Addon = name;
        this.AdditionalData = additionalData;
        this.SystemData = systemData;
    }
}

export class AdditionalData {
    Addons: Addon[];
}

export class ActionButton {
    title;
    callback;
    className;
    icon;

    constructor(title = '', callback = null, className = '', icon = '') {
        this.title = title;
        this.callback = callback;
        this.className = className;
        this.icon = icon;
    }
}

export interface DataRowField {

    ApiName: string;
    FormattedValue: string;
    Value: string;
    FieldType: any;
    ColumnWidth: number;
    XAlignment: number;
    Title: string;
    AdditionalValue: any;
    OptionalValues: any;

}
