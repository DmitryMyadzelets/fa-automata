
# Backup code from 'tesis.coffee' file

#  Benchmark for parallel composition

sync = (m1, m2) ->
    # common = find_common_events(m1, m2)
    common = []
    # console.log 'Common events:', common
    DES.sync(m1, m2, common)


sys = DES.modules[ix]
cnt = 2
console.log 'Parallel composition'

start = window.performance.now()
stop = start

table = []

foo = () ->
    start = stop
    sys = sync(DES.modules[ix], sys)
    stop = window.performance.now()

    dt = stop - start
    s = (dt/1000)|0
    m = (s/60)|0
    s -= m*60
    ms = (dt - ((m*60)+s)*1000)|0
    console.log cnt++, 'X:', sys.X.size(), 'T:', sys.T.size(), 'm:', m, 's:', s, 'ms:', ms

    table.push({
        X: sys.X.size()
        T: sys.T.size()
        'm:s.ms': m + ':' + s + '.' + ms
            })

    if (m>0)
        console.log 'Interruped due to the time limit'
        return true

    null


for i in [0..3]
    break if foo()

console.table(table)
