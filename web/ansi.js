const ANSI = {}

ANSI.esc = '\x1B'
ANSI.ctl = '\x5B'
ANSI.seq = ANSI.esc + ANSI.ctl

ANSI.mov = {
  h: ANSI.seq + '\x48',
  b: '\x08',
  u: (x) => ANSI.seq + x + '\x41',
  d: (x) => ANSI.seq + x + '\x42',
  r: (x) => ANSI.seq + x + '\x43',
  l: (x) => ANSI.seq + x + '\x44',
  sav: ANSI.esc + '7',
  res: ANSI.esc + '8',
  db: (x) => ANSI.seq + x + '\x45',
  ub: (x) => ANSI.seq + x + '\x46'
}

ANSI.erase = {
  disp: ANSI.seq + '\x4B',
  line: ANSI.seq + '\x4B'
}

ANSI.key = {
  insert: (x, d) => ANSI.mov.sav + ANSI.mov.l(x) + ANSI.erase.line + d + ANSI.mov.res + ANSI.mov.r(1),
  return: ANSI.mov.db(1)
}
