# Skyline Manager — als App auf Rechner und Telefon

Das Spiel ist eine installierbare Web-App (PWA). Es läuft offline, landet auf dem
Homescreen und teilt seine Spielstände zwischen allen Geräten, sobald ein
kostenloses Firebase-Projekt hinterlegt ist.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Das ganze Spiel. Läuft auch ohne alles Übrige per Doppelklick. |
| `manifest.webmanifest` | Macht die Seite installierbar (Name, Symbol, Startbild). |
| `sw.js` | Service Worker für den Offline-Betrieb. |
| `icon-192.png`, `icon-512.png`, `icon-180.png` | App-Symbole für Android und iOS. |

Alle Dateien gehören in **denselben Ordner**.

## Schritt 1: Veröffentlichen (GitHub Pages, gratis)

1. Neues Repository anlegen, z. B. `skyline-manager`.
2. Die fünf Dateien ins Wurzelverzeichnis laden.
3. Unter *Settings → Pages* als Quelle `main` und Ordner `/ (root)` wählen.
4. Nach ein bis zwei Minuten ist das Spiel unter
   `https://IHRNAME.github.io/skyline-manager/` erreichbar.

HTTPS ist Pflicht, sonst arbeitet weder der Service Worker noch die Installation.
GitHub Pages liefert das automatisch mit. Netlify oder Cloudflare Pages tun es
genauso; dort genügt es, den Ordner ins Fenster zu ziehen.

## Schritt 2: Auf dem Telefon installieren

**Android, Chrome:** Seite öffnen, im Menü *App installieren* wählen.

**iPhone, Safari:** Seite öffnen, Teilen-Symbol, *Zum Home-Bildschirm*.
Chrome auf dem iPhone kann das nicht — es muss Safari sein.

Danach startet das Spiel ohne Adressleiste, im Vollbild, auch ohne Verbindung.

## Schritt 3: Spielstände synchronisieren (Firebase, Gratis-Tarif)

