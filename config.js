const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const TOKEN_PATH = "token.json";

const languages = {
  en: 0,
  fa: 4,
  ar: 5,
  de: 6,
  ru: 7,
  tr: 8,
};

const platforms = {
  web: 1,
  android: 2,
  ios: 3,
};

module.exports = {
  SCOPES,
  TOKEN_PATH,
  languages,
  platforms,
};
