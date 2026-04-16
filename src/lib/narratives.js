// src/lib/narratives.js
// FM Lab Report Explainer — Clinical Narrative Library
// ForMen Health · https://formen.health
//
// Each entry maps a snippetKey (from analyzeReport.js) to the text
// content shown in the verdict hero, action timeline, and modals.
//
// Action items use outcomes-first phrasing ("Check if your hormone
// levels are blocking sperm production") rather than test names
// ("request hormone panel"). The clinical name is kept in parentheses
// so curious users can search for it, but the why-it-matters comes first.
//
// fertiQContext is the per-result line shown on the FertiQ card so the
// supplement is positioned as a solution to *this* result, not a generic
// banner ad.

export const narratives = {

  ALL_NORMAL: {
    verdictCard:
      "Great news — all your numbers are in the healthy range. Your sperm count, movement, and shape all look good. You're in a strong position.",
    narrative:
      "Everything looks solid — good count, healthy movement, and normal shape. These are the three things that matter most for fertility, and yours are all on track. If you and your partner have been trying for 12 months or more without success (6+ months if she's over 35), a normal semen test is only part of the picture — it's worth looking at sperm DNA quality and your partner's tests too, not stopping here.",
    actions: [
      { timeline: "Immediate", action: "Share these results with your partner. If you're seeing a fertility doctor, take this report along.", fertiQ: false },
      { timeline: "30 Days", action: "Lock in 7–9 hours of sleep, exercise 150 minutes a week, and eat more whole foods (fish, nuts, vegetables).", fertiQ: false },
      { timeline: "90 Days", action: "If you're still trying, get re-tested to make sure your numbers stay strong.", fertiQ: false },
    ],
    fertiQContext:
      "Daily nutritional support to keep your numbers strong while you keep trying. Built around the same nutrients (zinc, CoQ10, antioxidants) shown to protect sperm health.",
    notConceivingNote:
      "A standard semen test only checks count, movement, and shape — it can't see sperm DNA quality or many other things that affect fertility. If you've been trying for a while and this report came back normal, ask your doctor about: (1) a sperm DNA quality test (DFI), (2) a hormone check (FSH, LH, testosterone), (3) your partner's fertility check at the same time. Most 'unexplained' infertility is just untested infertility.",
  },

  ISOLATED_LOW_COUNT: {
    verdictCard:
      "Your sperm count is a bit low, but movement and shape look healthy. This is very common and often improves with simple lifestyle changes.",
    narrative:
      "Your sperm are moving well and shaped normally — there just aren't as many as we'd like to see. Think of it as needing more players on the field, while the ones you have are already doing great. Heat (laptops, hot baths, tight underwear), poor sleep, and missing nutrients are common causes. Targeted nutrition (zinc, antioxidants) supports sperm production, and a re-test in 90 days will show if things are improving.",
    actions: [
      { timeline: "Immediate", action: "Stop using laptops on your lap, avoid hot baths and tight underwear — heat lowers sperm production.", fertiQ: false },
      { timeline: "30 Days", action: "Eat more zinc-rich foods (pumpkin seeds, lean meat, eggs). A daily supplement with zinc and CoQ10 supports the 74-day sperm production cycle.", fertiQ: true },
      { timeline: "90 Days", action: "Re-test your semen analysis to see if your count has improved after one full sperm cycle.", fertiQ: false },
    ],
    fertiQContext:
      "Your sperm are moving and shaped well — you just need more of them. Zinc, CoQ10 and selenium in FertiQ are the nutrients shown to support sperm production over a 90-day cycle.",
  },

  ISOLATED_LOW_MOTILITY: {
    verdictCard:
      "Your sperm movement is below the healthy range, but count and shape are fine. Movement often improves with the right support.",
    narrative:
      "You're making plenty of healthy-looking sperm — they just need help swimming better. Diet, stress, and lifestyle play a big role here, and small changes can make a real difference. CoQ10 and antioxidants are the nutrients most studied for supporting movement. Talk to your doctor about a 90-day plan and re-test to see how things change.",
    actions: [
      { timeline: "Immediate", action: "Cut down on alcohol (4 drinks a week or less). If you smoke or vape, stop — both directly slow sperm down.", fertiQ: false },
      { timeline: "30 Days", action: "Start a daily CoQ10 + antioxidant supplement. CoQ10 powers the 'engine' inside each sperm — the part that lets it swim.", fertiQ: true },
      { timeline: "90 Days", action: "Re-test your semen analysis and ask the lab to break out progressive (forward) movement separately.", fertiQ: false },
    ],
    fertiQContext:
      "Sperm need energy to swim. CoQ10 in FertiQ is the same nutrient that powers the 'engine' inside each sperm cell — directly linked to better movement.",
  },

  ISOLATED_LOW_MORPHOLOGY: {
    verdictCard:
      "Your sperm shape score is below the range, but count and movement are both healthy. This number is often misunderstood — a low score here is rarely a problem on its own.",
    narrative:
      "Important context: even men with no fertility issues, most sperm have imperfect shapes. The bar is set at just 4%, so 96% can look 'abnormal' and that's still fine. One thing worth saying clearly — shape scoring under the microscope does NOT predict any health problems in a future baby. Your count and movement are solid, which matters more. Eating well, staying active, and reducing stress are the best ways to support shape over time.",
    actions: [
      { timeline: "Immediate", action: "Eat 5 or more servings of colourful fruits and vegetables every day — antioxidants protect sperm from cell damage.", fertiQ: false },
      { timeline: "30 Days", action: "Add a daily antioxidant supplement. Sperm shape is hit hardest by oxidative damage — the kind antioxidants directly protect against.", fertiQ: true },
      { timeline: "90 Days", action: "Re-test, and ask the lab to use the same Kruger method again so the numbers can be compared fairly.", fertiQ: false },
    ],
    fertiQContext:
      "Sperm shape is hit hardest by cell damage from stress and toxins. Antioxidants in FertiQ protect against exactly that kind of damage.",
    morphologyNote:
      "A shape score of 3% or even 2% can look scary, but the 'normal' bar is only 4%. The difference between 3% and 4% out of millions of sperm is tiny, and many men have children naturally with scores like this.",
  },

  LOW_COUNT_LOW_MOTILITY: {
    verdictCard:
      "Your count and movement are both below the healthy range, but sperm shape looks fine. Two numbers being low needs attention, but this is often fixable.",
    narrative:
      "Think of it as fewer players on the field and those players running a bit slower — but they're in good shape. When both numbers are low together, they often share one cause (heat, stress, or a hormone gap), which means one plan can fix both. See a fertility doctor to find out what's behind it. A nutrition + lifestyle plan plus a re-test in 90 days is usually the right next step.",
    actions: [
      { timeline: "Immediate", action: "Book a fertility doctor (men's specialist). Ask them to check your hormone levels (FSH, LH, testosterone) — a hormone gap can lower both count and movement.", fertiQ: false },
      { timeline: "30 Days", action: "Start a daily fertility supplement, cut out heat exposure, and do 30 minutes of moderate exercise 5 days a week.", fertiQ: true },
      { timeline: "90 Days", action: "Re-test your semen analysis to see how count and movement have changed.", fertiQ: false },
    ],
    fertiQContext:
      "When both count and movement are low, they often share one cause. FertiQ's zinc + CoQ10 combination supports both — the production side and the energy side — at the same time.",
  },

  LOW_COUNT_LOW_MORPHOLOGY: {
    verdictCard:
      "Your count and shape are below the range, but your sperm are swimming well. That's a good sign — and both numbers are often improvable.",
    narrative:
      "The good news is your sperm are moving strongly, even if there are fewer and their shape scores are lower. Shape is widely misunderstood — even men with no fertility problems score low here. Healthy eating and targeted nutrition give you the best chance at improving both numbers. A men's fertility specialist visit is a sensible early step to rule out causes that can be treated.",
    actions: [
      { timeline: "Immediate", action: "Book a men's fertility specialist. Ask them to: (1) feel for varicoceles (swollen veins in the scrotum — a common, fixable cause of low count), and (2) check hormone levels (FSH, LH, testosterone).", fertiQ: false },
      { timeline: "30 Days", action: "Switch to a Mediterranean-style diet (fish, nuts, olive oil, fruit, vegetables) and start a daily fertility supplement.", fertiQ: true },
      { timeline: "90 Days", action: "Re-test your semen analysis to see how count and shape have changed together.", fertiQ: false },
    ],
    fertiQContext:
      "Both production (count) and quality (shape) need the same building blocks: zinc, antioxidants, and CoQ10. FertiQ delivers all three in one daily dose.",
  },

  LOW_MOTILITY_LOW_MORPHOLOGY: {
    verdictCard:
      "Your movement and shape are below the range, but your count is normal. You're producing enough sperm — now we focus on quality, which is often improvable.",
    narrative:
      "Your body is making a healthy number of sperm — that's a strong starting point. When movement and shape are both low, they usually share one cause (often cell damage from stress or toxins), so one plan can help both. Antioxidants, diet, and removing heat exposure are the most powerful changes you can make. Combine them with the lifestyle tips below and re-test after 90 days.",
    actions: [
      { timeline: "Immediate", action: "Stop smoking, vaping, and any recreational drug use — these directly damage both sperm movement and shape.", fertiQ: false },
      { timeline: "30 Days", action: "Eat omega-3 rich foods (salmon, walnuts, flaxseed) and start a daily fertility supplement to repair cell damage.", fertiQ: true },
      { timeline: "90 Days", action: "Re-test your semen analysis with the same Kruger shape method so the numbers can be compared fairly.", fertiQ: false },
    ],
    fertiQContext:
      "Movement and shape both depend on healthy sperm cells. Antioxidants and CoQ10 in FertiQ protect the cell membrane (shape) and power the 'engine' (movement) at the same time.",
  },

  ALL_THREE_LOW: {
    verdictCard:
      "Many men with results like these still go on to have children — the key is a clear plan. All three main numbers are low, which usually points to one underlying cause that can be treated, not three separate problems.",
    narrative:
      "When all three numbers are low, it usually means there's one underlying reason — like a hormone gap, body stress, or a fixable physical issue — rather than three different problems. That's actually good news, because one treatment plan can improve all three. A fertility doctor should be your first step to find the root cause. Nutritional support can run alongside medical workup while you get clarity.",
    actions: [
      { timeline: "Immediate", action: "Book a men's fertility specialist as soon as possible. Ask them to: (1) check your hormone levels (FSH, LH, testosterone), (2) do a quick scrotum scan to look for varicoceles (swollen veins, a fixable cause), and (3) order a sperm DNA quality test.", fertiQ: false },
      { timeline: "30 Days", action: "Move to a Mediterranean-style diet, start regular moderate exercise, and add a daily fertility supplement.", fertiQ: true },
      { timeline: "90 Days", action: "Re-test your full semen analysis and compare all three numbers against this baseline with your doctor.", fertiQ: false },
    ],
    fertiQContext:
      "All three numbers being low usually points to one underlying cause. Strong nutritional support — zinc, CoQ10, antioxidants in FertiQ — works alongside whatever your doctor finds and treats.",
    morphologyNote:
      "A low shape score alongside other low numbers can feel overwhelming, but remember: the 'normal' bar is just 4%. Shape is the most variable number on a semen report and can change a lot between tests, even at the same lab.",
  },

  CRITICAL_COUNT: {
    verdictCard:
      "A low sperm count is one of the most treatable fertility findings. This needs a specialist visit, but many causes have proven treatments with strong success rates. This is a starting point, not a final answer.",
    narrative:
      "A very low count means it's important to see a fertility doctor soon. Common causes — like a swollen vein in the scrotum (varicocele), a hormone gap, or a blockage — all have proven treatments. While you get checked, avoiding heat, eating well, and cutting out toxins gives your body the best chance to recover. This is a starting point, not an endpoint.",
    actions: [
      { timeline: "Immediate", action: "Book a men's fertility specialist within 1–2 weeks. Ask them to check your hormone levels (FSH, LH, testosterone) and do a quick scrotum scan to look for varicoceles.", fertiQ: false },
      { timeline: "30 Days", action: "Start a daily fertility supplement to support sperm production while you wait for tests. Cut out all heat (laptops, hot baths) and toxins (alcohol, tobacco).", fertiQ: true },
      { timeline: "90 Days", action: "Follow your doctor's plan and re-test your semen analysis to see how things have responded.", fertiQ: false },
    ],
    fertiQContext:
      "Sperm production needs zinc, CoQ10, and selenium — all in FertiQ. Useful as nutritional support alongside whatever treatment your doctor finds for the underlying cause.",
  },

  CRITICAL_MOTILITY: {
    verdictCard:
      "Sperm movement is one of the numbers that responds best to treatment and lifestyle changes. A specialist can find the cause, and real improvement is very possible within 90 days.",
    narrative:
      "Very low movement can come from energy problems inside the sperm, physical issues, or cell damage — all of which a fertility doctor can look into. The good news is that movement is one of the numbers that improves most with the right changes. CoQ10 and antioxidants directly support the 'engine' that powers sperm movement. See a specialist first, then build a 90-day plan together.",
    actions: [
      { timeline: "Immediate", action: "Book a men's fertility specialist. Ask them about anti-sperm antibody testing — sometimes the body's immune system attacks its own sperm and slows them down.", fertiQ: false },
      { timeline: "30 Days", action: "Start a daily CoQ10 supplement to fuel sperm energy. Stop all tobacco and alcohol — both directly slow sperm down.", fertiQ: true },
      { timeline: "90 Days", action: "Re-test your semen analysis and ask for the breakdown of forward (progressive) vs other movement.", fertiQ: false },
    ],
    fertiQContext:
      "Sperm need energy to swim — and that energy comes from CoQ10. FertiQ delivers a daily dose of CoQ10 plus antioxidants to fuel and protect the sperm cell.",
  },

  CRITICAL_MORPHOLOGY: {
    verdictCard:
      "Sperm shape is the most misread number on a semen report. Even healthy, fertile men often score in the low single digits. A low score alone doesn't predict your chances, and it responds well to diet and lifestyle changes.",
    narrative:
      "The shape scoring system is strict on purpose — even healthy men regularly score low. A very low number is worth looking into, but on its own it doesn't tell us much about your chances. One important reassurance: a low shape score does NOT mean a baby conceived from this sperm will have any health or developmental issues — this only looks at how sperm appear under a microscope, not at the genes they carry. The best thing you can do is eat well, avoid toxins, and start an antioxidant-focused nutrition plan, then re-test after 90 days.",
    actions: [
      { timeline: "Immediate", action: "See a men's fertility specialist to rule out fixable causes like varicoceles (swollen scrotal veins) or infection.", fertiQ: false },
      { timeline: "30 Days", action: "Eat a strict antioxidant-rich diet — berries, leafy greens, nuts, fish — and start a daily fertility supplement.", fertiQ: true },
      { timeline: "90 Days", action: "Re-test at the same lab using the same Kruger shape method, so the numbers can be compared accurately.", fertiQ: false },
    ],
    fertiQContext:
      "Sperm shape is hit hardest by oxidative damage to the cell. Antioxidants in FertiQ are designed to protect exactly the part of the sperm that determines shape.",
  },

  LOW_VOLUME: {
    verdictCard:
      "Your volume is below the typical range. This is usually related to how the sample was collected or hydration, but worth checking if it stays low.",
    narrative:
      "Low volume is often caused by not collecting the full sample, not waiting long enough between tests, or not drinking enough water. Before worrying, make sure your next test waits 2–5 days and you're well hydrated. If it stays low after re-testing, a fertility doctor can check for physical causes. This alone doesn't define your fertility.",
    actions: [
      { timeline: "Immediate", action: "Drink 2–3 litres of water a day. Wait 2–5 days between any tests for accurate volume.", fertiQ: false },
      { timeline: "30 Days", action: "Re-test with proper collection: full sample in the right container, after 2–5 days of waiting.", fertiQ: false },
      { timeline: "90 Days", action: "If volume is still low, see a men's fertility specialist. They can rule out a blockage in the tubes or semen going backward into the bladder (both treatable).", fertiQ: false },
    ],
  },

  ABNORMAL_PH_HIGH: {
    verdictCard:
      "Your pH is higher than normal. This can point to a mild infection, but it's easy to check and treat.",
    narrative:
      "A high pH may mean there's a mild infection or inflammation, which can usually be cleared with a short course of antibiotics. It's worth getting checked soon, especially if your white blood cell count is also high. Once treated, pH usually goes back to normal. This is fixable and not a long-term issue.",
    actions: [
      { timeline: "Immediate", action: "See your doctor for a semen culture (a test to find any bacteria) and a quick prostate check.", fertiQ: false },
      { timeline: "30 Days", action: "Finish any antibiotic course in full — even if you feel better early.", fertiQ: false },
      { timeline: "90 Days", action: "Re-test your semen analysis to confirm pH is back to normal after treatment.", fertiQ: false },
    ],
  },

  ABNORMAL_PH_LOW: {
    verdictCard:
      "Your pH is lower than normal. This is uncommon and may be a sample collection issue. If it happens again, it's worth a check-up.",
    narrative:
      "Low pH can happen if the sample wasn't collected cleanly, or sometimes if there's a blockage. If your volume is also low, it's more reason to get checked. A fertility doctor can quickly tell if a scan is needed. In many cases, a careful re-test clears things up.",
    actions: [
      { timeline: "Immediate", action: "Talk to your clinic about how the sample was collected — a partial sample or contamination can lower pH.", fertiQ: false },
      { timeline: "30 Days", action: "Re-test your semen analysis with extra care: full sample, proper container.", fertiQ: false },
      { timeline: "90 Days", action: "If pH is still low, see a men's fertility specialist. A scan can check for a blockage in the tubes that carry sperm.", fertiQ: false },
    ],
  },

  ELEVATED_WBC: {
    verdictCard:
      "Your white blood cell count is high, which could mean a mild infection or inflammation. This is usually easy to treat.",
    narrative:
      "White blood cells in your sample often point to a bacterial infection or mild inflammation. Left alone, this can slowly affect sperm quality, so getting it checked soon is a good idea. Your doctor will do a simple culture test to find any bacteria, then prescribe antibiotics if needed. Most men see their levels go back to normal after one round of treatment.",
    actions: [
      { timeline: "Immediate", action: "Ask your doctor for a semen culture — a quick test to find out if there's bacteria causing the inflammation.", fertiQ: false },
      { timeline: "30 Days", action: "Finish any antibiotic course in full. Add a daily antioxidant supplement to help sperm recover from the inflammation damage.", fertiQ: true },
      { timeline: "90 Days", action: "Re-test your semen analysis to confirm white blood cells are back to normal and check if sperm quality has improved.", fertiQ: false },
    ],
    fertiQContext:
      "Inflammation creates oxidative damage that hurts sperm. Antioxidants in FertiQ help your sperm recover while the underlying infection is treated.",
  },

  BORDERLINE_MULTIPLE: {
    verdictCard:
      "Several of your numbers are just at or slightly below the line. None are critically low, which is reassuring — but small improvements across the board can make a big difference.",
    narrative:
      "When several numbers are near the borderline, you don't need a big change in any one area — just a small push in each. This is actually one of the easiest profiles to improve with lifestyle changes. Broad-spectrum nutrition covers most of the basics that support improvement. Think of it as fine-tuning, not a major overhaul.",
    actions: [
      { timeline: "Immediate", action: "Look at your sleep, exercise, heat exposure, and alcohol — small fixes across all four add up to real improvement.", fertiQ: false },
      { timeline: "30 Days", action: "Move to a whole-foods, antioxidant-rich diet and add a daily fertility supplement.", fertiQ: true },
      { timeline: "90 Days", action: "Re-test your semen analysis to see if the broad lifestyle push has moved the borderline numbers into the healthy range.", fertiQ: false },
    ],
    fertiQContext:
      "Borderline numbers respond best to small, broad nutritional support. FertiQ covers the main micronutrients (zinc, CoQ10, selenium, antioxidants) that move multiple numbers up at once.",
  },

  HIGH_URGENCY_MODIFIER: {
    verdictCard:
      "Given your timeline, acting quickly matters. Starting now gives you the best window for improvement.",
    narrative:
      "Every week counts. Sperm take about 74 days to develop, so changes you make today start showing in your results about 2.5–3 months from now. Start supplements, lifestyle changes, and doctor visits all at once — don't wait to do them one by one. If your partner is also getting checked, line up the timing with your clinic so neither of you is waiting on the other.",
    actions: [
      { timeline: "Immediate", action: "Start everything in parallel — supplement, lifestyle changes, and doctor visit. Don't wait for one before starting the next.", fertiQ: true },
      { timeline: "30 Days", action: "Check in with your fertility clinic to line up your timeline with any treatment your partner is doing.", fertiQ: false },
      { timeline: "90 Days", action: "Re-test and review the results with your fertility doctor to plan next steps before your window narrows.", fertiQ: false },
    ],
  },

  AGE_MODIFIER: {
    verdictCard:
      "Your age is worth noting, though male fertility doesn't drop as sharply as is often discussed. Taking action now can make a real difference.",
    narrative:
      "After 40, sperm DNA quality can gradually decline and hormone levels may shift. This doesn't mean you can't improve — it means the changes you make now are even more valuable. Ask your doctor about a sperm DNA quality test for a fuller picture. CoQ10 and antioxidants are the nutrients most studied for protecting against age-related sperm damage.",
    actions: [
      { timeline: "Immediate", action: "Ask your fertility doctor for a sperm DNA quality test (DFI). A standard semen test can't see DNA damage — this one can.", fertiQ: false },
      { timeline: "30 Days", action: "Start a daily CoQ10 + antioxidant supplement. After 40, your body produces less CoQ10 naturally — supplementing matters more.", fertiQ: true },
      { timeline: "90 Days", action: "Re-test your semen analysis along with the DNA quality test, so you have both standard and advanced numbers to track.", fertiQ: false },
    ],
  },

  FALLBACK: {
    verdictCard:
      "Your results don't fit a common pattern, but that's okay — a specialist can help make sense of them.",
    narrative:
      "Sometimes results don't fit neatly into one category, and that's normal. The best next step is to have a fertility doctor review your full report. In the meantime, the lifestyle tips below support sperm health no matter what your numbers look like.",
    actions: [
      { timeline: "Immediate", action: "Book a fertility doctor (men's specialist) to go through these results with you in person.", fertiQ: false },
      { timeline: "30 Days", action: "Start a daily fertility supplement for broad nutritional support while you wait for the specialist visit.", fertiQ: true },
      { timeline: "90 Days", action: "Re-test your semen analysis to get a second data point so trends become clear.", fertiQ: false },
    ],
    fertiQContext:
      "Until your doctor has the full picture, broad-spectrum nutritional support (zinc, CoQ10, antioxidants in FertiQ) covers the basics that support sperm health.",
  },
};
