// src/lib/narrativesHG.js
// FM Lab Report Explainer — "Easy Hinglish" Narrative Library
//
// Simple, conversational Hindi + English for better accessibility.

export const narrativesHG = {

  ALL_NORMAL: {
    verdictCard:
      "Badhiya news — aapke saare numbers healthy range mein hain. Sperm count, movement aur shape sab theek hai. ✅",
    narrative:
      "Sab kuch solid dikh raha hai — count accha hai, movement healthy hai, aur shape bhi normal hai. Fertility ke liye ye 3 cheezein sabse zaroori hoti hain aur aapki report mein ye bilkul on track hain. Agar aap aur aapki partner 1 saal se zyada time se try kar rahe hain aur success nahi mili, toh sirf semen test kaafi nahi hai — sperm DNA quality aur partner ke tests karwana bhi zaroori ho sakta hai. 🧬",
    actions: [
      { timeline: "Immediate", action: "Apni partner ke saath ye results share karein. Agar doctor se mil rahe hain toh ye report saath le jayein.", fertiQ: false },
      { timeline: "30 Days", action: "Kam se kam 7–9 ghante ki neend lein, hafte mein 150 minute exercise karein, aur accha khana (fish, nuts, vegetables) khao. 🥗", fertiQ: false },
      { timeline: "90 Days", action: "Agar phir bhi conceive nahi ho raha, toh 3 mahine baad ek baar phir test karwayein.", fertiQ: false },
    ],
    fertiQContext:
      "Numbers ko healthy rakhne ke liye daily nutritional support. Isme wahi nutrients hain (zinc, CoQ10) jo sperm health ko protect karte hain.",
    notConceivingNote:
      "Standard semen test sirf count aur movement dekhta hai — ye sperm ki DNA quality nahi dekh sakta. Agar report normal hai phir bhi conceive nahi ho raha, toh doctor se in cheezon ke baare mein poochein: (1) Sperm DNA quality test (DFI), (2) Hormone check (FSH, LH, Testosterone), aur (3) Partner ka fertility check. 👨‍⚕️",
  },

  ISOLATED_LOW_COUNT: {
    verdictCard:
      "Sperm count thoda kam hai, par movement aur shape ekdum healthy hai. Ye kaafi common hai aur lifestyle badalne se theek ho sakta hai. 📉",
    narrative:
      "Aapke sperm swim accha kar rahe hain aur shape bhi normal hai — bas unki quantity thodi kam hai. Aise samajhiye ki field par players toh acche hain, bas player ki ginti badhani hai. Garmi (laptop lap par rakhna, tight underwear), kam neend aur nutrients ki kami iska bada reason hote hain. Zinc aur antioxidants sperm production badhane mein help karte hain. 90 din baad re-test karne se pata chalega ki improvements ho rahi hain ya nahi. 🩺",
    actions: [
      { timeline: "Immediate", action: "Laptop ko lap par rakhna band karein, aur tight underwear avoid karein — zyada garmi se sperm count kam hota hai. 💻", fertiQ: false },
      { timeline: "30 Days", action: "Zinc-rich khana khao (seeds, eggs). Daily supplement lene se sperm production cycle (74 days) mein help milti hai. 💊", fertiQ: true },
      { timeline: "90 Days", action: "Ek baar phir semen analysis karwayein dekhne ke liye ki count badha ya nahi.", fertiQ: false },
    ],
    fertiQContext:
      "Aapko bas sperm ki quantity badhani hai. FertiQ mein Zinc aur Selenium hain jo 90-day cycle mein sperm production ko support karte hain.",
  },

  ISOLATED_LOW_MOTILITY: {
    verdictCard:
      "Sperm ki movement (swimming) healthy range se kam hai, par count aur shape theek hai. Sahi support se movement sudhar sakti hai. 🏊‍♂️",
    narrative:
      "Aap healthy sperm toh bana rahe hain — bas unhe behtar swim karne mein madad chahiye. Isme diet, stress aur lifestyle ka bada role hota hai. CoQ10 aur antioxidants movement behtar karne ke liye sabse best maane jaate hain. Doctor se 90-day plan ke baare mein baat karein aur check karein ki kya badlav aata hai. ⚡",
    actions: [
      { timeline: "Immediate", action: "Alcohol kam karein aur smoking bilkul band kar dein — ye dono sperm ki speed slow kar dete hain. 🚭", fertiQ: false },
      { timeline: "30 Days", action: "Daily CoQ10 aur antioxidant supplement shuru karein. CoQ10 sperm ke andar ke 'engine' ko power deta hai. 🔋", fertiQ: true },
      { timeline: "90 Days", action: "Re-test karwayein aur lab se kahein ki 'Progressive Motility' (aage badhne waali speed) alag se check karein.", fertiQ: false },
    ],
    fertiQContext:
      "Sperm ko swim karne ke liye energy chahiye. FertiQ mein CoQ10 hai jo sperm ke 'engine' ko power deta hai aur unki speed badhata hai.",
  },

  ISOLATED_LOW_MORPHOLOGY: {
    verdictCard:
      "Sperm shape score thoda kam hai, par count aur movement healthy hai. Ghabraiye mat, sirf low shape score se koi badi problem nahi hoti. 🔬",
    narrative:
      "Ek baat samajhna zaroori hai: healthy men mein bhi zyada sperm 'abnormal' shape ke hi hote hain. Bar sirf 4% par set hota hai, yaani 96% abnormal honi par bhi report normal maani jaati hai. Shape kam hone ka matlab ye bilkul nahi hai ki honi waale bacche ki health mein koi issue hoga. Accha khana aur stress kam karna sperm shape ko behtar karne ka sabse accha tareeka hai. 🥗",
    actions: [
      { timeline: "Immediate", action: "Daily 5 tarah ke colorful fruits aur vegetables khao — antioxidants sperm ko cell damage se bachate hain. 🍎", fertiQ: false },
      { timeline: "30 Days", action: "Antioxidant supplement lein. Sperm shape cell damage ki wajah se bigadti hai aur antioxidants isse prevent karte hain.", fertiQ: true },
      { timeline: "90 Days", action: "Dusse lab ya same method (Kruger) se test karwayein taaki numbers sahi se compare ho sakein.", fertiQ: false },
    ],
    fertiQContext:
      "Stress aur pollution se sperm cells ko damage hota hai jisse shape bigadti hai. FertiQ ke antioxidants is damage ko rokne mein help karte hain.",
    morphologyNote:
      "Agar shape score 3% ya 2% hai toh darne ki baat nahi hai. Millions sperm mein se ye fark bahut chota hai, aur bahut se mard natural tarike se baap bante hain is score ke saath.",
  },

  LOW_COUNT_LOW_MOTILITY: {
    verdictCard:
      "Count aur movement dono healthy range se thoda kam hain. Jab do numbers kam hon, toh ispe dhyaan dena zaroori hai, par ye theek ho sakta hai. ⚖️",
    narrative:
      "Aise samjhiye ki players ki ginti kam hai aur woh slow bhi daud rahe hain. Jab dono numbers saath mein kam hote hain, toh aksar unka reason ek hi hota hai (stress, garmi ya hormone balance). Iska matlab hai ki ek sahi lifestyle plan se dono ko theek kiya ja sakta hai. Ek fertility doctor se milna aur 90 din ka nutrition plan shuru karna best rahega. 🩺",
    actions: [
      { timeline: "Immediate", action: "Doctor se milein aur apna hormone level (FSH, LH, Testosterone) check karwayein. Hormone gap se count aur speed dono kam hoti hai.", fertiQ: false },
      { timeline: "30 Days", action: "Daily fertility supplement shuru karein, garmi se bachein (tight clothes nahi), aur hafte mein 5 din exercise karein. 🏃‍♂️", fertiQ: true },
      { timeline: "90 Days", action: "Mahine baad dobara test karwayein dekhne ke liye ki kitna sudhar aaya hai.", fertiQ: false },
    ],
    fertiQContext:
      "Count aur movement dono ke liye Zinc aur CoQ10 zaroori hain. FertiQ in dono ko ek saath deliver karta hai taaki aapko do alag cheezein na leni padein.",
  },

  ALL_THREE_LOW: {
    verdictCard:
      "Teeno main numbers (count, movement, shape) kam hain. Jab sab numbers kam hon toh aksar uska ek main reason hota hai jiska treatment ho sakta hai. 🚩",
    narrative:
      "Jab teeno numbers kam hote hain, toh aksar koi ek badi vajah hoti hai — jaise hormone gap, body stress ya koi physical issue. Ye acchi baat hai kyunki ek hi treatment plan se teeno numbers sudhar sakte hain. Sabse pehle ek fertility specialist se milna chahiye root cause janne ke liye. Saath mein nutrition aur lifestyle pe dhyaan dekar body ko analyze karein. 👨‍⚕️",
    actions: [
      { timeline: "Immediate", action: "Jald se jald fertility specialist (Andrologist) se milein. Hormone test aur varicocele (swollen veins) ka checkup karwayein.", fertiQ: false },
      { timeline: "30 Days", action: "Mediterranean diet (fish, nuts, olive oil) follow karein aur daily supplement shuru karein. Smoking/Alcohol band kar dein. 🚭", fertiQ: true },
      { timeline: "90 Days", action: "Check-up aur supplement ke baad 3 mahine baad dobara report check karein.", fertiQ: false },
    ],
    fertiQContext:
      "Teeno numbers kam hone ka matlab hai body ko extra support chahiye. FertiQ ke Zinc, CoQ10 aur Vitamins aapki doctor-suggested treatment ke saath support karte hain.",
  },

  CRITICAL_COUNT: {
    verdictCard:
      "Sperm count bahut zyada kam hai. Iske liye doctor se milna bahut zaroori hai, kyunki bahut se common reasons ka treatment available hai. ⚠️",
    narrative:
      "Count bahut kam hone ka matlab hai ki aapko jald hi doctor se salah leni chahiye. Iska reason 'varicocele' (naso ki sujan) ya hormone imbalance ho sakta hai, aur dono ka hi accha ilaaj hai. Ghabraiye mat, ye sirf ek starting point hai, final result nahi. Sahi treatment se count badhne ke bahut chances hote hain. 🩺",
    actions: [
      { timeline: "Immediate", action: "Jald se jald doctor (Urologist/Andrologist) se milein. Scrotum scan karwa kar varicoceles check karwayein.", fertiQ: false },
      { timeline: "30 Days", action: "Doctor ki salah ke saath supplement shuru karein. Garmi aur toxins (Nashe) se bilkul door rahein. 🚫", fertiQ: true },
      { timeline: "90 Days", action: "Doctor ke plan ko follow karein aur phir test report check karein.", fertiQ: false },
    ],
    fertiQContext:
      "Sperm banane ke liye body ko extra support chahiye. FertiQ ke nutrients aapke treatment ke saath side-by-side work karte hain.",
  },

  LOW_VOLUME: {
    verdictCard:
      "Aapka semen volume kam hai. Aksar ye dehydration ya sahi samay par sample na lene ki vajah se hota hai. 💧",
    narrative:
      "Kam volume ka matlab aksar ye hota hai ki aapne test se pehle dhoop mein zyada kaam kiya ho ya paani kam piya ho. Agle test se pehle 2–5 din ka gap rakhein aur khoob saara paani piyein. Agar phir bhi kam aaye, toh doctor se physical checkup karwayein. Iska matlab fertility khatam hona nahi hota. 🥛",
    actions: [
      { timeline: "Immediate", action: "Din mein 2–3 litre paani piyein. Agli baar test se pehle 2–5 din ka abstinence gap rakhein.", fertiQ: false },
      { timeline: "30 Days", action: "Dobara test karwayein aur poora sample container mein collection ka dhyaan rakhein.", fertiQ: false },
      { timeline: "90 Days", action: "Agar volume phir bhi kam hai, toh specialist se milein. Woh check karenge ki koi blockage toh nahi hai.", fertiQ: false },
    ],
  },

  FALLBACK: {
    verdictCard:
      "Aapki report thodi alag hai, par ghabrane ki baat nahi — doctor isse behtar samjha payenge. 🩺",
    narrative:
      "Kabhi kabhi results normal patterns mein fit nahi hote, aur ye okay hai. Specialist se milkar apni poori report discuss karein. Tab tak, niche diye gaye lifestyle tips follow karne se sperm health behtar rehti hai.",
    actions: [
      { timeline: "Immediate", action: "Ek men's fertility specialist (Andrologist) se milkar apni poori report share karein.", fertiQ: false },
      { timeline: "30 Days", action: "Broad nutritional support ke liye daily supplement shuru karein. Accha khana aur exercise help karegi. 🏃‍♂️", fertiQ: true },
      { timeline: "90 Days", action: "Sudhar check karne ke liye mahine baad dobara test karwayein.", fertiQ: false },
    ],
    fertiQContext:
      "Jab tak doctor poori report na dekh lein, body ko basic Zinc, CoQ10 aur Vitamins ka support dena hamesha faydemand hota hai.",
  },
};
