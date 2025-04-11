const vscode = require("vscode");
const axios = require("axios");
const moment = require("moment-hijri");
moment.locale("ar");

// إعدادات التكوين
const config = {
  city: "Cairo",
  prayerAPI: "https://api.aladhan.com/v1/timingsByAddress",
  مدة_التاخير: 10 * 60 * 1000, // 10 دقائق
};

// متغيرات التطبيق
let prayerTimes = {};
let subscriptions = [];
let مدة_التاخير;

// تحويل الوقت إلى نظام 12 ساعة
function convertTo12h(time24) {
  const [hour, minute] = time24.split(":").map(Number);
  let period = "الصبح";
  let h = hour % 12;
  h = h || 12; // الساعة 0 تصبح 12

  return {
    time: `${h}:${minute.toString().padStart(2, "0")} ${period}`,
    hour: h,
    minute,
    period,
  };
}

// جلب مواعيد الصلاة من API
async function fetchPrayerTimes() {
  try {
    const date = new Date();
    const response = await axios.get(config.prayerAPI, {
      params: {
        address: config.city,
        date: moment(date).format("DD-MMMM-YYYY"),
        method: 5,
      },
    });

    const data = response.data.data;
    prayerTimes = {
      fajr: convertTo12h(data.timings.Fajr),
      dhuhr: convertTo12h(data.timings.Dhuhr),
      asr: convertTo12h(data.timings.Asr),
      maghrib: convertTo12h(data.timings.Maghrib),
      isha: convertTo12h(data.timings.Isha),
      hijriDate: data.date.hijri.date,
    };
  } catch (error) {
    vscode.window.showErrorMessage("حدث خطأ في جلب مواعيد الصلاة");
  }
}

// التحقق من وقت الصلاة
function checkPrayerTime() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const isTimeMatch = (prayer) =>
    prayer.hour === currentHour % 12 && prayer.minute === currentMinute;

  if (isTimeMatch(prayerTimes.fajr)) {
    vscode.window.showInformationMessage("حان وقت صلاة الفجر");
  } else if (isTimeMatch(prayerTimes.dhuhr)) {
    vscode.window.showInformationMessage("حان وقت صلاة الظهر");
  } else if (isTimeMatch(prayerTimes.asr)) {
    vscode.window.showInformationMessage("حان وقت صلاة العصر");
  } else if (isTimeMatch(prayerTimes.maghrib)) {
    vscode.window.showInformationMessage("حان وقت صلاة المغرب");
  } else if (isTimeMatch(prayerTimes.isha)) {
    vscode.window.showInformationMessage("حان وقت صلاة العشاء");
  }
}

