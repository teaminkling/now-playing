cask "now-playing-for-spotify" do
  version "0.8.1"
  sha256 "775e6716a65d1bf64809f8e170d82024178bf67c7b142ed3ab7f9fc4212b1c34"

  url "https://github.com/teaminkling/mac-spotify-np/releases/download/v#{version}/Now.Playing.for.Spotify-#{version}.dmg"
  name "Now Playing for Spotify"
  desc "System tray mini-player and notifications provider for Spotify"
  homepage "https://github.com/teaminkling/mac-spotify-np"

  app "Now Playing for Spotify.app"

  zap trash: [
    "~/Library/Logs/Now Playing for Spotify",
    "~/Library/Preferences/com.teaminkling.now-playing-for-spotify.plist",
  ]
end
