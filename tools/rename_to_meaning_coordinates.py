#!/usr/bin/env python3
"""SC-0080 — the Meaning-Coordinates rename engine.

Applies tools/rename-map.json to one repo (--repo compiler|vault) per
RENAME-BUILD-SPEC-MEANING-COORDINATES.md §8. Deterministic, map-driven,
exempt-aware, git-mv-only, idempotent, guarded. This file deliberately
contains no old-name token: every string it replaces lives in the map.

Usage:
  python3 tools/rename_to_meaning_coordinates.py --repo compiler [--root .] [--dry-run]
"""
import argparse, fnmatch, json, os, re, subprocess, sys

def sh(args, cwd, check=True):
    r = subprocess.run(args, capture_output=True, text=True, cwd=cwd)
    if check and r.returncode != 0:
        sys.exit(f"ABORT: {' '.join(args)} failed in {cwd}:\n{r.stderr}")
    return r.stdout

def die(msg):
    sys.exit(f"ABORT: {msg}")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--repo', required=True, choices=['compiler', 'vault'])
    ap.add_argument('--root', default='.')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--manifest-out', default=None)
    a = ap.parse_args()
    root = os.path.abspath(a.root)
    kit_dir = os.path.dirname(os.path.abspath(__file__))
    mp = json.load(open(os.path.join(kit_dir, 'rename-map.json')))
    repo = a.repo

    # ---- req 3: substring-order self-check --------------------------------
    olds = [e['old'] for e in mp['global']]
    for i, oi in enumerate(olds):
        for j in range(i + 1, len(olds)):
            if oi in olds[j]:
                die(f"map order: entry {i} ({oi!r}) is a substring of later entry {j} ({olds[j]!r})")

    # ---- req 12: gate guard (runs in dry-run too) --------------------------
    need = mp['requires_merged'][repo]
    main_ref = mp['main_ref'][repo]
    if subprocess.run(['git', 'merge-base', '--is-ancestor', need, main_ref],
                      cwd=root).returncode != 0:
        die(f"gate: {need} is not an ancestor of {main_ref} — the prerequisite close is not merged")
    branch = sh(['git', 'branch', '--show-current'], root).strip()
    if branch != mp['branch']:
        head = sh(['git', 'rev-parse', 'HEAD'], root).strip()
        tag = sh(['git', 'rev-parse', mp['pre_rename_tag'][repo] + '^{commit}'], root).strip()
        if head != tag:
            die(f"gate: on branch {branch!r}, not {mp['branch']!r}, and HEAD is not the "
                f"pre-rename tag (replay mode)")
    prs = json.loads(sh(['gh', 'pr', 'list', '--json', 'headRefName', '--state', 'open'], root) or '[]')
    others = [p for p in prs if p['headRefName'] != mp['branch']]
    if others:
        die(f"gate: open PRs present (excluding the rename pair): {others}")

    # ---- dirty-tree guard (tracked changes only; untracked kit copies OK) --
    porcelain = [l for l in sh(['git', 'status', '--porcelain'], root).split('\n')
                 if l and not l.startswith('??')]
    if porcelain:
        die(f"dirty working tree ({len(porcelain)} tracked change(s)) — commit or stash first")

    # ---- load exempt + live lists (req 6) ----------------------------------
    def kitpath(key):
        p = os.path.join(kit_dir, os.path.basename(mp[key][repo]))
        return p if os.path.exists(p) else os.path.join(root, mp[key][repo])
    frozen, line_rules = set(), []   # line_rules: (path_glob, compiled_regex)
    for raw in open(kitpath('exempt_file')):
        row = raw.rstrip('\n')
        if not row.strip():
            continue
        if ' :: ' in row:
            path_part, _, rx = row.partition(' :: ')
            path_part, rx = path_part.strip(), rx.strip()
            if not path_part or not rx:
                die(f"malformed exempt row: {row!r}")
            try:
                line_rules.append((path_part, re.compile(rx)))
            except re.error as e:
                die(f"malformed exempt regex in row {row!r}: {e}")
        else:
            frozen.add(row.strip())
    live = {l.strip() for l in open(kitpath('live_file')) if l.strip()}

    def is_frozen(path):
        return any(path == f or fnmatch.fnmatch(path, f) or
                   (f.endswith('/**') and path.startswith(f[:-2])) for f in frozen)

    # ---- req 7: tracked files only ------------------------------------------
    tracked = sorted(sh(['git', 'ls-files'], root).split('\n'))
    tracked = [t for t in tracked if t and not t.startswith(('.git/', 'node_modules/',
               '.obsidian/', '.claude/')) and os.path.basename(t) != '.DS_Store']

    # ---- re-run detection (req 8) -------------------------------------------
    mvs = mp['renames'][repo]
    first = mvs[0]
    rerun = (not os.path.exists(os.path.join(root, first['src']))
             and os.path.exists(os.path.join(root, first['dst'])))

    def post_mv(path):
        """Translate a pre-mv path to its post-mv form (guards check the
        exempt/live rows, which are written in post-mv form per the spec)."""
        for m in mvs:
            if m.get('dir'):
                if path.startswith(m['src'] + '/'):
                    path = m['dst'] + path[len(m['src']):]
            elif path == m['src']:
                path = m['dst']
        # a file inside a renamed dir may ALSO have a per-file rename entry
        for m in mvs:
            if not m.get('dir') and path == m['src']:
                path = m['dst']
        return path

    # ---- req 10: refusals -----------------------------------------------------
    if not rerun:
        # pre-existing new-family tokens must be zero
        for e in mp['global']:
            for tgt in {e['new'], e.get('new_scope_b', e['new'])}:
                hits = subprocess.run(['git', 'grep', '-I', '-l', '-F', tgt],
                                      capture_output=True, text=True, cwd=root).stdout.split()
                hits = [h for h in hits if not h.startswith('tools/rename')]
                if hits:
                    die(f"new-family token {tgt!r} pre-exists in {hits[:5]}")
    # census classification: every variant hit must be classified
    kitset = {os.path.relpath(os.path.join('tools', os.path.basename(k)))
              for k in [mp['exempt_file'][repo], mp['live_file'][repo]]}
    for e in mp['global']:
        hits = subprocess.run(['git', 'grep', '-I', '-l', '-F', e['old']],
                              capture_output=True, text=True, cwd=root).stdout.split()
        for h in hits:
            if h.startswith('tools/rename'):
                continue  # the committed kit carries old tokens by design
            hp = post_mv(h)
            if h not in live and hp not in live and not is_frozen(h) and not is_frozen(hp):
                die(f"unclassified census hit: {h} contains {e['old']!r} but is on neither list")
    # bare-token classification
    idents = mp['identifiers'][repo]
    ident_files = {f for e in idents for f in e['files']}
    rule_files = set()
    for g, _ in line_rules:
        for t in tracked:
            tp = post_mv(t)
            if fnmatch.fnmatch(t, g) or t == g or fnmatch.fnmatch(tp, g) or tp == g:
                rule_files.add(t)
    keep = set(mp.get('keep_bare_fm', [])) if repo == 'compiler' else set()
    hand = set(mp['hand_edits'] if repo == 'compiler' else mp['hand_edits_vault'])
    bare = subprocess.run(['git', 'grep', '-I', '-l', '-P', r'\b[fF][mM]s?\b'],
                          capture_output=True, text=True, cwd=root).stdout.split()
    for h in bare:
        if h.startswith('tools/rename'):
            continue
        hp = post_mv(h)
        if (h not in ident_files and hp not in ident_files and h not in keep
                and not is_frozen(h) and not is_frozen(hp)
                and h not in rule_files and h not in hand and hp not in hand):
            die(f"bare-token hit in undisposed file: {h}")

    # ---- pass 1: git mv (req 5) ----------------------------------------------
    def pre_dir(path):
        # reverse-translate a per-file src through NOT-YET-APPLIED directory renames
        for m in mvs:
            if m.get('dir') and path.startswith(m['dst'] + '/') and \
                    not os.path.exists(os.path.join(root, m['dst'])):
                path = m['src'] + path[len(m['dst']):]
        return path
    planned_mvs, done_mvs = [], []
    for m in mvs:
        src, dst = os.path.join(root, m['src']), os.path.join(root, m['dst'])
        if os.path.exists(src) or os.path.exists(os.path.join(root, pre_dir(m['src']))):
            planned_mvs.append((m['src'], m['dst']))
        elif os.path.exists(dst):
            done_mvs.append((m['src'], m['dst']))  # req 8: completed mv = no-op
        else:
            die(f"mv: neither {m['src']} nor {m['dst']} exists")
    if not a.dry_run:
        for src, dst in planned_mvs:
            sh(['git', 'mv', src, dst], root)

    # ---- pass 2: content ------------------------------------------------------
    # (re-list after mv so paths are post-mv)
    tracked = sorted(sh(['git', 'ls-files'], root).split('\n')) if not a.dry_run else tracked
    tracked = [t for t in tracked if t and not t.startswith(('.git/', 'node_modules/',
               '.obsidian/', '.claude/')) and os.path.basename(t) != '.DS_Store']
    scope_b = set(mp['scope_b'][repo])
    per_variant = {e['old']: 0 for e in mp['global']}
    per_ident = {}
    touched, skipped_lines = [], {}
    for path in tracked:
        if path.startswith('tools/rename'):
            continue
        if is_frozen(path):
            continue
        fp = os.path.join(root, path)
        try:
            raw = open(fp, 'rb').read()
            if b'\x00' in raw:
                continue
            text = raw.decode('utf-8')
        except (UnicodeDecodeError, FileNotFoundError):
            continue
        rules = [rx for g, rx in line_rules if path == g or fnmatch.fnmatch(path, g)]
        my_idents = [e for e in idents if path in e['files']]
        if not rules and not my_idents:
            probe = any(e['old'] in text for e in mp['global'])
            if not probe:
                continue
        lines = text.split('\n')
        out, changed, skipped = [], False, 0
        sb = path in scope_b
        for i, line in enumerate(lines, 1):
            if rules and any(rx.search(line) for rx in rules):
                out.append(line)
                skipped += 1
                continue
            newline = line
            for e in mp['global']:
                tgt = e.get('new_scope_b', e['new']) if sb else e['new']
                if e['old'] in newline:
                    per_variant[e['old']] += newline.count(e['old'])
                    newline = newline.replace(e['old'], tgt)
            for e in my_idents:
                if any(lo <= i <= hi for lo, hi in e.get('exclude_lines', [])):
                    skipped += 1
                    continue
                newline, n = re.subn(e['pattern'], e['new'], newline)
                if n:
                    per_ident[e['pattern']] = per_ident.get(e['pattern'], 0) + n
            if newline != line:
                changed = True
            out.append(newline)
        if changed:
            touched.append(path)
            if not a.dry_run:
                open(fp, 'w').write('\n'.join(out))
        if skipped:
            skipped_lines[path] = skipped

    # ---- req 11: manifest -------------------------------------------------------
    manifest = {
        'repo': repo,
        'renames_applied': planned_mvs, 'renames_preexisting': done_mvs,
        'files_touched': touched, 'per_variant_replacements': per_variant,
        'per_identifier_replacements': per_ident, 'skipped_line_counts': skipped_lines,
        'hand_edits': mp['hand_edits'] if repo == 'compiler' else mp['hand_edits_vault'],
    }
    mout = a.manifest_out or os.path.join(
        kit_dir, 'rename-manifest.json' if repo == 'compiler' else 'rename-manifest-vault.json')
    if not a.dry_run:
        json.dump(manifest, open(mout, 'w'), indent=1)
        open(mout, 'a').write('\n')

    mode = 'DRY-RUN' if a.dry_run else 'APPLIED'
    print(f"[{mode}] repo={repo} root={root}")
    print(f"  mv: {len(planned_mvs)} planned, {len(done_mvs)} already done")
    print(f"  files touched: {len(touched)}")
    for k, v in per_variant.items():
        print(f"  {k!r:<18} -> {v} replacement(s)")
    idtot = sum(per_ident.values())
    print(f"  identifier replacements: {idtot} across {len(per_ident)} pattern(s)")
    print(f"  exempt-skipped lines: {sum(skipped_lines.values())} in {len(skipped_lines)} file(s)")
    if not a.dry_run:
        print(f"  manifest: {mout}")

if __name__ == '__main__':
    main()
