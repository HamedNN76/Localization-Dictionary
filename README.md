# Localization-Dictionary

A simple script to transfer translations in to json (web), xml (android) and lproj (ios).

## Description

In every multi-language website or mobile application, there is a pain for translate different languages and copy them into source code.

With this package you can easily manage your cross platform application's dictionary, for developers to fill a sheet and for translators to translate filled strings.

## Installing

Easily installing from npm:

```
npm i --save-dev localization-dictionary
```

## Using the package

1. Open [Localization-dictionary.xlsx](Localization-dictionary.xlsx) on google sheets, and you have to fill the sheets with you keys and values.
2. Enable your google sheets api. https://developers.google.com/sheets/api/quickstart/nodejs ( In resulting dialog click DOWNLOAD CLIENT CONFIGURATION and save the file credentials.json to this project's root directory.)
3. Specify you language detectors and column index in the [config.js](config.js) file, for example:
```
const languages = {
   en: 0, // default language
   fa: 4,
   ar: 5,
   de: 6,
   ru: 7,
   tr: 8,
 };
```

Also you can specify your platform column index, in [config.js](config.js) file:

```
const platforms = {
  web: 1,
  android: 2,
  ios: 3,
};
```
At last you can run scripts to output dictionary files.
```
npm run web 
npm run android 
npm run ios
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
