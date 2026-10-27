"""Gera os arquivos de identidade a partir da imagem institucional autorizada.
Uso: python3 scripts/atualizar-brasao.py /caminho/brasao.png
Requer Pillow. Preserva a proporção do brasão em todas as plataformas.
"""
from pathlib import Path
import argparse
import json
import re
from PIL import Image, ImageOps

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('imagem', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
image = Image.open(args.imagem).convert('RGBA')
if image.width < 192 or image.height < 192:
    raise SystemExit('Forneça o brasão original com pelo menos 192 pixels em cada dimensão.')


def icon(size, destination, opaque=False):
    art = ImageOps.contain(image, (round(size * .88), round(size * .88)), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (size, size), 'white' if opaque else (255, 255, 255, 0))
    canvas.alpha_composite(art, ((size - art.width)//2, (size - art.height)//2))
    destination.parent.mkdir(parents=True, exist_ok=True)
    (canvas.convert('RGB') if opaque else canvas).save(destination)
    return canvas

public = root / 'public'
image.save(public / 'brasao-aurora.png')
icon(64, public / 'favicon.png')
icon(256, public / 'favicon.ico')
for size in [192, 512]:
    icon(size, public / f'app-icons/aurora-{size}.png')
icon(180, public / 'app-icons/aurora-apple.png', True)
for density, size in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
    icon(size, root / f'mobile/android/app/src/main/res/mipmap-{density}/ic_launcher.png', True)
icon(1024, root / 'mobile/ios/Resources/Assets.xcassets/AppIcon.appiconset/AppIcon.png', True)
manifest_path = public / 'manifest.webmanifest'
manifest = json.loads(manifest_path.read_text())
manifest['icons'] = [{'src': f'/app-icons/aurora-{size}.png', 'sizes': f'{size}x{size}', 'type': 'image/png', 'purpose':'any'} for size in [192,512]]
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
brand = root / 'src/lib/municipal-brand.ts'
source = brand.read_text()
source = re.sub(r'export const BRASAO_URL\s*=\s*"[^"]+";', 'export const BRASAO_URL = "/brasao-aurora.png";', source)
brand.write_text(source)
install = public / 'instalar.html'
html = install.read_text()
html = re.sub(r'https://thumb\.wikimedia\.org/[^"\s]+', '/brasao-aurora.png', html)
install.write_text(html)
print('Identidade atualizada no portal, favicon, manifesto, Android e iOS.')
