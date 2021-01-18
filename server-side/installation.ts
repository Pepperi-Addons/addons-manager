import MyService from './my.service';
import { Client, Request } from '@pepperi-addons/debug-server';
import { InstalledAddon, Addon, AddonVersion } from '@pepperi-addons/papi-sdk';
import config from '../addon.config.json';
// add functions here



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



// this function will run on the 'api/foo' endpoint
// the real function is runnning on another typescript file

export async function foo(client: Client, request: Request) {
    const service = new MyService(client);
    const res = await service.getAddons();
    return res;
}

