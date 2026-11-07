# Sum Pop (凑凑数)

A number-matching puzzle game. Tap numbers on the board that add up to the target; each correct group pops off the board. Make enough groups before time runs out to pass the level, and make more to earn more stars.

The game is a plain web page (no framework, no build step), packaged as an iOS app with [Capacitor](https://capacitorjs.com/). The interface is in English and Chinese, and follows the device language.

<p>
  <img src="docs/home.png" width="260" alt="Home screen: levels grouped by world, with stars earned">
  &nbsp;
  <img src="docs/game.png" width="260" alt="Game screen: target is 40, the player has tapped 15">
</p>

There are 113 stages across 12 levels. They start with "Make 1" and build up to mixed challenges with negatives and decimals:

| Level | Stages | What it's about |
|---|---|---|
| 1 First Sums | 10 | Make 1 to 10, with 0 on the board. 45-second timer, auto-hints when idle (made for young kids) |
| 2 Teens | 10 | Make 11 to 20 |
| 3 Make Tens | 10 | Make 10, 20 … 100 |
| 4 Big Numbers | 10 | Make 150 up to 1000 |
| 5 Threes | 10 | Tap up to 3 numbers; most groups need all three |
| 6 Tiny Boards | 8 | Fewer tiles and fewer answers, on a shorter timer |
| 7 Negatives | 10 | Striped tiles are negative |
| 8 Below Zero | 9 | The target is negative too |
| 9 Decimals | 10 | Tenths, halves and quarters |
| 10 Pocket Change | 8 | Two decimal places, counted in fives |
| 11 Blitz | 8 | 30 seconds on the clock |
| 12 Grand Finale | 10 | Everything at once, with less time |

---

## Just want to play? Use a browser (no Mac needed)

The game is a web page, so there's nothing to install.

**On a computer:** download the code and open `www/index.html` in your browser.

```sh
git clone https://github.com/sslcandoit/sum-pop.git
open sum-pop/www/index.html        # on Windows, just double-click the file
```

**On a phone browser:** start a local web server on your computer, then open it from a phone on the same Wi-Fi network.

```sh
cd sum-pop
python3 -m http.server 8000 -d www
```

Then open `http://<your computer's local IP>:8000` on the phone. On a Mac, `ipconfig getifaddr en0` prints the IP. In Safari, **Share → Add to Home Screen** makes it feel almost like an app.

The browser version plays exactly like the app; the app just adds haptic feedback on iPhone. Progress is saved in that browser.

---

## Install it on your own iPhone

### What you need

- A Mac with **Xcode 26** or later (free on the Mac App Store)
- **Node.js 22** or later ([nodejs.org](https://nodejs.org/) or `brew install node`)
- An Apple ID. A free one works; you don't need a paid developer account
- An iPhone on **iOS 15** or later, and a USB cable for the first install

### Steps

**1. Get the code, install dependencies, open Xcode**

```sh
git clone https://github.com/sslcandoit/sum-pop.git
cd sum-pop
npm install
npm run ios          # copies www/ into the iOS project, then opens Xcode
```

**2. Switch the signing to your own account**

The project is set up with the author's signing settings, which won't work on your Mac. Change two things:

1. If you haven't added your Apple ID to Xcode yet: open **Xcode → Settings → Accounts**, click **+** in the bottom-left corner and sign in.
2. In the left sidebar, click the top **App** project. In the middle pane, select **TARGETS → App**, then open the **Signing & Capabilities** tab:
   - **Team**: pick your own name. A free account shows up as "(Personal Team)".
   - **Bundle Identifier**: change `com.sslee.sumpop` to something of your own, such as `com.yourname.sumpop`. The original ID is already registered to the author's account, so signing fails if you keep it.

**3. Turn on Developer Mode on the iPhone**

1. Connect the iPhone to the Mac with the cable. When the phone asks **Trust This Computer?**, tap **Trust**.
2. On the iPhone, go to **Settings → Privacy & Security → Developer Mode** and turn it on. The phone restarts; confirm once more after it boots.
   If the option isn't there yet, do the next step once (press Run) and it will appear.

**4. Run**

At the top of the Xcode window, choose your iPhone as the run destination and press **▶ Run** (⌘R). Xcode builds the app, installs it on the phone and opens it.

If the first launch says **Untrusted Developer**: on the iPhone, go to **Settings → General → VPN & Device Management**, tap your Apple ID, then tap **Trust**. Go back to the home screen and open the app again.

> **Limit of a free Apple ID:** apps installed with a free account **stop opening after 7 days**. When that happens, connect the phone and press Run in Xcode again; game progress is kept. With a paid developer account, the install lasts one year.

**Rather not open Xcode every time?** Once signing is set up, you can install from the command line:

```sh
npx cap run ios --list               # list available devices
npx cap run ios --target <device id>
```

---

## Changing the game

| File | What's in it |
|---|---|
| [`www/levels.js`](www/levels.js) | **Every level's settings.** Tuning difficulty or adding levels only touches this file. Each field is explained at the top of the file |
| [`www/i18n.js`](www/i18n.js) | Interface text in English and Chinese |
| [`www/game.js`](www/game.js) | Gameplay, rendering, home screen, saved progress |
| [`www/style.css`](www/style.css) | Styles |
| [`www/index.html`](www/index.html) | Page structure |
| [`design/make_icons.py`](design/make_icons.py) | Generates the app icon and launch screen (needs `pip install pillow`) |
| `ios/` | The Xcode project; normally you don't edit it by hand |

**When editing levels:**

- Each level's `key` (for example `'tens-40'`) is what saved progress is stored under. **Don't rename a key after release**, or players lose their stars and best score for that level. Inserting, removing or reordering levels is fine; the level numbers shown in the game update automatically.
- After editing, open `www/index.html?check` in a browser. It lists any problems in the level settings, such as duplicate keys, misspelled field names, or a number pool that can't make the target.

**URL parameters for testing:**

- `index.html?level=2-3` jumps straight into level 2, stage 3. A key works too, e.g. `?level=tens-40`
- `index.html?level=2-3&result=25` shows the results screen as if you'd made 25 groups

**Updating the app on your phone after a change:** editing files in `www/` doesn't update the installed app. First run

```sh
npm run sync
```

to copy your changes into the iOS project, then press **▶ Run** in Xcode again. Running `sync` alone isn't enough; the phone keeps the old version until you run it again from Xcode.

---

## Releasing to the App Store / TestFlight (maintainers)

### Prerequisites

- Membership in the [Apple Developer Program](https://developer.apple.com/programs/) (US$99/year). Free accounts can't publish.
- An app record in [App Store Connect](https://appstoreconnect.apple.com/) with the Bundle ID `com.sslee.sumpop`.

### Before each release

- [ ] The **"Unlock all levels (testing)"** button on the home screen is currently visible to every player. Hide or remove it before a public release (`#unlockBtn` in `www/index.html`)
- [ ] Open `www/index.html?check` and make sure the level settings report no problems
- [ ] No level `key` has been renamed since the previous release

### Release steps

1. **Bump the version.** In Xcode, go to **TARGETS → App → General**:
   - **Version**: the version players see, e.g. `1.0` → `1.1`
   - **Build**: must be higher than any build uploaded before, e.g. `1` → `2`
2. **Sync the web code:** `npm run sync`
3. **Archive:** set the run destination at the top of Xcode to **Any iOS Device (arm64)**, then choose **Product → Archive**.
4. **Upload:** when archiving finishes, the Organizer window opens. Select the new archive and click **Distribute App → App Store Connect → Upload**.
5. **Test:** after a few minutes (sometimes longer), the build appears under **TestFlight** in App Store Connect. Add testers; they install the TestFlight app on their iPhone and can play without a Mac.
6. **Submit for review:** in App Store Connect, add screenshots and a description, select the build, and click **Add for Review**.
   For the privacy questionnaire you can answer **Data Not Collected**: the game makes no network requests and keeps progress only on the device.
7. **Tag the release in git:**

   ```sh
   git tag v1.1
   git push --tags
   ```
