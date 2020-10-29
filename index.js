console.log("Awesome script started for generating ©Localization dictionary");

const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const { SCOPES, TOKEN_PATH, languages, platforms } = require("./config");

fs.readFile("credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  authorize(JSON.parse(content), getSheet);
});

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          "Error while trying to retrieve access token",
          err
        );
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function makePlatformDirectory(platform) {
  if (!fs.existsSync(platform)) {
    fs.mkdirSync(platform);
  }
}

function getSheet(auth) {
  const sheets = google.sheets({ version: "v4", auth });
  sheets.spreadsheets.values.get(
    {
      spreadsheetId: "1tI9rshNuLZZ1VD7-NW-1VQCQ8Ow1_hpII_V70k127i4",
      range: "A2:An",
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      const platform = process.argv.pop();
      const rows = res.data.values;

      if (rows.length) {
        if (platform === "web") {
          return generateWebFile(rows);
        } else if (platform === "android") {
          return generateAndroidFile(rows);
        } else if (platform === "ios") {
          return generateIosFile(rows);
        } else {
          return console.log(
            "You must specify the platform (web, android, ios). example: npm start -- web"
          );
        }
      } else {
        return console.log("No data found.");
      }
    }
  );
}

async function generateWebFile(rows) {
  await makePlatformDirectory("web");

  const generateLanguage = (detector, index) => {
    const file = `web/${detector}.json`;

    let json = {};
    rows.map((row) => {
      let keys = ["json", ...row[platforms.web].split("__")];
      let str = "json";
      for (let i = 1; i < keys.length; i++) {
        str += "." + keys[i];
        eval(`if (!${str}) { ${str} = {} }`);
      }
      keys = keys.join(".");
      try {
        eval(`${keys} = "${row[index]}"`);
      } catch (e) {
        console.log(
          row[index],
          "\n",
          detector,
          "\n",
          keys,
          "error when reading string in sheet"
        );
      }
    });

    fs.writeFile(file, `${JSON.stringify(json)}`, (err) => {
      if (err) return console.error(err);
      console.log(`Web files generated to ${file}`);
    });
  };

  await Object.keys(languages).forEach((value) =>
    generateLanguage(value, languages[value])
  );
}

async function generateAndroidFile(rows) {
  await makePlatformDirectory("android");

  const generateLanguage = async (detector, index) => {
    const file = `android/strings-${detector}.xml`;

    if (!fs.existsSync("android")) {
      fs.mkdirSync("android");
    }
    const initialString = '<?xml version="1.0" encoding="utf-8"?><resources>';

    await fs.writeFile(file, initialString, (err) => {
      if (err) return console.error(err);
    });

    await rows.map((row) => {
      const string = `<string name="${row[platforms.android]}">${
        row[index]
      }</string>`;
      fs.appendFile(file, string, (err) => {
        if (err) return console.error(err);
      });
    });

    await fs.appendFile(file, "</resources>", (err) => {
      if (err) return console.error(err);
      console.log(`Android files generated to ${file}`);
    });
  };

  await Object.keys(languages).forEach((value) =>
    generateLanguage(value, languages[value])
  );
}

async function generateIosFile(rows) {
  await makePlatformDirectory("ios");

  const generateLanguage = async (detector, index) => {
    if (!fs.existsSync("ios")) {
      fs.mkdirSync("ios");
    }

    const file = `ios/${detector}.lproj/Localizable.strings`;

    await rows.map((row) => {
      if (!fs.existsSync(`ios/${detector}.lproj`)) {
        fs.mkdirSync(`ios/${detector}.lproj`);
      }
      const string = `"${row[platforms.ios]}" = "${row[index]}";\n`;
      fs.appendFile(file, string, (err) => {
        if (err) return console.error(err);
      });
    });
    await console.log(`iOS files generated to ${file}`);
  };

  Object.keys(languages).forEach((value) =>
    generateLanguage(value, languages[value])
  );
}
