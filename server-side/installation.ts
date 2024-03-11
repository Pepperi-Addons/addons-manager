import MyService from './my.service';
import { Client, Request } from '@pepperi-addons/debug-server';

export async function install(client: Client, request: Request) {
    try {
        const service = new MyService(client);
        await service.createRelations();

        // const addon = {  
        //     Editors: [
        //         {
        //             ParentPackageName: 'Configuration',
        //             PackageName: 'editor',
        //             Description: 'Addon Manager'
        //         }
        //     ],
        //     UUID: '',
        //     Version: ''
        // };
        // const result = await service.installAddon(addon);
    } catch (err) {
        throw new Error(`Failed to create ADAL Tables. error - ${err}`);
    }

    // return result;
    return { success: true, resultObject: {} };
}

export async function uninstall(client: Client, request: Request) {
    return {success: true, resultObject: {}};
}

export async function upgrade(client: Client, request: Request) {
    return {success: true, resultObject: {}};
}

export async function downgrade(client: Client, request: Request) {
    return {success: true, resultObject: {}};
}
