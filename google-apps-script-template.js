const SHEET_NAME = "Guest Data";
const SPREADSHEET_ID = "1oYcZWq91cMJl6azoBMYgVgtHTO1M_28NGOrN_kGj7R8";

function doGet(e) {
  const guestId = String(e.parameter.guest || "").trim();
  const action = String(e.parameter.action || "").trim();
  const selectedPasses = Number(e.parameter.passes || 0);
  const callback = String(e.parameter.callback || "").trim();

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
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
      cbNvStatusConfirmacion: "Confirmado",
      noPartidaA: guestId
    }, callback);
  }

  const rowNumber = rowIndex + 2;
  const row = values[rowIndex];
  const record = Object.fromEntries(headers.map((header, index) => [header, row[index]]));

  if (action === "confirm") {
    setCell(sheet, headers, rowNumber, "rsvp_status", "Confirmado");
    if (selectedPasses > 0) setCell(sheet, headers, rowNumber, "confirmed_passes", selectedPasses);
  }

  if (action === "decline") {
    setCell(sheet, headers, rowNumber, "rsvp_status", "Declinado");
  }

  return jsonOutput({
    nvInvitadoNombre: record.family_name || "Guest",
    inInvitadoPases: Number(record.passes || 0),
    nvInvitadoMesa: record.table || "",
    txInvitadoMensajeEspecial: record.message || "",
    cbNvStatusConfirmacion: record.rsvp_status || "Confirmado",
    noPartidaA: guestId
  }, callback);
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
