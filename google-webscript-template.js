const SHEET_NAME = "Guest Data";
const PHYSICAL_RSVP_SHEET_NAME = "Physical RSVP";
const SPREADSHEET_ID = "1oYcZWq91cMJl6azoBMYgVgtHTO1M_28NGOrN_kGj7R8";

function doGet(e) {
  const action = String(e.parameter.action || "").trim();
  const callback = String(e.parameter.callback || "").trim();
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

  if (action === "physicalRsvp") {
    return savePhysicalRsvp(e, spreadsheet, callback);
  }

  const guestId = String(e.parameter.guest || "").trim();
  const selectedPasses = Number(e.parameter.passes || 0);
  const guestsAttending = Number(e.parameter.guestsAttending || e.parameter.guests_attending || selectedPasses || 0);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return jsonOutput({ error: 'Sheet tab "' + SHEET_NAME + '" was not found' }, callback);
  }

  const values = sheet.getDataRange().getValues();
  const headers = values.shift().map((header) => String(header).trim());
  const guestIdIndex = headers.indexOf("guest_id");

  if (!guestId || guestIdIndex === -1) {
    return jsonOutput({ error: "Missing guest_id" }, callback);
  }

  const rowIndex = values.findIndex((row) => String(row[guestIdIndex]).trim() === guestId);
  if (rowIndex === -1) {
    return jsonOutput({
      nvInvitadoNombre: "Guest",
      inInvitadoPases: 0,
      nvInvitadoMesa: "",
      txInvitadoMensajeEspecial: "Please contact the host for your invitation details.",
      cbNvStatusConfirmacion: "Pending",
      noPartidaA: guestId
    }, callback);
  }

  const rowNumber = rowIndex + 2;
  const row = values[rowIndex];
  const record = Object.fromEntries(headers.map((header, index) => [header, row[index]]));

  if (action === "confirm") {
    const safeGuestsAttending = guestsAttending > 0
      ? Math.min(guestsAttending, Number(record.passes || 1))
      : 1;

    setCell(sheet, headers, rowNumber, "rsvp_status", "Attending");
    setCell(sheet, headers, rowNumber, "guests_attending", safeGuestsAttending);
    setCell(sheet, headers, rowNumber, "confirmed_passes", safeGuestsAttending);

    record.rsvp_status = "Attending";
    record.guests_attending = safeGuestsAttending;
    record.confirmed_passes = safeGuestsAttending;
  }

  if (action === "decline") {
    setCell(sheet, headers, rowNumber, "rsvp_status", "Not Attending");
    setCell(sheet, headers, rowNumber, "guests_attending", 0);
    setCell(sheet, headers, rowNumber, "confirmed_passes", 0);

    record.rsvp_status = "Not Attending";
    record.guests_attending = 0;
    record.confirmed_passes = 0;
  }

  return jsonOutput({
    nvInvitadoNombre: record.family_name || "Guest",
    inInvitadoPases: Number(record.passes || 0),
    nvInvitadoMesa: record.table || "",
    txInvitadoMensajeEspecial: record.message || "",
    cbNvStatusConfirmacion: normalizeStatus(record.rsvp_status),
    guestsAttending: Number(record.guests_attending || 0),
    noPartidaA: guestId
  }, callback);
}

function savePhysicalRsvp(e, spreadsheet, callback) {
  const firstName = String(e.parameter.first_name || "").trim();
  const lastName = String(e.parameter.last_name || "").trim();
  const rsvpStatus = normalizeStatus(e.parameter.rsvp_status);

  if (!firstName || !lastName) {
    return jsonOutput({ error: "Missing first_name or last_name" }, callback);
  }

  if (rsvpStatus === "Pending") {
    return jsonOutput({ error: "Invalid rsvp_status" }, callback);
  }

  const sheet = spreadsheet.getSheetByName(PHYSICAL_RSVP_SHEET_NAME);
  if (!sheet) {
    return jsonOutput({ error: 'Sheet tab "' + PHYSICAL_RSVP_SHEET_NAME + '" was not found' }, callback);
  }

  const headers = ensureHeaders(sheet, ["first_name", "last_name", "rsvp_status"]);
  const nextRow = findFirstEmptyPhysicalRsvpRow(sheet, headers);

  setCell(sheet, headers, nextRow, "first_name", firstName);
  setCell(sheet, headers, nextRow, "last_name", lastName);
  setCell(sheet, headers, nextRow, "rsvp_status", rsvpStatus);

  return jsonOutput({
    ok: true,
    first_name: firstName,
    last_name: lastName,
    rsvp_status: rsvpStatus
  }, callback);
}

function ensureHeaders(sheet, requiredHeaders) {
  const lastColumn = Math.max(sheet.getLastColumn(), requiredHeaders.length);
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map((header) => String(header).trim());

  requiredHeaders.forEach((header) => {
    if (headers.indexOf(header) === -1) {
      headers.push(header);
      sheet.getRange(1, headers.length).setValue(header);
    }
  });

  return headers;
}

function findFirstEmptyPhysicalRsvpRow(sheet, headers) {
  const firstNameIndex = headers.indexOf("first_name");
  const lastNameIndex = headers.indexOf("last_name");
  const maxRows = sheet.getMaxRows();

  if (firstNameIndex === -1 || lastNameIndex === -1 || maxRows < 2) {
    return appendPhysicalRsvpRow(sheet);
  }

  const firstNameValues = sheet.getRange(2, firstNameIndex + 1, maxRows - 1, 1).getValues();
  const lastNameValues = sheet.getRange(2, lastNameIndex + 1, maxRows - 1, 1).getValues();

  for (let index = 0; index < firstNameValues.length; index += 1) {
    const firstName = String(firstNameValues[index][0] || "").trim();
    const lastName = String(lastNameValues[index][0] || "").trim();

    if (!firstName && !lastName) {
      return index + 2;
    }
  }

  return appendPhysicalRsvpRow(sheet);
}

function appendPhysicalRsvpRow(sheet) {
  const maxRows = sheet.getMaxRows();
  sheet.insertRowsAfter(maxRows, 1);
  return maxRows + 1;
}

function normalizeStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  if (value === "confirmado" || value === "confirmed" || value === "attending") return "Attending";
  if (value === "declinado" || value === "declined" || value === "not attending") return "Not Attending";
  return "Pending";
}

function setCell(sheet, headers, rowNumber, columnName, value) {
  const index = headers.indexOf(columnName);
  if (index !== -1) sheet.getRange(rowNumber, index + 1).setValue(value);
}

function jsonOutput(data, callback) {
  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + JSON.stringify(data) + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
