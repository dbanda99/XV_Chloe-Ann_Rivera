# Guest Spreadsheet Setup

Use one row per invitation/household. The `guest_id` value is the URL value.

Example:

| guest_id | family_name | passes | phone | table | rsvp_status |
| --- | --- | --- | --- | --- | --- |
| 1 | Family Gomez | 2 | 2222222222 | 2 | Pendiente |
| 2 | Family Lopez | 4 | 9999999999 | 1 | Pendiente |

Invitation links:

```txt
index.html?guest=1
index.html?guest=2
```

Direct RSVP links:

```txt
rsvp.html?guest=1
rsvp.html?guest=2
```

The invitation page generates an RSVP QR/button from the current `guest` value. For example:

```txt
?guest=2 -> rsvp.html?guest=2
```

The RSVP page writes to `rsvp_status`:

```txt
Attending -> Confirmado
Not Attending -> Declinado
```

Required sheet tab name:

```txt
Guest Data
```

Required headers:

```txt
guest_id, family_name, passes, phone, table, rsvp_status
```

After changing `google-apps-script-template.js`, update Google Apps Script:

1. Copy your spreadsheet ID from the Google Sheet URL.
2. In `google-apps-script-template.js`, confirm `SPREADSHEET_ID` matches that ID.
3. Paste the full file into Apps Script.
4. Click `Deploy > Manage deployments`.
5. Click the pencil/edit icon.
6. Select `New version`.
7. Deploy.
8. Make sure access is set to `Anyone`.

Direct API test:

```txt
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?guest=1&callback=testCb
```

Expected result:

```js
testCb({"nvInvitadoNombre":"Family Gomez","inInvitadoPases":2,...});
```
