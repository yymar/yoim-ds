# Bouwt een @dsCard-pagina uit omgezette fragmenten (een per thema).
# Gebruik: python3 card.py <uit.html> <naam> <viewport> <subtitel> <fragment>...
import sys

out, name, viewport, subtitle, *fragments = sys.argv[1:]
parts = ''.join(f'<div class="vak">{open(f).read()}</div>' for f in fragments)
html = f'''<!-- @dsCard group="mone.yoim" viewport="{viewport}" name="{name}" subtitle="{subtitle}" -->
<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>{name} · mone.yoim</title>
<link rel="stylesheet" href="../styles.css">
<link rel="stylesheet" href="mone-tokens.css">
<style>body{{margin:0;display:flex;align-items:flex-start;width:max-content;background:#5f5f58}}.vak{{flex:0 0 auto}}.vak>div{{min-height:0!important}}</style>
</head><body>{parts}</body></html>
'''
open(out, 'w').write(html)