// إدارة التذكيرات
function setupReminders() {
  // تذكير دوري بذكر الله
  مدة_التاخير = setInterval(() => {
    const اذكار = [
      "سبحان الله",
      "الحمد لله",
      "الله أكبر",
      "لا إله إلا الله",
      "أستغفر الله",
      "لا حول ولا قوة إلا بالله",
      "سبحان الله وبحمده",
      "سبحان الله العظيم",
      "اللهم صل على محمد",
      "ما تصلّ علي النبي يا قلب اخوك",
      "اللهم اغفر لي",
      "اللهم إني أسألك الجنة",
      "اللهم أعني على ذكرك وشكرك وحسن عبادتك",
      "رب اغفر لي ولوالدي",
      "اللهم ثبت قلبي على دينك",
      "اللهم اهدني",
      "رضيت بالله ربا، وبالإسلام دينا، وبمحمد صلى الله عليه وسلم نبيا",
      "اللهم ارزقني توبة نصوحا",
      "اللهم اجعلني من التوابين",
      "اللهم اجعلني من المتقين",
      "اللهم ارحمني برحمتك",
      "اللهم إني أعوذ بك من الهم والحزن",
      "اللهم إني أعوذ بك من العجز والكسل",
      "اللهم إني أعوذ بك من الجبن والبخل",
      "اللهم إني أعوذ بك من غلبة الدين وقهر الرجال",
      "اللهم إني أسألك العفو والعافية",
      "اللهم يا مقلب القلوب ثبت قلبي على دينك",
      "يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله",
      "اللهم إني ظلمت نفسي ظلمًا كثيرًا",
      "اللهم إنك عفو تحب العفو فاعف عني",
      "اللهم اجعل القرآن ربيع قلبي",
    ];

    const ذكر_عشوائي = اذكار[Math.floor(Math.random() * اذكار.length)];
    vscode.window.showErrorMessage(ذكر_عشوائي);
  }, config.مدة_التاخير);

  // تذكير بالراحة
  if (
    vscode.workspace.getConfiguration().get("editor.openedTime") >
    60 * 60 * 1000
  ) {
    const تذكير_بالراحة = [
      "أنت كده طولت على نفسك، قوم خد لك استراحة.",
      "الدماغ خلاص اتقفلت، لازم تشيل رجلك شوية.",
      "العمل مش هيروح، خليك ريح شوية.",
      "مفيش حاجة هتخلص غير لما تعطي لنفسك وقت ترتاح فيه.",
      "أنت لو كملّت كده، هتنهار، قوم خذلك فاصل.",
      "الوقت خلص منك، خذلك كام دقيقة على جنب.",
      "كل شوية تشتغل كده، هتلاقي نفسك تعبت أكتر، لازم تريح.",
      "خليك واقف كده كتير مش هيفيدك، خدلك بريك.",
      "الذهن محتاج يشحن شوية، قوم ارتاح.",
      "التركيز هيروح منك، لازم تجيب شوية راحة.",
    ];

    const تذكير_عشوائي =
      تذكير_بالراحة[Math.floor(Math.random() * تذكير_بالراحة.length)];
    vscode.window.showInformationMessage(
      تذكير_عشوائي,

      { timeout: 30000 }
    );
  }

  // التحقق من أوقات الصلاة كل دقيقة
  const prayerCheckInterval = setInterval(checkPrayerTime, 60 * 1000);

  subscriptions.push(
    { dispose: () => clearInterval(مدة_التاخير) },
    { dispose: () => clearInterval(prayerCheckInterval) }
  );
}

// معالجة الأوامر النصية
function تجهيز_الاوامر_المكتوبة(text) {
  const commandPatterns = {
    وقت: /صحبي الساعة/,
    تاريخ: /صحبي (النهارده|التاريخ) كام/,
    صلاة: /صحبي (الظهر|الفجر|العصر|المغرب|العشاء)/,
    نكتة: /صحبي (قولي نكتة|ضحكني|انا زهقان)/,
    اكل: /صحبي (انا جعان|اكل ايه|اقترح اكل)/,
    فاجئني: /صحبي (فاجئني|اعمل حاجة عشوائية)/,
  };

  for (const [type, pattern] of Object.entries(commandPatterns)) {
    const match = text.match(pattern);
    if (match) {
      تجهيز_الاوامر(type, match[1]);
      return true;
    }
  }
  return false;
}

function تجهيز_الاوامر(type, detail) {
  switch (type) {
    case "وقت":
      عرض_الوقت_الحالي();
      break;
    case "تاريخ":
      عرض_التاريخ();
      break;
    case "صلاة":
      عرض_مواعيد_الصلاة(detail);
      break;
    case "نكتة":
      عرض_النكت();
      break;
    case "اكل":
      عرض_الاكل();
      break;
    case "فاجئني":
      عرض_المفاجئة();
      break;
  }
}

function عرض_الوقت_الحالي() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("ar-EG", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  vscode.window.showInformationMessage(`الوقت الحالي: ${timeString}`);
}

function عرض_التاريخ() {
  if (prayerTimes.hijriDate) {
    vscode.window.showInformationMessage(
      `التاريخ الهجري: ${prayerTimes.hijriDate}`
    );
  }
}

