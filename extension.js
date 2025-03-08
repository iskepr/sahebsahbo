const { console } = require("inspector");
const vscode = require("vscode");
const المدينة = "Cairo";
const اليوم = new Date();
const التاريخ =
  اليوم.getDate() + "-" + (اليوم.getMonth() + 1) + "-" + اليوم.getFullYear();

// تحويل الساعة إلى نظام 12 ساعة
const إلى_12_ساعة = (time24) => {
  let [hour, minute] = time24.split(":");
  hour = parseInt(hour);
  let صباح_مساء = "صباحاً";

  if (hour >= 12) {
    صباح_مساء = "مساءً";
    if (hour > 12) hour -= 12; // تحويل الساعة إلى 12 ساعة
  }

  if (hour === 0) hour = 12; // للتعامل مع منتصف الليل

  minute = minute < 10 ? "0" + minute : minute; // إضافة صفر قبل الدقائق إذا كانت أقل من 10

  return `${hour}:${minute} ${صباح_مساء}`;
};

// الحصول على الساعة الحالية بنظام 12 ساعة
let الساعة = اليوم.getHours();
let دقائق = اليوم.getMinutes();
let صباح_مساء = "صباحاً";

// تحديد ما إذا كانت الساعة صباحاً أو مساءً
if (الساعة >= 12) {
  صباح_مساء = "مساءً";
  if (الساعة > 12) الساعة -= 12; // تحويل الساعة إلى 12 ساعة
}

دقائق = دقائق < 10 ? "0" + دقائق : دقائق;
الساعة = الساعة + ":" + دقائق + " " + صباح_مساء;

// مواعيد الصلاة
let المواعيد;
let الفجر;
let الظهر;
let العصر;
let المغرب;
let العشاء;
let التاريخ_الهجري;
let يوم_الأسبوع;

const الاذان = fetch(
  `https://api.aladhan.com/v1/timingsByAddress/${التاريخ}?address=${المدينة}`
)
  .then((response) => response.json())
  .then((data) => {
    المواعيد = data["data"]["timings"];

    // تحويل مواعيد الصلاة من 24 ساعة إلى 12 ساعة
    الفجر = إلى_12_ساعة(المواعيد["Fajr"]);
    الظهر = إلى_12_ساعة(المواعيد["Dhuhr"]);
    العصر = إلى_12_ساعة(المواعيد["Asr"]);
    المغرب = إلى_12_ساعة(المواعيد["Maghrib"]);
    العشاء = إلى_12_ساعة(المواعيد["Isha"]);
    يوم_الأسبوع = data["data"]["date"]["hijri"]["weekday"]["ar"];
    التاريخ_الهجري =
      data["data"]["date"]["hijri"]["day"] +
      " " +
      data["data"]["date"]["hijri"]["month"]["ar"] +
      " " +
      data["data"]["date"]["hijri"]["year"];

    console.log(المواعيد); // طباعة المواعيد بعد تحويلها

    // الرسالة وقت الصلاة
    if (الساعة == الفجر) {
      vscode.window.showInformationMessage("حان وقت الفجر", "موافق");
    } else if (الساعة == الظهر) {
      vscode.window.showInformationMessage("حان وقت الظهر", "موافق");
    } else if (الساعة == العصر) {
      vscode.window.showInformationMessage("حان وقت العصر", "موافق");
    } else if (الساعة == المغرب) {
      vscode.window.showInformationMessage("حان وقت المغرب", "موافق");
    } else if (الساعة == العشاء) {
      vscode.window.showInformationMessage("حان وقت العشاء", "موافق");
    } else {
      console.log(المواعيد);
    }
  });

