export const SAMPLE_STATISTICAL_MATERIAL = {
  title: "Official Statistical System & Applied Statistics Handbook (Sample)",
  fileName: "Official_Statistical_System_Handbook_v1.pdf",
  fileSizeText: "245 KB (Preloaded PDF Material)",
  content: `OFFICIAL STATISTICAL SYSTEM AND APPLIED SAMPLING METHODOLOGY
A Comprehensive Guide for Statistical Officers and Survey Investigators

SECTION 1: STRUCTURE OF THE OFFICIAL STATISTICAL SYSTEM
The National Statistical System is the coordinated mechanism of government agencies responsible for the collection, processing, compilation, and dissemination of official statistical data.
In India and many decentralized statistical systems, the Ministry of Statistics and Programme Implementation (MoSPI) serves as the nodal agency. Key wings include:
1. Central Statistics Office (CSO): Responsible for national income accounting, preparation of national accounts (GDP, GNP, NNP), compilation of the Index of Industrial Production (IIP), Consumer Price Index (CPI-Urban/Rural), and Annual Survey of Industries (ASI).
2. National Sample Survey Office (NSSO): Conducts large-scale socio-economic sample surveys on household consumer expenditure, employment-unemployment, unorganized manufacturing, and agricultural conditions. Operates via four divisions: Survey Design and Research Division (SDRD), Field Operations Division (FOD), Data Processing Division (DPD), and Coordination and Publication Division (CPD).
3. National Statistical Commission (NSC): Established following the C. Rangarajan Commission recommendations to oversee statistical standards, methodology, and quality assurance.

SECTION 2: SAMPLING THEORY AND SURVEY METHODOLOGY
1. Simple Random Sampling (SRS):
- SRS with Replacement (SRSWR): Each sample unit can be selected more than once. The variance of the sample mean is Var(ȳ) = σ² / n.
- SRS without Replacement (SRSWOR): Each unit can be selected at most once. The variance of the sample mean is Var(ȳ) = (σ² / n) * ((N - n) / (N - 1)) = (S² / n) * (1 - f), where f = n/N is the sampling fraction and (1 - f) is the finite population correction (FPC). SRSWOR is always more efficient than SRSWR because its sampling variance is strictly smaller for n > 1.
2. Stratified Random Sampling:
- The heterogeneous population is partitioned into non-overlapping homogeneous sub-populations called strata.
- In proportional allocation, sample size n_i = n * (N_i / N).
- In optimum (Neyman) allocation, sample size is proportional to both stratum size and standard deviation: n_i = n * (N_i * S_i) / Σ(N_k * S_k). This minimizes variance for a fixed overall sample size.
3. Systematic Sampling:
- Selecting every k-th element after a random start between 1 and k. Highly convenient in field surveys; however, if the population has periodic fluctuations coinciding with interval k, systematic sampling can introduce heavy bias.
4. Cluster and Multi-stage Sampling:
- Used when complete frame of ultimate sampling units is unavailable or geographically dispersed. NSSO typically uses a stratified two-stage design where Census Villages (rural) or Urban Frame Survey (UFS) blocks are First Stage Units (FSUs), and households are Ultimate Stage Units (USUs).

SECTION 3: INDEX NUMBERS AND ECONOMIC INDICATORS
1. Laspeyres Price Index (Base Year Weighted):
L_P = [Σ (p1 * q0) / Σ (p0 * q0)] * 100
Tends to overestimate inflation because it does not account for consumer substitution when relative prices rise.
2. Paasche Price Index (Current Year Weighted):
P_P = [Σ (p1 * q1) / Σ (p0 * q1)] * 100
Tends to underestimate inflation.
3. Fisher's Ideal Index:
The geometric mean of Laspeyres and Paasche indices: F_P = √(L_P * P_P). It satisfies both the Time Reversal Test (TRT: I_01 * I_10 = 1) and the Factor Reversal Test (FRT: P_01 * Q_01 = V_01).
4. Consumer Price Index (CPI) and Wholesale Price Index (WPI):
CPI measures changes in the price level of a market basket of consumer goods and services purchased by households, with base year revisions periodically enacted.

SECTION 4: NATIONAL INCOME ACCOUNTING CONCEPTS
1. Gross Domestic Product (GDP): Total monetary value of all final goods and services produced within the geographic boundaries of a nation during a given financial year.
2. Gross National Product (GNP): GDP + Net Factor Income from Abroad (NFIA).
3. Net Domestic Product (NDP) = GDP - Depreciation (Consumption of Fixed Capital).
4. Net National Product at Factor Cost (NNP_FC): National Income = NNP at Market Prices - Net Indirect Taxes (Indirect Taxes - Subsidies).
5. Real vs. Nominal GDP: Nominal GDP is evaluated at current market prices; Real GDP is evaluated at constant base-year prices, eliminating the distortion of price inflation via the GDP Deflator = (Nominal GDP / Real GDP) * 100.

SECTION 5: DEMOGRAPHIC AND VITAL STATISTICS
1. Crude Birth Rate (CBR): Number of live births per 1,000 mid-year population.
2. Crude Death Rate (CDR): Number of deaths per 1,000 mid-year population.
3. Total Fertility Rate (TFR): The average number of children a woman would bear over her reproductive lifespan (ages 15-49) according to current age-specific fertility rates. Replacement-level fertility is typically 2.1 births per woman.
4. Life Table: A demographic model displaying the mortality experience of a synthetic cohort of individuals from birth (radix l_0 = 100,000) until the death of the last member. Key column: e_x (expectation of life at age x).`
};