function عرض_مواعيد_الصلاة(prayerName) {
  const prayerMap = {
    الفجر: "fajr",
    الظهر: "dhuhr",
    العصر: "asr",
    المغرب: "maghrib",
    العشاء: "isha",
  };

  const prayerKey = prayerMap[prayerName];
  if (prayerTimes[prayerKey]) {
    vscode.window.showInformationMessage(
      `موعد صلاة ${prayerName}: ${prayerTimes[prayerKey].time}`
    );
  }
}

// عرض النكت
function عرض_النكت() {
  const نكت = [
    "ليه المبرمج بيروح الشغل بنضارة؟ عشان يتعامل مع الـ C++",
    "المبرمج الحقيقي لما يقع في الحب بيكتب: if (love == true) then marry();",
    "ليه المبرمجين مش بيحبوا البحر؟ عشان بيكرهوا الغرق في الـ bugs",
    "المبرمج دخل مطعم طلب بيتزا، الجرسون قاله: أقسمها؟ قاله: لا، هي بتشتغل كده!",
    "المبرمج قال لصاحبه: عندي crush على واحدة، قاله صاحبه: شغل antivirus بسرعة!",
    "ليه المبرمج بيكتب كود وهو نايم؟ عشان بيحلم بـ Java",
    "دخل المبرمج سينما، الفيلم وقف، قال: شكلها infinite loop",
    "المبرمجين لما بيتخانقوا، بيعملوا Git conflict",
    "ليه المبرمج مش بيروح الجيم؟ عشان كل يوم بيعمل Push",
    "المبرمج اتجوز، كتب مراته: new Wife();",
    "لما المبرمج يحب يسيب الشغل، بيكتب: exit(0);",
    "المبرمج لما يخلص الأكل يقول: return plate.Empty();",
    "ليه المبرمج بيحب الشتاء؟ عشان فيه bugs أقل!",
    "المبرمج لو زعل من واحد، يعمله: block(user);",
    "المبرمج لو حب واحدة من أول نظرة، يقول: love_at_first_if();",
    "المبرمج دخل مستشفى، قالوا له: انت عندك Stack Overflow!",
    "المبرمجين ما بيغرقوش، لأنهم دايمًا عندهم float",
    "مره مبرمج وقع من الدور التاني، قام قال: null pointer exception",
    "المبرمج لما يتجوز، يقول: I'm finally in a committed relationship",
    "المبرمج بيشتري حاجة من السوبر ماركت، يسأل: في version أحدث؟",
    "المبرمج بيروح ينام، يقول: shutdown -h now",
    "المبرمج لما يغلط، يعمل undo بدل ما يقول آسف",
    "لما المبرمج يصحي ابنه، يقول: wakeUp(child);",
    "المبرمج لما يدخل أوضة مظلمة، يعمل: light.switch(true);",
    "المبرمج دايمًا بيركب مواصلات async",
    "لما المبرمج يسمع نكتة بايخة، يقول: throw new LameJokeException();",
    "المبرمج مش بيرقص، هو بس بيعمل loops",
    "المبرمج اتجوز، خلف Array من الأطفال",
    "المبرمج بيحب يوم الجمعة، عشان بياخد break",
    "المبرمج لو شاف واحدة حلوة، يقول: this.girl = true;",
    "المبرمج لما يتفرج على ماتش، يقول: if(ball == goal) then cheer();",
    "المبرمج دايمًا بيسأل: فيه update؟",
    "المبرمج لو دخل امتحان، بيكتب الحل داخل function",
    "المبرمجين في الفرح بيفرحوا بـ debug بدل الدف",
    "المبرمجين لما يتخانقوا، بيكتبوا comments سامة في الكود",
    "المبرمجين بيتعرفوا على بعض بكلمة: Hello World!",
    "المبرمج لما ينسى حاجة، يعمل: Ctrl + Z",
    "المبرمج بيطبخ كود، مش أكل",
    "المبرمج لما يحب واحدة يقول: I found the missing semicolon of my life",
    "المبرمج الحقيقي عمره ما بينسى، عنده version control",
    "المبرمج لو دخل مسجد، يعمل: sudo su -m",
    "المبرمج في المدرسة، بيكتب الواجب بلغة Python",
    "المبرمج لو اشترى حاجة، يسأل: في open source منها؟",
    "المبرمج لما يحب واحدة، بيقولها: انت الـ class اللي دايمًا بعمله import",
    "المبرمج لما ينام، يدخل في وضع sleep(8);",
    "المبرمجين بيحبوا الجبال، عشان بيشتغلوا في سطر الأوامر",
    "المبرمج اتسرق، قال: كويس عملت commit قبل ما يسرقوا",
    "المبرمج لو حصلله حاجة، أول حاجة يعملها restart",
    "المبرمج بيحب القهوة عشان فيها Java",
    "المبرمجين بيشتروا كتب فيها bugs عشان يصلحوها",
    "المبرمج بيحب الهدوء، بس مش الـ silent bugs",
    "المبرمج لما يكون عنده امتحان، يقول: compile قبل ما تفكر!",
    "المبرمج بيقول لابنه: لما تكبر هتبقى متغير عالمي",
    "المبرمج مش بيحب يبرر، هو بس بيعمل logs",
    "المبرمج لو حب واحدة، يبعثلها pull request",
    "المبرمج لما يزهق، يعمل refactor للحياة",
    "المبرمج بيروح الجيم، يشتغل على ال RAM",
    "المبرمجين بيحسبوا عمرهم بـ epochs مش سنين",
    "المبرمج دايمًا على الوضع الداكن dark mode",
    "المبرمجين بيصلوا عالسطر الأول",
    "المبرمج بيكتب جواب حب بـ HTML",
    "المبرمج لما يحلف، يقول: والله بـ if و else",
    "المبرمج اتخانق مع مراته، قالها: you're undefined!",
    "المبرمج لما يحب واحدة، يخزنها في متغير private",
    "المبرمج مش بيغار، بس بيكره الـ merge conflicts",
    "المبرمج لما يصحى متأخر، يقول: مش أنا اللي في الـ loop دي",
    "المبرمج لما يسافر، يعمل: ping للبلد",
    "المبرمج بيروح للدكتور، يقوله: السيستم وقع فيّي",
    "المبرمج بيربي ولاده OOP",
    "المبرمج مش بيشتري حاجة إلا لو فيها API",
    "المبرمج دايمًا يقول: الحياة عبارة عن if و else",
    "المبرمج لما يشتغل زيادة، يقول: overtime بدون threads",
    "المبرمج بيحب الخط المستقيم، بس مش الـ infinite loop",
    "المبرمج لما يسوق، يستخدم switch case",
    "المبرمج لو سمع شائعة، يقول: دي false",
    "المبرمج بيشرب شاي بس بـ filter",
    "المبرمج دايمًا بيقلب في Logs زي اللي بيقلب في الماضي",
    "المبرمج مش بيخون، بس بيحب الـ multiple inheritance",
    "المبرمج لو حب، يبعتلها POST request",
    "المبرمج يشتري عربية، يسأل فيها كم line of code",
    "المبرمج لو عايز يشتم، يكتب comment ساخر",
    "المبرمجين لما يخرجوا مع بعض، يعملوا networking",
    "المبرمج لما يكون حزين، يعمل: console.error('أنا تعبان')",
    "المبرمج بيركب طيارة، يسأل: فيها wifi؟ عشان الـ git pull",
    "المبرمج لو اتأخر، يقول: كنت في deadlock",
    "المبرمج لما يتجوز، يسمي ابنه firstChild",
    "المبرمج لما يسمع نكتة بايخة، يقول: .catch(e => ignore())",
    "المبرمجين لما يتخانقوا، يعملوا fork لبعض",
    "المبرمج مش بيرقص، هو بيعمل code dance",
    "المبرمج لو راح حفلة، يسأل: في debug section؟",
    "المبرمج لما يدخل جيم، يعمل: initWorkout();",
    "المبرمج لما يشوف كود حلو، يقول: ده clean كأنه توضّى!",
    "المبرمج الحقيقي بيصلي 5 مرات في اليوم... وبـ cron job كمان",
    "المبرمج لما يخطب، يبعت proposal.json",
    "المبرمج في الجيش، يقعد على command line",
    "المبرمج لو دخل عزا، يقول: system failure",
    "المبرمج في الكلية، يكتب thesis بـ markdown",
    "المبرمج بيروح يحج، يسأل: في wi-fi؟",
    "المبرمجين لو صاموا، يعملوا pause للأكل",
    "المبرمج بيتصدق بكود مفتوح المصدر",
    "المبرمج لما يسأل عن شغله، يقول: والله أنا handler مش developer",
    "المبرمج يلبس بدلة، يسأل: هل دي compatible مع الـ style guide؟",
    "المبرمج بيربي ولاده بـ if و else مش بالصراخ",
  ];
  vscode.window.showWarningMessage(
    `${نكت[Math.floor(Math.random() * نكت.length)]} 😂`
  );
  if (Math.random() < 0.5) {
    فعل_عشوائي();
  }
}

