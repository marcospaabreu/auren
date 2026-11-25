"""Bundle the pinned, self-contained Three.js module for classic-script loading.
No downloads and no runtime imports. Original sources and MIT license are kept.
Run from any directory; the script resides in <project>/scripts after installation.
"""
from pathlib import Path
import re
import hashlib

root = Path(__file__).resolve().parent.parent
site = root / 'site'
library = (site / 'assets/vendor/three.module.min.js').read_text(encoding='utf-8')
exports = re.search(r'export\s*\{([^}]+)\};?\s*$', library)
assert exports, 'Unexpected vendor module format; use a module bundler for another version.'
assert not re.search(r'^import\s', library, re.M), 'Vendor imports require a full module bundler.'
bindings=[]
for item in exports.group(1).split(','):
    pair=re.fullmatch(r'\s*([\w$]+)(?:\s+as\s+([\w$]+))?\s*',item)
    assert pair, f'Unsupported export: {item}'
    source,alias=pair.groups()
    bindings.append(f'{alias or source}:{source}')
source=(site/'watch-3d.js').read_text(encoding='utf-8')
import_line="import * as THREE from './assets/vendor/three.module.min.js';"
assert source.startswith(import_line), 'Unexpected application import.'
bundle="/* AUREN local bundle. Three.js MIT license: assets/vendor/three.LICENSE.txt */\n(()=>{\n'use strict';\nconst THREE=(()=>{\n" + library[:exports.start()] + '\nreturn {'+','.join(bindings)+'};\n})();\n' + source[len(import_line):] + '\n})();\n'
(site/'watch-3d.bundle.js').write_text(bundle,encoding='utf-8')
html=(site/'index.html').read_text(encoding='utf-8')
html=html.replace('<script type="module" src="watch-3d.js"></script>','<script src="watch-3d.bundle.js" defer></script>')
bundle_version=hashlib.sha256(bundle.encode('utf-8')).hexdigest()[:12]
css_version=hashlib.sha256((site/'watch-3d.css').read_bytes()).hexdigest()[:12]
html=re.sub(r'watch-3d\.bundle\.js(?:\?v=[a-f0-9]+)?', 'watch-3d.bundle.js?v='+bundle_version, html)
html=re.sub(r'watch-3d\.css(?:\?v=[a-f0-9]+)?', 'watch-3d.css?v='+css_version, html)
assert 'watch-3d.bundle.js' in html
(site/'index.html').write_text(html,encoding='utf-8')
print(f'Built classic-script bundle: {len(bundle.encode("utf-8")):,} bytes; {len(bindings)} vendor exports.')
