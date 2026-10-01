/* valentino guides · site data (shared by the homepage and the eight class welcome pages).
   Adding a guide: add a unit to its class in CLASSES (newest first), add the same link to the
   <noscript> list in index.html, and add an entry to FEATURES when a test is coming. */
"use strict";

/* FEATURES: upcoming tests, in date order. Expired ones drop off on their own; leave them.
   Optional note: one line on what the test covers. Optional end: last day of a multi-day test.
   Optional pin:true puts a live entry first in up next, ahead of earlier-dated ones; it still drops off after its date. */
const FEATURES=[
  {classId:"apush", title:"Unit 1/A study guide", url:"/apush-unit-1a", test:"2026-08-31", end:"2026-09-01"},
  {classId:"pre",   title:"Vectors + dot product study guide", url:"/precalc-vectors", test:"2026-08-31"},
  {classId:"mor",   title:"Ch 1–2 study guide", url:"/morality-ch1-2", test:"2026-09-02", end:"2026-09-03"},
  {classId:"mor",   title:"Ch 3 study guide", url:"/morality-ch3", test:"2026-10-01", note:"Law as a Guide to Freedom, vocab heavy, with a review game"},
  {classId:"bus",   title:"Unit 1 study guide", url:"/bus-unit-1", test:"2026-09-02", end:"2026-09-03"},
  {classId:"phys",  title:"Intro kinematics study guide", url:"/physics-intro-kinematics", test:"2026-09-02", end:"2026-09-03"},
  {classId:"psych", title:"Unit 0 study guide", url:"/psych-unit-0", test:"2026-09-02", end:"2026-09-03"},
  {classId:"pre",   title:"Vectors, ICF & trig equations study guide", url:"/precalc-vectors-icf-trig-eq", test:"2026-09-04"},
  {classId:"apush", title:"Unit 1/B study guide", url:"/apush-unit-1b", test:"2026-09-08", end:"2026-09-09"},
  {classId:"psych", title:"Unit 1.1–1.3 study guide", url:"/psych-unit-1-1-1-3", test:"2026-09-15", end:"2026-09-16", note:"Heredity and environment, the nervous system, the neuron and neural firing."},
  {classId:"apush", title:"Unit 1 LEQ study guide", url:"/apush-unit-1-leq", test:"2026-09-16", note:"In-class LEQ, 40 minutes. English colonization through King William's War."},
  {classId:"apush", title:"Unit 2/A study guide", url:"/apush-unit-2a", test:"2026-09-23", note:"25 questions, 17 minutes. Population and the Great Awakening through choosing sides (1774-75); acts of Parliament first."},
  {classId:"psych", title:"Unit 1.4–1.6 study guide", url:"/psych-unit-1-4-1-6", test:"2026-09-23", end:"2026-09-24", note:"The brain, sleep, and sensation, plus the Phineas Gage mini FRQs."},
  {classId:"pre",   title:"Complex numbers & trig form study guide", url:"/precalc-complex-trig-form", test:"2026-09-18", note:"Non-calculator quiz, 11 questions, 30 minutes. Complex arithmetic, trig/polar form, the Julia set."},
  {classId:"pre",   title:"Product, quotient & De Moivre's theorems study guide", url:"/precalc-theorems", test:"2026-09-24", pin:true, note:"Non-calculator quiz, 5 questions, 30 minutes. Product and quotient theorems, De Moivre's theorem, nth roots."},
  {classId:"phys",  title:"Advanced kinematics study guide", url:"/physics-advanced-kinematics", test:"2026-09-28", note:"50 minutes: sketch a graph, two problems, one derivation. Acceleration, kinematic equations, free fall, projectiles."},
  {classId:"psych", title:"Unit 1 exam study guide", url:"/psych-unit-1", test:"2026-09-29", end:"2026-10-01", note:"The full unit 1 exam: an AAQ plus 50 MCQs on modules 1.1 to 1.6, with unit 0 mixed in."},
  {classId:"bus",   title:"LPs 1-5 to 1-10 study guide", url:"/bus-unit-1-5-1-10", test:"2026-10-01", end:"2026-10-02", note:"High Exam #2: information management, operations and gross profit, business models, competition, trends, ownership types. Practice tests A and B in the exam’s own layout."},
  {classId:"pre",   title:"Polar unit test study guide", url:"/precalc-polar", test:"2026-10-01", note:"The whole unit: complex numbers, trig form, the theorems, polar equations and graphs. 25 problems, 2 with a calculator."},
  {classId:"apush", title:"Unit 2/B study guide", url:"/apush-unit-2b", test:"2026-10-02", note:"15 multiple choice + 1 SAQ, 25 minutes. Lexington and Concord through the Treaty of Paris (1783); Saratoga, the Second Continental Congress and the Declaration first."}
];

/* CLASSES: the eight classes this year, each with its welcome page (page) and its units, newest first.
   A unit is the guide plus optional extras (kind: "cram" | "pdf" | "quiz"). added = the day it went up;
   "new" shows for 7 days. A class with no units keeps its welcome page with an honest empty state.
   blurb: one line on the welcome page. short: the label printed on the class cover. */
