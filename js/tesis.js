// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  var get_event_by_label, get_events_by_labels, set_transitions, show_bfs, show_dfs, show_events, show_modules, show_modules_transitions, show_states, show_transitions;

  show_events = function() {
    console.log('Events:');
    return console.table(DES.E());
  };

  show_states = function(m) {
    console.log('States of module', m.name);
    return console.table(m.X());
  };

  show_transitions = function(m) {
    console.log('Transitions of module', m.name);
    return console.table(m.T.transitions().map(function(v) {
      return {
        from: v[0],
        event: DES.E.labels.get(v[1]),
        to: v[2]
      };
    }));
  };

  show_modules = function() {
    console.log('Modules:');
    console.table(DES.modules);
  };

  show_modules_transitions = function() {
    var m, _i, _len, _ref;

    _ref = DES.modules;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      m = _ref[_i];
      show_transitions(m);
    }
  };

  show_dfs = function(m) {
    console.log('Depth-First Search of module', m.name);
    DES.DFS(m, function(q, e, p) {
      console.log(q, DES.E.labels.get(e), p);
      return true;
    });
  };

  show_bfs = function(m) {
    console.log('Breadth-First Search of module', m.name);
    DES.BFS(m, function(q, e, p) {
      console.log(q, DES.E.labels.get(e), p);
    });
  };

  get_event_by_label = function(label) {
    var i;

    i = DES.E.size();
    while (i-- > 0) {
      if (DES.E.labels.get(i) === label) {
        break;
      }
    }
    return i;
  };

  get_events_by_labels = function(labels) {
    var label, _i, _len, _results;

    _results = [];
    for (_i = 0, _len = labels.length; _i < _len; _i++) {
      label = labels[_i];
      _results.push(get_event_by_label(label));
    }
    return _results;
  };

  set_transitions = function(m, transitions) {
    var eid, i, t, _i, _len;

    for (_i = 0, _len = transitions.length; _i < _len; _i++) {
      t = transitions[_i];
      if ((eid = get_event_by_label(t[1])) >= 0) {
        m.T.transitions.set(m.T.add(), t[0], eid, t[2]);
      } else {
        console.log('Error:', t[1], 'labels not found');
      }
    }
    i = 1 + m.T.transitions.max_state();
    while (i-- > 0) {
      m.X.add();
    }
    return m;
  };

  (function() {
    var E, e, events, i, key, _i, _len;

    events = [
      {
        labels: 'do_hi',
        observable: true
      }, {
        labels: 'do_lo',
        observable: true
      }, {
        labels: 'r_hi'
      }, {
        labels: 'r_lo'
      }, {
        labels: 'f0',
        fault: true
      }, {
        labels: 'c_hi'
      }, {
        labels: 'c_lo'
      }, {
        labels: 'v_mo'
      }, {
        labels: 'v_mc'
      }, {
        labels: 'v_op_hi'
      }, {
        labels: 'v_op_lo'
      }, {
        labels: 'v_cl_hi'
      }, {
        labels: 'v_cl_lo'
      }
    ];
    E = DES.E;
    for (_i = 0, _len = events.length; _i < _len; _i++) {
      e = events[_i];
      i = E.add();
      for (key in e) {
        E[key].set(i, e[key]);
      }
    }
    set_transitions(DES.add_module('DO'), [[0, 'do_hi', 1], [0, 'do_lo', 0], [1, 'do_hi', 1], [1, 'do_lo', 0]]);
    return set_transitions(DES.add_module('Relay'), [[0, 'r_hi', 1], [0, 'r_lo', 0], [1, 'r_hi', 1], [1, 'r_lo', 0], [0, 'f0', 2], [1, 'f0', 2], [2, 'r_lo', 2]]);
  });

  (function() {
    var E, e, events, i, key, m, _i, _len;

    events = [
      {
        labels: '1_hi'
      }, {
        labels: '1_lo'
      }, {
        labels: '1_f0'
      }, {
        labels: '1_f1'
      }, {
        labels: '2_hi'
      }, {
        labels: '2_lo'
      }
    ];
    E = DES.E;
    for (_i = 0, _len = events.length; _i < _len; _i++) {
      e = events[_i];
      i = E.add();
      for (key in e) {
        E[key].set(i, e[key]);
      }
    }
    set_transitions(m = DES.add_module('DO'), [[0, '1_hi', 1], [0, '1_lo', 0], [1, '1_hi', 1], [1, '1_lo', 0]]);
    set_transitions(m = DES.add_module('DO'), [[0, '2_hi', 1], [0, '2_lo', 0], [1, '2_hi', 1], [1, '2_lo', 0]]);
    set_transitions(m = DES.add_module('DO2DO'), [[0, '2_lo', 0], [0, '1_lo', 0], [0, '1_hi', 1], [1, '2_hi', 1], [1, '1_hi', 1], [1, '1_lo', 0], [1, '2_lo', 2], [2, '2_lo', 2], [2, '1_lo', 2], [2, '1_hi', 2], [0, '2_hi', 3], [3, '2_hi', 3], [3, '1_lo', 3], [3, '1_hi', 3]]);
    m.X.marked.set(2);
    return m.X.marked.set(3);
  });

  (function() {
    var E, e, events, i, key, m, _i, _len;

    events = [
      {
        labels: 'open'
      }, {
        labels: 'close'
      }, {
        labels: 'move'
      }, {
        labels: 'reset'
      }, {
        labels: 'tout'
      }, {
        labels: 'light_on'
      }, {
        labels: 'light_of'
      }, {
        labels: 'enter'
      }, {
        labels: 'exit'
      }
    ];
    E = DES.E;
    for (_i = 0, _len = events.length; _i < _len; _i++) {
      e = events[_i];
      i = E.add();
      for (key in e) {
        E[key].set(i, e[key]);
      }
    }
    set_transitions(DES.add_module('Door'), [[0, 'open', 1], [1, 'close', 0]]);
    set_transitions(m = DES.add_module('Light'), [[0, 'light_on', 1], [1, 'tout', 2], [2, 'light_on', 1], [2, 'light_of', 0]]);
    m.X.marked.set(1);
    m.X.marked.set(2);
    return set_transitions(DES.add_module('Door-Sensor-Light'), [[0, 'open', 1], [0, 'close', 1], [1, 'light_on', 0]]);
  });

  (function() {
    var events, make_2states_automaton, make_2states_automaton_faulty, make_3states_automaton, make_cause_effect_automaton, make_compleate_valve, make_valve_automaton, put_events_to_system;

    events = [];
    put_events_to_system = function(events) {
      var E, e, i, key, _i, _len;

      E = DES.E;
      for (_i = 0, _len = events.length; _i < _len; _i++) {
        e = events[_i];
        i = E.add();
        for (key in e) {
          E[key].set(i, e[key]);
        }
      }
      return null;
    };
    put_events_to_system(events);
    make_valve_automaton = function(name) {
      var m;

      events = [
        {
          labels: name + '_open'
        }, {
          labels: name + '_closed'
        }, {
          labels: name + '_stoped'
        }, {
          labels: name + '_opening'
        }, {
          labels: name + '_closing'
        }
      ];
      put_events_to_system(events);
      m = set_transitions(DES.add_module(name), [[0, name + '_opening', 1], [1, name + '_opening', 1], [1, name + '_open', 2], [2, name + '_open', 2], [2, name + '_closing', 3], [3, name + '_closing', 3], [3, name + '_closed', 0], [0, name + '_closed', 0], [1, name + '_stoped', 4], [3, name + '_stoped', 4], [4, name + '_stoped', 4], [4, name + '_opening', 1], [4, name + '_closing', 3]]);
      return m;
    };
    make_2states_automaton = function(name, observable) {
      var e, m, _i, _len;

      if (observable == null) {
        observable = false;
      }
      events = [
        {
          labels: name + '_lo'
        }, {
          labels: name + '_hi'
        }
      ];
      if (observable) {
        for (_i = 0, _len = events.length; _i < _len; _i++) {
          e = events[_i];
          e.observable = true;
        }
      }
      put_events_to_system(events);
      m = set_transitions(DES.add_module(name), [[0, name + '_lo', 0], [0, name + '_hi', 1], [1, name + '_hi', 1], [1, name + '_lo', 0]]);
      return m;
    };
    make_2states_automaton_faulty = function(name, observable) {
      var m;

      if (observable == null) {
        observable = false;
      }
      events = [
        {
          labels: name + '_lo',
          observable: true
        }, {
          labels: name + '_hi',
          observable: true
        }, {
          labels: name + '_f0',
          fault: true
        }, {
          labels: 'tout',
          observable: true
        }
      ];
      put_events_to_system(events);
      m = set_transitions(DES.add_module(name), [[0, name + '_lo', 0], [0, name + '_hi', 1], [1, name + '_hi', 1], [1, name + '_lo', 0], [0, name + '_f0', 2], [1, name + '_f0', 2], [2, name + '_lo', 2], [2, 'tout', 2]]);
      return m;
    };
    make_3states_automaton = function(name) {
      var m;

      events = [
        {
          labels: name + '_a_lo',
          observable: true
        }, {
          labels: name + '_a_hi',
          observable: true
        }, {
          labels: name + '_b_lo',
          observable: true
        }, {
          labels: name + '_b_hi',
          observable: true
        }
      ];
      put_events_to_system(events);
      m = set_transitions(DES.add_module(name), [[0, name + '_a_lo', 0], [0, name + '_b_lo', 0], [0, name + '_a_hi', 1], [1, name + '_a_hi', 1], [1, name + '_b_lo', 1], [1, name + '_a_lo', 0], [0, name + '_b_hi', 2], [2, name + '_b_hi', 2], [2, name + '_a_lo', 2], [2, name + '_b_lo', 0]]);
      return m;
    };
    make_cause_effect_automaton = function(name1, name2, events) {
      var m;

      if (events.length !== 4) {
        return;
      }
      m = set_transitions(DES.add_module(name1 + '-' + name2), [[0, name2 + '_' + events[3], 0], [1, name2 + '_' + events[1], 1], [0, name1 + '_' + events[0], 1], [1, name1 + '_' + events[0], 1], [1, name1 + '_' + events[2], 0], [0, name1 + '_' + events[2], 0]]);
      return m;
    };
    make_compleate_valve = function(name) {
      var a, aa, ab, sc, so, v;

      v = name;
      sc = v + 'sc';
      so = v + 'so';
      a = v + 'a';
      aa = v + 'a_a';
      ab = v + 'a_b';
      make_valve_automaton(v);
      make_2states_automaton(sc);
      make_2states_automaton(so);
      make_cause_effect_automaton(v, sc, ['closed', 'hi', 'opening', 'lo']);
      make_cause_effect_automaton(v, so, ['open', 'hi', 'closing', 'lo']);
      make_3states_automaton(a);
      make_cause_effect_automaton(aa, v, ['hi', 'opening', 'lo', 'stoped']);
      return make_cause_effect_automaton(ab, v, ['hi', 'closing', 'lo', 'stoped']);
    };
    make_2states_automaton('LT1', true);
    make_2states_automaton('A');
    make_2states_automaton('B');
    set_transitions(DES.add_module('Technology'), [[0, 'A_lo', 0], [0, 'A_hi', 1], [1, 'B_lo', 2], [2, 'B_hi', 3], [3, 'B_lo', 4], [4, 'B_hi', 0], [3, 'A_lo', 5]]).X.faulty.set(5);
    return make_cause_effect_automaton('A', 'LT1', ['hi', 'hi', 'lo', 'lo']);
  })();

  show_events();

  (function() {
    var cnt, dt, i, ix, m, ms, number_of_modules, observed, s, start, stop, sync, sys, table;

    sync = function(m1, m2) {
      var common;

      common = DES.get_common_events(m1, m2);
      return DES.sync(m1, m2, common);
    };
    number_of_modules = DES.modules.length;
    console.log(number_of_modules, 'modules in DES');
    if (number_of_modules < 1) {
      return;
    }
    sys = DES.modules[0];
    start = window.performance.now();
    stop = start;
    table = [];
    cnt = 2;
    ix = 1;
    while (ix < number_of_modules) {
      start = stop;
      sys = sync(DES.modules[ix], sys);
      ix++;
      stop = window.performance.now();
      dt = stop - start;
      s = (dt / 1000) | 0;
      m = (s / 60) | 0;
      s -= m * 60;
      ms = (dt - ((m * 60) + s) * 1000) | 0;
      console.log(cnt++, 'X:', sys.X.size(), 'T:', sys.T.size(), 'm:', m, 's:', s, 'ms:', ms);
      table.push({
        X: sys.X.size(),
        T: sys.T.size(),
        'm:s.ms': m + ':' + s + '.' + ms
      });
      if (m > 5) {
        console.log('Interruped due to the time limit');
        console.table(table);
        return;
      }
    }
    console.table(table);
    observed = [];
    i = DES.E.size();
    while (i-- > 0) {
      if (DES.E.observable.get(i)) {
        observed.push(i);
      }
    }
    console.log(observed.map(function(e) {
      return DES.E.labels.get(e);
    }));
    return DES.modules.push(sys);
  });

}).call(this);
