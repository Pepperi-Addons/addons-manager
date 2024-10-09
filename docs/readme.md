# Rich text

## High Level
- The Rich text addon enables users to input different types of content such as text with different styles, images, videos, and so on.
- The Rich text addon has an editor with a simple interface.
- Rich text often have text, styles, images and more. 
- Rich text can run onLoad [flows](https://github.com/Pepperi-Addons/user-defined-flows). the flow can run configured script/navigate & more.
- The component is an extension of the [quill editor](https://www.npmjs.com/package/ngx-quill).

### Richtext editor
- A Rich text editor allows you to easily view or edit your rich text preview.
- The Rich text editor allows you to:
    - add content via HTML, text or from an HTML file.
    - Set height, width, number of columns & padding.
    - Configure onLoad/onChange [flow](https://github.com/Pepperi-Addons/user-defined-flows)

---

## Releases
| Version | Description | Migration |
|-------- |------------ |---------- |
| 1.3  | Padding component support added |  |

---

## Deployment
After a Pull Request is merged into a release branch, avilable version will be published.

---

## Debugging
#### Client side: 
To debug your addon with developer toolbar (chrome or any other browser dev tool).
Open terminal --> change to client-side --> Start your addon with npm start.
Open your browser at: https://app.pepperi.com/settings_block/16d2052b-55b7-43b5-9d3b-a2f9d9950d59/pages/[page UUID]?devBlocks=[["BlockComponent","http://localhost:4401/file_3864cd44-b388-41c5-8af9-ec200f72b3f3.js"]]

Open the browser inspector to make sure that the editor file is served locally
#### Server side: 
To debug your addon with `Visual Studio Code`, set the RUN mode to 'Launch API Server', press `F5` or `Run->Start Debugging`.
You can then checkout your *API* at http://localhost:4401/api/foo. Be sure to supply a JWT for it to work.

#### CPI side:
To debug the CPI side with `Visual Studio Code`, open the PEPPERI application (simulator), login to the user that you want to debug, add 'debugger' at the cpi code,  set the RUN mode to 'Launch CPINode debugger Server', press `F5` or `Run->Start Debugging`. 

---

## Testing

This addon does not require any tests (so far).

---

## Dependencies

| Addon | Usage |
|-------- |------------ |
| [pages](https://github.com/Pepperi-Addons/page-builder) | Pages addon is needed for show the addon on a page on run time or for editing in the editing mode |
| [cpi_node](https://https://github.com/Pepperi-Addons/cpi-node) | cpi node is needed to deal with the cpi side code |
| [pepperi_pack](https://https://github.com/Pepperi-Addons/pepperi-pack) | |
---

## APIs

There is no APIs call for this block

[Postman Collection](./addon.postman_collection.json)

---

## Limitations
There is no limits to this addon.

---

## Architecture
see: [Architecture](./architecture.md)

---

## Known issues

- [provide any information regarding known issues (bugs, qwerks etc.) in the addon] 

---

## Future Ideas & Plans

- [provide any knowledge regarding meaningful future plans for the addons (features, refactors etc.)]

## Usage
- Install the addon & all his dependencies.
- Navigate to Settings --> Pages --> Page builder and choose your page.
- Configures a block typed "Rich text" (drag it to the page) on the page editor.
- Edit, Save/Publish the page.
- Configure a slug for it -> sync.
- Navigates to the slug that has finished to configure.

## Block
- The block (Rich text) gets the UI from the object who configured with the editor on the edit mode.
## Editor
#### Managing the rich text view:
The editor give the ability to create a Rich text content by:
-  Organizing your view as you want. With many UI options such as:
    - Add content via HTML (text), text or from an HTML file.
    - Set height, width, number of columns & padding.
    - Configure onLoad/onChange [flow](https://github.com/Pepperi-Addons/user-defined-flows).

