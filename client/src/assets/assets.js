import logo from './logo.png';

export const assets = {
  logo,
};

export const navbarItems = [
  { label: 'Home', icon: 'Home', path: '/' },
  { label: 'Messages', icon: 'MessageSquare', path: '/messages' },
  { label: 'Search', icon: 'Search', path: '/discover' },
  { label: 'Notifications', icon: 'Bell', path: '/notifications' },
];

// ============================================================
//  assets.js  –  Dummy data for Phase 1
//  Mirrors the real DB schema so swapping to API calls later
//  is a straight find-and-replace of the data source.
// ============================================================

// ─────────────────────────────────────────────
//  USERS
//  Matches: Clerk profile + your own users table
// ─────────────────────────────────────────────
export const USERS = [
  {
    id: 'user_01',
    clerkId: 'clerk_2abc123def456', // from Clerk – use this as the join key
    username: 'arjun_codes',
    displayName: 'Arjun Reddy',
    email: 'arjun@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
    bio: "Competitive programmer. NIT Warangal '23. Obsessed with graph theory and bad puns.",
    location: 'Hyderabad, IN',
    joinedAt: '2024-08-15T10:22:00Z',

    // creator analytics (shown on dashboard)
    analytics: {
      totalProblemsPosted: 14,
      totalSolvesOnMyProblems: 1043,
      totalLikesReceived: 428,
      averageDifficulty: 'Medium', // of problems they posted
    },

    // solver stats (shown on dashboard)
    stats: {
      currentStreak: 7, // days
      longestStreak: 21,
      eloRating: 1540,
      rank: 'Expert', // Beginner | Intermediate | Expert | Master | Grandmaster
      categoriesBreakdown: {
        Arrays: 18,
        'Dynamic Programming': 12,
        Graphs: 9,
        Strings: 11,
        Trees: 8,
      },
      dailyActivity: [
        // last 7 days, for sparkline
        { date: '2026-04-20', solved: 3 },
        { date: '2026-04-21', solved: 0 },
        { date: '2026-04-22', solved: 5 },
        { date: '2026-04-23', solved: 2 },
        { date: '2026-04-24', solved: 4 },
        { date: '2026-04-25', solved: 1 },
        { date: '2026-04-26', solved: 6 },
      ],
    },
  },

  {
    id: 'user_02',
    clerkId: 'clerk_3xyz789ghi012',
    username: 'priya_dsa',
    displayName: 'Priya Sharma',
    email: 'priya@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    bio: 'Love solving hard problems. IIT Delhi. Currently grinding for internships.',
    location: 'Delhi, IN',
    joinedAt: '2024-09-01T08:00:00Z',
    analytics: {
      totalProblemsPosted: 22,
      totalSolvesOnMyProblems: 2310,
      totalLikesReceived: 875,
      averageDifficulty: 'Hard',
    },
    stats: {
      problemsSolved: 134,
      totalAttempts: 158,
      successRate: 85,
      currentStreak: 14,
      longestStreak: 45,
      eloRating: 1820,
      rank: 'Master',
      categoriesBreakdown: {
        'Dynamic Programming': 40,
        Graphs: 30,
        Arrays: 25,
        Trees: 20,
        'Bit Manipulation': 19,
      },
      dailyActivity: [
        { date: '2026-04-20', solved: 6 },
        { date: '2026-04-21', solved: 4 },
        { date: '2026-04-22', solved: 8 },
        { date: '2026-04-23', solved: 5 },
        { date: '2026-04-24', solved: 7 },
        { date: '2026-04-25', solved: 3 },
        { date: '2026-04-26', solved: 9 },
      ],
    },
  },

  {
    id: 'user_03',
    clerkId: 'clerk_4lmn345opq678',
    username: 'dev_rahul',
    displayName: 'Rahul Mehta',
    email: 'rahul@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
    bio: 'Backend dev by day, algorithmic poet by night.',
    location: 'Bengaluru, IN',
    joinedAt: '2024-10-10T14:30:00Z',
    analytics: {
      totalProblemsPosted: 5,
      totalSolvesOnMyProblems: 320,
      totalLikesReceived: 104,
      averageDifficulty: 'Easy',
    },
    stats: {
      problemsSolved: 27,
      totalAttempts: 40,
      successRate: 67,
      currentStreak: 2,
      longestStreak: 10,
      eloRating: 1210,
      rank: 'Intermediate',
      categoriesBreakdown: {
        Arrays: 10,
        Strings: 9,
        Sorting: 5,
        Math: 3,
      },
      dailyActivity: [
        { date: '2026-04-20', solved: 0 },
        { date: '2026-04-21', solved: 2 },
        { date: '2026-04-22', solved: 0 },
        { date: '2026-04-23', solved: 1 },
        { date: '2026-04-24', solved: 3 },
        { date: '2026-04-25', solved: 0 },
        { date: '2026-04-26', solved: 2 },
      ],
    },
  },

  // ← The "logged-in" user you'll use in dev/testing
  {
    id: 'user_04',
    clerkId: 'user_3Df5oZbjGwi4g43iXIFqvrNJCFO', // replace with real Clerk ID during dev
    username: 'chandu_.7',
    displayName: 'CHANDU (Dev Mode)',
    email: 'dev@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=devuser',
    bio: 'Building the next big platform. Phase 1 in progress.',
    location: 'Hyderabad, IN',
    joinedAt: '2026-04-01T00:00:00Z',
    analytics: {
      totalProblemsPosted: 2,
      totalSolvesOnMyProblems: 17,
      totalLikesReceived: 6,
      averageDifficulty: 'Medium',
    },
    stats: {
      problemsSolved: 5,
      totalAttempts: 8,
      successRate: 62,
      currentStreak: 1,
      longestStreak: 3,
      eloRating: 2000,
      rank: 'Grandmaster',
      categoriesBreakdown: {
        Arrays: 3,
        Strings: 2,
      },
      dailyActivity: [
        { date: '2026-04-20', solved: 0 },
        { date: '2026-04-21', solved: 1 },
        { date: '2026-04-22', solved: 0 },
        { date: '2026-04-23', solved: 0 },
        { date: '2026-04-24', solved: 2 },
        { date: '2026-04-25', solved: 1 },
        { date: '2026-04-26', solved: 1 },
      ],
    },
  },
];

