# Plant photos — where to put your JPGs

Your converted photos go in **one** of these folders (pick whichever is easiest to find):

```
noobwork-site/
  download/plant-photos/     ← easiest (repo root)
  plants/download/           ← also works
```

## In Cursor (recommended)

1. Open the **noobwork-site** project in Cursor.
2. In the left **file explorer**, expand the project tree.
3. Open **`download`** → **`plant-photos`** (create the folder if it’s missing).
4. Drag your 3 JPG files from **Finder → Downloads** into **`plant-photos`**.
5. In the terminal (Cursor: **Terminal → New Terminal**):

```bash
cd plants
npm run ingest:photos
```

6. Refresh http://localhost:3001 and open any plant detail page to see the photo timeline.

## On your Mac (Documents/code)

If the repo isn’t on your Mac yet:

```bash
mkdir -p ~/Documents/code
cd ~/Documents/code
git clone https://github.com/nubtwerk/noobwork-site.git
cd noobwork-site
```

Then in Cursor: **File → Open Folder…** → choose:

```
~/Documents/code/noobwork-site
```

Put photos here:

```
~/Documents/code/noobwork-site/download/plant-photos/
```

Example — copy from Downloads and ingest:

```bash
cp ~/Downloads/*.jpg ~/Documents/code/noobwork-site/download/plant-photos/
cd ~/Documents/code/noobwork-site/plants
npm install
npm run ingest:photos
npm run dev
```

Open http://localhost:3001

## File naming

Any JPG names work if there are exactly 3 files (sorted alphabetically = plant order). Or use:

| File | Plant |
|---|---|
| `1.jpg` or `bird-of-paradise.jpg` | Bird of paradise |
| `2.jpg` or `china-doll.jpg` | China doll |
| `3.jpg` or `olive-tree.jpg` | Olive tree |

## Dev server

From the **`plants`** folder (not repo root):

```bash
cd ~/Documents/code/noobwork-site/plants
npm run dev
```

App runs at **http://localhost:3001**