function activate(context) {
  const مرحبا = vscode.commands.registerCommand(
    "sahebsahbo.helloWorld",
    function () {
      vscode.window.showInformationMessage("اهلا بيك يا صحبي");
    }
  );

  // الصلاة علي النبي
  const صل_علي_النبي = setInterval(() => {
    const اذكار = [
      "سبحان اللّه",
      "الحمد للّه",
      "لا اله الا اللّه",
      "اللّه اكبر",
      "ما تصلّ علي النبي يا قلب اخوك",
      "استغفر اللّه",
      "وحد اللّه",
    ];
    const ذكر = اذكار[Math.floor(Math.random() * اذكار.length)];
    vscode.window.showInformationMessage(ذكر);
    console.log(ذكر);
  }, 5 * 60000);

  // المحادثة
  const editor = vscode.window.activeTextEditor;

  const document = editor.document;

  vscode.workspace.onDidChangeTextDocument((event) => {
    const editor = vscode.window.activeTextEditor;

    const document = editor.document;
    const text = document.getText();

    if (text.includes("صحبي")) {
      // جمل رد فعل مختلفة
      const تفضل = ["شبيك لبيك", "اؤمرني", "ارغي", "قول", "ايه"];
      const نكت = [
        "محشش اسمه سالم زعل من أهله وفكر يسافر، وهو رايح المطار شاف لوحة مكتوب عليها 'ارجع لنا سالم'، رجع بيتهم يبكي، وقال: طيب ليه زعلتوني؟ 😢✈️",
        "واحد قاعد بيحمد ربنا لأنه مش صيني، فصاحبه بيسأله ليه كده?? قام قاله أنت غبي?? أصلي مبعرفش ولا كلمة صيني. 😂🇨🇳",
        "غبي يكتب ورا الدكتور بالمحاضرة، كل ما الدكتور مسح السبورة شق الورقة ورماها. 📚📝",
        "مرة أستاذ كيمياء خلف ولد سماه سامي أكسيد الكربون. 🧪💨",
        "محشش راح لماكدونالدز قالهم عندكم حلقات بصل?? قالوله آه، قالهم تمام أعطوني الحلقة الأخيرة. 🍔🧅",
        "وحدة ماشية في جنازة زوجها وبتضحك سألوها بتضحكي ليه؟ قالتلهم لأني أول مرة أعرف هو رايح فين. 🤣⚰️",
        "وحدة ابنها بلع جنيه قعدت تعيط وتولول اتصلت على جوزها البخيل تقله أعمل إيه؟ قلها قوليله والله ليتخصم من مصروفك. 💸😭",
        "تلاتة مساطيل ركبوا طيارة هيلوكوبتر حسوا بالبرد قاموا طفوا المروحة. 🚁❄️",
        "مرة واحد يقول لزوجته: وش رأيك نرجع زي زمان؟ ابتسمت وقالت: كيف يا حياتي؟ قال: يعني لا أعرفك ولا تعرفيني. 👫⏳",
        "مرة واحد بخيل جاب تليفون جديد حطه في جيبه اللي ورا، ونسي وقعد على كرسي، راح سامع صوت حاجة بتتكسر، قال يارب يبقي العمود الفقري. 📱💔",
        "مرة واحد يأكل فستق قالت له زوجته عطني.. عطاها حبة وحده قالت له حبة بس؟ قال كلها نفس الطعم. 🥜😅",
        "بيطلع الأستاذ على الطلاب وبقلهم أنتم مصابيح المستقبل، بص الطالب لزميله لقاه بسابع نومة فقال الطالب: يا أستاذ اللمبة اللي جمبي اتحرقت. 💡😴",
        "غبي ألقى بهاتفه من النافذة، وعندما نزل وجده مكسور، قال غريبة جدًا مع أني مشغل وضع الطيران. 📱✈️",
        "واحد محشش حران أوي معندوش ولا مروحة ولا تكييف أخد دواء خافض للحرارة. 🌡️💊",
        "أخطبوط مرة قاعد زعلان أوي عشان مش عارف إيده من رجله. 🐙😔",
        "فيه مرة راجل جاتله فاتورة المويه ١٠٠٠٠ ريال، قام دق لوزارة المالية وقال لهم: أهلين حبايبي ليكون المطر حق هالسنة على حسابي؟ 💦💸",
        "فيه واحد سمى عياله صقر وفهد وأسد وذيب، سألوه الناس عن السبب، قال لهم علشان لما احتاجهم أقولهم في مرة واحدة تعالوا يا حيوانات. 🦅🦁🐅🐺",
        "مرة واحد مسطول راح المحكمة، فالقاضي سأله: أنت متزوج مين؟ راح قال للقاضي: متزوج واحدة ست يا سعادة القاضي، راح القاضي قال له أنت بتهزر يا بني هوا فيه حد يتزوج راجل؟!، قال له والله أختي متزوجة راجل. 👨‍⚖️💍",
        "محشش شاف واحدة في الطريق فسألها اسمك إيه؟ قالت له أسماء، قال لها يعني مالكيش اسم محدد؟! 🤔❓",
        "واحد غبي راح يقدم في وظيفة، فقال للمدير هو المرتب كام؟ فالمدير قال له ٢٠٠٠ وبعد سنتين هيبقى ٥٠٠٠، فقال له خلاص ابقى اجي بعد سنتين. 🧑‍💼💸",
      ];
      const اكلات = [
        "كشري 🍛",
        "ملوخية 🥬",
        "فول مدمس 🍲",
        "طعمية (فلافل) 🥙",
        "محشي 🍂",
        "محمرة 🫑",
        "فتة 🥖",
        "شاورما 🥙",
        "سمك بلطي مشوي 🐟",
        "مقبلات مصرية (حمص - بابا غنوج) 🧆",
        "كبدة إسكندراني 🥩",
        "طاجن لحم 🍖",
        "حمام محشي 🦢",
        "أرز باللبن 🍚",
        "بسبوسة 🍰",
        "أم علي 🍮",
        "صينية بطاطس 🍟",
        "رز معمر 🍚",
        "فطير مشلتت 🍕",
        "ملوخية بالجمبري 🍤",
        "شوربة عدس 🥣",
        "فطائر سبانخ 🥐",
        "سلطة طحينة 🥗",
        "كوارع 🐾",
        " فسيخ 🐟",
        "سندوتشات الطعمية 🥙",
        "طاجن بامية 🍲",
        "مكرونة بشاميل 🍝",
        "طاجن البطاطس 🍲",
        "فول مع طماطم 🍅",
        "طاجن جمبري 🍤",
        "صينية ورق عنب 🍇",
        "شاورما لحم 🥙",
        "طاجن فريك 🍚",
        "صينية لحمة بالفلفل 🍖",
        "سحلب 🥛",
        "فتة للحم 🥩",
        "صينية بطاطس باللحم 🍖",
        "شاورما فراخ 🍗",
        "مندي فراخ 🍗",
        "كباب الحلة 🍖",
        "بطاطس محمرة 🍟",
        "شوربة لسان العصفور 🍲",
        "مكرونة بالحمة 🍝",
        "حمام محشي فريك 🦢",
        "حمام محشي أرز 🦢",
        "موزة محمرة 🍖",
        "محشي ورق عنب 🍇",
        "طاجن بصل 🍲",
        "خبيزة 🍂",
        "سلطة خضراء 🥗",
        "طاجن سمك 🐟",
        "شوربة خضار 🥕",
        "بليلة 🌾",
        "صينية فراخ بالبطاطس 🍗",
        "صينية بطاطس بالبشاميل 🍟",
        "طاجن ضأن 🍖",
        "كفتة مشوية 🍖",
        "أندومي 🍝",
        "فطير بالجبنة 🧀",
        "طاجن بطاطس بالفراخ 🍗",
        "لوبيا 🍲",
      ];

      // الساعة كام
      if (text.includes("الساعة")) {
        const currentDate = new Date();
        let hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        const isAM = hours < 12;
        if (hours > 12) {
          hours -= 12;
        } else if (hours === 0) {
          hours = 12;
        }
        const time = `${hours}:${minutes < 10 ? "0" + minutes : minutes} ${
          isAM ? "اصبح" : "بليل"
        }`;
        vscode.window.showInformationMessage(`الساعة: ${time}`);
      }
      // التاريخ واليوم
      else if (text.includes("التاريخ", "النهارده كام")) {
        vscode.window.showInformationMessage(`التاريخ: ${التاريخ_الهجري}`);
      } else if (text.includes("يوم", "يوم الاسبوع", "النهارده")) {
        vscode.window.showInformationMessage(`يوم الأسبوع: ${يوم_الأسبوع}`);
      }
      // مواعيد الصلاة
      else if (text.includes("الفجر")) {
        vscode.window.showInformationMessage(`الفجر: ${الفجر}`);
      } else if (text.includes("الظهر")) {
        vscode.window.showInformationMessage(`الظهر: ${الظهر}`);
      } else if (text.includes("العصر")) {
        vscode.window.showInformationMessage(`العصر: ${العصر}`);
      } else if (text.includes("المغرب")) {
        vscode.window.showInformationMessage(`المغرب: ${المغرب}`);
      } else if (text.includes("العشاء")) {
        vscode.window.showInformationMessage(`العشاء: ${العشاء}`);
      }
      // نكتة
      else if (text.includes("نكت", "ضحك", "زهق")) {
        const نكته = نكت[Math.floor(Math.random() * نكت.length)];
        vscode.window.showWarningMessage(نكته, "😂");
      }
      // طلب طعام
      else if (text.includes("اكل", "طعام", "فطار", "غداء", "عشاء", "جعان")) {
        const اكل = اكلات[Math.floor(Math.random() * اكلات.length)];
        vscode.window.showWarningMessage(`تفضل: ${اكل}`);
      }
      // رد عشوائي
      else {
        const ردود = تفضل[Math.floor(Math.random() * تفضل.length)];
        vscode.window.showInformationMessage(ردود);
      }
    }
  });

  context.subscriptions.push(مرحبا, صل_علي_النبي, الاذان);
}

module.exports = {
  activate,
};
