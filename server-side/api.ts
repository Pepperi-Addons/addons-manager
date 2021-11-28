import MyService from './my.service';
import { Client, Request } from '@pepperi-addons/debug-server';
import { InstalledAddon, Addon, AddonVersion } from '@pepperi-addons/papi-sdk';


export async function importmaps(client: Client, req: Request) {
 
  const service = new MyService(client);
  const installedAddons = await service.getInstalledAddons();
  let importMaps = new Object({'imports': {}});
  installedAddons.forEach( installedAddon => { 
    if (installedAddon && installedAddon.Addon) {
      importMaps['imports'][installedAddon.Addon.UUID.toString()] = installedAddon.PublicBaseURL;
    }
  });
  return importMaps;
}

// creates dictionary of addon uuId to object contains the latest version in one property and all other versions in other property
function getAddonLatestPhasedVersion(installedAddonVersions) {
  return installedAddonVersions.reduce( (addonsVersions, version) => {
    const value = version.AddonUUID; // get the addon UUID from the version object
    if (addonsVersions[value]) {
        const LatestPhasedVersion = addonsVersions[value].LatestPhasedVersion;
        if (version.Phased && (LatestPhasedVersion == null || LatestPhasedVersion.StartPhasedDateTime < version.StartPhasedDateTime)) {
                // if there is newer phased version --> add it as latest version
                addonsVersions[value].LatestPhasedVersion = version;

        } else {
            if (version.Phased) {
                addonsVersions[value] = {LatestPhasedVersion : version};
            } else if (version) {
                addonsVersions[value] = {LatestPhasedVersion : null};
        }
    }
        return addonsVersions;
    }
  }, {});
}

// Returns a list of all addons
export async function addons(client: Client, request: Request) {
    // client.addLogEntry("Info", "Started Get Addons Function");
    const service = new MyService(client);
    const allAddons = await service.getAddons();
    const installedAddons = await service.getInstalledAddons();
    const filteredInstalledAddons = installedAddons.filter( installedAddon => installedAddon.Addon !== null);
    const fullAddons: InstalledAddon[] = [];

    allAddons.forEach( addon => {
        const fullAddon: InstalledAddon = {
            Addon: addon,
            PublicBaseURL: '',
            AdditionalData: '{}',
            UUID: '',
            SystemData: {}
          };
        fullAddons.push(fullAddon);
    });

    const unionedAddons = [...filteredInstalledAddons, ...fullAddons];
    const set = new Set();
    const unionArray = unionedAddons.filter(item => {
      if (!set.has(item.Addon.UUID)) {
        set.add(item.Addon.UUID);
        return true;
      }
      return false;
    }, set);

    unionArray.sort((a, b) => (a.Addon.Name && b.Addon.Name && a.Addon.Name > b.Addon.Name) ? 1 : -1);
    return unionArray;
}
// Return a list of installed addons that needs update
export async function updates(client: Client, request: Request) {

  const service = new MyService(client);
  const installedAddons = await service.getInstalledAddons();
  const filteredInstalledAddons = installedAddons.filter( installedAddon => installedAddon.Addon !== null);

  const upgradeableAddons: Array<InstalledAddon> = await service.getInstalledAddonsPhasedVersions(filteredInstalledAddons);

  upgradeableAddons.sort((a, b) => (a.Addon.Name && b.Addon.Name && a.Addon.Name > b.Addon.Name) ? 1 : -1);

  return upgradeableAddons;
}

export async function install(client: Client) {
  // client.addLogEntry("Info", "Start Installation");
  const service = new MyService(client);
  const addon = {  Editors: [{ParentPackageName: 'Configuration',
  PackageName: 'editor',
  Description: 'Addon Manager'}],
  UUID: '',
  Version: ''};
  const result = await service.installAddon(addon);

  // addEditors.emit();

  // client.addLogEntry("Info", `Response from addons ${addons}`);
  return result;
}


export async function upgrade(client: Client) {
  // client.addLogEntry("Info", "Start Installation");
  const service = new MyService(client);
  const result = await service.upgradeAddon(client.AddonUUID);
  return result;
}

export async function uninstall(client: Client) {
  // client.addLogEntry("Info", "Start Installation");
  const service = new MyService(client);
  const result = await service.uninstallAddon(client.AddonUUID);
  return result;
}

export async function downgrade(client: Client, request: Request) {
  // client.addLogEntry("Info", "Start Installation");
  const version = request.body.Version;
  const service = new MyService(client);
  const result = await service.downgradeAddon(request.body.UUID, version);
  return result;
}

export async function install_version(client: Client, request: Request) {
  // client.addLogEntry("Info", "Start Installation");
  const version = request.body.Version;
  const service = new MyService(client);
//   const result = await service.installVersionAddon(request.body.UUID, version);
  return 'result';
}

export async function addon_versions(client: Client, request: Request) {
  const service = new MyService(client);
  const addonVersions: Array<AddonVersion> = await service.getAddonVersions(request.body.RowUUID);
  return addonVersions;
}

export async function update_all_addons(client: Client, request: Request) {
  const service = new MyService(client);
  const result = await service.updateAllAddons(request.body);  
  return result;
}




