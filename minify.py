"""Conservative pure-Python minifier for HOLLOW HOUR (build.py --min).
JS: strips comments, drops indentation/blank lines, collapses spaces; strings,
template literals (with nested ${}) and regex literals are copied verbatim.
Newlines are kept (ASI-safe) except after { ; , or before } where removal can't
change meaning. CSS: strips /* */ and collapses whitespace. HTML: strips indent."""
import re
W=set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$\\')
RE_KW={'return','typeof','instanceof','in','of','new','delete','void','throw','case','do','else','yield','await'}
def _need_space(a,b):
    if not a or not b: return False
    if (a in W or ord(a)>127) and (b in W or ord(b)>127): return True
    if a+b in ('++','--','+-'[:0]) or (a=='+' and b=='+') or (a=='-' and b=='-'): return True
    if a=='/' or b=='/': return True
    if a=='.' and b.isdigit(): return True
    if a.isdigit() and b=='.': return True
    return False
def js(src):
    out=[]; i=0; n=len(src)
    last=''          # last significant emitted char
    lastword=''      # last identifier/keyword emitted (for regex detection)
    pend=None        # pending whitespace: None, ' ' or '\n'
    stack=[]         # template-literal brace depth stack
    depth=0
    def emit(s):
        nonlocal pend,last
        if pend is not None and out:
            if pend=='\n':
                if last in '{;,' or s[0]=='}': 
                    if _need_space(last,s[0]): out.append(' ')
                else: out.append('\n')
            elif _need_space(last,s[0]): out.append(' ')
        pend=None
        out.append(s); last=s[-1]
    def regex_ok():
        if not last: return True
        if last in W or ord(last)>127:
            return lastword in RE_KW
        return last not in ')]}'
    while i<n:
        c=src[i]
        if c in ' \t\r\n':
            j=i
            while j<n and src[j] in ' \t\r\n': j+=1
            ws=src[i:j]
            if '\n' in ws: pend='\n'
            elif pend is None: pend=' '
            i=j; continue
        if c=='/' and i+1<n and src[i+1]=='/':
            j=src.find('\n',i)
            i=n if j<0 else j
            continue
        if c=='/' and i+1<n and src[i+1]=='*':
            j=src.find('*/',i+2); assert j>=0
            if '\n' in src[i:j]: pend='\n'
            elif pend is None: pend=' '
            i=j+2; continue
        if c in '"\'':
            j=i+1
            while src[j]!=c:
                if src[j]=='\\': j+=1
                elif src[j]=='\n': raise ValueError('newline in string at %d'%i)
                j+=1
            emit(src[i:j+1]); lastword=''; i=j+1; continue
        if c=='`' or (c=='}' and stack and stack[-1]==depth):
            if c=='}': stack.pop()
            j=i+1
            while True:
                if src[j]=='\\': j+=2; continue
                if src[j]=='`': j+=1; break
                if src[j]=='$' and src[j+1]=='{': j+=2; stack.append(depth); break
                j+=1
            emit(src[i:j]); lastword=''
            if src[j-1]=='{': last='{'
            i=j; continue
        if c=='/' and regex_ok():
            j=i+1; cls=False
            while True:
                ch=src[j]
                if ch=='\\': j+=2; continue
                if ch=='\n': raise ValueError('newline in regex at %d'%i)
                if cls:
                    if ch==']': cls=False
                elif ch=='[': cls=True
                elif ch=='/': break
                j+=1
            j+=1
            while j<n and (src[j] in W): j+=1
            emit(src[i:j]); lastword=''; i=j; continue
        if c in W or ord(c)>127:
            j=i
            while j<n and (src[j] in W or ord(src[j])>127): j+=1
            # numbers like 1.5e-3 : take . and exponent sign
            tok=src[i:j]
            if tok[0].isdigit():
                while j<n and (src[j] in W or src[j]=='.' or (src[j] in '+-' and src[j-1] in 'eE' and not tok.lower().startswith('0x'))): j+=1
                tok=src[i:j]
            emit(tok); lastword=tok; i=j; continue
        if c=='{': depth+=1
        elif c=='}': depth-=1
        emit(c); lastword=''; i+=1
    return ''.join(out)+'\n'
def css(s):
    s=re.sub(r'/\*.*?\*/','',s,flags=re.S)
    s=re.sub(r'\s+',' ',s)
    s=re.sub(r'\s*([{};,>])\s*',r'\1',s)
    s=re.sub(r';}','}',s)
    return s.strip()
def html(head):
    """head.html = markup + <style>..</style> + markup + opening <script>."""
    def st(m): return '<style>'+css(m.group(1))+'</style>'
    head=re.sub(r'<style>(.*?)</style>',st,head,flags=re.S)
    head=re.sub(r'<!--.*?-->','',head,flags=re.S)
    lines=[l.strip() for l in head.split('\n')]
    return '\n'.join(l for l in lines if l)+'\n'
