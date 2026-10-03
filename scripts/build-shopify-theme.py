"""Package the static storefront as a Shopify theme. Output stays out of Git."""
from pathlib import Path
import json
import re
import zipfile

root = Path(__file__).resolve().parents[1]
source = root / 'site/dist'
output = root / 'release'
output.mkdir(exist_ok=True)
assert (source / 'config.js').exists(), 'Create local config.js first'
assert 'checkoutEnabled = false' in (source / 'checkout-policy.js').read_text()
files = {}
modules = list(source.glob('*.js')) + list((source / 'vendor/three').glob('*.js'))
modules = [p for p in modules if p.name != 'config.example.js']
module_names = {p.name for p in modules}
for p in modules:
    text = p.read_text()
    # Import maps keep every ES module on Shopify's versioned asset URLs.
    def replace_import(match):
        name = match.group(2).split('?')[0].split('/')[-1]
        assert name in module_names, name
        return match.group(1) + 'areas/' + name + match.group(3)
    text = re.sub(r"(['\"])(\./[^'\"]+\.js(?:\?[^'\"]*)?)(['\"])", replace_import, text)
    files['assets/' + p.name] = text
for name in ['style.css', 'favicon.svg']:
    files['assets/' + name] = (source / name).read_text()
files['assets/three-license.txt'] = (source / 'vendor/three/LICENSE').read_text()

html = (source / 'index.html').read_text()
head, body = html.split('<body>', 1)
head = head.rstrip().removesuffix('</head>')
head = head.replace('href="favicon.svg"', 'href="{{ \'favicon.svg\' | asset_url }}"')
head = re.sub(r'href="style.css[^\"]*"', 'href="{{ \'style.css\' | asset_url }}"', head)
imports = ',\n'.join(json.dumps('areas/' + n) + ': {{ ' + repr(n) + ' | asset_url | json }}' for n in sorted(module_names))
head += '\n<link rel="canonical" href="{{ canonical_url }}">\n{{ content_for_header }}\n'
head += '<script type="importmap">{"imports":{' + imports + '}}</script>\n</head>'
body = re.sub(r'<script type="module"[^>]*></script>', '', body)
body = body.replace('</body></html>', '').replace('href="#', 'href="/#')
files['snippets/areas-storefront.liquid'] = body
files['layout/theme.liquid'] = head + '<body>{{ content_for_layout }}\n<script type="module">import "areas/app.js"; import "areas/scene.js";</script></body></html>'
for template in ['index', 'product', 'collection', 'list-collections', 'cart', 'page', 'search', '404']:
    files[f'templates/{template}.liquid'] = "{% render 'areas-storefront' %}"
files['config/settings_schema.json'] = json.dumps([{'name':'theme_info','theme_name':'Areas 3D','theme_version':'1.0.0','theme_author':'Areas 3D','theme_documentation_url':'https://github.com/dannyaguilargil/areas3d','theme_support_url':'https://github.com/dannyaguilargil/areas3d/issues'}])
files['config/settings_data.json'] = '{"current":{}}'
files['locales/es.default.json'] = '{}'
archive = output / 'areas3d-v1-pago-no-habilitado.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    for name, text in files.items():
        assert not re.search(r'(shpat_|shpss_|shppa_|ghp_|github_pat_|BEGIN .*PRIVATE KEY)', text), name
        z.writestr(name, text)
print(f'{archive}: {len(files)} files')