// عرض النكت
function عرض_الاكل() {
  const اكل = [
    "🍗 فراخ مشوية",
    "🍖 لحمة مشوية",
    "🍛 أرز بالكاري والدجاج",
    "🍲 فتة لحمة",
    "🍝 مكرونة بالبشاميل",
    "🍝 مكرونة نجرسكو",
    "🍝 سباجيتي بولونيز",
    "🍜 نودلز بالخضار",
    "🥘 طاجن بامية باللحمة",
    "🥘 طاجن ملوخية",
    "🍚 كبسة دجاج",
    "🍚 كبسة لحم",
    "🍗 صينية بطاطس بالفراخ",
    "🍖 صينية بطاطس باللحمة",
    "🥘 مسقعة",
    "🍛 كشري مصري",
    "🍚 أرز بسمتي مع مشويات",
    "🌯 شاورما فراخ",
    "🌯 شاورما لحم",
    "🍔 برجر لحم",
    "🍔 برجر فراخ",
    "🌭 هوت دوج",
    "🌮 تاكو دجاج",
    "🌮 تاكو لحم",
    "🥙 فاهيتا فراخ",
    "🥙 فاهيتا لحم",
    "🍕 بيتزا ميكس",
    "🍕 بيتزا بالخضار",
    "🍕 بيتزا باللحم المفروم",
    "🥪 ساندوتش كبدة",
    "🥪 ساندوتش سجق",
    "🥪 ساندوتش برجر",
    "🍗 دجاج كنتاكي",
    "🍗 بروستد دجاج",
    "🍗 فراخ بانبه",
    "🍛 دجاج بالزبدة (باتر تشيكن)",
    "🍛 تيكا مسالا",
    "🍲 شوربة عدس مع عيش",
    "🍲 شوربة فراخ مع نودلز",
    "🥩 ستيك لحم مشوي",
    "🥩 ستيك دجاج",
    "🍗 دجاج محشي",
    "🍖 لحمة محشية",
    "🥘 محشي ورق عنب",
    "🥘 محشي كرنب",
    "🥘 محشي كوسة",
    "🥘 محشي فلفل",
    "🥘 محشي باذنجان",
    "🍲 سمك مشوي",
    "🍲 سمك مقلي",
    "🦐 جمبري مشوي",
    "🦐 جمبري مقلي",
    "🦞 لوبستر مشوي",
    "🦀 كابوريا بالبشاميل",
    "🐟 صينية سمك بالبطاطس",
    "🍜 طاجن مكرونة باللحمة المفرومة",
    "🍗 كباب وكفتة",
    "🍚 برياني دجاج",
    "🍚 برياني لحم",
    "🥘 عدس بالأرز",
    "🍛 فول بالبيض",
    "🍛 فول بالسجق",
    "🥘 بيض بالطماطم",
    "🍳 عجة مصرية",
    "🥘 طاجن كوارع",
    "🥘 موزة ضاني بالفتة",
    "🍖 لحمة بالبصل",
    "🥩 لحم بالبشاميل",
    "🍲 فتة شاورما",
    "🥘 طاجن لسان عصفور بالكبد والقوانص",
    "🍛 أرز بالخلطة والحمام",
    "🍗 بط محشي أرز",
    "🍛 ملوخية مع بط",
    "🍗 فراخ مشوية على الفحم",
    "🍗 طاجن فراخ بالصلصة",
    "🍛 أرز بالكبد والقوانص",
    "🍖 لحمة بالبصل والطماطم",
    "🥘 كوارع محمرة",
    "🥘 شوربة لحمة بالخضار",
    "🍚 أرز صيادية",
    "🍛 عدس مع بيض مسلوق",
    "🍜 شوربة نودلز بالدجاج",
    "🥘 فتة عدس",
    "🍚 أرز بلبن (وجبة مش حلو)",
    "🥘 فتة كبده",
    "🥘 كبدة اسكندراني",
    "🍛 سجق بالخضار",
    "🥘 لحمة رأس",
    "🥘 شوربة حمام",
    "🥘 شوربة بط",
    "🍗 دجاج بالمشروم والكريمة",
    "🍖 لحم بصوص المشروم",
    "🍚 مكبوس",
    "🍛 مندي دجاج",
    "🍛 مندي لحم",
    "🥘 كوسة بالبشاميل",
    "🍲 شوربة طماطم مع كريمة",
    "🥩 ريش ضاني مشوية",
    "🍛 دجاج تندوري",
    "🍚 أرز بالجمبري",
    "🍚 أرز بالسمك",
    "🦐 جمبري بالكريمة",
    "🥘 سمك فيليه بالبشاميل",
  ];

  vscode.window.showWarningMessage(
    `${اكل[Math.floor(Math.random() * اكل.length)]} 😂`
  );
}

