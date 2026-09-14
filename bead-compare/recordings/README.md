# recordings/

Recording folders made from real takes with `tools/units_to_tape.py`, ready to import
into Bead Compare (**Importar pasta…** on a passage card). One folder is one take:

```
recordings/
  satere-rute-1-1-5-tomada-1/
    audio.wav     16 kHz mono 16-bit, the storyteller's own voice
    tape.json     the acoustemes as a tape: u (unit id per 20 ms), f (pitch class), pause_unit
    meta.json     passage, language, narrator, recorded_at, label
  satere-rute-1-1-5-tomada-2/
    ...
```

Everything in this folder except this file is ignored by git: these are recordings of
real people, and the repository keeps only the synthetic demo voice in `fixtures/`.

## Two takes of one passage

From the `bead-compare/` folder, once per take, naming the same codebook for both:

```sh
python3 tools/units_to_tape.py "path/to/take 1.npy" --audio "path/to/take 1.wav" \
    -o recordings/satere-rute-1-1-5-tomada-1 --codebook path/to/satere_codebook.pkl \
    --passage "Rute 1:1-5" --language "Sateré-Mawé" --narrator "Nome" --label "tomada 1"

python3 tools/units_to_tape.py "path/to/take 2.npy" --audio "path/to/take 2.wav" \
    -o recordings/satere-rute-1-1-5-tomada-2 --codebook path/to/satere_codebook.pkl \
    --passage "Rute 1:1-5" --language "Sateré-Mawé" --narrator "Nome" --label "tomada 2"
```

Then `npm run dev`, open <http://localhost:5173>, **Criar passagem**, and import the
older take first (**Importar pasta…**), then the newer one. `python3 tools/units_to_tape.py --help`
lists every accepted input form and option.
