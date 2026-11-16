import os,sys
d=os.path.dirname(os.path.abspath(__file__))
src=os.path.join(d,'src')
head=open(os.path.join(src,'head.html')).read()
files=[l.strip() for l in open(os.path.join(src,'MANIFEST.txt')) if l.strip() and not l.startswith('#')]
on_disk=set()
for r,_,fs in os.walk(src):
    for f in fs:
        if f.endswith('.js'): on_disk.add(os.path.relpath(os.path.join(r,f),src))
missing=on_disk-set(files)
if missing: print('WARNING: .js files not in MANIFEST:', sorted(missing))
parts=[(f,open(os.path.join(src,f)).read()) for f in files]
js=''.join(p+'\n' for _,p in parts)
open(os.path.join(d,'index.html'),'w').write(head+js+'</script>\n</body>\n</html>\n')
open('/tmp/hh.js','w').write(js)
print('built', len(head)+len(js), 'bytes')
if '--size' in sys.argv:
    for f,p in sorted(parts,key=lambda x:-len(x[1])): print(f'  {len(p):>8}  {f}')
    print(f'  budget: {len(head)+len(js)} / 1200000 bytes ({(len(head)+len(js))/12000:.1f}%)')
if '--min' in sys.argv:
    # M4-D6: separate minified build; index.html above is untouched.
    sys.path.insert(0,d); import minify
    mhead=minify.html(head); mjs=minify.js(js)
    mout=mhead+mjs+'</script>\n</body>\n</html>\n'
    open(os.path.join(d,'index.min.html'),'w').write(mout)
    open('/tmp/hh.min.js','w').write(mjs)
    B=lambda x:len(x.encode('utf-8'))
    full=B(head+js+'</script>\n</body>\n</html>\n'); mb=B(mout)
    print(f'min: head {B(head)} -> {B(mhead)} B, js {B(js)} -> {B(mjs)} B')
    print(f'min: index.html {full} B -> index.min.html {mb} B ({100*mb/full:.1f}%, saved {full-mb} B)')
