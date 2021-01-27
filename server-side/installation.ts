import MyService from './my.service';
import { Client, Request } from '@pepperi-addons/debug-server';
import { Addon, AddonVersion } from '@pepperi-addons/papi-sdk';
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


