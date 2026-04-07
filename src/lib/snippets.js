// src/lib/snippets.js
// FM Lab Report Explainer — Narrative Snippet Library
// ForMen Health · https://formen.health

export const snippets = {

  ALL_NORMAL: {
    verdictCard:
      "Great news — your semen analysis results are within normal ranges across the board. This means your sperm count, motility, and morphology all meet WHO reference values. You're in a strong position for natural conception.",
    narrative:
      "Your results paint a reassuring picture: healthy count, strong motility, and normal morphology working together as they should. These three parameters are the foundation of male fertility, and yours are all performing well. That said, fertility is a dynamic process — maintaining a healthy lifestyle will help keep these numbers steady over time. Share this with your partner so you can both feel confident moving forward.",
    actions: [
      { timeline: "Immediate", action: "Share these results with your partner and your fertility doctor if you have one", fertiQ: false },
      { timeline: "30 Days", action: "Lock in consistent sleep (7-9 hrs), exercise (150 min/wk), and a Mediterranean-style diet", fertiQ: false },
      { timeline: "90 Days", action: "Retest if conception hasn't occurred to confirm values remain stable", fertiQ: false },
    ],
  },

  ISOLATED_LOW_COUNT: {
    verdictCard:
      "Your sperm count came in below the reference range, but your motility and morphology look healthy. A low count on its own is one of the most common findings, and this is often improvable with targeted lifestyle changes.",
    narrative:
      "When motility and morphology are normal, a lower count often responds well to straightforward interventions — think of it as needing more players on the field while the ones you have are already performing well. Factors like heat exposure, sleep disruption, and nutritional gaps are frequent culprits. FertiQ — ForMen's fertility supplement formulated with CoQ10 and zinc — is designed to support sperm production and may be worth discussing with your doctor as part of your plan. A follow-up test in 90 days will show whether these changes are moving the needle.",
    actions: [
      { timeline: "Immediate", action: "Eliminate laptop-on-lap use, hot tubs, and tight underwear to reduce scrotal heat", fertiQ: false },
      { timeline: "30 Days", action: "Start FertiQ daily and add zinc-rich foods (oysters, pumpkin seeds, lean beef)", fertiQ: true },
      { timeline: "90 Days", action: "Repeat semen analysis to measure count improvement after one full sperm cycle", fertiQ: false },
    ],
  },

  ISOLATED_LOW_MOTILITY: {
    verdictCard:
      "Your sperm motility is below the reference range, while your count and morphology are in good shape. Motility measures how well sperm swim, and this is often improvable with the right support.",
    narrative:
      "Your body is producing a healthy number of well-shaped sperm — they just need help with their swimming efficiency. Motility is highly sensitive to oxidative stress, which means antioxidant intake and lifestyle factors can make a meaningful difference. FertiQ — ForMen's fertility supplement formulated with CoQ10 and zinc — is designed to support sperm motility and energy production at the cellular level. Discuss adding it to your routine with your doctor, and plan a retest at the 90-day mark to track progress.",
    actions: [
      { timeline: "Immediate", action: "Cut alcohol to ≤ 4 drinks/week and stop smoking or vaping if applicable", fertiQ: false },
      { timeline: "30 Days", action: "Begin FertiQ daily to deliver CoQ10 and antioxidants that support mitochondrial function in sperm", fertiQ: true },
      { timeline: "90 Days", action: "Repeat semen analysis focusing on progressive motility percentage", fertiQ: false },
    ],
  },

  ISOLATED_LOW_MORPHOLOGY: {
    verdictCard:
      "Your morphology score is below the reference range, but your count and motility are both healthy. Morphology is the most misunderstood metric on a semen analysis, and a low number here is rarely cause for alarm on its own.",
    narrative:
      "Even in men with proven fertility, the majority of sperm have imperfect shapes — the WHO threshold is just 4%, meaning 96% of sperm can be 'abnormal' and that's still considered normal. With your count and motility in good shape, you have plenty of well-moving sperm to compensate. Reducing oxidative stress through diet, exercise, and supplementation is the best-studied way to support morphology over time. Screenshot this and share it with your partner — context matters more than the number.",
    actions: [
      { timeline: "Immediate", action: "Add 5+ servings of colorful fruits and vegetables daily for antioxidant support", fertiQ: false },
      { timeline: "30 Days", action: "Start FertiQ daily — its antioxidant blend targets the oxidative damage linked to morphology changes", fertiQ: true },
      { timeline: "90 Days", action: "Retest morphology alongside a full semen analysis to assess improvement", fertiQ: false },
    ],
    morphologyNote:
      "A morphology score of 3% or even 2% can look alarming, but remember: the normal threshold is only 4%. The difference between 3% and 4% in a sample of millions of sperm is clinically minor, and many men conceive naturally with scores in this range.",
  },

  LOW_COUNT_LOW_MOTILITY: {
    verdictCard:
      "Your count and motility are both below reference ranges, while morphology looks fine. Two parameters being low together deserves attention, but this is often improvable — and your normal morphology is a positive sign.",
    narrative:
      "Think of this as having fewer players on the field and those players running a bit slower — but their form is solid. The combination of low count and low motility often shares a common root cause such as oxidative stress, heat exposure, or hormonal imbalance, which means a single intervention strategy can improve both. FertiQ — ForMen's fertility supplement formulated with CoQ10 and zinc — is designed to support both sperm production and motility simultaneously. Book a follow-up with a reproductive urologist to rule out varicocele or hormonal factors, and retest in 90 days.",
    actions: [
      { timeline: "Immediate", action: "Schedule an appointment with a reproductive urologist for physical exam and hormone panel", fertiQ: false },
      { timeline: "30 Days", action: "Start FertiQ daily, eliminate heat exposure, and begin 30 min moderate exercise 5x/week", fertiQ: true },
      { timeline: "90 Days", action: "Repeat full semen analysis to compare count and motility trends", fertiQ: false },
    ],
  },

  LOW_COUNT_LOW_MORPHOLOGY: {
    verdictCard:
      "Your count and morphology are below reference ranges, though your motility is healthy. This combination is worth addressing, but the fact that your sperm are swimming well is encouraging — and both metrics are often improvable.",
    narrative:
      "Your motility being normal tells us the sperm you're producing are energetic and functional, even if there are fewer of them and their shape scores are lower. Morphology in particular is widely misunderstood — even fertile men typically have very low 'normal forms' percentages. Combining lifestyle optimization with targeted supplementation gives you the best shot at moving both numbers. FertiQ — ForMen's fertility supplement formulated with CoQ10 and zinc — supports both sperm production and the antioxidant defense that influences morphology.",
    actions: [
      { timeline: "Immediate", action: "Book a reproductive urologist visit to check for varicocele and get a hormone panel (FSH, LH, testosterone)", fertiQ: false },
      { timeline: "30 Days", action: "Start FertiQ daily and shift to an antioxidant-rich, Mediterranean-style diet", fertiQ: true },
      { timeline: "90 Days", action: "Retest semen analysis to track changes in count and morphology together", fertiQ: false },
    ],
  },

  LOW_MOTILITY_LOW_MORPHOLOGY: {
    verdictCard:
      "Your motility and morphology are below reference ranges, while your count is normal. Having enough sperm is a strong foundation, and both motility and morphology are often improvable with targeted changes.",
    narrative:
      "A normal count means your body's production capacity is solid — the focus now shifts to quality and function. Low motility and morphology together often point to oxidative stress as a shared driver, which is good news because it means one strategy can address both. FertiQ — ForMen's fertility supplement formulated with CoQ10 and zinc — delivers the antioxidants and micronutrients most studied for improving sperm quality parameters. Pair supplementation with the lifestyle actions below and retest after a full 90-day sperm cycle.",
    actions: [
      { timeline: "Immediate", action: "Eliminate smoking, vaping, and recreational drugs — these directly impair motility and morphology", fertiQ: false },
      { timeline: "30 Days", action: "Start FertiQ daily and add omega-3-rich foods (salmon, walnuts, flaxseed) to your diet", fertiQ: true },
      { timeline: "90 Days", action: "Repeat semen analysis with strict morphology assessment to compare trends", fertiQ: false },
    ],
  },

  ALL_THREE_LOW: {
    verdictCard:
      "Your count, motility, and morphology are all below reference ranges. We know this can feel overwhelming to read, but all three parameters are often improvable, and many men in this situation see meaningful gains with the right plan.",
    narrative:
      "When all three core metrics are low, it usually points to a systemic factor — hormonal imbalance, significant oxidative stress, or a treatable anatomical issue like varicocele — rather than three separate problems. That's actually helpful because it means one well-targeted treatment plan can lift all three numbers together. A reproductive urologist should be your first call to identify the root cause. FertiQ — ForMen's fertility supplement formulated with CoQ10 and zinc — can complement medical guidance by supporting sperm production, motility, and antioxidant defense while you work through the diagnostic process.",
    actions: [
      { timeline: "Immediate", action: "Book a reproductive urologist appointment — request hormone panel, scrotal ultrasound, and DNA fragmentation test", fertiQ: false },
      { timeline: "30 Days", action: "Start FertiQ daily, overhaul diet toward Mediterranean pattern, and begin regular moderate exercise", fertiQ: true },
      { timeline: "90 Days", action: "Repeat full semen analysis and compare all three parameters to this baseline", fertiQ: false },
    ],
    morphologyNote:
      "Seeing a low morphology number alongside other low values can feel especially daunting, but remember: the WHO 'normal' threshold is just 4%. Morphology is the noisiest metric on a semen analysis and varies significantly between labs and even between samples from the same person.",
  },

  CRITICAL_COUNT: {
    verdictCard:
      "Your sperm count is severely low, which we know is hard to read. This level does warrant prompt medical evaluation, but even critically low counts can respond to treatment — this is often improvable with specialist care.",
    narrative:
      "A very low count means it's important to involve a reproductive urologist sooner rather than later to look for treatable causes like varicocele, hormonal deficiency, or obstruction. Many of these causes have well-established medical or surgical treatments with strong success rates. While you pursue evaluation, foundational changes — eliminating heat exposure, optimizing nutrition, and reducing toxin exposure — give your body the best environment for recovery. This is a starting point, not a final answer.",
    actions: [
      { timeline: "Immediate", action: "Schedule a reproductive urologist appointment within 1-2 weeks — request hormone panel and scrotal ultrasound", fertiQ: false },
      { timeline: "30 Days", action: "Start FertiQ daily as an adjunct while awaiting specialist guidance; eliminate all heat and toxin exposure", fertiQ: true },
      { timeline: "90 Days", action: "Follow urologist's treatment plan and repeat semen analysis to measure response", fertiQ: false },
    ],
  },

  CRITICAL_MOTILITY: {
    verdictCard:
      "Your sperm motility is very low, meaning most sperm aren't moving effectively. This is a finding that benefits from specialist evaluation, and motility is often improvable with the right interventions.",
    narrative:
      "Very low motility can stem from structural issues, mitochondrial energy deficits in the sperm tail, or significant oxidative damage — all of which a reproductive urologist can investigate. The good news is that motility is one of the most responsive parameters to both medical treatment and lifestyle change. FertiQ — ForMen's fertility supplement formulated with CoQ10 and zinc — specifically targets mitochondrial function in sperm cells, which powers tail movement. Get specialist input first, then build a comprehensive 90-day plan.",
    actions: [
      { timeline: "Immediate", action: "Book a reproductive urologist visit — ask about anti-sperm antibody testing and advanced motility assessment", fertiQ: false },
      { timeline: "30 Days", action: "Start FertiQ daily for CoQ10-driven mitochondrial support; stop all tobacco and alcohol", fertiQ: true },
      { timeline: "90 Days", action: "Retest semen analysis with focus on progressive vs. non-progressive motility breakdown", fertiQ: false },
    ],
  },

  CRITICAL_MORPHOLOGY: {
    verdictCard:
      "Your morphology score is very low, which can look alarming on paper. But morphology is the most variable and misunderstood metric on a semen analysis, and this is often improvable with lifestyle and nutritional changes.",
    narrative:
      "Strict morphology criteria are intentionally demanding — even healthy, fertile men routinely score in the low single digits. A very low score warrants attention but is not, on its own, a reliable predictor of fertility outcomes. The most productive step is to reduce oxidative stress through diet, supplementation, and toxin avoidance, then retest to see how your score responds over a full sperm production cycle. FertiQ — ForMen's fertility supplement formulated with CoQ10 and zinc — provides the antioxidant coverage most studied for morphology improvement.",
    actions: [
      { timeline: "Immediate", action: "Consult a reproductive urologist to rule out contributing factors like varicocele or infection", fertiQ: false },
      { timeline: "30 Days", action: "Start FertiQ daily and adopt a strict antioxidant-rich diet — berries, leafy greens, nuts, fish", fertiQ: true },
      { timeline: "90 Days", action: "Repeat semen analysis with strict Kruger morphology at the same lab for accurate comparison", fertiQ: false },
    ],
  },

  LOW_VOLUME: {
    verdictCard:
      "Your semen volume came in below the typical range. This is usually related to collection factors or hydration, but it's worth investigating if it persists.",
    narrative:
      "Low volume can result from incomplete sample collection, short abstinence time, dehydration, or — less commonly — a partial obstruction or retrograde ejaculation. Before drawing conclusions, ensure your next sample follows the recommended 2-5 day abstinence window and stays well-hydrated beforehand. If volume remains low on repeat testing, a reproductive urologist can check for structural causes. This finding on its own doesn't define your fertility potential.",
    actions: [
      { timeline: "Immediate", action: "Increase daily water intake to 2-3 liters and observe 2-5 days abstinence before any retest", fertiQ: false },
      { timeline: "30 Days", action: "Retest semen analysis with strict collection protocol — full sample, proper container, 2-5 day abstinence", fertiQ: false },
      { timeline: "90 Days", action: "If volume remains low, see a reproductive urologist to rule out retrograde ejaculation or ductal obstruction", fertiQ: false },
    ],
  },

  HIGH_VOLUME: {
    verdictCard:
      "Your semen volume is above the typical range. This is rarely a concern and often reflects a longer abstinence period before the test.",
    narrative:
      "Higher-than-average volume most commonly results from extended abstinence prior to collection. In rare cases it may be associated with inflammation of the accessory glands. If your other parameters are normal, this is unlikely to affect fertility. Ensure your next test follows the standard 2-5 day abstinence window for the most accurate overall results.",
    actions: [
      { timeline: "Immediate", action: "Confirm you observed the 2-5 day abstinence window — longer gaps inflate volume readings", fertiQ: false },
      { timeline: "30 Days", action: "Retest with strict 2-5 day abstinence to get a more representative volume measurement", fertiQ: false },
      { timeline: "90 Days", action: "If high volume persists alongside elevated WBC, consult a urologist to rule out accessory gland inflammation", fertiQ: false },
    ],
  },

  ABNORMAL_PH_HIGH: {
    verdictCard:
      "Your semen pH is higher than the normal range. This can indicate infection or inflammation, but it's a finding that's easy to investigate and address.",
    narrative:
      "An elevated pH may suggest an infection or inflammation in the prostate or seminal vesicles, which can often be treated with a short course of antibiotics. It's worth having this checked promptly, especially if you also have elevated white blood cells in your sample. Once any underlying cause is treated, pH typically normalizes. This is a treatable finding, not a long-term fertility obstacle.",
    actions: [
      { timeline: "Immediate", action: "See your doctor or urologist for a semen culture and prostate evaluation", fertiQ: false },
      { timeline: "30 Days", action: "Complete any prescribed antibiotic course in full, even if symptoms resolve early", fertiQ: false },
      { timeline: "90 Days", action: "Retest semen analysis to confirm pH has normalized post-treatment", fertiQ: false },
    ],
  },

  ABNORMAL_PH_LOW: {
    verdictCard:
      "Your semen pH is lower than the normal range. This is an uncommon finding that may indicate a sample collection issue or, less often, an obstruction worth investigating.",
    narrative:
      "Low pH can result from contamination during collection or from a blockage in the ejaculatory ducts that reduces the alkaline contribution from the seminal vesicles. If volume is also low, these two findings together strengthen the case for a structural evaluation. A reproductive urologist can quickly assess whether further imaging is needed. In many cases a repeat test with careful collection resolves the concern.",
    actions: [
      { timeline: "Immediate", action: "Review collection method with your clinic — contamination or partial sample can artificially lower pH", fertiQ: false },
      { timeline: "30 Days", action: "Repeat semen analysis with careful attention to complete collection and proper container use", fertiQ: false },
      { timeline: "90 Days", action: "If pH remains low, see a reproductive urologist for transrectal ultrasound to evaluate ductal anatomy", fertiQ: false },
    ],
  },

  ELEVATED_WBC: {
    verdictCard:
      "Your sample shows an elevated white blood cell count, which suggests possible infection or inflammation. This is typically straightforward to treat and resolve.",
    narrative:
      "White blood cells in semen — called leukocytospermia — often indicate a bacterial infection in the reproductive tract or prostate inflammation. Left untreated, the resulting oxidative stress can impair sperm quality over time, so prompt evaluation is valuable. The standard workup involves a semen culture to identify any bacteria, followed by targeted antibiotics if needed. Most men see their WBC levels normalize within one treatment cycle.",
    actions: [
      { timeline: "Immediate", action: "Request a semen culture from your doctor to identify any bacterial infection", fertiQ: false },
      { timeline: "30 Days", action: "Complete the full antibiotic course if prescribed; start FertiQ daily for antioxidant support against WBC-driven oxidative stress", fertiQ: true },
      { timeline: "90 Days", action: "Repeat semen analysis to confirm WBC normalization and check for sperm quality improvement", fertiQ: false },
    ],
  },

  BORDERLINE_MULTIPLE: {
    verdictCard:
      "Several of your values are sitting just at or slightly below the borderline. None are critically low, which is reassuring — but the pattern suggests your fertility potential would benefit from optimization.",
    narrative:
      "When multiple parameters hover near their thresholds, small improvements across the board can produce a meaningful cumulative effect on your overall fertility. This is actually one of the most responsive profiles to lifestyle intervention because you don't need a dramatic swing in any single metric — just a nudge in each. FertiQ — ForMen's fertility supplement formulated with CoQ10 and zinc — covers the nutritional bases most likely to support that broad-spectrum improvement. Think of it as fine-tuning rather than overhauling.",
    actions: [
      { timeline: "Immediate", action: "Audit your sleep, exercise, heat exposure, and alcohol intake — small fixes across all four add up", fertiQ: false },
      { timeline: "30 Days", action: "Start FertiQ daily and transition to a whole-foods, antioxidant-rich diet", fertiQ: true },
      { timeline: "90 Days", action: "Retest semen analysis to see if the broad lifestyle push has moved borderline values into normal range", fertiQ: false },
    ],
  },

  HIGH_URGENCY_MODIFIER: {
    verdictCard:
      "Because of the urgency of your fertility timeline, acting quickly on these recommendations is especially important. Time is a factor, and starting now gives you the best window for improvement.",
    narrative:
      "Given your timeline, every week counts. Sperm take roughly 74 days to develop, so changes you make today begin showing up in your semen analysis about 2.5-3 months from now. Starting supplementation, lifestyle changes, and specialist visits immediately — rather than sequentially — gives you the best chance of meaningful improvement within your window. If your partner is also undergoing evaluation, coordinating timelines with your fertility clinic ensures neither side is waiting on the other.",
    actions: [
      { timeline: "Immediate", action: "Begin all recommended actions in parallel rather than sequentially — time is your most valuable resource", fertiQ: true },
      { timeline: "30 Days", action: "Check in with your fertility clinic to align your improvement timeline with any partner-side treatment plans", fertiQ: false },
      { timeline: "90 Days", action: "Retest and review results with your reproductive urologist to decide on next steps before your window narrows", fertiQ: false },
    ],
  },

  AGE_MODIFIER: {
    verdictCard:
      "Your age is a factor worth acknowledging, though male fertility doesn't have the same sharp cliff that's often discussed for women. Proactive steps now can meaningfully protect your fertility potential.",
    narrative:
      "After age 40, sperm DNA fragmentation tends to increase and hormonal shifts can gradually affect production and quality. This doesn't mean your results can't improve — it means the improvements you make now carry extra value. A DNA fragmentation test provides the most useful additional data point at this stage, since standard semen analysis doesn't capture DNA integrity. FertiQ — ForMen's fertility supplement formulated with CoQ10 and zinc — includes the antioxidants most studied for reducing age-related DNA damage in sperm.",
    actions: [
      { timeline: "Immediate", action: "Request a sperm DNA fragmentation test from your reproductive urologist for a fuller picture of sperm health", fertiQ: false },
      { timeline: "30 Days", action: "Start FertiQ daily — CoQ10 and antioxidant coverage become more important as age-related oxidative stress increases", fertiQ: true },
      { timeline: "90 Days", action: "Repeat semen analysis plus DNA fragmentation to track both conventional and advanced metrics", fertiQ: false },
    ],
  },

  FALLBACK: {
    verdictCard:
      "We weren't able to match your results to a specific pattern, but that doesn't mean we can't help. Your report may have an unusual combination that benefits from professional interpretation.",
    narrative:
      "Semen analysis results can occasionally fall into patterns that don't fit neatly into standard categories, and that's okay. The most productive next step is to have a reproductive urologist review your full report in the context of your health history. In the meantime, the foundational lifestyle actions below support sperm health regardless of your specific numbers. FertiQ — ForMen's fertility supplement formulated with CoQ10 and zinc — provides broad nutritional support while you get personalized medical guidance.",
    actions: [
      { timeline: "Immediate", action: "Book a consultation with a reproductive urologist to review these results in person", fertiQ: false },
      { timeline: "30 Days", action: "Start FertiQ daily for broad-spectrum fertility nutritional support while awaiting specialist input", fertiQ: true },
      { timeline: "90 Days", action: "Repeat semen analysis to establish a second data point for trend comparison", fertiQ: false },
    ],
  },
};