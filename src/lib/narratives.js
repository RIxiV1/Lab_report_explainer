// src/lib/narratives.js
// FM Lab Report Explainer — Clinical Narrative Library
// ForMen Health · https://formen.health
//
// Each entry maps a snippetKey (from analyzeReport.js) to the text
// content shown in the verdict hero, action timeline, and modals.

export const narratives = {

  ALL_NORMAL: {
    verdictCard:
      "Great news — all your numbers are in the healthy range. Your sperm count, movement, and shape all look good. You're in a strong position.",
    narrative:
      "Everything looks solid — good count, healthy movement, and normal shape. These are the three things that matter most for fertility, and yours are all on track. If you and your partner have been trying for 12 months or more without success (6+ months if she's over 35), a normal standard semen analysis is only part of the picture — this is the moment to look at sperm DNA fragmentation and your partner's workup, not to stop investigating.",
    actions: [
      { timeline: "Immediate", action: "Share these results with your partner and your fertility doctor if you have one", fertiQ: false },
      { timeline: "30 Days", action: "Lock in consistent sleep (7-9 hrs), exercise (150 min/wk), and a Mediterranean-style diet", fertiQ: false },
      { timeline: "90 Days", action: "Retest if conception hasn't occurred to confirm values remain stable", fertiQ: false },
    ],
    // Shown as a callout when verdict is ALL_NORMAL — addresses the
    // "normal report but not conceiving" case that a single semen
    // analysis cannot explain on its own.
    notConceivingNote:
      "A standard semen analysis measures count, movement, and shape — but it does NOT measure sperm DNA integrity or many other fertility factors. If you've been trying for a while and this report came back normal, ask your doctor about: (1) a DNA fragmentation test (DFI), (2) a full hormone panel, (3) your partner's fertility workup in parallel. Unexplained infertility is often just un-tested infertility.",
  },

  ISOLATED_LOW_COUNT: {
    verdictCard:
      "Your sperm count is a bit low, but movement and shape look healthy. This is very common and often improves with simple lifestyle changes.",
    narrative:
      "Your sperm are moving well and shaped normally — there just aren't as many as we'd like to see. Think of it as needing more players on the field, while the ones you have are already doing great. Things like too much heat, poor sleep, and missing nutrients are common causes. Targeted nutrition (zinc, antioxidants) can support sperm production, and a retest in 90 days will show if things are improving.",
    actions: [
      { timeline: "Immediate", action: "Eliminate laptop-on-lap use, hot tubs, and tight underwear to reduce scrotal heat", fertiQ: false },
      { timeline: "30 Days", action: "Add zinc-rich foods (oysters, pumpkin seeds, lean beef) and consider a daily fertility supplement with CoQ10 and zinc", fertiQ: true },
      { timeline: "90 Days", action: "Repeat semen analysis to measure count improvement after one full sperm cycle", fertiQ: false },
    ],
  },

  ISOLATED_LOW_MOTILITY: {
    verdictCard:
      "Your sperm movement is below the healthy range, but count and shape are fine. Movement often improves with the right support.",
    narrative:
      "You're making plenty of healthy-looking sperm — they just need help swimming better. Diet, stress, and lifestyle play a big role here, and small changes can make a real difference. Antioxidants and CoQ10 are the nutrients most studied for supporting motility. Talk to your doctor about a 90-day plan and retest to see how things change.",
    actions: [
      { timeline: "Immediate", action: "Cut alcohol to ≤ 4 drinks/week and stop smoking or vaping if applicable", fertiQ: false },
      { timeline: "30 Days", action: "Begin a daily CoQ10 + antioxidant supplement to support the mitochondrial function that powers sperm movement", fertiQ: true },
      { timeline: "90 Days", action: "Repeat semen analysis focusing on progressive motility percentage", fertiQ: false },
    ],
  },

  ISOLATED_LOW_MORPHOLOGY: {
    verdictCard:
      "Your sperm shape score is below the range, but count and movement are both healthy. This number is often misunderstood — a low score here is rarely a problem on its own.",
    narrative:
      "Here's some important context: even in men who have no fertility issues, most sperm have imperfect shapes. The bar is set at just 4%, so 96% can look 'abnormal' and that's still fine. One thing worth saying clearly — shape scoring under the microscope does NOT predict health problems in a future baby. Your count and movement are solid, which matters more. Eating well, staying active, and reducing stress are the best ways to support shape over time.",
    actions: [
      { timeline: "Immediate", action: "Add 5+ servings of colorful fruits and vegetables daily for antioxidant support", fertiQ: false },
      { timeline: "30 Days", action: "Start a daily antioxidant-rich supplement to target the oxidative damage linked to morphology changes", fertiQ: true },
      { timeline: "90 Days", action: "Retest morphology alongside a full semen analysis to assess improvement", fertiQ: false },
    ],
    morphologyNote:
      "A shape score of 3% or even 2% can look scary, but the 'normal' bar is only 4%. The difference between 3% and 4% out of millions of sperm is tiny, and many men have children naturally with scores like this.",
  },

  LOW_COUNT_LOW_MOTILITY: {
    verdictCard:
      "Your count and movement are both below the healthy range, but sperm shape looks fine. Two numbers being low needs attention, but this is often fixable.",
    narrative:
      "Think of it as fewer players on the field and those players running a bit slower — but they're in good shape. When both numbers are low together, they often share one cause (like too much heat, stress, or a hormone gap), which means one plan can fix both. See a fertility doctor to check for common causes. A nutrition + lifestyle plan plus a retest in 90 days is usually the right next step.",
    actions: [
      { timeline: "Immediate", action: "Schedule an appointment with a reproductive urologist for physical exam and hormone panel", fertiQ: false },
      { timeline: "30 Days", action: "Begin a daily fertility supplement, eliminate heat exposure, and start 30 min moderate exercise 5x/week", fertiQ: true },
      { timeline: "90 Days", action: "Repeat full semen analysis to compare count and motility trends", fertiQ: false },
    ],
  },

  LOW_COUNT_LOW_MORPHOLOGY: {
    verdictCard:
      "Your count and shape are below the range, but your sperm are swimming well. That's a good sign — and both numbers are often improvable.",
    narrative:
      "The good news is your sperm are moving strongly, even if there are fewer and their shape scores are lower. Shape is widely misunderstood — even men with no fertility problems score low here. Healthy eating and targeted nutrition give you the best chance at improving both numbers. A reproductive urologist visit is a sensible early step to rule out treatable causes.",
    actions: [
      { timeline: "Immediate", action: "Book a reproductive urologist visit to check for varicocele and get a hormone panel (FSH, LH, testosterone)", fertiQ: false },
      { timeline: "30 Days", action: "Shift to an antioxidant-rich, Mediterranean-style diet and add a daily fertility supplement", fertiQ: true },
      { timeline: "90 Days", action: "Retest semen analysis to track changes in count and morphology together", fertiQ: false },
    ],
  },

  LOW_MOTILITY_LOW_MORPHOLOGY: {
    verdictCard:
      "Your movement and shape are below the range, but your count is normal. You're producing enough sperm — now we focus on quality, which is often improvable.",
    narrative:
      "Your body is making a healthy number of sperm — that's a strong starting point. When movement and shape are both low, they usually share one cause (often related to cell damage from stress or toxins), so one plan can help both. Antioxidants, diet, and removing heat exposure are the most impactful levers. Combine them with the lifestyle tips below and retest after 90 days.",
    actions: [
      { timeline: "Immediate", action: "Eliminate smoking, vaping, and recreational drugs — these directly impair motility and morphology", fertiQ: false },
      { timeline: "30 Days", action: "Add omega-3-rich foods (salmon, walnuts, flaxseed) to your diet and begin a daily fertility supplement", fertiQ: true },
      { timeline: "90 Days", action: "Repeat semen analysis with strict morphology assessment to compare trends", fertiQ: false },
    ],
  },

  ALL_THREE_LOW: {
    verdictCard:
      "Many men with results like these go on to have children — the key is a clear plan. All three main numbers are low, which usually points to one treatable cause, not three separate issues.",
    narrative:
      "When all three numbers are low, it usually means there's one underlying reason — like a hormone gap, excess body stress, or a fixable physical issue — rather than three different problems. That's actually good news, because one treatment plan can improve all three. A fertility doctor should be your first step to find the root cause. Nutritional support can run alongside medical workup while you get clarity.",
    actions: [
      { timeline: "Immediate", action: "Book a reproductive urologist appointment — request hormone panel, scrotal ultrasound, and DNA fragmentation test", fertiQ: false },
      { timeline: "30 Days", action: "Overhaul diet toward Mediterranean pattern, begin regular moderate exercise, and add a daily fertility supplement", fertiQ: true },
      { timeline: "90 Days", action: "Repeat full semen analysis and compare all three parameters to this baseline", fertiQ: false },
    ],
    morphologyNote:
      "A low shape score alongside other low numbers can feel overwhelming, but remember: the 'normal' bar is just 4%. Shape is the most variable number on a semen report and can change a lot between tests, even at the same lab.",
  },

  CRITICAL_COUNT: {
    verdictCard:
      "A low sperm count is one of the most treatable fertility findings. This needs a specialist visit, but many causes have proven treatments with strong success rates. This is a starting point, not a final answer.",
    narrative:
      "A very low count means it's important to see a fertility doctor soon. Common causes — like a vein issue, hormone gap, or blockage — all have well-proven treatments. While you get checked, avoiding heat, eating well, and cutting out toxins gives your body the best chance to recover. This is a starting point, not an endpoint.",
    actions: [
      { timeline: "Immediate", action: "Schedule a reproductive urologist appointment within 1-2 weeks — request hormone panel and scrotal ultrasound", fertiQ: false },
      { timeline: "30 Days", action: "Begin a daily fertility supplement as an adjunct while awaiting specialist guidance; eliminate all heat and toxin exposure", fertiQ: true },
      { timeline: "90 Days", action: "Follow urologist's treatment plan and repeat semen analysis to measure response", fertiQ: false },
    ],
  },

  CRITICAL_MOTILITY: {
    verdictCard:
      "Sperm movement is one of the numbers that responds best to treatment and lifestyle changes. A specialist can find the cause, and real improvement is very possible within 90 days.",
    narrative:
      "Very low movement can come from energy problems in the sperm, physical issues, or cell damage — all of which a fertility doctor can look into. The good news is that movement is one of the numbers that improves most with the right changes. CoQ10 and antioxidants directly support the energy system that powers sperm movement. See a specialist first, then build a 90-day plan together.",
    actions: [
      { timeline: "Immediate", action: "Book a reproductive urologist visit — ask about anti-sperm antibody testing and advanced motility assessment", fertiQ: false },
      { timeline: "30 Days", action: "Begin a daily CoQ10 supplement for mitochondrial support; stop all tobacco and alcohol", fertiQ: true },
      { timeline: "90 Days", action: "Retest semen analysis with focus on progressive vs. non-progressive motility breakdown", fertiQ: false },
    ],
  },

  CRITICAL_MORPHOLOGY: {
    verdictCard:
      "Sperm shape is the most misread number on a semen report. Even healthy, fertile men often score in the low single digits. A low score alone doesn't predict your chances, and it responds well to diet and lifestyle changes.",
    narrative:
      "The shape scoring system is strict on purpose — even healthy men regularly score low. A very low number is worth looking into, but on its own it doesn't tell us much about your chances. One important reassurance: a low shape score does NOT mean a baby conceived from this sperm will have any health or developmental issues — this metric looks at how sperm appear under a microscope, not at the genes they carry. The best thing you can do is eat well, avoid toxins, and consider an antioxidant-focused nutrition plan, then retest after 90 days.",
    actions: [
      { timeline: "Immediate", action: "Consult a reproductive urologist to rule out contributing factors like varicocele or infection", fertiQ: false },
      { timeline: "30 Days", action: "Adopt a strict antioxidant-rich diet — berries, leafy greens, nuts, fish — and add a daily fertility supplement", fertiQ: true },
      { timeline: "90 Days", action: "Repeat semen analysis with strict Kruger morphology at the same lab for accurate comparison", fertiQ: false },
    ],
  },

  LOW_VOLUME: {
    verdictCard:
      "Your volume is below the typical range. This is usually related to how the sample was collected or hydration, but worth checking if it stays low.",
    narrative:
      "Low volume is often caused by not collecting the full sample, not waiting long enough between tests, or not drinking enough water. Before worrying, make sure your next test follows the 2–5 day wait and that you're well hydrated. If it stays low after retesting, a fertility doctor can check for physical causes. This alone doesn't define your fertility.",
    actions: [
      { timeline: "Immediate", action: "Increase daily water intake to 2-3 liters and observe 2-5 days abstinence before any retest", fertiQ: false },
      { timeline: "30 Days", action: "Retest semen analysis with strict collection protocol — full sample, proper container, 2-5 day abstinence", fertiQ: false },
      { timeline: "90 Days", action: "If volume remains low, see a reproductive urologist to rule out retrograde ejaculation or ductal obstruction", fertiQ: false },
    ],
  },

  ABNORMAL_PH_HIGH: {
    verdictCard:
      "Your pH is higher than normal. This can point to a mild infection, but it's easy to check and treat.",
    narrative:
      "A high pH may mean there's a mild infection or inflammation, which can usually be cleared with a short course of antibiotics. It's worth getting checked soon, especially if your white blood cell count is also high. Once treated, pH usually goes back to normal. This is fixable and not a long-term issue.",
    actions: [
      { timeline: "Immediate", action: "See your doctor or urologist for a semen culture and prostate evaluation", fertiQ: false },
      { timeline: "30 Days", action: "Complete any prescribed antibiotic course in full, even if symptoms resolve early", fertiQ: false },
      { timeline: "90 Days", action: "Retest semen analysis to confirm pH has normalized post-treatment", fertiQ: false },
    ],
  },

  ABNORMAL_PH_LOW: {
    verdictCard:
      "Your pH is lower than normal. This is uncommon and may be a sample collection issue. If it happens again, it's worth a check-up.",
    narrative:
      "Low pH can happen if the sample wasn't collected cleanly, or sometimes if there's a blockage. If your volume is also low, it's more reason to get checked. A fertility doctor can quickly tell if imaging is needed. In many cases, a careful retest clears things up.",
    actions: [
      { timeline: "Immediate", action: "Review collection method with your clinic — contamination or partial sample can artificially lower pH", fertiQ: false },
      { timeline: "30 Days", action: "Repeat semen analysis with careful attention to complete collection and proper container use", fertiQ: false },
      { timeline: "90 Days", action: "If pH remains low, see a reproductive urologist for transrectal ultrasound to evaluate ductal anatomy", fertiQ: false },
    ],
  },

  ELEVATED_WBC: {
    verdictCard:
      "Your white blood cell count is high, which could mean a mild infection or inflammation. This is usually easy to treat.",
    narrative:
      "White blood cells in your sample often point to a bacterial infection or mild inflammation. If left alone, this can slowly affect sperm quality, so getting it checked soon is a good idea. Your doctor will do a simple culture test to find any bacteria, then prescribe antibiotics if needed. Most men see their levels go back to normal after one round of treatment.",
    actions: [
      { timeline: "Immediate", action: "Request a semen culture from your doctor to identify any bacterial infection", fertiQ: false },
      { timeline: "30 Days", action: "Complete the full antibiotic course if prescribed; begin a daily antioxidant supplement to offset WBC-driven oxidative stress", fertiQ: true },
      { timeline: "90 Days", action: "Repeat semen analysis to confirm WBC normalization and check for sperm quality improvement", fertiQ: false },
    ],
  },

  BORDERLINE_MULTIPLE: {
    verdictCard:
      "Several of your numbers are just at or slightly below the line. None are critically low, which is reassuring — but small improvements across the board can make a big difference.",
    narrative:
      "When several numbers are near the borderline, you don't need a big change in any one area — just a small push in each. This is actually one of the easiest profiles to improve with lifestyle changes. Broad-spectrum nutrition covers most of the nutritional basics that support improvement. Think of it as fine-tuning, not a major overhaul.",
    actions: [
      { timeline: "Immediate", action: "Audit your sleep, exercise, heat exposure, and alcohol intake — small fixes across all four add up", fertiQ: false },
      { timeline: "30 Days", action: "Transition to a whole-foods, antioxidant-rich diet and add a daily fertility supplement", fertiQ: true },
      { timeline: "90 Days", action: "Retest semen analysis to see if the broad lifestyle push has moved borderline values into normal range", fertiQ: false },
    ],
  },

  HIGH_URGENCY_MODIFIER: {
    verdictCard:
      "Given your timeline, acting quickly matters. Starting now gives you the best window for improvement.",
    narrative:
      "Every week counts. Sperm take about 74 days to develop, so changes you make today start showing in your results about 2.5–3 months from now. Start supplements, lifestyle changes, and doctor visits all at once — don't wait to do them one by one. If your partner is also getting checked, coordinate with your clinic so neither of you is waiting on the other.",
    actions: [
      { timeline: "Immediate", action: "Begin all recommended actions in parallel rather than sequentially — time is your most valuable resource", fertiQ: true },
      { timeline: "30 Days", action: "Check in with your fertility clinic to align your improvement timeline with any partner-side treatment plans", fertiQ: false },
      { timeline: "90 Days", action: "Retest and review results with your reproductive urologist to decide on next steps before your window narrows", fertiQ: false },
    ],
  },

  AGE_MODIFIER: {
    verdictCard:
      "Your age is worth noting, though male fertility doesn't drop as sharply as often discussed. Taking action now can make a real difference.",
    narrative:
      "After 40, sperm DNA quality can gradually decline and hormone levels may shift. This doesn't mean you can't improve — it means the changes you make now are even more valuable. Ask your doctor about a DNA fragmentation test for a fuller picture. CoQ10 and antioxidants are the nutrients most studied for protecting against age-related sperm damage.",
    actions: [
      { timeline: "Immediate", action: "Request a sperm DNA fragmentation test from your reproductive urologist for a fuller picture of sperm health", fertiQ: false },
      { timeline: "30 Days", action: "Start a daily CoQ10 + antioxidant supplement — this coverage matters more as age-related oxidative stress increases", fertiQ: true },
      { timeline: "90 Days", action: "Repeat semen analysis plus DNA fragmentation to track both conventional and advanced metrics", fertiQ: false },
    ],
  },

  FALLBACK: {
    verdictCard:
      "Your results don't fit a common pattern, but that's okay — a specialist can help make sense of them.",
    narrative:
      "Sometimes results don't fit neatly into one category, and that's normal. The best next step is to have a fertility doctor review your full report. In the meantime, the lifestyle tips below support sperm health no matter what your numbers look like.",
    actions: [
      { timeline: "Immediate", action: "Book a consultation with a reproductive urologist to review these results in person", fertiQ: false },
      { timeline: "30 Days", action: "Begin a daily fertility supplement for broad-spectrum nutritional support while awaiting specialist input", fertiQ: true },
      { timeline: "90 Days", action: "Repeat semen analysis to establish a second data point for trend comparison", fertiQ: false },
    ],
  },
};