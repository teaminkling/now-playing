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

Alternatively, you can use Homebrew:

> This will install the latest version from the [old version][old-version-repo], for now.

```
brew install spotify-now-playing
```

## Contributing

### Local Development

This is a typical Electron app and is relatively easy to run locally!

After cloning this repository, you must install the dependencies:

```
yarn install
```

Since this app uses the Spotify API, you [must create and register an app][spotify-app-registration] in the Spotify 
Developer portal.

Once you have done this, rename `.env-example.json` (file in the root of this project) to `.env.json`.

Finally, start the app:

```
yarn start
```

### Deployment

> For this section, I will assume you are developing on macOS.

Deployment is not quite as simple as development. Start by renaming `electron-builder-example.yml` to 
`electron-builder.yml` and editing it to match desired settings.

To distribute a binary release:

```
yarn dist
```

This will create a `.dmg` file in `dist/` (possibly a new directory). For now, deployment is a manual process that 
requires uploading the DMG manually to the GitHub Releases page. This is because of [notarisation](#notarisation).

You should make sure your [Spotify App][spotify-developers] is up-to-date right before distribution.

Also, if you make any changes to the logo, run:

```
iconutil -c icns build/icon.iconset
```

### Notarisation

To get code signing to work, there is a fairly involved first-time process:

1. Join the [Apple Developer Program][apple-developer-program] (this will cost about AUD$150 a year).
2. Use Keychain Access to create a [Certificate Signing Request][csr-apple].
3. Use the CSR to create a [Developer ID Application certificate][certificate-create-apple].
  a. This is for applications that are not packaged to the Mac App Store.
4. Download that certificate and add it to your keychain.
  a. We will assume it is the only key on your keychain.
5. 

## Notice

Now Playing is not affiliated with Apple or Spotify. These business names, graphics, style guide, and other 
references are the trademarks of their respective copyright holders.

The graphic design of this app was designed by Cindy Xu of Inkling Interactive.

This project was first forked and then copied from @davicorreiajr's [original repo][old-version-repo].

This project uses the [MIT License](LICENSE).

[latest-release]: https://github.com/teaminkling/mac-spotify-np/releases/latest
[spotify-app-registration]: https://developer.spotify.com/documentation/general/guides/app-settings/#register-your-app
[github-new-token]: https://github.com/settings/tokens/new
[old-version-repo]: https://github.com/davicorreiajr/spotify-now-playing
[apple-developer-program]: https://developer.apple.com/programs/
[csr-apple]: https://help.apple.com/developer-account/#/devbfa00fef7
[certificate-create-apple]: https://help.apple.com/developer-account/#/dev04fd06d56
[spotify-developers]: https://developer.spotify.com/