// ─────────────────────────────────────────────
//  PROBLEMS
//  The "posts" of your platform
// ─────────────────────────────────────────────
export const PROBLEMS = [
  {
    id: 'prob_001',
    authorId: 'user_02',
    title: 'Two Sum – Classic Revisited',
    slug: 'two-sum-classic-revisited',
    summary:
      'Ever stared at a list of numbers and needed to find the exact pair that hits a specific target? That is exactly what we are doing here. It is a classic array problem, but it is the absolute perfect warm-up for mastering Hash Maps and optimizing your code from O(n²) down to O(n). Can you find the pair in a single pass?',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers that add up to \`target\`.
 
You may assume that each input has exactly **one solution**, and you may not use the same element twice.
 
**Input Format:**
- First line: \`n\` (the length of the array).
- Second line: \`n\` space-separated integers representing the array \`nums\`.
- Third line: An integer representing the \`target\`.
 
**Output Format:**
- Two space-separated integers representing the indices.
 
**Example:**
\`\`\`text
Input: 
4
2 7 11 15
9

Output: 
0 1   // nums[0] + nums[1] = 2 + 7 = 9

Input:
3
3 2 4
6

Output:
1 2   // nums[1] + nums[2] = 2 + 4 = 6
\`\`\`
 
**Constraints:**
- \`2 <= n <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- Only one valid answer exists.`,

    difficulty: 'Easy',
    tags: ['Arrays', 'Hash Map', 'Two Pointers'],
    starterCode: {
      python: 'def two_sum(nums: list[int], target: int) -> list[int]:\n    pass\n',
      javascript: 'function twoSum(nums, target) {\n    \n}\n',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}\n',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};\n',
      c: 'int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    \n}\n',
    },
    testCases: [
      { id: 'tc_001_1', label: 'Case 1', input: '4\n2 7 11 15\n9', expectedOutput: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { id: 'tc_001_2', label: 'Case 2', input: '3\n3 2 4\n6', expectedOutput: '1 2', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
      { id: 'tc_001_3', label: 'Case 3', input: '2\n3 3\n6', expectedOutput: '0 1', explanation: 'nums[0] + nums[1] = 3 + 3 = 6' },
    ],
    hiddenTestCases: [
      { id: 'tc_001_h1', input: '4\n1 4 5 2\n6', expectedOutput: '1 3' },
      { id: 'tc_001_h2', input: '3\n-1 -2 -3\n-5', expectedOutput: '1 2' },
    ],
    likesCount: 214,
    totalAttempts: 892,
    successfulSolves: 601,
    commentsCount: 34,
    createdAt: '2026-04-10T09:00:00Z',
    updatedAt: '2026-04-10T09:00:00Z',
  },

  {
    id: 'prob_002',
    authorId: 'user_01',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-no-repeat',
    summary:
      'Strings are everywhere, but finding the longest sequence of totally unique characters without repeating yourself is trickier than it looks. Think of it like a sliding window moving across the text. This is a brilliant exercise for understanding dynamic ranges and hash sets. What is the longest chain you can build?',
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.
 
**Input Format:**
- A single string \`s\` on one line.
 
**Output Format:**
- A single integer representing the maximum length.
 
**Example:**
\`\`\`text
Input:  s = "abcabcbb"
Output: 3   // "abc"
 
Input:  s = "bbbbb"
Output: 1   // "b"

Input:  s = "pwwkew"
Output: 3   // "wke"
\`\`\`
 
**Constraints:**
- \`0 <= s.length <= 5 * 10^4\`
- \`s\` consists of English letters, digits, symbols, and spaces.`,

    difficulty: 'Medium',
    tags: ['Strings', 'Sliding Window', 'Hash Map'],
    starterCode: null,
    testCases: [
      { id: 'tc_002_1', label: 'Case 1', input: 'abcabcbb', expectedOutput: '3', explanation: '"abc" is the longest' },
      { id: 'tc_002_2', label: 'Case 2', input: 'bbbbb', expectedOutput: '1', explanation: '"b" only' },
      { id: 'tc_002_3', label: 'Case 3', input: 'pwwkew', expectedOutput: '3', explanation: '"wke"' },
    ],
    hiddenTestCases: [
      { id: 'tc_002_h1', input: '', expectedOutput: '0' },
      { id: 'tc_002_h2', input: 'aab', expectedOutput: '2' },
    ],
    likesCount: 178,
    totalAttempts: 643,
    successfulSolves: 310,
    commentsCount: 22,
    createdAt: '2026-04-12T11:30:00Z',
    updatedAt: '2026-04-12T11:30:00Z',
  },

  {
    id: 'prob_003',
    authorId: 'user_02',
    title: 'Binary Tree Level Order Traversal',
    slug: 'binary-tree-level-order',
    summary:
      "Navigating a tree structure isn't just about going as deep as possible; sometimes you need to take it one level at a time. This challenge asks you to traverse a binary tree horizontally, sweeping across each depth before moving down. Grab a Queue data structure and let's map out this tree level by level!",
    description: `Given a binary tree, print its **level order traversal** (i.e., from left to right, level by level).
 
**Input Format:**
- A single line of space-separated strings representing the level-order traversal of the tree. Missing nodes are represented by \`null\`.
 
**Output Format:**
- Multiple lines, where each line contains the space-separated node values for a specific depth level.
 
**Example:**
\`\`\`text
Input:  root = [3, 9, 20, null, null, 15, 7]
Output:
3
9 20
15 7

Input:  root = [1]
Output:
1
\`\`\`
 
**Constraints:**
- The number of nodes in the tree is in the range \`[0, 2000]\`.
- \`-1000 <= Node.val <= 1000\``,

    difficulty: 'Medium',
    tags: ['Trees', 'BFS', 'Queues'],
    starterCode: null,
    testCases: [
      { id: 'tc_003_1', label: 'Case 1', input: '3 9 20 null null 15 7', expectedOutput: '3\n9 20\n15 7' },
      { id: 'tc_003_2', label: 'Case 2', input: '1', expectedOutput: '1' },
      { id: 'tc_003_3', label: 'Case 3', input: '', expectedOutput: '' },
    ],
    hiddenTestCases: [{ id: 'tc_003_h1', input: '1 2 3 4 5', expectedOutput: '1\n2 3\n4 5' }],
    likesCount: 302,
    totalAttempts: 510,
    successfulSolves: 289,
    commentsCount: 41,
    createdAt: '2026-04-14T07:45:00Z',
    updatedAt: '2026-04-14T07:45:00Z',
  },

  {
    id: 'prob_004',
    authorId: 'user_03',
    title: 'Reverse a Linked List',
    slug: 'reverse-linked-list',
    summary:
      'It is the quintessential interview question that everyone loves to hate: reversing a singly linked list. Whether you tackle it iteratively by meticulously flipping pointers, or use the mind-bending elegance of recursion, getting this right is a programming rite of passage. How cleanly can you turn this list around?',
    description: `Given the \`head\` of a singly linked list, reverse the list, and print the reversed list.
 
**Input Format:**
- A single line of space-separated integers representing the linked list.
 
**Output Format:**
- A single line of space-separated integers representing the reversed list.
 
**Example:**
\`\`\`text
Input:  head = [1, 2, 3, 4, 5]
Output: 5 4 3 2 1

Input:  head = [1, 2]
Output: 2 1
\`\`\`
 
**Constraints:**
- The number of nodes in the list is the range \`[0, 5000]\`.
- \`-5000 <= Node.val <= 5000\``,

    difficulty: 'Easy',
    tags: ['Linked Lists', 'Recursion'],
    starterCode: null,
    testCases: [
      { id: 'tc_004_1', label: 'Case 1', input: '1 2 3 4 5', expectedOutput: '5 4 3 2 1' },
      { id: 'tc_004_2', label: 'Case 2', input: '1 2', expectedOutput: '2 1' },
      { id: 'tc_004_3', label: 'Case 3', input: '', expectedOutput: '' },
    ],
    hiddenTestCases: [{ id: 'tc_004_h1', input: '1', expectedOutput: '1' }],
    likesCount: 93,
    totalAttempts: 280,
    successfulSolves: 241,
    commentsCount: 8,
    createdAt: '2026-04-15T16:00:00Z',
    updatedAt: '2026-04-15T16:00:00Z',
  },

  {
    id: 'prob_005',
    authorId: 'user_02',
    title: 'Coin Change – Minimum Coins',
    slug: 'coin-change-minimum',
    summary:
      'Imagine you are a cashier with an unlimited supply of certain coin denominations, and you need to make exact change using the absolute minimum number of coins. A simple greedy approach might fail you here! This is a fantastic introduction to 1D Dynamic Programming. Can you compute the optimal combination?',
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money. Return the **minimum number of coins** needed to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.
 
**Input Format:**
- First line: \`k\` (number of coin denominations).
- Second line: \`k\` space-separated integers representing the \`coins\`.
- Third line: An integer representing the \`amount\`.
 
**Output Format:**
- A single integer.
 
**Example:**
\`\`\`text
Input:
4
1 5 6 9
11

Output:
2    // 5 + 6 = 11

Input:
1
2
3

Output:
-1   // Impossible to make 3 with only 2s
\`\`\`
 
**Constraints:**
- \`1 <= k <= 12\`
- \`1 <= coins[i] <= 2^31 - 1\`
- \`0 <= amount <= 10^4\``,

    difficulty: 'Hard',
    tags: ['Dynamic Programming', 'Arrays', 'Greedy'],
    starterCode: null,
    testCases: [
      { id: 'tc_005_1', label: 'Case 1', input: '4\n1 5 6 9\n11', expectedOutput: '2', explanation: '5 + 6 = 11' },
      { id: 'tc_005_2', label: 'Case 2', input: '1\n2\n3', expectedOutput: '-1', explanation: 'impossible' },
      { id: 'tc_005_3', label: 'Case 3', input: '1\n1\n0', expectedOutput: '0', explanation: 'amount is 0' },
    ],
    hiddenTestCases: [
      { id: 'tc_005_h1', input: '3\n1 2 5\n11', expectedOutput: '3' },
      { id: 'tc_005_h2', input: '4\n186 419 83 408\n6249', expectedOutput: '20' },
    ],
    likesCount: 441,
    totalAttempts: 730,
    successfulSolves: 198,
    commentsCount: 67,
    createdAt: '2026-04-17T13:20:00Z',
    updatedAt: '2026-04-17T13:20:00Z',
  },

  {
    id: 'prob_006',
    authorId: 'user_04',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    summary:
      "Code syntax relies on perfectly matched brackets, and building a validator for them is a surprisingly fun logic puzzle. You will need to keep track of every open parenthesis, bracket, and brace to ensure they close in the exact right order. Dust off your Stack data structure and let's parse some strings!",
    description: `Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid. Open brackets must be closed by the same type of brackets and in the correct order.
 
**Input Format:**
- A single string \`s\`.
 
**Output Format:**
- \`true\` if the string is valid, \`false\` otherwise.
 
**Example:**
\`\`\`text
Input:  s = "()[]{}"
Output: true

Input:  s = "(]"
Output: false

Input:  s = "([)]"
Output: false
\`\`\`
 
**Constraints:**
- \`1 <= s.length <= 10^4\`
- \`s\` consists of parentheses only \`()[]{}\`.`,

    difficulty: 'Easy',
    tags: ['Strings', 'Stack'],
    starterCode: null,
    testCases: [
      { id: 'tc_006_1', label: 'Case 1', input: '()', expectedOutput: 'true' },
      { id: 'tc_006_2', label: 'Case 2', input: '()[]{}', expectedOutput: 'true' },
      { id: 'tc_006_3', label: 'Case 3', input: '(]', expectedOutput: 'false' },
    ],
    hiddenTestCases: [
      { id: 'tc_006_h1', input: '([)]', expectedOutput: 'false' },
      { id: 'tc_006_h2', input: '{[]}', expectedOutput: 'true' },
    ],
    likesCount: 55,
    totalAttempts: 120,
    successfulSolves: 98,
    commentsCount: 3,
    createdAt: '2026-04-18T20:00:00Z',
    updatedAt: '2026-04-18T20:00:00Z',
  },

  {
    id: 'prob_007',
    authorId: 'user_01',
    title: 'Number of Islands',
    slug: 'number-of-islands',
    summary:
      'You are given a 2D grid representing a map, consisting entirely of 1s (land) and 0s (water). Your mission? Count the total number of distinct islands. This problem is a beautiful way to practice graph traversal algorithms like Depth-First Search (DFS) or Breadth-First Search (BFS). Ready to explore the map?',
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`1\`s (land) and \`0\`s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.
 
**Input Format:**
- First line: \`m\` (rows) and \`n\` (cols), space-separated.
- Next \`m\` lines: \`n\` space-separated integers (either \`0\` or \`1\`).
 
**Output Format:**
- A single integer representing the island count.
 
**Example:**
\`\`\`text
Input:
3 5
1 1 0 0 0
1 1 0 0 0
0 0 1 0 0
0 0 0 1 1

Output:
3
\`\`\`
 
**Constraints:**
- \`1 <= m, n <= 300\`
- \`grid[i][j]\` is \`'0'\` or \`'1'\`.`,

    difficulty: 'Medium',
    tags: ['Graphs', 'DFS', 'BFS', 'Union Find'],
    starterCode: null,
    testCases: [
      {
        id: 'tc_007_1',
        label: 'Case 1',
        input: '3 3\n1 1 0\n0 1 0\n0 0 1',
        expectedOutput: '2',
      },
    ],
    hiddenTestCases: [{ id: 'tc_007_h1', input: '3 3\n1 1 1\n0 1 0\n1 1 1', expectedOutput: '1' }],
    likesCount: 280,
    totalAttempts: 590,
    successfulSolves: 334,
    commentsCount: 28,
    createdAt: '2026-04-19T10:10:00Z',
    updatedAt: '2026-04-19T10:10:00Z',
  },

  {
    id: 'prob_008',
    authorId: 'user_02',
    title: 'Merge K Sorted Lists',
    slug: 'merge-k-sorted-lists',
    summary:
      "Merging two sorted lists is easy enough, but what happens when you have K different sorted lists and need to combine them all into one massive, perfectly ordered chain? Brute force won't cut it here. You'll need to leverage Divide and Conquer or a Priority Queue to keep things highly efficient. Let's get merging!",
    description: `You are given an array of \`k\` linked-lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.
 
**Input Format:**
- First line: \`k\` (number of lists).
- Next \`k\` lines: Space-separated integers representing each sorted list.
 
**Output Format:**
- A single line of space-separated integers representing the fully merged, sorted list.
 
**Example:**
\`\`\`text
Input:
3
1 4 5
1 3 4
2 6

Output:
1 1 2 3 4 4 5 6
\`\`\`
 
**Constraints:**
- \`0 <= k <= 10^4\`
- \`0 <= lists[i].length <= 500\`
- \`-10^4 <= lists[i][j] <= 10^4\`
- \`lists[i]\` is sorted in ascending order.
- The sum of \`lists[i].length\` will not exceed \`10^4\`.`,

    difficulty: 'Hard',
    tags: ['Linked Lists', 'Divide and Conquer', 'Heap', 'Merge Sort'],
    starterCode: null,
    testCases: [
      {
        id: 'tc_008_1',
        label: 'Case 1',
        input: '3\n1 4 5\n1 3 4\n2 6',
        expectedOutput: '1 1 2 3 4 4 5 6',
      },
      { id: 'tc_008_2', label: 'Case 2', input: '0', expectedOutput: '' },
    ],
    hiddenTestCases: [{ id: 'tc_008_h1', input: '2\n1\n0', expectedOutput: '0 1' }],
    likesCount: 512,
    totalAttempts: 840,
    successfulSolves: 210,
    commentsCount: 89,
    createdAt: '2026-04-20T08:00:00Z',
    updatedAt: '2026-04-20T08:00:00Z',
  },
];

// ─────────────────────────────────────────────
//  SOLVE ATTEMPTS
//  One row per user+problem submission
// ─────────────────────────────────────────────
export const SOLVE_ATTEMPTS = [
  {
    id: 'attempt_001',
    userId: 'user_04',
    problemId: 'prob_001',
    status: 'accepted', // accepted | wrong_answer | runtime_error | time_limit_exceeded
    language: 'python',
    submittedCode: `def twoSum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i`,
    runtime: 52, // ms
    memory: 14.3, // MB
    beatsRuntime: 82, // percentile
    beatsMemory: 74,
    errorMessage: null,
    submittedAt: '2026-04-24T14:22:00Z',
  },
  {
    id: 'attempt_002',
    userId: 'user_04',
    problemId: 'prob_001',
    status: 'wrong_answer',
    language: 'python',
    submittedCode: `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]`,
    runtime: null,
    memory: null,
    beatsRuntime: null,
    beatsMemory: null,
    errorMessage: 'Wrong Answer on test case 2: Expected [1, 2], got [0, 0]',
    submittedAt: '2026-04-24T14:10:00Z',
  },
  {
    id: 'attempt_003',
    userId: 'user_04',
    problemId: 'prob_006',
    status: 'accepted',
    language: 'javascript',
    submittedCode: `function isValid(s) {
  const map = { ')': '(', '}': '{', ']': '[' };
  const stack = [];
  for (const c of s) {
    if (map[c]) {
      if (stack.pop() !== map[c]) return false;
    } else {
      stack.push(c);
    }
  }
  return stack.length === 0;
}`,
    runtime: 68,
    memory: 42.1,
    beatsRuntime: 91,
    beatsMemory: 60,
    errorMessage: null,
    submittedAt: '2026-04-26T09:11:00Z',
  },
  {
    id: 'attempt_004',
    userId: 'user_04',
    problemId: 'prob_002',
    status: 'wrong_answer',
    language: 'javascript',
    submittedCode: `function lengthOfLongestSubstring(s) {
  let start = 0;
  let maxLen = 0;
  const chars = new Map();

  for (let end = 0; end < s.length; end++) {
    if (chars.has(s[end]) && chars.get(s[end]) >= start) {
      start = chars.get(s[end]) + 1;
    }
    chars.set(s[end], end);
    maxLen = Math.max(maxLen, end - start + 1);
  }

  return maxLen;
}`,
    runtime: null,
    memory: null,
    beatsRuntime: null,
    beatsMemory: null,
    errorMessage: 'Wrong Answer on test case 3: Expected 3, got 2',
    submittedAt: '2026-04-26T10:00:00Z',
  },
];

// ─────────────────────────────────────────────
//  SOLVED PROBLEMS lookup (fast UI check)
//  userId → Set of problemIds they've accepted
// ─────────────────────────────────────────────
export const USER_SOLVED_MAP = {
  user_04: ['prob_001', 'prob_006'],
  user_01: ['prob_001', 'prob_002', 'prob_003', 'prob_007'],
  user_02: ['prob_001', 'prob_002', 'prob_003', 'prob_004', 'prob_005', 'prob_007', 'prob_008'],
  user_03: ['prob_001', 'prob_004'],
};

// ─────────────────────────────────────────────
//  FOLLOWING RELATIONSHIPS
// ─────────────────────────────────────────────
export const FOLLOWS = [
  { follower: 'user_04', following: 'user_01' },
  { follower: 'user_04', following: 'user_02' },
  { follower: 'user_01', following: 'user_02' },
  { follower: 'user_03', following: 'user_01' },
  { follower: 'user_03', following: 'user_02' },
  { follower: 'user_01', following: 'user_04' },
  { follower: 'user_02', following: 'user_04' },
  { follower: 'user_03', following: 'user_04' },
];

// ─────────────────────────────────────────────
//  TAGS MASTER LIST  (for the problem creation form)
// ─────────────────────────────────────────────
export const ALL_TAGS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Recursion',
  'Backtracking',
  'Sorting',
  'Searching',
  'Binary Search',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Queue',
  'Heap',
  'Hash Map',
  'Greedy',
  'Divide and Conquer',
  'BFS',
  'DFS',
  'Union Find',
  'Bit Manipulation',
  'Math',
  'Simulation',
  'Merge Sort',
  'Tries',
  'Segment Trees',
];

