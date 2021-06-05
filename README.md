# Now Playing for Spotify

Now Playing is a tool for macOS and Spotify used to extend functionality of Spotify Desktop. It:

- Creates a tray mini-player interface.
- Allows you to add tracks to your library and playlists from the interface.
- (Optionally) displays a notification in Notification Center.
  - Tested to be working on macOS 11.3.1 (Big Sur)!

![](spotify-now-playing.gif)

## Installing

Download the `.dmg` file from the [latest release][latest-release], run it, and move the app to your 
system's `Application` folder!

This application is not yet available in Homebrew Cask because it does not have the required popularity: 75 stars.

## Contributing

### Local Development

This is a typical Electron app and is relatively easy to run locally!

After cloning this repository, you must install the dependencies:

```
yarn install
```

Since this app uses the Spotify API, you [must create and register an app][spotify-app-registration] in the Spotify 
Developer portal.

Once you have done this, rename `.env.json.example` (file in the root of this project) to `.env.json`.

Finally, start the app:

```
yarn start
```

### Deployment

> For this section, it is assumed you are using macOS 11.0.0 or later.

Deployment is not quite as simple as development. It involves code signing, notarisation, and packaging. Luckily, it is
fairly easy to repeat distributions after the first-time setup:

1. Join the [Apple Developer Program][apple-developer-program] (this will cost about AUD$150 a year).
2. Use Keychain Access to create a [Certificate Signing Request][csr-apple].
3. Use the CSR to create a [Developer ID Application certificate][certificate-create-apple].
  a. This is for applications that are not packaged to the Mac App Store.
4. Download that certificate and add it to your keychain.
5. Create a `.env` file from `.env.example`.
  a. You may have already done this.
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

## Notice

Now Playing is not affiliated with Apple or Spotify. These business names, graphics, style guide, and other 
references are the trademarks of their respective copyright holders.

The graphic design of this app was designed by Cindy Xu of Inkling Interactive.

This project was first forked and then copied from @davicorreiajr's [original repo][old-version-repo].

This project uses the [MIT License](LICENSE).

[latest-release]:           https://github.com/teaminkling/mac-spotify-np/releases/latest
[spotify-app-registration]: https://developer.spotify.com/documentation/general/guides/app-settings
[github-new-token]:         https://github.com/settings/tokens/new
[old-version-repo]:         https://github.com/davicorreiajr/spotify-now-playing
[apple-developer-program]:  https://developer.apple.com/programs/
[csr-apple]:                https://help.apple.com/developer-account/#/devbfa00fef7
[certificate-create-apple]: https://help.apple.com/developer-account/#/dev04fd06d56
[spotify-developers]:       https://developer.spotify.com/
[apple-id]:                 https://appleid.apple.com/account/manage
[apple-app-identifier]:     https://developer.apple.com/account/resources/identifiers/list
