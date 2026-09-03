from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

old_css = ".app-splash-logo {\n  width: 132px;\n  height: 132px;\n  border-radius: 30px;\n  object-fit: cover;\n  box-shadow: 0 10px 28px rgba(14,165,233,.16);\n  animation: appSplashPulse 1.25s ease-in-out infinite;\n}"
new_css = ".app-splash-mark {\n  width: 92px;\n  height: 92px;\n  border-radius: 24px;\n  display: grid;\n  place-items: center;\n  background: linear-gradient(145deg, #0ea5e9, #2563eb 58%, #1e40af);\n  border: 1px solid rgba(255,255,255,.22);\n  box-shadow: 0 14px 34px rgba(37,99,235,.22), inset 0 1px 0 rgba(255,255,255,.20);\n  animation: appSplashFloat 1.8s ease-in-out infinite;\n}\n.app-splash-mark svg {\n  width: 50px;\n  height: 50px;\n  display: block;\n  filter: drop-shadow(0 2px 5px rgba(0,0,0,.12));\n}"
if old_css not in s:
    raise SystemExit('old splash logo css not found')
s = s.replace(old_css, new_css, 1)

s = s.replace("@keyframes appSplashPulse {\n  0%,100% { transform: scale(1); }\n  50% { transform: scale(1.035); }\n}", "@keyframes appSplashFloat {\n  0%,100% { transform: translateY(0) scale(1); }\n  50% { transform: translateY(-3px) scale(1.015); }\n}", 1)

old_img = '    <img class="app-splash-logo" src="./IMG_4289.png" alt="">'
new_mark = '''    <div class="app-splash-mark" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="8" width="36" height="48" rx="8" stroke="white" stroke-width="4"/>
        <rect x="21" y="15" width="22" height="10" rx="3" fill="white" fill-opacity=".96"/>
        <circle cx="23" cy="35" r="3" fill="white"/>
        <circle cx="32" cy="35" r="3" fill="white"/>
        <circle cx="41" cy="35" r="3" fill="white"/>
        <circle cx="23" cy="45" r="3" fill="white"/>
        <circle cx="32" cy="45" r="3" fill="white"/>
        <rect x="38" y="42" width="6" height="6" rx="2" fill="white"/>
      </svg>
    </div>'''
if old_img not in s:
    raise SystemExit('splash img not found')
s = s.replace(old_img, new_mark, 1)

old_dark = "@media (prefers-color-scheme: dark) {\n  #app-splash { background: #0f172a; }\n  .app-splash-title { color: #e0f2fe; }\n  .app-splash-loader { background: rgba(56,189,248,.18); }\n  .app-splash-loader::after { background: #38bdf8; }\n}"
new_dark = "@media (prefers-color-scheme: dark) {\n  #app-splash { background: #0b1220; }\n  .app-splash-title { color: #f1f5f9; }\n  .app-splash-mark { background: linear-gradient(145deg, #2563eb, #1d4ed8 58%, #1e3a8a); border-color: rgba(147,197,253,.22); box-shadow: 0 14px 36px rgba(30,64,175,.26), inset 0 1px 0 rgba(255,255,255,.14); }\n  .app-splash-loader { background: rgba(96,165,250,.15); }\n  .app-splash-loader::after { background: #60a5fa; }\n}"
if old_dark not in s:
    raise SystemExit('old dark splash css not found')
s = s.replace(old_dark, new_dark, 1)

p.write_text(s, encoding='utf-8')
