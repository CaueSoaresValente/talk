const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

function seedExercises() {
  const count = db.prepare('SELECT COUNT(*) as c FROM exercises').get().c;
  if (count > 0) return; // Already seeded

  const exercises = [
    // BEGINNER - Multiple Choice
    { type: 'multiple_choice', level: 'beginner', question: 'What is the correct article? "___ apple"', options: JSON.stringify(['A', 'An', 'The', 'No article']), correct_answer: '1', explanation: 'We use "An" before words starting with a vowel sound. "An apple" is correct.' },
    { type: 'multiple_choice', level: 'beginner', question: '"She ___ a student."', options: JSON.stringify(['am', 'is', 'are', 'be']), correct_answer: '1', explanation: '"She" uses "is" as the verb to be. "She is a student."' },
    { type: 'multiple_choice', level: 'beginner', question: '"They ___ playing football."', options: JSON.stringify(['is', 'am', 'are', 'be']), correct_answer: '2', explanation: '"They" uses "are". "They are playing football."' },
    { type: 'multiple_choice', level: 'beginner', question: 'What is the plural of "child"?', options: JSON.stringify(['childs', 'children', 'childes', 'child']), correct_answer: '1', explanation: '"Child" has an irregular plural: "children".' },
    { type: 'multiple_choice', level: 'beginner', question: '"I ___ breakfast every morning."', options: JSON.stringify(['has', 'have', 'having', 'had']), correct_answer: '1', explanation: 'With "I", we use "have". "I have breakfast every morning."' },

    // BEGINNER - Fill in the blank
    { type: 'fill_blank', level: 'beginner', question: 'Complete: "My name ___ Maria."', options: null, correct_answer: 'is', explanation: 'We use "is" with singular subjects. "My name is Maria."' },
    { type: 'fill_blank', level: 'beginner', question: 'Complete: "I ___ from Brazil."', options: null, correct_answer: 'am', explanation: 'With "I", we always use "am". "I am from Brazil."' },
    { type: 'fill_blank', level: 'beginner', question: 'Complete: "She likes ___ play tennis."', options: null, correct_answer: 'to', explanation: 'After "likes", we use "to + verb". "She likes to play tennis."' },

    // BEGINNER - Translation
    { type: 'translation', level: 'beginner', question: 'Translate to English: "Eu tenho um gato."', options: null, correct_answer: 'I have a cat', explanation: '"Eu" = "I", "tenho" = "have", "um gato" = "a cat". "I have a cat."' },
    { type: 'translation', level: 'beginner', question: 'Translate to English: "Ela é minha amiga."', options: null, correct_answer: 'She is my friend', explanation: '"Ela" = "She", "é" = "is", "minha amiga" = "my friend".' },

    // INTERMEDIATE - Multiple Choice
    { type: 'multiple_choice', level: 'intermediate', question: '"If I ___ you, I would apologize."', options: JSON.stringify(['am', 'was', 'were', 'be']), correct_answer: '2', explanation: 'In the second conditional, we use "were" for all subjects. "If I were you..."' },
    { type: 'multiple_choice', level: 'intermediate', question: '"She has been working here ___ 2019."', options: JSON.stringify(['for', 'since', 'during', 'while']), correct_answer: '1', explanation: '"Since" is used with a specific point in time. "Since 2019".' },
    { type: 'multiple_choice', level: 'intermediate', question: '"The report ___ by tomorrow."', options: JSON.stringify(['will finish', 'will be finished', 'finishes', 'is finishing']), correct_answer: '1', explanation: 'Passive voice future: "will be finished".' },
    { type: 'multiple_choice', level: 'intermediate', question: '"He suggested ___ a break."', options: JSON.stringify(['to take', 'taking', 'take', 'took']), correct_answer: '1', explanation: 'After "suggest", we use the gerund (-ing form). "He suggested taking a break."' },
    { type: 'multiple_choice', level: 'intermediate', question: '"I wish I ___ speak French."', options: JSON.stringify(['can', 'could', 'would', 'will']), correct_answer: '1', explanation: '"I wish" + past simple/could for present wishes. "I wish I could speak French."' },

    // INTERMEDIATE - Fill in the blank
    { type: 'fill_blank', level: 'intermediate', question: 'Complete: "She\'s used ___ waking up early."', options: null, correct_answer: 'to', explanation: '"Used to" + gerund means accustomed to. "She\'s used to waking up early."' },
    { type: 'fill_blank', level: 'intermediate', question: 'Complete: "Not only ___ he smart, but he\'s also kind."', options: null, correct_answer: 'is', explanation: 'Inversion after "Not only": "Not only is he smart..."' },

    // INTERMEDIATE - Translation
    { type: 'translation', level: 'intermediate', question: 'Translate: "Eu costumava jogar futebol quando era criança."', options: null, correct_answer: 'I used to play football when I was a child', explanation: '"Costumava" = "used to". "I used to play football when I was a child."' },
    { type: 'translation', level: 'intermediate', question: 'Translate: "Se eu tivesse dinheiro, viajaria o mundo."', options: null, correct_answer: 'If I had money, I would travel the world', explanation: 'Second conditional: "If I had..., I would..."' },

    // ADVANCED - Multiple Choice
    { type: 'multiple_choice', level: 'advanced', question: '"Had she ___ earlier, she would have caught the train."', options: JSON.stringify(['leave', 'left', 'leaving', 'leaves']), correct_answer: '1', explanation: 'Third conditional inversion: "Had she left earlier..." = "If she had left earlier..."' },
    { type: 'multiple_choice', level: 'advanced', question: '"The theory ___ which the research is based is quite controversial."', options: JSON.stringify(['in', 'on', 'at', 'for']), correct_answer: '1', explanation: '"Based on" is the correct collocation. "The theory on which..."' },
    { type: 'multiple_choice', level: 'advanced', question: '"Hardly ___ I arrived when the phone rang."', options: JSON.stringify(['have', 'had', 'has', 'having']), correct_answer: '1', explanation: 'Inversion with "hardly": "Hardly had I arrived..." = "I had hardly arrived..."' },

    // ADVANCED - Fill in the blank
    { type: 'fill_blank', level: 'advanced', question: 'Complete: "She demanded that he ___ immediately."', options: null, correct_answer: 'leave', explanation: 'Subjunctive mood after "demand": base form of the verb. "She demanded that he leave."' },

    // ADVANCED - Translation
    { type: 'translation', level: 'advanced', question: 'Translate: "Embora ela tenha se esforçado, não conseguiu passar no exame."', options: null, correct_answer: 'Although she had tried hard, she could not pass the exam', explanation: '"Embora" = "Although", past perfect for prior action.' },
  ];

  const stmt = db.prepare('INSERT INTO exercises (id, type, level, question, options, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)');

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run(uuidv4(), item.type, item.level, item.question, item.options, item.correct_answer, item.explanation);
    }
  });

  insertMany(exercises);
  console.log(`✅ Seeded ${exercises.length} exercises`);
}

module.exports = { seedExercises };
