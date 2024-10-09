# Rich text Architecture

## Overview

- This addon is using the [Page block](https://github.com/Pepperi-Addons/page-builder)  infrastructure for its runtime and usage
- Most of the logic is being implemented on the client side
- Pages editor is needed in order to set the block configuration and behavior.
- The Rich text addon is using the pep-rich-text componnet from the ngx-composite-lib.
- The component is an extension of the [quill editor](https://www.npmjs.com/package/ngx-quill).

---

## Infrastructure

| Addon  | Usage  |
| ---------------------------|------------------------ |
| [Pages](https://github.com/Pepperi-Addons/page-builder) | or "Page Builder" is the addon that configures web pages to be presented both on the mobile devices and on the webapp (run time & edit mode) |

---

## Data Model

[Provide any data models used by the addon (eg. ADAL tables etc.)]

---

## PNS Usage

[Provide any PNS subscriptions or publishes done by the addon]

---

## Relations
| Relation Name | Description |
|---------------|--------------|
| PageBlock | Used to Edit & Run the Rich text block. 

---

## Topics
- High Level:
    The Rich text has an editor with a simple interface. the editor give the ability to add text (via Text, HTML or from uploaded file) and set style. 
___________________________________________________________
### Screen sizes support:
- The editor gives the ability to build a page with 3 different configuration objects. to support 3 screen sizes:
    - Desktop
    - Tablet
    - Mobile

- Some of the fields in the editor have a 'Screen sizes support' sign, it means that those fields can get different configure for each screen size.
_____________________________________________________________
### Flow:
- High Level:
[Flow](https://github.com/Pepperi-Addons/user-defined-flows) can runs configured script, navigate to other pages & more. we can configure onLoad flow with the Rich text editor.
_____________________________________________________________
### CPI endpoints:

- CPI has endpoints that configured on the block Schema in installation.js file. each endpoint can 
    - Run [flow](https://github.com/Pepperi-Addons/user-defined-flows)
    - Check the "Show if" condition 
    - Set the [Translation](https://apidesign.pepperi.com/cpi-node-sdk/functions/translation) if configured : 

    ### Endpoints:
    - BlockLoadEndpoint - runs before every block load. The endpoint can return a modified state, configuration and parameters to do run-time manipulation. Consider that this function can be trigger more then once
    - BlockStateChangeEndpoint: runs when the state change event is fired. 

read more... [Page Block](https://apidesign.pepperi.com/addon-relations/addons-link-table/relation-names/page-block)
#### Diagram

[Provide any diagrams relevant to topic1]
