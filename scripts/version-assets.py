#!/usr/bin/env python3
"""Stamp styles.css / script.js links in every page with a content hash (?v=abc123),
so browsers fetch the new file right after a deploy instead of a cached copy.
Run from the repo root after editing styles.css or script.js:  python3 scripts/version-assets.py"""
import glob, hashlib, re, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
def short_hash(name):
    return hashlib.sha1((root / name).read_bytes()).hexdigest()[:8]

versions = {name: short_hash(name) for name in ("styles.css", "script.js")}
for page in glob.glob(str(root / "*.html")):
    text = pathlib.Path(page).read_text(encoding="utf-8")
    new = text
    for name, v in versions.items():
        new = re.sub(r'(["\'])' + re.escape(name) + r'(?:\?v=[0-9a-f]+)?\1', r'\g<1>' + name + '?v=' + v + r'\1', new)
    if new != text:
        pathlib.Path(page).write_text(new, encoding="utf-8")
print("versions:", versions)