const CLASSES=[
  {id:"apush", page:"/apush", c:"var(--c-apush)", glyph:"flag", name:"AP US History", abbr:"APUSH", short:"US HISTORY",
   blurb:"Connect the events to the argument. Study the units, then put the evidence to work.", units:[
     {t:"Unit 2/B", url:"/apush-unit-2b", added:"2026-10-01",
      extras:[{kind:"pdf", t:"practice test", url:"/apush-unit-2b-practice.pdf"}]},
     {t:"Unit 2/A", url:"/apush-unit-2a", added:"2026-09-21"},
     {t:"Unit 1 LEQ", url:"/apush-unit-1-leq", added:"2026-09-13"},
     {t:"Unit 1/B", url:"/apush-unit-1b", added:"2026-09-07"},
     {t:"Unit 1/A", url:"/apush-unit-1a", added:"2026-08-29"}]},
  {id:"lang", page:"/lang", c:"var(--c-lang)", glyph:"nib", name:"AP English Language and Composition", abbr:"AP Lang", short:"ENGLISH LANGUAGE",
   blurb:"Read closely. Follow the argument. Make your own language do more.", units:[]},
  {id:"phys", page:"/physics", c:"var(--c-phys)", glyph:"atom", name:"AP Physics 1", abbr:"Physics", short:"PHYSICS",
   blurb:"Sketch the motion before solving it. From introductory to advanced kinematics.", units:[
     {t:"Advanced kinematics", url:"/physics-advanced-kinematics", added:"2026-09-27", extras:[
        {kind:"pdf", t:"version 1", url:"/physics-advanced-kinematics-version-1.pdf"},
        {kind:"pdf", t:"version 2", url:"/physics-advanced-kinematics-version-2.pdf"},
        {kind:"pdf", t:"version 3", url:"/physics-advanced-kinematics-version-3.pdf"},
        {kind:"pdf", t:"version 4", url:"/physics-advanced-kinematics-version-4.pdf"},
        {kind:"pdf", t:"version 5", url:"/physics-advanced-kinematics-version-5.pdf"},
        {kind:"pdf", t:"version 6", url:"/physics-advanced-kinematics-version-6.pdf"}]},
     {t:"Intro kinematics", url:"/physics-intro-kinematics", added:"2026-09-01"}]},
  {id:"psych", page:"/psych", c:"var(--c-psych)", glyph:"head", name:"AP Psychology", abbr:"Psych", short:"PSYCHOLOGY",
   blurb:"From biological bases to behavior. Make the vocabulary stick by putting it in context.", units:[
     {t:"Unit 1 exam", url:"/psych-unit-1", added:"2026-09-25"},
     {t:"Unit 1.4–1.6", url:"/psych-unit-1-4-1-6", added:"2026-09-23"},
     {t:"Unit 1.1–1.3", url:"/psych-unit-1-1-1-3", added:"2026-09-15"},
     {t:"Unit 0", url:"/psych-unit-0", added:"2026-09-01"}]},
  {id:"sem", page:"/seminar", c:"var(--c-sem)", glyph:"bubbles", name:"AP Seminar", abbr:"Seminar", short:"SEMINAR",
   blurb:"Start with a question. Look at the evidence. Build a perspective you can defend.", units:[]},
  {id:"bus", page:"/business", c:"var(--c-biz)", glyph:"chart", name:"Business Principles", abbr:"Business", short:"BUSINESS",
   blurb:"Turn business vocabulary into a working understanding of choices, markets and organizations.", units:[
     {t:"LPs 1-5 to 1-10", url:"/bus-unit-1-5-1-10", added:"2026-09-24", extras:[
        {kind:"pdf", t:"practice test a", url:"/bus-unit-1-5-1-10-practice-a.pdf"},
        {kind:"pdf", t:"practice test b", url:"/bus-unit-1-5-1-10-practice-b.pdf"}]},
     {t:"Unit 1", url:"/bus-unit-1", added:"2026-09-01", extras:[{kind:"cram", t:"cram sheet", url:"/bus-unit-1-cram"}]}]},
  {id:"mor", page:"/morality", c:"var(--c-mor)", glyph:"cross", name:"Catholic Morality and Social Justice", abbr:"Morality", short:"MORALITY",
   blurb:"Think through moral choices, human dignity, and the responsibility we share with one another.", units:[
     {t:"Ch 3", url:"/morality-ch3", added:"2026-09-24", extras:[{kind:"pdf", t:"practice quiz A", url:"/morality-ch3-practice-a.pdf"},{kind:"quiz", t:"jeopardy", url:"/morality-ch3-jeopardy"}]},
     {t:"Ch 1–2", url:"/morality-ch1-2", added:"2026-09-01", extras:[{kind:"cram", t:"cram sheet", url:"/morality-ch1-2-cram"}]}]},
  {id:"pre", page:"/precalc", c:"var(--c-pre)", glyph:"curve", name:"Honors Precalculus BC", abbr:"Precalc", short:"PRECALCULUS",
   blurb:"Find the pattern, draw the connection. Complex numbers, trig form, polar graphs and vectors.", units:[
     {t:"Polar unit test", url:"/precalc-polar", added:"2026-09-29", extras:[
        {kind:"pdf", t:"practice a", url:"/precalc-polar-practice-a.pdf"},
        {kind:"pdf", t:"practice b", url:"/precalc-polar-practice-b.pdf"},
        {kind:"pdf", t:"practice c", url:"/precalc-polar-practice-c.pdf"},
        {kind:"pdf", t:"practice d", url:"/precalc-polar-practice-d.pdf"},
        {kind:"pdf", t:"practice e", url:"/precalc-polar-practice-e.pdf"},
        {kind:"pdf", t:"practice f", url:"/precalc-polar-practice-f.pdf"},
        {kind:"cram", t:"cram sheet", url:"/precalc-polar-cram.pdf"}]},
     {t:"Product, quotient & De Moivre's theorems", url:"/precalc-theorems", added:"2026-09-23", extras:[
        {kind:"pdf", t:"practice a", url:"/precalc-theorems-practice-a.pdf"},
        {kind:"pdf", t:"practice b", url:"/precalc-theorems-practice-b.pdf"},
        {kind:"pdf", t:"practice c", url:"/precalc-theorems-practice-c.pdf"},
        {kind:"pdf", t:"all quizzes + keys", url:"/precalc-theorems-quizzes.pdf"}]},
     {t:"Complex numbers & trig form", url:"/precalc-complex-trig-form", added:"2026-09-17", extras:[
        {kind:"pdf", t:"practice a", url:"/precalc-complex-trig-form-practice-a.pdf"},
        {kind:"pdf", t:"practice b", url:"/precalc-complex-trig-form-practice-b.pdf"},
        {kind:"pdf", t:"practice c", url:"/precalc-complex-trig-form-practice-c.pdf"},
        {kind:"pdf", t:"all quizzes + memorize sheet", url:"/precalc-complex-trig-form-quizzes.pdf"}]},
     {t:"Vectors, ICF & trig equations", url:"/precalc-vectors-icf-trig-eq", added:"2026-09-03", extras:[
        {kind:"pdf", t:"practice a", url:"/precalc-vectors-icf-trig-eq-practice-a.pdf"},
        {kind:"pdf", t:"practice b", url:"/precalc-vectors-icf-trig-eq-practice-b.pdf"},
        {kind:"quiz", t:"quizzes", url:"/precalc-quizzes"}]},
     {t:"Vectors + dot product", url:"/precalc-vectors", added:"2026-08-30"}]}
];