// ─────────────────────────────────────────────
//  DIFFICULTY OPTIONS  (for dropdowns)
// ─────────────────────────────────────────────
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

// ─────────────────────────────────────────────
//  SUPPORTED LANGUAGES  (for the solve workspace)
// ─────────────────────────────────────────────
export const SUPPORTED_LANGUAGES = [
  { id: 'python', label: 'Python 3', monacoLang: 'python' },
  { id: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
  { id: 'typescript', label: 'TypeScript', monacoLang: 'typescript' },
  { id: 'java', label: 'Java', monacoLang: 'java' },
  { id: 'cpp', label: 'C++', monacoLang: 'cpp' },
  { id: 'c', label: 'C', monacoLang: 'c' },
  { id: 'go', label: 'Go', monacoLang: 'go' },
  { id: 'rust', label: 'Rust', monacoLang: 'rust' },
];

// ─────────────────────────────────────────────
//  HELPER FUNCTIONS
//  Drop these when you wire up a real API
// ─────────────────────────────────────────────

/** Get a user by their ID */
export const getUserById = id => USERS.find(u => u.id === id) ?? null;

/** Get a user by their Clerk ID */
export const getUserByClerkId = clerkId => USERS.find(u => u.clerkId === clerkId) ?? null;

/** Get a problem by its ID */
export const getProblemById = id => PROBLEMS.find(p => p.id === id) ?? null;

/** Get all problems posted by a user */
export const getProblemsByUser = userId => PROBLEMS.filter(p => p.authorId === userId);

/** Check if a user has solved a problem */
export const hasSolved = (userId, problemId) => (USER_SOLVED_MAP[userId] ?? []).includes(problemId);

/** Get the author user object for a problem */
export const getAuthorForProblem = problem => getUserById(problem.authorId);

/** Get total Solved Problems by a user */
export const getSolvedCount = userId => (USER_SOLVED_MAP[userId] ?? []).length;

/** Get total attempts by a user */
export const getTotalAttempts = userId => SOLVE_ATTEMPTS.filter(a => a.userId === userId).length;

/** Get all accepted attempts by a user */
export const getAcceptedAttempts = userId => SOLVE_ATTEMPTS.filter(a => a.userId === userId && a.status === 'accepted');

/** Get success rate of a user */
export const getSuccessRate = userId => {
  const attempts = SOLVE_ATTEMPTS.filter(attempt => attempt.userId === userId);

  if (attempts.length === 0) {
    return 0;
  }

  const accepted = attempts.filter(attempt => attempt.status === 'accepted');

  return Math.round((accepted.length / attempts.length) * 100);
};

/** Get count of users a given user is following */
export const getFollowingCount = userId => FOLLOWS.filter(f => f.follower === userId).length;

/** Get count of followers of a given user */
export const getFollowersCount = userId => FOLLOWS.filter(f => f.following === userId).length;

/** Get all users a given user is following */
export const getFollowing = userId =>
  FOLLOWS.filter(f => f.follower === userId)
    .map(f => getUserById(f.following))
    .filter(Boolean);

/** Get all followers of a given user */
export const getFollowers = userId =>
  FOLLOWS.filter(f => f.following === userId)
    .map(f => getUserById(f.follower))
    .filter(Boolean);

/** Feed – all problems, newest first */
export const getFeedGlobal = () => [...PROBLEMS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

/** Feed – only problems from people the user follows */
export const getFeedFollowing = userId => {
  const followings = FOLLOWS.filter(f => f.follower === userId).map(f => f.following);
  return PROBLEMS.filter(p => followings.includes(p.authorId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// ─────────────────────────────────────────────
//  CURRENT USER MOCK  (swap with Clerk user later)
//  Import this wherever you need "the logged-in user"
// ─────────────────────────────────────────────
export const CURRENT_USER = getUserById('user_04');
