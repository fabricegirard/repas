const SPREADSHEET_ID = "1-fpFRXBo3tTdz4hV4Th9SvY09aiIpMgb5H3LSXll1So";
const SHEET_GID = 0;

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
  try {
    const params = event && event.parameter ? event.parameter : {};
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
      return reply_({ ok: true, healthcheck: true });
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
    return reply_({ ok: true });
  } catch (error) {
    return reply_({ ok: false, error: error.message || "Erreur lors de l'enregistrement." });
  }
}

function safeCell_(value) {
  return /^[=+@\-]/.test(value) ? "'" + value : value;
}

function reply_(payload) {
  const serialized = JSON.stringify({ source: "repas-sheet", ...payload }).replace(/</g, "\\u003c");
  return HtmlService.createHtmlOutput(
    "<!doctype html><meta charset=\"utf-8\"><script>(function(){const message=" + serialized + ";let frame=window;for(let i=0;i<8;i++){if(frame===frame.parent)break;frame=frame.parent;frame.postMessage(message,'*');}})();</script>"
  );
}