/* line glyphs, one per class */
const G={
 flag:'<path d="M7 22V5"/><path d="M7 6.4h10.5c.8 0 1.2.9.7 1.5L16 10l2.2 2.1c.5.6.1 1.5-.7 1.5H7"/>',
 nib:'<path d="M6 22 9.3 15"/><path d="M9 15.4 17.4 5.2c.5-.6 1.4-.5 1.8.1l1.2 2c.3.6.1 1.4-.5 1.7L8.6 14.9"/><path d="M11.6 10.4 15 12.4"/>',
 head:'<path d="M18.4 20.4v-2.6h1.9c.7 0 1.1-.7.8-1.3l-1.6-3a7.2 7.2 0 1 0-6.8 4.2"/><path d="M9.2 21v-3.3"/>',
 atom:'<circle cx="13.5" cy="13.5" r="2"/><ellipse cx="13.5" cy="13.5" rx="9" ry="3.6"/><ellipse cx="13.5" cy="13.5" rx="9" ry="3.6" transform="rotate(60 13.5 13.5)"/><ellipse cx="13.5" cy="13.5" rx="9" ry="3.6" transform="rotate(120 13.5 13.5)"/>',
 curve:'<path d="M5 5v16h16"/><path d="M7.5 18.6c3.2 0 3.6-9.4 6.6-9.4 2.6 0 3.3 6 6.6 6"/>',
 bubbles:'<path d="M4.6 8.2a2 2 0 0 1 2-2h8.6a2 2 0 0 1 2 2v4.4a2 2 0 0 1-2 2h-4l-3.4 2.7v-2.7h-1.2a2 2 0 0 1-2-2z"/><path d="M19.2 10.6h.4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-.6v2.4l-2.9-2.4"/>',
 chart:'<path d="M5 5v16h16"/><rect x="8.4" y="13" width="3" height="5.2" rx=".8"/><rect x="13.4" y="9.6" width="3" height="8.6" rx=".8"/><rect x="18.4" y="6.4" width="3" height="11.8" rx=".8"/>',
 cross:'<path d="M13 4.6v17"/><path d="M7.4 10.2h11.2"/>'
};