// فاجئني
function عرض_المفاجئة() {
  const actions = [
    () => vscode.window.showWarningMessage("⚠️ خلي بالك من الكود بتاعك!"),
    () =>
      vscode.commands.executeCommand("workbench.action.closeEditorsInGroup"),
    () =>
      vscode.commands.executeCommand(
        "workbench.action.toggleSidebarVisibility"
      ),
    () => vscode.commands.executeCommand("workbench.action.zoomIn"),
    () => vscode.commands.executeCommand("workbench.action.openSettingsJson"),
    () =>
      vscode.window.showInputBox({ prompt: "اكتب سرك هنا 🤫" }).then((res) => {
        if (res)
          vscode.window.showInformationMessage(`🤣 هههههههه فضحتك: ${res}`);
      }),
    () => {
      const editors = vscode.window.visibleTextEditors;
      if (editors.length > 0) {
        const editor = editors[0];
        editor.edit((editBuilder) => {
          editBuilder.insert(
            new vscode.Position(0, 0),
            "// مفاجأة من صحبي 🤖\n"
          );
        });
      }
    },
    () =>
      vscode.env.openExternal(
        vscode.Uri.parse("https://www.youtube.com/watch?v=9U-48bd0w9U")
      ),
    () =>
      vscode.env.openExternal(
        vscode.Uri.parse("https://www.youtube.com/watch?v=C43p8h99Cs0")
      ),
    () =>
      vscode.env.openExternal(
        vscode.Uri.parse("https://www.youtube.com/watch?v=eM9ehwkRuGM")
      ),
  ];

  const فعل_عشوائي = actions[Math.floor(Math.random() * actions.length)];
  فعل_عشوائي();
}

// تفعيل الإضافة
async function activate(context) {
  await fetchPrayerTimes();
  setupReminders();

  const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
    const text = event.document.getText();
    if (text.includes("صحبي")) {
      let rodod = ["قول", "ارغي", "شبيك لبيك", "اياااااه", "نعم", "اقمر"];
      if (!event.document._handledResponse) {
        vscode.window.showErrorMessage(
          `${rodod[Math.floor(Math.random() * rodod.length)]}`
        );
        event.document._handledResponse = true;
      }
      تجهيز_الاوامر_المكتوبة(text);
    }
  });

  context.subscriptions.push(disposable, ...subscriptions);
}

module.exports = {
  activate,
};
