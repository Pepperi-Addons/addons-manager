import { PapiClient, InstalledAddon, Addon, AddonVersion } from '@pepperi-addons/papi-sdk';
import { Client } from '@pepperi-addons/debug-server';

class MyService {

    papiClient: PapiClient;

    constructor(private client: Client) {
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken
        });
    }

    installAddon(addon) {

        const systemData = {
          Version: 'v1.0',
          Editors: [
            {
              ParentPackageName: 'Configuration',
              PackageName: 'editor',
              Description: 'Addon Manager',
            }
          ]
        };
        // Update installed add-on
        const addonEditor: InstalledAddon = {
          UUID: '',
          SystemData: {},
          AdditionalData: JSON.stringify(systemData),
          Addon : { UUID: 'a8f4698f-eb75-4a75-bdf6-1524eb9f6baf', SystemData: {}}
        };
        return this.papiClient.addons.installedAddons.addonUUID(addon.Addon.UUID).install();
    }

    uninstallAddon(addonUUID) {
      return this.papiClient.addons.installedAddons.addonUUID(addonUUID).uninstall();
    }

    upgradeAddon(addonUUID) {
      return this.papiClient.addons.installedAddons.addonUUID(addonUUID).upgrade();
    }

    downgradeAddon(addonUUID, version) {
      return this.papiClient.addons.installedAddons.addonUUID(addonUUID).downgrade(version);
    }

    installVersionAddon(addonUUID, version) {
      return this.papiClient.addons.installedAddons.addonUUID(addonUUID).install(version);
    }

    getAddons(): Promise<Addon[]> {
        // return this.papiClient.addons.find({});
        return this.papiClient.addons.iter({where: 'Type<>4'}).toArray();

    }

    getInstalledAddons(): Promise<any[]> {
        // return this.papiClient.addons.installedAddons.find({})
        return this.papiClient.addons.installedAddons.iter({}).toArray();
    }

    getAddonsVersions(): Promise<AddonVersion[]> {
        return this.papiClient.addons.versions.iter({where: `Available=1 AND Phased=1`}).toArray();
    }

    getAddonVersions(addonUUID): Promise<AddonVersion[]> {
      return this.papiClient.addons.versions.iter(
          {where: `Available=1 AND AddonUUID='${addonUUID}'`}).toArray();
    }

    getAddonVersion(version): Promise<AddonVersion> {
          return this.papiClient.addons.versions.iter({where: `Version='${version}' and Available='true'`}).toArray()[0];
    }

    initDate(dateTimeStr) {
        const nineteenSeventy = new Date(1970, 0, 0);
        return new Date(dateTimeStr || nineteenSeventy).getTime();
    }

    async getInstalledAddonsPhasedVersions(installedAddons: Array<any>): Promise<any[]> {
      // const nineteenSeventy = new Date(1970, 0, 0);
      for (const installedAddon of installedAddons) {
            const versionID = installedAddon.Version;
            const addonVersions = await this.getAddonVersions(installedAddon);
            // tslint:disable-next-line:no-debugger
            if (addonVersions && addonVersions.length > 0 ) {
                installedAddon.HasVersions = true;

                const latestPhasedDate  = (new Date(Math.max.apply(null, addonVersions.map(e => this.initDate(e.StartPhasedDateTime)))));

                const latestPhased = addonVersions.filter(e => {
                    return this.initDate(e.StartPhasedDateTime) === latestPhasedDate.getTime();
                })[0];

                const currentVersion = addonVersions.filter(addonVersion => addonVersion.Version === versionID)[0];

                if ( latestPhased && currentVersion) {
                    installedAddon.LatestPhased =
                      currentVersion.Version === latestPhased.Version ||
                        !(this.initDate(currentVersion.CreationDateTime) < this.initDate(latestPhased.StartPhasedDateTime) &&
                         (this.initDate(latestPhased.StartPhasedDateTime) <= Date.now() || latestPhased.StartPhasedDateTime === null));
                } else {
                    installedAddon.LatestPhased = true;
                }
            }
        }
      return installedAddons;
    }
}

export default MyService;
