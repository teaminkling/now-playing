# Spotify - now playing

This is a popup that shows Spotify current playback information, made and tested specially for macOS. It also allows you to add tracks to your library and playlists.

![](spotify-now-playing.gif)

## Installing

<a href="Spotify - now playing-0.1.0.dmg" download>Download</a> the `.dmg` file, run it and move the app to the `Application` folder.

## Running locally

This app was made using Electron, but developed and tested only on macOS.

First, clone the repo:
```
git clone https://github.com/davicorreiajr/spotify-now-playing
cd spotify-now-playing
```

Install the dependencies:
```
npm install
```
Then you have to create an app on Spotify, in order to get the codes necessary for doing the requests to its API. You can do it easly, following [this tutorial](https://developer.spotify.com/documentation/general/guides/app-settings/#register-your-app).

Once you have done this, create a `.env.json` file in the root of this project, with the following content:
```
{
  "SPOTIFY_CLIENT_ID": '<client_id_from_the_app_you_just_created>',
  "SPOTIFY_CLIENT_SECRET": '<client_secret_from_the_app_you_just_created>',
  "REDIRECT_URI": '<redirect_uri_you_used_to_create_the_app>'
}
```

And finally, start the app:
```
npm start
```

If you are developing over this project and want to test the built app, the one generated by `electron-builder`, just run:
```
npm build
```
With this command, you are going to find a `.dmg` file inside a new folder `dist`. 

## Contributing & developing

To contribute with this repository:
 - First you need to fork the project;
 - Create a branch with a meaningful name;
 - Modify the project as you see fit;
 - To test it manually, run:
 ```
 npm link
 ```
 - Open a pull request to the main repository.

## Copyright & credits

Spotify - now playing is not affiliated with Apple or Spotify and these are the trademarks of the respective parties. The icon used here belongs to Spotify and it was used to ease the usage of this app to the user.


## Troubles & suggestions

Please, if you find any problem or have some sugestion, don't hesitate to open an issue or even a pull request.
