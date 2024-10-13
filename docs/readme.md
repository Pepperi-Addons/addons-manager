# Addon manager

## High Level
- The Addon manager gives the possibility to track versions of addons, install new ones, upgrade or downgrade versions, view logs of the each addon, set permissions to Reps and Buyers on the addons and to set auto update time for the addons.

    ### Addons Tab:
    - Addons: addons list with Name, Description, Version and last update date.
    - Permissions: Define which settings editors can be executed according to the profile. there is no need to define the Admin profile, Admin can run all the settings editors
    - Settings: set addons auto update & freeze end date & time

---

## Releases
| Version | Description | Migration |
|-------- |------------ |---------- |
| 2.0.xx  | addon manage last phased version |  |
| 2.1.xx | KDs files added | |

---

## Deployment
After a Pull Request is merged into a release branch, avilable version will be published.

---

## Debugging
#### Client side: 
To debug your addon with developer toolbar (chrome or any other browser dev tool).
Open terminal --> change to client-side --> Start your addon with npm start.
Open your browser at: https://app.pepperi.com/settings_block/bd629d5f-a7b4-4d03-9e7c-67865a6d82a9/addons_manager?dev=true
Open the browser inspector to make sure that the editor file is served locally
#### Server side: 
To debug your addon with `Visual Studio Code`, set the RUN mode to 'Launch API Server', press `F5` or `Run->Start Debugging`.
You can then checkout your *API* at http://localhost:4401/api/foo. Be sure to supply a JWT for it to work.

#### CPI side:
There is no CPI side calls.

---

## Testing
This addon does not require any tests (so far).

---

## Dependencies
| Addon | Usage |
|-------- |------------ |
| [papi](https://apidesign.pepperi.com/papi-index/papi-functions) | A Javascript/Typescript SDK for working with the Pepperi SDK. |
| [data_views](https://apidesign.pepperi.com/meta-data/data-views) | for getting the addons data views |
| [Webapp]() | the addon get versions and set updates from the webapp platform |
---

## APIs

<!-- [Provide links to API documentation] -->
There is no hosted API on the [Pepperi API Design Center](https://apidesign.pepperi.com/) about this addon.

- [addons (Get)](https://api.pepperi.com/v1.0/addons/): return list of addons.
- [addon_versions (Get)](https://apidesign.pepperi.com/var-api/get-all-addons-versions/get-single-addon-version): Return addon version by uuid.
- updates (Get)]: return list of addons that needs an update.
- [update_alladdons (Post)](https://apidesign.pepperi.com/distributor/upgrade-all-installed-addons): Update all installed addons.
- [install (Post)](https://apidesign.pepperi.com/add-ons/addons-installation/install-add-on-to-distributor): Install addon by addon UUID.
- [install_version (Post)](https://apidesign.pepperi.com/add-ons/addons-installation/install-add-on-to-distributor): Install  specific add-on version by addon UUID.
- [uninstall (Post)](https://apidesign.pepperi.com/add-ons/addons-installation/uninstall-addon-from-distributor): Uninstall addon by addon UUID.
- [upgrade (Post)](https://apidesign.pepperi.com/add-ons/addons-installation/upgrade-installed-add-on): Upgrade addon by addon UUID and a version.
- [downgrade (Post)](https://apidesign.pepperi.com/add-ons/addons-installation/downgrade-installed-add-on): Downgrade addon by addon UUID and a version.

[Postman Collection](./addon.postman_collection.json)

---

## Limitations
There is no limits to this addon.

---

## Architecture
see: [Architecture](./architecture.md)

---

## Known issues

- Need to add this addon to the pepperi API design data (https://apidesign.pepperi.com/)
- When using the '?support_user=true' in the url , we present hard coded menu with change addon version & audit log insted of adding those options to the regular menu.

---

## Future Ideas & Plans

- [provide any knowledge regarding meaningful future plans for the addons (features, refactors etc.)]

## Usage
- Install the addon & all his dependencies.
- Navigate to Settings --> Configuration --> Addon manager.
- To see the audit log or to Uninstall an addon: Select an addon and choose from the menu.
- to change addon version (upgrade/downgrade) add the ?support_user=true to the url.
- To set permission move to Permissions tab.
- To set auto addon Update: move to settings Tab.

