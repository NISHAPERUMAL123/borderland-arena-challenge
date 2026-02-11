export interface Question {
  id: string;
  round: number;
  question: string;
  options: string[];
  answer: string;
  category: string;
}

export const questions: Question[] = [
  // ROUND 1 – Entry Game (Logic, Riddles, Patterns)
  {
    id: "r1q1",
    round: 1,
    question: "What comes next in the sequence: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "36", "38"],
    answer: "42",
    category: "pattern",
  },
  {
    id: "r1q2",
    round: 1,
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    options: ["Echo", "Shadow", "Smoke", "Fire"],
    answer: "Echo",
    category: "riddle",
  },
  {
    id: "r1q3",
    round: 1,
    question: "Which step comes FIRST in a software development lifecycle?",
    options: ["Testing", "Deployment", "Requirements Analysis", "Coding"],
    answer: "Requirements Analysis",
    category: "tech-flow",
  },
  {
    id: "r1q4",
    round: 1,
    question: "If all Bloops are Razzles and all Razzles are Lazzles, are all Bloops definitely Lazzles?",
    options: ["Yes", "No", "Maybe", "Not enough info"],
    answer: "Yes",
    category: "logic",
  },
  {
    id: "r1q5",
    round: 1,
    question: "Complete the pattern: 1, 1, 2, 3, 5, 8, ?",
    options: ["11", "12", "13", "10"],
    answer: "13",
    category: "pattern",
  },
  {
    id: "r1q6",
    round: 1,
    question: "A farmer has 17 sheep. All but 9 die. How many sheep are left?",
    options: ["8", "9", "17", "0"],
    answer: "9",
    category: "riddle",
  },

  // ROUND 2 – Mind Trap (Reverse Coding, Logic)
  {
    id: "r2q1",
    round: 2,
    question: "What does this code output? console.log(typeof null)",
    options: ["null", "undefined", "object", "boolean"],
    answer: "object",
    category: "reverse-code",
  },
  {
    id: "r2q2",
    round: 2,
    question: "What is the output? console.log(1 + '1')",
    options: ["2", "11", "NaN", "Error"],
    answer: "11",
    category: "reverse-code",
  },
  {
    id: "r2q3",
    round: 2,
    question: "In binary, what is 1010 + 0110?",
    options: ["10000", "10100", "1100", "10010"],
    answer: "10000",
    category: "logic",
  },
  {
    id: "r2q4",
    round: 2,
    question: "What does this return? [1,2,3].map(x => x * 2).filter(x => x > 3)",
    options: ["[4, 6]", "[2, 4, 6]", "[6]", "[4]"],
    answer: "[4, 6]",
    category: "reverse-code",
  },
  {
    id: "r2q5",
    round: 2,
    question: "How many times does a loop run? for(let i=0; i<5; i++)",
    options: ["4", "5", "6", "Infinite"],
    answer: "5",
    category: "logic",
  },
  {
    id: "r2q6",
    round: 2,
    question: "What is the output? console.log(0.1 + 0.2 === 0.3)",
    options: ["true", "false", "undefined", "NaN"],
    answer: "false",
    category: "reverse-code",
  },

  // ROUND 3 – Betrayal Stage (Coding, Reverse Code)
  {
    id: "r3q1",
    round: 3,
    question: "Which sorting algorithm has O(n log n) average time complexity?",
    options: ["Bubble Sort", "Merge Sort", "Selection Sort", "Insertion Sort"],
    answer: "Merge Sort",
    category: "coding",
  },
  {
    id: "r3q2",
    round: 3,
    question: "What does 'DNS' stand for?",
    options: ["Domain Name System", "Data Network Service", "Digital Name Server", "Domain Net System"],
    answer: "Domain Name System",
    category: "coding",
  },
  {
    id: "r3q3",
    round: 3,
    question: "What is the output? console.log(!!'false')",
    options: ["true", "false", "undefined", "Error"],
    answer: "true",
    category: "reverse-code",
  },
  {
    id: "r3q4",
    round: 3,
    question: "Which data structure uses LIFO?",
    options: ["Queue", "Stack", "Array", "Tree"],
    answer: "Stack",
    category: "coding",
  },
  {
    id: "r3q5",
    round: 3,
    question: "What does this output? console.log([...'hello'].reverse().join(''))",
    options: ["hello", "olleh", "Error", "undefined"],
    answer: "olleh",
    category: "reverse-code",
  },
  {
    id: "r3q6",
    round: 3,
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    answer: "O(log n)",
    category: "coding",
  },
];