1. Auf [console.firebase.google.com](https://console.firebase.google.com) ein
   Projekt anlegen. Google Analytics kann man abwählen.
2. **Firestore Database** anlegen, Modus *Produktion*, Region `eur3` oder
   `europe-west6` (Zürich).
3. Unter **Authentication → Sign-in method** die Anmeldung mit
   *E-Mail/Passwort* aktivieren.
4. Unter **Projekteinstellungen → Meine Apps** eine Web-App hinzufügen.
   Aus der angezeigten Konfiguration braucht das Spiel nur zwei Werte:
   `apiKey` und `projectId`.
5. Bei den Firestore-Regeln eintragen:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /skyline/{uid}/saves/{doc} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

6. Im Spiel unter **Daten → Spielstand in der Cloud** die beiden Werte
   eintragen, danach ein Konto anlegen. **Auf jedem Gerät dasselbe Konto
   verwenden** — sonst sehen Rechner und Telefon verschiedene Stände.

Ab dann: *In die Cloud sichern* auf dem einen Gerät, *Aus der Cloud laden* auf
dem anderen. Der Schalter *Beim Monatswechsel automatisch sichern* nimmt einem
das Daran-Denken ab. Über *Weitere Stände* lassen sich mehrere benannte
Sicherungen ablegen, etwa vor einer riskanten Übernahme.

### Was das kostet

Nichts. Ein Spielstand ist komprimiert deutlich unter 100 KB; der Gratis-Tarif
von Firestore erlaubt 50'000 Lesevorgänge und 20'000 Schreibvorgänge pro Tag.
Selbst bei automatischer Sicherung in jedem Spielmonat kommt man dem nicht nahe.

### Sicherheit

Der Web-API-Schlüssel ist kein Geheimnis — er identifiziert nur das Projekt.
Den Zugriff regeln allein die Firestore-Regeln oben: jedes Konto sieht
ausschliesslich seine eigenen Stände. Schlüssel und Sitzung liegen im
Browserspeicher des jeweiligen Geräts und wandern nie in einen Spielstand.

## Grafiken: Ordnerstruktur

```
graphics/
  AircraftTemplates/     Seitenansichten der Flugzeugmuster
  misc/                  alles Übrige
    decals/              eigene Aufkleber für den Lackierungseditor
```

Das Spiel durchsucht diese Ordner beim Start. **In `index.html` muss nichts
eingetragen werden.**

## Flugzeugmuster

1. Ordner anlegen: *Add file → Create new file*, Dateiname
   `graphics/AircraftTemplates/.gitkeep` — durch die Schrägstriche legt GitHub
   die Ordner an.
2. Seitenansichten hineinladen, etwa die Fassungen *all white* von norebbo.com.
3. **Die Dateinamen dürfen bleiben, wie sie sind.** Das Spiel liest die
   Ordnerliste und ordnet selbst zu: `A320_NEO_Pratt__Whitney_white_sm.jpg`
   landet beim Airbus A320neo, `Q400_white.jpg` bei der Dash 8, `CS300_white.jpg`
   beim A220-300. Gibt es kein exakt passendes Muster, wird die nächstliegende
   Vorlage genommen — bei einer Seitenansicht fällt das kaum auf.
4. **Commit changes**, im Spiel unter *Daten → Grafikpaket* auf **Ordner neu
   durchsuchen** klicken.

Wer die Zuordnung selbst bestimmen will, benennt die Datei nach der
Musterkennung: `a20n.jpg`, `b789.jpg`. Die Liste zeigt das Spiel unter
*Daten → Grafikpaket → Musterkennungen zeigen*.

Das Spiel stellt den Hintergrund frei, erzeugt die Farbmaske, leitet die
Leitwerksmaske ab und misst Nase, Mittellinie und Rumpfradius selbst aus.

Der Kniff beim Freistellen: Der Hintergrund wird **vom Bildrand her** entfernt,
nicht nach Farbe — ein simples „Weiss entfernen" würde den weissen Rumpf
durchlöchern. Für die Farbmaske gilt: helle, deckende Flächen dürfen Farbe
annehmen, dunkle nicht. Dadurch bleiben Fenster, Cockpitscheiben und
Triebwerkseinläufe automatisch ausgespart.

Wer mehr Kontrolle will, legt statt der rohen Vorlage fertige Ebenen ab:
`<id>-base.png` (freigestellt, mit Alphakanal), dazu wahlweise `<id>-mask.png`,
`<id>-tail.png` und `<id>-shade.png`. Erzeugen lassen sie sich mit dem
eingebauten Werkzeug unter *Daten → Grafikpaket → Vorlage von Hand aufbereiten*,
mit Reglern für Hintergrund-Toleranz und Maskenschwelle sowie Vorschau in der
Hausfarbe.

Das Suchergebnis wird eine Woche gemerkt. Nach dem Hochladen neuer Dateien
einmal auf **Ordner neu durchsuchen** klicken.

## Der Ordner misc

Hier liegt alles, was nicht zu einem Flugzeugmuster gehört. Bereits genutzt:

| Datei | Wirkung |
|---|---|
| `graphics/misc/logo.png` | Bildmarke statt des gezeichneten Signets — erscheint in der Kopfzeile und lässt sich im Editor auf den Rumpf setzen. Quadratisch, mit Alphakanal. |
| `graphics/misc/splash.jpg` | Bild im Gründungsfenster. Breitformat, etwa 1200 × 400. |
| `graphics/misc/decals/*.png` | Eigene Aufkleber. Jede Datei erscheint im Freiform-Editor als Werkzeug und lässt sich frei platzieren, drehen und skalieren. |
| `graphics/misc/airports/<IATA>.jpg` | Bild eines Flughafens, ersetzt dort die gezeichnete Platzskizze. Breitformat 16:9. |

Die Dateien im Unterordner `decals/` werden über die öffentliche GitHub-API
aufgelistet, deshalb sind die Namen frei wählbar. Läuft das Spiel nicht auf
GitHub Pages, sucht es stattdessen nach einer Datei `index.json` im selben
Ordner, die schlicht die Dateinamen enthält:

```json
["swissair-retro.png", "jubilaeum-25.png", "star-alliance.png"]
```

### Bereits erzeugt statt gesammelt

Zwei Dinge, für die sich das Sammeln von Bildern nicht lohnt, weil sie nie
einheitlich würden, erzeugt das Spiel selbst:

**Leitwerke der Wettbewerber.** Jede der 71 Gesellschaften hat Hausfarben, ein
Leitwerksmuster und ein Signet — angelehnt an das Original, aber eigenständig
gezeichnet. Sie erscheinen im Streckendetail, in der Wettbewerberübersicht, bei
den Beteiligungen und im Flughafenfenster. Einheitlich in Form und Grösse, und
ohne fremde Markenzeichen zu verwenden.

**Flughafenskizzen.** Ein schematischer Platzplan aus den vorhandenen Daten:
Pistenlänge massstäblich, Vorfeld, Terminal, Rollwege, Massstabsbalken und
Nordpfeil. Die Ausrichtung ist bei rund achtzig Flughäfen die echte — Zürich
14/32, Basel 15/33, Heathrow 09/27 — bei den übrigen schematisch, was in der
Skizze auch so vermerkt ist. Wer für einen Flughafen ein echtes Bild einsetzen
will, legt es als `graphics/misc/airports/<IATA>.jpg` ab; dann ersetzt es die
Skizze.

### Ideen für später

### Ideen für später

Was sich mit wenig Aufwand ergänzen liesse, falls Sie Material sammeln:

- **`graphics/misc/cabin/<klasse>.jpg`** — Kabinenbilder für Economy, Premium,
  Business und First, gezeigt im Kabinendialog. Macht die Servicestufen
  greifbar.
- **`graphics/misc/badges/<id>.png`** — eigene Abzeichen für die Meilensteine
  statt der reinen Textkarten.
- **`graphics/misc/weather/<art>.png`** — Symbole für Sturm, Nebel, Gewitter
  auf der Karte statt der farbigen Ellipsen.
- **`graphics/misc/panel.jpg`** — eine dezente Hintergrundtextur für die
  Seitenleiste, etwa ein unscharfes Vorfeldfoto.

Sagen Sie Bescheid, welche davon Sie wollen — die Einbindung ist jeweils
überschaubar, weil der Suchmechanismus schon steht.

### Zur Lizenz

Norebbo schreibt in einer Kommentarantwort vom 2. Februar 2024, die auf der
Website gezeigten Bilder dürfe man herunterladen und damit machen, was man
wolle; kostenpflichtig seien nur die höher aufgelösten, bearbeitbaren
Quelldateien. Im Fussbereich steht gleichwohl ein Copyright-Vermerk, und eine
Kommentarantwort ist keine förmliche Lizenz.

Für ein privates Projekt ist das vertretbar. Zwei Dinge sind trotzdem sinnvoll:
eine Nennung des Urhebers auf der Seite, und — falls das Spiel je öffentlich
beworben wird — eine kurze Anfrage beim Anbieter mit genauer Beschreibung des
Falls: Einbindung als Bild in eine öffentlich erreichbare Browser-Anwendung,
bei der die Dateien technisch herunterladbar sind.

Rechtlich unbedenkliche Alternative sind Seitenrisse auf Wikimedia Commons
unter CC BY-SA; dort genügen Namensnennung und Weitergabe unter gleichen
Bedingungen.

## Einstieg ins Spiel

Beim Start erscheint ein Menü mit vier Wegen:

- **Neue Airline gründen** — von null: Name, Heimatstation, Bemalung,
  Schwierigkeit. Der offenste, aber längste Weg.
- **Bestehende Airline führen** — eine von zehn mittelgrossen Gesellschaften
  übernehmen, von Helvetic Airways in Bern und Zürich bis Finnair in Helsinki.
  Flotte, Basen, Personal und Tagespläne sind eingerichtet, der Betrieb läuft ab
  dem ersten Tag. Das Startkapital ist knapper als bei einer Neugründung.
- **Szenarien** — vorgegebene Ausgangslagen mit klarem Ziel. Noch nicht gefüllt.
- **Spielstand laden** — aus einer Datei oder aus der Cloud.

Die übernommene Gesellschaft verschwindet aus dem Wettbewerb. Name, Bemalung
und Flugpläne lassen sich danach frei ändern.

## Ohne Cloud

Wer keinen Server möchte, nutzt weiterhin *Spielstand sichern* und *laden* über
Dateien. Am Telefon landet der Download im Ordner *Downloads* und lässt sich von
dort wieder einlesen — umständlicher, aber ohne jede Abhängigkeit.

## Hinweise zum Betrieb

- Wechselt man auf dem Telefon die App, hält die Simulation an und läuft beim
  Zurückkehren weiter. Sonst würden im Hintergrund Wochen durchlaufen.
- Der Knopf **Karte grösser** rechts oben schaltet die Kartenhöhe in drei
  Stufen — am Telefon nützlich, wenn man Strecken erkennen will.
- Quer gehalten legt sich die Karte neben die Bedienleiste.
- Nach einem Update auf dem Server: App einmal schliessen und neu öffnen, dann
  zieht der Service Worker die neue Fassung.
