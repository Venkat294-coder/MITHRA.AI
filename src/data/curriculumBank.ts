import { Question } from "../types";

// Verified Official Statistical System curriculum bank for resilient offline & failover fallback
export const STATISTICAL_CURRICULUM_BANK = [
  {
    id: 1,
    question: "Why is Simple Random Sampling Without Replacement (SRSWOR) always more efficient than Simple Random Sampling With Replacement (SRSWR) for sample size n > 1?",
    options: {
      A: "SRSWOR has a strictly smaller sampling variance due to the finite population correction factor (1 - f).",
      B: "SRSWR requires knowing the population variance in advance.",
      C: "SRSWOR completely eliminates non-sampling errors.",
      D: "SRSWR cannot be executed without stratified clusters."
    },
    correctAnswer: "A",
    topic: "Sampling Theory",
    explanation: "For n > 1, the variance of the sample mean in SRSWOR is Var(ȳ) = (S²/n)*(1 - f), whereas in SRSWR it is Var(ȳ) = σ²/n. Because (1 - f) < 1, SRSWOR yields a smaller sampling variance, making it strictly more efficient."
  },
  {
    id: 2,
    question: "In Neyman (optimum) allocation for stratified random sampling, how is the sample size n_i allocated to stratum i?",
    options: {
      A: "Inversely proportional to stratum size N_i",
      B: "Proportional to the product of stratum size and stratum standard deviation: n * (N_i * S_i) / Σ(N_k * S_k)",
      C: "Equally divided among all strata regardless of size",
      D: "Directly proportional to the stratum mean"
    },
    correctAnswer: "B",
    topic: "Sampling Theory",
    explanation: "Neyman optimum allocation minimizes the sampling variance of the stratified estimator for a fixed total sample size n by allocating samples in proportion to both stratum size (N_i) and stratum variability (S_i)."
  },
  {
    id: 3,
    question: "Which division of the National Sample Survey Office (NSSO) is primarily tasked with survey methodology, sample design, and schedule formulation?",
    options: {
      A: "Survey Design and Research Division (SDRD)",
      B: "Field Operations Division (FOD)",
      C: "Data Processing Division (DPD)",
      D: "Coordination and Publication Division (CPD)"
    },
    correctAnswer: "A",
    topic: "Official Statistical System",
    explanation: "SDRD (located in Kolkata) is the technical wing of NSSO responsible for conceptualizing survey themes, developing sampling methodology, designing questionnaires, and preparing field instructions."
  },
  {
    id: 4,
    question: "Which index number satisfies both the Time Reversal Test (TRT) and the Factor Reversal Test (FRT)?",
    options: {
      A: "Laspeyres Price Index",
      B: "Paasche Price Index",
      C: "Fisher's Ideal Index",
      D: "Bowley's Weighted Index"
    },
    correctAnswer: "C",
    topic: "Index Numbers",
    explanation: "Fisher's Ideal Index is defined as the geometric mean of Laspeyres and Paasche indices: √(L_P * P_P). Because of this symmetric structure, it uniquely satisfies both the Time Reversal and Factor Reversal tests."
  },
  {
    id: 5,
    question: "In national accounts aggregates, Net National Product at Factor Cost (NNP_FC) is formally recognized as:",
    options: {
      A: "Gross Domestic Product (GDP)",
      B: "National Income",
      C: "Personal Disposable Income",
      D: "Gross National Disposable Income"
    },
    correctAnswer: "B",
    topic: "National Income",
    explanation: "National Income is rigorously defined as Net National Product at Factor Cost (NNP_FC = NNP_MP - Net Indirect Taxes = GNP_MP - Depreciation - Net Indirect Taxes)."
  },
  {
    id: 6,
    question: "Which nodal ministry oversees the national statistical system and national accounts compilation in India?",
    options: {
      A: "Ministry of Finance",
      B: "Ministry of Statistics and Programme Implementation (MoSPI)",
      C: "Reserve Bank of India (RBI)",
      D: "NITI Aayog"
    },
    correctAnswer: "B",
    topic: "Official Statistical System",
    explanation: "MoSPI serves as the nodal ministry responsible for planned development of the statistical system, standards, national income accounting (via CSO), and large-scale socio-economic surveys (via NSSO)."
  },
  {
    id: 7,
    question: "What is the primary cause of upward substitution bias in the Laspeyres Price Index?",
    options: {
      A: "It utilizes current-year quantity weights",
      B: "It assumes consumer purchasing baskets remain fixed to base-year consumption despite relative price changes",
      C: "It ignores indirect taxation",
      D: "It applies harmonic averaging to prices"
    },
    correctAnswer: "B",
    topic: "Index Numbers",
    explanation: "The Laspeyres formula fixes quantities at base-year weights (q0). When goods increase in relative price, consumers typically substitute toward cheaper alternatives; Laspeyres ignores this substitution and hence tends to overestimate inflation."
  },
  {
    id: 8,
    question: "In two-stage sampling designs commonly utilized by national survey organizations, what constitutes the First Stage Unit (FSU) in rural regions?",
    options: {
      A: "Individual households",
      B: "Census Villages",
      C: "Agricultural plots",
      D: "Panchayat wards"
    },
    correctAnswer: "B",
    topic: "Survey Methodology",
    explanation: "In standard NSSO two-stage stratified sampling, Census Villages serve as First Stage Units (FSUs) in rural areas, while households within selected villages serve as Ultimate Stage Units (USUs)."
  },
  {
    id: 9,
    question: "The Total Fertility Rate (TFR) required for a human population to achieve exact demographic replacement level without migration is approximately:",
    options: {
      A: "1.5 children per woman",
      B: "2.1 children per woman",
      C: "2.8 children per woman",
      D: "3.0 children per woman"
    },
    correctAnswer: "B",
    topic: "Demographic Statistics",
    explanation: "A Total Fertility Rate of approximately 2.1 children per woman accounts for mortality among children before reproductive age and the biological human sex ratio at birth, establishing replacement-level fertility."
  },
  {
    id: 10,
    question: "The GDP Deflator is mathematically defined as:",
    options: {
      A: "(Nominal GDP / Real GDP) * 100",
      B: "(Real GDP / Nominal GDP) * 100",
      C: "GDP at Factor Cost - Indirect Taxes",
      D: "Nominal GDP + Net Factor Income from Abroad"
    },
    correctAnswer: "A",
    topic: "National Income",
    explanation: "The GDP Deflator is the ratio of nominal GDP (current market prices) to real GDP (constant base-year prices) multiplied by 100, measuring comprehensive economy-wide price inflation."
  },
  {
    id: 11,
    question: "Which high-level commission recommended the creation of the permanent National Statistical Commission (NSC) to uphold professional statistical standards?",
    options: {
      A: "Kothari Commission",
      B: "Dr. C. Rangarajan Commission",
      C: "Sarkaria Commission",
      D: "Narasimham Committee"
    },
    correctAnswer: "B",
    topic: "Official Statistical System",
    explanation: "The National Statistical Commission was constituted in 2005 based on the recommendations of the Rangarajan Commission (2001) to serve as an apex body for statistical quality assurance."
  },
  {
    id: 12,
    question: "When is Systematic Sampling particularly vulnerable to substantial estimation bias?",
    options: {
      A: "When the population elements are arranged in strictly ascending order",
      B: "When a hidden periodic cyclical fluctuation exists coinciding with the sampling interval k",
      C: "When the sample size is greater than 100",
      D: "When population variance is unknown"
    },
    correctAnswer: "B",
    topic: "Sampling Theory",
    explanation: "If the list has periodic fluctuations matching the sampling interval k, systematic sampling repeatedly samples from the exact same phase of the wave, introducing severe bias into the estimates."
  },
  {
    id: 13,
    question: "In a demographic Life Table, the initial synthetic cohort size at age 0, denoted as l_0 and conventionally set to 100,000, is called the:",
    options: {
      A: "Radix",
      B: "Mortality Quotient",
      C: "Stationary Index",
      D: "Force of Mortality"
    },
    correctAnswer: "A",
    topic: "Demographic Statistics",
    explanation: "The initial cohort size at the starting age of life (l_0), traditionally standardized to 100,000 live births, is termed the radix of the life table."
  },
  {
    id: 14,
    question: "The fundamental arithmetic difference between Gross National Product (GNP) and Gross Domestic Product (GDP) is:",
    options: {
      A: "Depreciation of fixed capital",
      B: "Net Factor Income from Abroad (NFIA)",
      C: "Net indirect commercial tariffs",
      D: "Transfer payments from governments"
    },
    correctAnswer: "B",
    topic: "National Income",
    explanation: "GNP measures total output produced by a nation's permanent residents globally: GNP = GDP + Net Factor Income from Abroad (NFIA)."
  },
  {
    id: 15,
    question: "Which price index formula utilizes current-year consumption quantities (q1) as its weighting mechanism?",
    options: {
      A: "Laspeyres Price Index",
      B: "Paasche Price Index",
      C: "Fisher's Ideal Index",
      D: "Drobisch Index"
    },
    correctAnswer: "B",
    topic: "Index Numbers",
    explanation: "The Paasche index weights prices using current period quantities: P_P = [Σ(p1 * q1) / Σ(p0 * q1)] * 100."
  },
  {
    id: 16,
    question: "In stratified random sampling with proportional allocation, the sample size assigned to stratum i (n_i) is:",
    options: {
      A: "n * (N_i / N)",
      B: "n / k",
      C: "n * (S_i / ΣS_k)",
      D: "n * (N_i² / N)"
    },
    correctAnswer: "A",
    topic: "Sampling Theory",
    explanation: "Under proportional allocation, each stratum receives a sample size directly proportional to its population weight: n_i = n * (N_i / N)."
  },
  {
    id: 17,
    question: "The Index of Industrial Production (IIP) measures short-term volume changes in which sectors?",
    options: {
      A: "Agriculture, Forestry, and Livestock",
      B: "Mining, Manufacturing, and Electricity",
      C: "Information Technology, Banking, and Tourism",
      D: "Retail Trade, E-commerce, and Transport"
    },
    correctAnswer: "B",
    topic: "Index Numbers",
    explanation: "The IIP is a composite volume index that measures growth rates in three broad industrial sectors: Mining, Manufacturing, and Electricity."
  },
  {
    id: 18,
    question: "The Crude Birth Rate (CBR) of a geographic jurisdiction expresses the number of live births per:",
    options: {
      A: "100 married women",
      B: "1,000 mid-year population",
      C: "10,000 registered households",
      D: "100,000 census respondents"
    },
    correctAnswer: "B",
    topic: "Demographic Statistics",
    explanation: "Crude Birth Rate is computed as: (Total Live Births during the year / Mid-year Population) * 1,000."
  },
  {
    id: 19,
    question: "What is the primary operational role of the Field Operations Division (FOD) of the NSSO?",
    options: {
      A: "Designing statistical sampling models",
      B: "Direct primary collection of survey data across nationwide field establishments",
      C: "Econometric forecasting of gross capital formation",
      D: "Formulating consumer price regulations"
    },
    correctAnswer: "B",
    topic: "Official Statistical System",
    explanation: "FOD (headquartered in New Delhi/Faridabad with widespread regional networks) executes field surveys, collection of price data, and annual industrial survey canvassing."
  },
  {
    id: 20,
    question: "The Finite Population Correction (FPC) factor in Simple Random Sampling without Replacement is expressed as:",
    options: {
      A: "(N - n) / (N - 1) or (1 - f)",
      B: "n / N",
      C: "√(n / N)",
      D: "(N + n) / N"
    },
    correctAnswer: "A",
    topic: "Sampling Theory",
    explanation: "The factor (1 - f) = (1 - n/N) = (N - n)/N adjusts the sampling variance in SRSWOR for sampling from a finite population without replacement."
  },
  {
    id: 21,
    question: "The Annual Survey of Industries (ASI) in India provides the primary statistical basis for assessing:",
    options: {
      A: "Informal street vending dynamics",
      B: "Organized manufacturing sector capital, employment, and output",
      C: "Smallholder agricultural yields",
      D: "Central government tariff revenues"
    },
    correctAnswer: "B",
    topic: "Official Statistical System",
    explanation: "ASI is the principal source of industrial statistics in India, capturing structured data from registered factories regarding capital, inputs, output, and value added."
  },
  {
    id: 22,
    question: "In cluster sampling, when is relative efficiency highest compared to simple random sampling?",
    options: {
      A: "When clusters are internally heterogeneous and between-cluster variance is minimal",
      B: "When clusters are internally identical and homogeneous",
      C: "When cluster size equals population size",
      D: "When no clusters are sampled"
    },
    correctAnswer: "A",
    topic: "Sampling Theory",
    explanation: "Cluster sampling achieves greatest precision when each individual cluster mirrors the diverse characteristics of the full population (internally heterogeneous) while clusters are similar to one another."
  },
  {
    id: 23,
    question: "Expectation of life at age x (denoted e_x) in an actuarial life table indicates:",
    options: {
      A: "The probability of dying before age x + 1",
      B: "The average number of complete additional years an individual surviving to age x can expect to live",
      C: "The modal age of death in the cohort",
      D: "The proportion of individuals who survive beyond retirement"
    },
    correctAnswer: "B",
    topic: "Demographic Statistics",
    explanation: "e_x designates the complete expectation of life at age x, signifying the mean expected future lifespan for individuals who have already survived to age x."
  },
  {
    id: 24,
    question: "Which of the following describes the difference between Gross Domestic Product (GDP) and Net Domestic Product (NDP)?",
    options: {
      A: "Subsidies paid to public corporations",
      B: "Consumption of Fixed Capital (Depreciation)",
      C: "Net Factor Income from Abroad",
      D: "Export duties"
    },
    correctAnswer: "B",
    topic: "National Income",
    explanation: "Net Domestic Product (NDP) = Gross Domestic Product (GDP) - Depreciation (Consumption of Fixed Capital)."
  },
  {
    id: 25,
    question: "The Data Processing Division (DPD) of the NSSO is primarily responsible for:",
    options: {
      A: "Canvassing schedules in rural clusters",
      B: "Electronic validation, coding, processing, and tabulation of survey microdata",
      C: "Drafting monetary policy benchmarks",
      D: "Printing annual union budgets"
    },
    correctAnswer: "B",
    topic: "Official Statistical System",
    explanation: "DPD (based in Kolkata) processes the vast microdata gathered by FOD, implementing automated scrutiny, imputation, editing, and table compilation."
  },
  {
    id: 26,
    question: "In an unbiased estimator, the mathematical expectation of the estimator must equal:",
    options: {
      A: "Zero",
      B: "The true population parameter",
      C: "The sample standard error",
      D: "The maximum observed sample value"
    },
    correctAnswer: "B",
    topic: "Estimation Theory",
    explanation: "An estimator θ̂ is unbiased for parameter θ if and only if E(θ̂) = θ across all conceivable samples."
  },
  {
    id: 27,
    question: "Consumer Price Index (CPI) numbers are specifically designed to measure:",
    options: {
      A: "Wholesale transactions at factory gates",
      B: "Average change over time in retail prices paid by consumer households for a fixed basket of goods and services",
      C: "Foreign currency exchange fluctuations",
      D: "Corporate bond yields"
    },
    correctAnswer: "B",
    topic: "Index Numbers",
    explanation: "CPI tracks movements in retail prices of commodities and services consumed by target population segments (e.g. rural, urban, or industrial workers)."
  },
  {
    id: 28,
    question: "Real GDP is calculated by valuing current production at:",
    options: {
      A: "Current market prices",
      B: "Constant base-year prices",
      C: "Future projected prices",
      D: "Foreign exchange parity prices"
    },
    correctAnswer: "B",
    topic: "National Income",
    explanation: "Real GDP isolates physical volume changes in economic production from inflation by valuing all goods and services at fixed, constant base-year prices."
  },
  {
    id: 29,
    question: "In multi-stage sampling, the units selected at the final stage of sampling are termed:",
    options: {
      A: "First Stage Units (FSUs)",
      B: "Ultimate Stage Units (USUs)",
      C: "Stratum boundaries",
      D: "Radix elements"
    },
    correctAnswer: "B",
    topic: "Sampling Theory",
    explanation: "In hierarchical multi-stage designs, the primary divisions are First Stage Units (FSUs), while the final sampling units from which survey measurements are collected are Ultimate Stage Units (USUs)."
  },
  {
    id: 30,
    question: "Which of the following indices is known as an 'Ideal' index because it avoids both upward and downward substitution bias?",
    options: {
      A: "Marshall-Edgeworth Index",
      B: "Fisher's Ideal Index",
      C: "Laspeyres Index",
      D: "Paasche Index"
    },
    correctAnswer: "B",
    topic: "Index Numbers",
    explanation: "Fisher's Ideal Index strikes a geometric balance between the upward bias of Laspeyres and the downward bias of Paasche, making it conceptually and mathematically ideal."
  }
];

export function getCurriculumQuestions(count: number): Question[] {
  const targetCount = count === 30 ? 30 : count === 20 ? 20 : 10;
  return STATISTICAL_CURRICULUM_BANK.slice(0, targetCount).map((q: any, idx: number) => ({
    ...q,
    id: idx + 1,
    detailedSolution: q.detailedSolution || {
      type: "theoretical",
      coreConcept: `${q.topic} - Core Principles`,
      conceptualExplanation: q.explanation,
      whyCorrect: `Option ${q.correctAnswer} is correct: "${q.options[q.correctAnswer]}". ${q.explanation}`,
      whyIncorrect: "Other options either contradict standard MoSPI/UPSC definitions or refer to alternative frameworks.",
      keyTakeaway: `Key Takeaway: Master verified standard definitions in ${q.topic}.`,
      laymanExplanation: `In simple terms: ${q.explanation}`
    }
  }));
}
