const SPREADSHEET_ID = "1-fpFRXBo3tTdz4hV4Th9SvY09aiIpMgb5H3LSXll1So";
const SHEET_GID = 0;
const APP_RETURN_URL = "https://fabricegirard.github.io/repas/";

function doGet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const activeEmail = String(Session.getActiveUser().getEmail() || "").toLowerCase();
  const editorEmails = spreadsheet.getEditors().map(user => user.getEmail().toLowerCase());
  const ownerEmail = spreadsheet.getOwner().getEmail().toLowerCase();
  const authorized = activeEmail && (activeEmail === ownerEmail || editorEmails.includes(activeEmail));
  const message = authorized
    ? "Connexion autorisée. Vous pouvez fermer cet onglet et ajouter un repas dans le carnet."
    : "Ce compte Google n’est pas autorisé à modifier la feuille. Connectez-vous avec l’un des quatre comptes autorisés.";
  return HtmlService.createHtmlOutput("<!doctype html><meta charset=\"utf-8\"><title>Carnet de repas</title><p>" + message + "</p>");
}

function doPost(event) {
  let returnUrl = APP_RETURN_URL;
  let requestId = "";
  try {
    const params = event && event.parameter ? event.parameter : {};
    requestId = String(params.requestId || "").slice(0, 80);
    returnUrl = safeReturnUrl_(params.returnUrl);
    // La web app doit être déployée pour s'exécuter comme l'utilisateur connecté.
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const activeEmail = String(Session.getActiveUser().getEmail() || "").toLowerCase();
    const editorEmails = spreadsheet.getEditors().map(user => user.getEmail().toLowerCase());
    const ownerEmail = spreadsheet.getOwner().getEmail().toLowerCase();
    if (!activeEmail || (activeEmail !== ownerEmail && !editorEmails.includes(activeEmail))) {
      throw new Error("Seuls les éditeurs autorisés de la feuille peuvent ajouter un repas.");
    }
    const sheet = spreadsheet.getSheets().find(item => item.getSheetId() === SHEET_GID);
    if (!sheet) throw new Error("Onglet de repas introuvable.");

    const headers = sheet.getRange(1, 1, 1, 3).getDisplayValues()[0]
      .map(value => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase());
    if (headers[0] !== "nom" || headers[1] !== "emoji" || headers[2] !== "ingredients") {
      throw new Error("Les colonnes doivent être Nom, Emoji, Ingrédients.");
    }

    // Exerce le même accès en écriture que l'ajout, puis retire aussitôt la ligne de test.
    if (params.action === "healthcheck") {
      const lock = LockService.getScriptLock();
      lock.waitLock(10000);
      let testRow = 0;
      try {
        sheet.appendRow(["__TEST_CONNEXION_REPAS__", "🧪", "Ligne temporaire de diagnostic"]);
        testRow = sheet.getLastRow();
        sheet.deleteRow(testRow);
      } finally {
        if (testRow && sheet.getLastRow() >= testRow && sheet.getRange(testRow, 1).getValue() === "__TEST_CONNEXION_REPAS__") {
          sheet.deleteRow(testRow);
        }
        lock.releaseLock();
      }
      return reply_({ ok: true, healthcheck: true }, returnUrl, requestId);
    }

    const name = String(params.name || "").trim();
    const emoji = String(params.emoji || "").trim();
    const ingredients = String(params.ingredients || "").trim();
    if (!name || name.length > 100) throw new Error("Le nom doit contenir entre 1 et 100 caractères.");
    if (!emoji || emoji.length > 8) throw new Error("Renseigne un emoji valide.");
    if (!ingredients || ingredients.length > 500) throw new Error("Renseigne les ingrédients (500 caractères maximum).");

    const ingredientList = ingredients.split(/[;,]/).map(value => value.trim()).filter(Boolean);
    if (!ingredientList.length) throw new Error("Ajoute au moins un ingrédient.");
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow([safeCell_(name), safeCell_(emoji), safeCell_(ingredientList.join(", "))]);
    } finally {
      lock.releaseLock();
    }
    return reply_({ ok: true }, returnUrl, requestId);
  } catch (error) {
    return reply_({ ok: false, error: error.message || "Erreur lors de l'enregistrement." }, returnUrl, requestId);
  }
}

function safeCell_(value) {
  return /^[=+@\-]/.test(value) ? "'" + value : value;
}

function safeReturnUrl_(candidate) {
  const value = String(candidate || APP_RETURN_URL);
  if (!/^https:\/\/fabricegirard\.github\.io\/repas\/?$/.test(value)) {
    throw new Error("Adresse de retour du carnet invalide.");
  }
  return APP_RETURN_URL;
}

function reply_(payload, returnUrl, requestId) {
  const message = { source: "repas-sheet", requestId, ...payload };
  const target = returnUrl + "#sheet-result=" + encodeURIComponent(JSON.stringify(message));
  const serialized = JSON.stringify(target).replace(/</g, "\\u003c");
  return HtmlService.createHtmlOutput(
    "<!doctype html><meta charset=\"utf-8\"><script>window.location.replace(" + serialized + ");</script>"
  );
}
