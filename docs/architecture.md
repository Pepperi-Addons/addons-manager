# Addon Manager Architecture

## Overview

- This addon is using the [papi-sdk](https://apidesign.pepperi.com/papi-index/papi-functions) functions for get, upsert, update, downgrade... addons. the addon also show logs about each addon from the audit-data-log addon. 
- Most of the logic is being implemented on the client side.

---

## Infrastructure

| Addon  | Usage  |
| ---------------------------|------------------------ |
| [audit-data-log](https://apidesign.pepperi.com/abi-addon-block-interface/addon-block-api/audit-data-log) | or "Audit Log" is the addon that show history log about addons |

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
| SettingsBlock |  Displays the "Addon Manager" tab in the Settings page of the Pepperi web-app.


---

## Topics
- High Level:
    The Addon manager gives the possibility to track versions of addons, install new ones, upgrade or downgrade versions, view logs of the each addon, set permissions to Reps and Buyers on the addons and to set auto update time for the addons. 
_____________________________________________________________
### CPI endpoints:

- There is no CPI side code.

#### Diagram

[Provide any diagrams relevant to topic1]
