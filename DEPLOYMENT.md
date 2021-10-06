# Deployment

> For this section, it is assumed you are using macOS 11.0.0 or later.

Deployment is not quite as simple as development. It involves code signing, notarisation, and packaging. Luckily, it is
fairly easy to repeat distributions after the first-time setup:

1. Join the [Apple Developer Program][apple-developer-program] (this will cost about AUD$150 a year).
2. Use Keychain Access to create a [Certificate Signing Request][csr-apple].
3. Use the CSR to create a [Developer ID Application certificate][certificate-create-apple].
4. Download that certificate and add it to your keychain.
5. Create a `.env` file from `.env.example` if you haven't already done this.
6. Log into your [Apple ID][apple-id] and create a new app-specific password.
7. Add your Apple ID and app-specific password to the `.env` file.
8. Create a `electron-builder.yml` file from `electron-builder.yml.example`.
9. Add your certificate identity from step 3 and 4.

Feel free to make any of the other changes you may want to add, including adding [an identifier][apple-app-identifier].

You should make sure your [Spotify App][spotify-developers] is up-to-date right before distribution.

Also, if you make any changes to the logo, run:

```
iconutil -c icns build/icon.iconset
```

After doing all of this, to distribute a binary release, run:

```
yarn dist
```

This can take a while. When it's done, it will create a `.dmg` file in `dist/` (possibly a new directory).

[apple-developer-program]:  https://developer.apple.com/programs/
[csr-apple]:                https://help.apple.com/developer-account/#/devbfa00fef7
[certificate-create-apple]: https://help.apple.com/developer-account/#/dev04fd06d56
[spotify-developers]:       https://developer.spotify.com/
[apple-id]:                 https://appleid.apple.com/account/manage
[apple-app-identifier]:     https://developer.apple.com/account/resources/identifiers/list
