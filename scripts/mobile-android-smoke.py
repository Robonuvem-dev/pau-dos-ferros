"""Ensaio real: portal remoto, notícias nativas e menu; falhas de rede não passam."""
import pathlib
import re
import subprocess
import time
import xml.etree.ElementTree as ET

proof = pathlib.Path('mobile/proof')
proof.mkdir(exist_ok=True)

def adb(*args):
    return subprocess.run(['adb', *args], check=True, capture_output=True, timeout=40).stdout

def snapshot(name):
    adb('shell', 'uiautomator', 'dump', '/sdcard/window.xml')
    data = adb('shell', 'cat', '/sdcard/window.xml')
    (proof / (name + '.xml')).write_bytes(data)
    (proof / (name + '.png')).write_bytes(adb('exec-out', 'screencap', '-p'))
    return ET.fromstring(data)

def texts(root):
    return ' '.join(n.get('text', '') + ' ' + n.get('content-desc', '') for n in root.iter('node'))

def wait_screen(name, predicate):
    for attempt in range(18):
        root = snapshot(name)
        if predicate(texts(root)):
            return root
        time.sleep(5)
    raise RuntimeError('Tela não comprovada: ' + name + '. Consulte XML e screenshot do artefato.')

def tap(root, label):
    node = next(n for n in root.iter('node') if n.get('text') == label and n.get('clickable') == 'true')
    left, top, right, bottom = map(int, re.findall(r'\d+', node.get('bounds', '')))
    adb('shell', 'input', 'tap', str((left + right) // 2), str((top + bottom) // 2))

def portal_ready(text):
    lowered = text.lower()
    errors = ['webpage not available', 'err_name_not_resolved', 'this page didn\'t load', 'err_internet_disconnected']
    return ('prefeitura de pau dos ferros' in lowered or 'prefeitura municipal de pau dos ferros' in lowered) and not any(error in lowered for error in errors)

try:
    root = wait_screen('android-portal', portal_ready)
    assert 'PoC · dados fictícios' not in texts(root), 'Faixa nativa antiga ainda presente'
    for label in ['Portal', 'Notícias', 'Menu']:
        assert any(n.get('text') == label for n in root.iter('node')), label
    tap(root, 'Menu')
    root = wait_screen('android-menu', lambda text: 'Painel administrativo' in text and 'Transparência' in text)
    adb('shell', 'input', 'keyevent', '4')
    root = snapshot('android-retorno-portal')
    tap(root, 'Notícias')
    wait_screen('android-noticias', lambda text: 'Notícias de Pau dos Ferros' in text and 'Não foi possível' not in text)
finally:
    snapshot('android-final')
