/* Fastaqim "A word for your heart" (25 Nov 2026): a calm reminder when a salah is late or its time is nearly over.
   One reminder at a time: Qur'an (Quran.com), sahih or hasan hadith only (sunnah.com, grade checked on the page),
   words of the Sahaba and scholars with their book, and short reflections in Fastaqim's own words.
   When it shows (never more than twice a day, never the same salah twice, never auto-marks anything):
   - you mark a salah "Made up" (prayed after its time): hope and coming back;
   - a salah is still unmarked and its time is nearly over (only with your real location set): "there is still time";
   - you tap "Finding it heavy?" yourself (no limit).
   Saved in S.nudge so it syncs. On/off and "not today" in More > Salah reminders. (c) Fastaqim, all rights reserved. */
(function(){'use strict';
const X=(en,ar,om,so)=>L==='ar'?ar:(LI===0&&om)?om:(LI===1&&so)?so:en;
const DAILY=2,NEAR=40,AFTER=15;
/* ---------- content ---------- tags: n = time nearly over, l = prayed late, h = feeling heavy */
const SU={2:['Al-Baqarah','البقرة'],3:["Ali 'Imran",'آل عمران'],4:["An-Nisa'",'النساء'],19:['Maryam','مريم'],20:['Ta-Ha','طه'],33:['Al-Ahzab','الأحزاب'],39:['Az-Zumar','الزمر'],45:['Al-Jathiyah','الجاثية'],51:['Adh-Dhariyat','الذاريات'],57:['Al-Hadid','الحديد'],59:['Al-Hashr','الحشر'],79:["An-Nazi'at",'النازعات']};
/* Somali meaning: Mahmud Muhammad Abduh. English: Saheeh International (from the site's own Qur'an files). */
const Q=[
 {r:'4:65',g:'h',so:'Eebahaa baan ku dhaartaye ma rumeeyaan intay kugu Xukuntamaan waxa dhex mara oyna ka helin Naftooda dhib, waxaad Xukuntay ooy hogaansamaan hogaansi.'},
 {r:'33:36',g:'h',so:"Kuma haboona nin Mu'min ah iyo haweenay Mu'minad ah marka Eebe iyo Rasuulkiisu wax xukumaan inay khiyaar u yeeshaan amarkooda, ruuxiise caasiya Eebe iyo Rasuulkiisa wuxuu dhumay dhumid cad."},
 {r:'79:40-41',g:'h',so:'Ruuxiise ka yaaba la kulanka Eebe naftana ka reeba hawada (xun), wuxuu u dheelman Janno.'},
 {r:'45:23',g:'h',so:'Ka waran ruux ka yeeshay ilaahiisa hawadiisa, oo Eebe dhumiyey isagoo cilmi leh, oo daboolay maqalkiisa iyo qalbigiisa, yeelayna aragiisa dabool, yaa hanuunin Eebe kadib, miyaydaan wax xusuusanayn.'},
 {r:'2:45',g:'h',so:'Kaalmaysta samirka iyo salaadda, wayna ku wayn tahay salaaddu (ku culus tahay) kuwa khushuuca mooyee.'},
 {r:'57:16',g:'hl',so:'Miyayan u dhawaanin kuwa xaqa rumeeyay inay u khushuucdo quluubtoodu xusidda Eebe iyo waxa xaqa ah ee dagay, oyna la mid noqonin kuwii Kitaabka la siiyay horay oo muddadu ku dheeraatay, markaas ay ingagtay quluubtoodu, wax badan oo ka mid ahna waa faasiqiin.'},
 {r:'59:19',g:'hn',so:'Kuwa xaqa rumeeyey waa inayan noqon sidii kuwii Eebe hilmaamay, isna markaas uu hilmaansiiyey naftooda, waana kuwo faasiqiin ah.'},
 {r:'51:50',g:'nlh',so:'Ee Eebe u carara (toobad keena), waxaana idiin ahay dige cad.'},
 {r:'20:14',g:'n',so:'Anigu waxaan ahay Alle, Ilaah kale ma jiro Ani mooyee ee i caabuda, oogna salaadda xuskayga.'},
 {r:'3:133',g:'nl',so:'Una deg dega dambi dhaafka Eebihiin iyo Janno ballaadhkeedu yahay samaawaadka iyo dhulka oo loo darbay kuwa dhawrsada.'},
 {r:'19:59-60',g:'l',so:'Waxaase ka gadaal maray kuwo xun oo dayacay salaadda oo raacay waxay naftoodu doonto, waxayna la kulmi sharr. Cidda toobad keenta oo rumeysa oo camal fiican fasha mooyee, kuwaasu waxay geli Jannada lagamana dulmiyo waxba.'},
 {r:'39:53',g:'l',so:'Waxaad dhahdaa: addoomadayda ku xad gudbay naftoodow, ha ka quusanina naxariista Eebe, Eebe wuxuu dhaafaa dambiyada dhammaantood, waana dambi dhaaf badane naxariis badane.'}];
const BK={b:['Sahih al-Bukhari','صحيح البخاري','bukhari'],m:['Sahih Muslim','صحيح مسلم','muslim'],t:["Jami' at-Tirmidhi",'جامع الترمذي','tirmidhi'],i:['Sunan Ibn Majah','سنن ابن ماجه','ibnmajah']};
/* hadith: [book, number, grade(1 = hasan), tags, ar, en, om, so] */
const HD=[
 ['b','527',0,'n','سُئِلَ النَّبِيُّ ﷺ: أَيُّ الْعَمَلِ أَحَبُّ إِلَى اللَّهِ؟ | قَالَ: «الصَّلَاةُ عَلَى وَقْتِهَا»','The Prophet ﷺ was asked: "Which deed is most beloved to Allah?" He said: "Salah at its time."','Nabiyyi ﷺ "Hojiin Rabbitti caalaa jaallatamu kami?" jedhamee gaafatame. Innis: "Salaata yeroo isheetti" jedhe.','Nabiga ﷺ waxaa la weydiiyay: "Camalkee ayaa Alle ugu jecel?" Wuxuu yiri: "Salaadda waqtigeeda."'],
 ['b','6502',0,'nh','قَالَ اللَّهُ تَعَالَى: «وَمَا تَقَرَّبَ إِلَيَّ عَبْدِي بِشَيْءٍ | أَحَبَّ إِلَيَّ مِمَّا افْتَرَضْتُ عَلَيْهِ»','Allah says: "My servant does not come closer to Me with anything more beloved to Me than what I have made obligatory upon him."','Rabbiin akkas jedha: "Garbichi koo waan ani isa irratti dirqama godhe caalaa waan anatti jaallatamuun natti hin dhihaatu."','Alle wuxuu yiri: "Addoonkaygu iguma soo dhowaado wax iiga jecel waxa aan ku waajibiyay."'],
 ['m','2822',0,'h','«حُفَّتِ الْجَنَّةُ بِالْمَكَارِهِ، | وَحُفَّتِ النَّارُ بِالشَّهَوَاتِ»','"Paradise is surrounded by things the soul dislikes, and the Fire is surrounded by desires."','"Jannaan wantoota lubbuun jibbituun marfamte, Ibiddi immoo fedhiiwwaniin marfamte."','"Jannada waxaa lagu wareejiyay waxyaabaha nafta ku adag, Naartana waxaa lagu wareejiyay waxyaabaha nafta jeceshahay."'],
 ['b','16',0,'h','«ثَلَاثٌ مَنْ كُنَّ فِيهِ وَجَدَ حَلَاوَةَ الْإِيمَانِ: | أَنْ يَكُونَ اللَّهُ وَرَسُولُهُ أَحَبَّ إِلَيْهِ مِمَّا سِوَاهُمَا، | وَأَنْ يُحِبَّ الْمَرْءَ لَا يُحِبُّهُ إِلَّا لِلَّهِ، | وَأَنْ يَكْرَهَ أَنْ يَعُودَ فِي الْكُفْرِ كَمَا يَكْرَهُ أَنْ يُقْذَفَ فِي النَّارِ»',"\"Three things: whoever has them tastes the sweetness of faith. That Allah and His Messenger are more beloved to him than anything else, that he loves a person only for Allah's sake, and that he hates to go back to disbelief as he would hate to be thrown into the Fire.\"","\"Wantoota sadii, namni isaan qabu mi'aa amantii argata: Rabbii fi Ergamaan Isaa waan biraa hunda caalaa isatti jaallatamuu, nama tokko Rabbiif qofa jaallachuu, fi akkuma ibiddatti darbatamuu jibbu kufrii keessatti deebi'uu jibbuu.\"","\"Saddex wax, qofkii ay ku jiraan wuxuu helaa macaanka iimaanka: in Alle iyo Rasuulkiisu uga jecel yihiin wax kasta oo kale, inuu qof u jeclaado Alle dartiis oo keliya, iyo inuu u neceb yahay inuu ku noqdo gaalnimada sida uu u neceb yahay in naar lagu tuuro.\""],
 ['b','528',0,'nl','«أَرَأَيْتُمْ لَوْ أَنَّ نَهَرًا بِبَابِ أَحَدِكُمْ يَغْتَسِلُ فِيهِ كُلَّ يَوْمٍ خَمْسًا، | مَا تَقُولُ ذَلِكَ يُبْقِي مِنْ دَرَنِهِ؟» | قَالُوا: لَا يُبْقِي مِنْ دَرَنِهِ شَيْئًا. | قَالَ: «فَذَلِكَ مِثْلُ الصَّلَوَاتِ الْخَمْسِ، | يَمْحُو اللَّهُ بِهِ الْخَطَايَا»','"If there were a river at the door of one of you and he bathed in it five times every day, would any dirt be left on him?" They said: "No dirt would be left on him." He said: "That is like the five prayers: through them Allah wipes away sins."',"\"Osoo laggi balbala keessanii duratti jiraatee guyyaa guyyaan si'a shan keessatti dhiqattan, xuriin isin irratti hafaa?\" Isaanis: \"Xuriin tokkollee hin hafu\" jedhan. Innis: \"Kun fakkeenya salaata shananiiti: Rabbiin isaaniin badii haqa\" jedhe.","\"Haddii webi uu ku yaal lahaa albaabka midkiin oo uu maalin kasta shan jeer ku maydhan lahaa, wasakh ma ku hari lahayd?\" Waxay yiraahdeen: \"Wasakh kuma hareyso.\" Wuxuu yiri: \"Taasi waa tusaalaha shanta salaadood: Alle ayaa iyaga ku tirtira dembiyada.\""],
 ['t','413',0,'n','«إِنَّ أَوَّلَ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ | مِنْ عَمَلِهِ صَلَاتُهُ»','"The first of his deeds that a servant will be asked about on the Day of Resurrection is his salah."','"Wanti jalqabaa guyyaa qiyaamaa garbichi hojii isaa keessaa itti gaafatamu salaata isaati."','"Waxa ugu horreeya ee addoonka laga xisaabin doono Maalinta Qiyaamaha camalkiisa waa salaaddiisa."'],
 ['i','4171',1,'n','«إِذَا قُمْتَ فِي صَلَاتِكَ | فَصَلِّ صَلَاةَ مُوَدِّعٍ»','"When you stand for your salah, pray it like someone saying goodbye."','"Yeroo salaata keetiif dhaabattu, akka nama nagaatti si\'in jedhee deemuutti salaati."','"Markaad salaaddaada u istaagto, u tuko sida qof macsalaameynaya."'],
 ['b','7405',0,'l','قَالَ اللَّهُ تَعَالَى: «وَإِنْ تَقَرَّبَ إِلَيَّ بِشِبْرٍ تَقَرَّبْتُ إِلَيْهِ ذِرَاعًا، | وَإِنْ تَقَرَّبَ إِلَيَّ ذِرَاعًا تَقَرَّبْتُ إِلَيْهِ بَاعًا، | وَإِنْ أَتَانِي يَمْشِي أَتَيْتُهُ هَرْوَلَةً»',"Allah says: \"If he comes closer to Me by a hand's span, I come closer to him by an arm's length. If he comes closer to Me by an arm's length, I come closer to him by the length of both arms. And if he comes to Me walking, I come to him running.\"",'Rabbiin akkas jedha: "Yoo inni taakkuu tokko natti dhihaate, ani irree tokko itti dhihaadha. Yoo inni irree tokko natti dhihaate, ani irree lamaan itti dhihaadha. Yoo inni deemaa natti dhufe, ani fiigaan itti dhufa."','Alle wuxuu yiri: "Haddii uu iigu soo dhowaado taako, waxaan ugu soo dhowaadaa dhudhun. Haddii uu iigu soo dhowaado dhudhun, waxaan ugu soo dhowaadaa laba gacmood oo kala bixisan. Haddii uu ii yimaado isagoo socda, waxaan u imaadaa anigoo orod ah."'],
 ['m','2749',0,'l','«وَالَّذِي نَفْسِي بِيَدِهِ، لَوْ لَمْ تُذْنِبُوا لَذَهَبَ اللَّهُ بِكُمْ، | وَلَجَاءَ بِقَوْمٍ يُذْنِبُونَ فَيَسْتَغْفِرُونَ اللَّهَ | فَيَغْفِرُ لَهُمْ»','"By the One in whose hand my soul is, if you did not sin, Allah would replace you with people who sin, then ask Allah for forgiveness, and He forgives them."','"Isa lubbuun koo harka Isaa jirtuun kakadha, osoo isin cubbuu hin hojjenne, Rabbiin isin fudhatee namoota cubbuu hojjetanii araara Isa gaafatan fida, Innis isaaniif araara."','"Waxaan ku dhaartay Kan naftaydu gacantiisa ku jirto, haddaydaan dembaabin, Alle wuu idin qaadi lahaa oo wuxuu keeni lahaa dad dembaaba oo dambi dhaaf weydiista, markaas uu u dhaafo."'],
 ['b','6412',0,'h','«نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: | الصِّحَّةُ وَالْفَرَاغُ»','"Two blessings that many people lose out on: health and free time."','"Qananiiwwan lama namoonni baay\'een keessatti gowwoomfaman: fayyaa fi yeroo duwwaa."','"Laba nicmo ayaa dad badani ku khasaaraan: caafimaadka iyo waqtiga firaaqada."']];
/* Sahaba and scholars: [tags, ar, en, om, so, src en, src ar, link] */
const SA=[
 ['lh','إِنَّ الْمُؤْمِنَ يَرَى ذُنُوبَهُ كَأَنَّهُ قَاعِدٌ تَحْتَ جَبَلٍ يَخَافُ أَنْ يَقَعَ عَلَيْهِ، | وَإِنَّ الْفَاجِرَ يَرَى ذُنُوبَهُ كَذُبَابٍ مَرَّ عَلَى أَنْفِهِ','The believer sees his sins as if he were sitting under a mountain he fears will fall on him. The wicked sees his sins like a fly that passed over his nose.',"Mu'iminni cubbuu isaa akka nama tulluu kufuu sodaatu jala taa'eetti ilaala. Badaan immoo cubbuu isaa akka tisee funyaan isaa irra darbiteetti ilaala.","Mu'minku dembiyadiisa wuxuu u arkaa sidii isagoo fadhiya buur hoostiis oo uu ka baqayo inay ku dhacdo. Faajirkuna wuxuu u arkaa sidii duqsi sankiisa maray.","Ibn Mas'ud, in Sahih al-Bukhari 6308",'ابن مسعود، صحيح البخاري ٦٣٠٨','https://sunnah.com/bukhari:6308'],
 ['nh','ارْتَحَلَتِ الدُّنْيَا مُدْبِرَةً، وَارْتَحَلَتِ الْآخِرَةُ مُقْبِلَةً، | وَلِكُلِّ وَاحِدَةٍ مِنْهُمَا بَنُونَ، | فَكُونُوا مِنْ أَبْنَاءِ الْآخِرَةِ، وَلَا تَكُونُوا مِنْ أَبْنَاءِ الدُّنْيَا، | فَإِنَّ الْيَوْمَ عَمَلٌ وَلَا حِسَابَ، | وَغَدًا حِسَابٌ وَلَا عَمَلَ','This world is leaving, turning its back, and the Hereafter is coming, facing us. Each of them has its children, so be children of the Hereafter and do not be children of this world. Today is action with no reckoning, and tomorrow is reckoning with no action.',"Addunyaan dugda garagalchitee deemaa jirti, Aakhiraan immoo fuula keessan dhufaa jirti. Tokkoon tokkoon isaanii ijoollee qabu; kanaaf ijoollee Aakhiraa ta'aa, ijoollee addunyaa hin ta'inaa. Har'a hojii malee herregni hin jiru, boru herrega malee hojiin hin jiru.","Adduunyadu way dhaqaaqday iyadoo dib u jeedda, Aakhiraduna way dhaqaaqday iyadoo soo socota. Mid kastaa waxay leedahay carruur, ee noqda carruurta Aakhirada, ha noqonina carruurta adduunyada. Maanta waa camal xisaab la'aan ah, berrina waa xisaab camal la'aan ah.","'Ali ibn Abi Talib, in Sahih al-Bukhari, Book of Softening the Hearts",'علي بن أبي طالب، صحيح البخاري، كتاب الرقاق','https://sunnah.com/bukhari/81'],
 ['h','فِي الْقَلْبِ شَعَثٌ | لَا يَلُمُّهُ إِلَّا الْإِقْبَالُ عَلَى اللَّهِ','In the heart there is a scattering that nothing gathers except turning to Allah.',"Onnee keessa bittinnaa'insa waan Rabbitti garagaluun malee homtuu walitti hin qabne tu jira.","Qalbiga waxaa ku jira kala firdhasho aan waxba isku keenin marka laga reebo u soo jeesashada Alle.","Ibn al-Qayyim, Madarij as-Salikin",'ابن القيم، مدارج السالكين',''],
 ['h','إِذَا أَصْبَحَ الْعَبْدُ وَأَمْسَى وَلَيْسَ هَمُّهُ إِلَّا اللَّهُ وَحْدَهُ، | تَحَمَّلَ اللَّهُ عَنْهُ حَوَائِجَهُ كُلَّهَا','When a servant spends his morning and evening with no concern but Allah alone, Allah carries all his needs for him.',"Yeroo garbichi ganamaa fi galgala yaaddoo Rabbii qofaa qabaatu, Rabbiin wanta inni barbaadu hunda isaaf baata.","Marka addoonku subaxo iyo galab ahaado isagoo aan walwal kale lahayn Alle keliya mooyee, Alle ayaa u qaada baahiyihiisa oo dhan.","Ibn al-Qayyim, al-Fawa'id",'ابن القيم، الفوائد',''],
 ['n','إِضَاعَةُ الْوَقْتِ أَشَدُّ مِنَ الْمَوْتِ؛ | لِأَنَّ إِضَاعَةَ الْوَقْتِ تَقْطَعُكَ عَنِ اللَّهِ وَالدَّارِ الْآخِرَةِ، | وَالْمَوْتُ يَقْطَعُكَ عَنِ الدُّنْيَا وَأَهْلِهَا','Wasting time is worse than death: wasting time cuts you off from Allah and the Hereafter, while death cuts you off from this world and its people.',"Yeroo balleessuun du'a caalaa cimaadha: yeroo balleessuun Rabbii fi Aakhiraa irraa si kuta, du'i immoo addunyaa fi namoota ishee irraa si kuta.","Lumintii waqtigu way ka daran tahay dhimashada: lumintii waqtigu waxay kaa goysaa Alle iyo Aakhirada, dhimashaduna waxay kaa goysaa adduunyada iyo dadkeeda.","Ibn al-Qayyim, al-Fawa'id",'ابن القيم، الفوائد',''],
 ['n','يَا ابْنَ آدَمَ، إِنَّمَا أَنْتَ أَيَّامٌ، | كُلَّمَا ذَهَبَ يَوْمٌ ذَهَبَ بَعْضُكَ','Son of Adam, you are only days. Whenever a day goes, a part of you goes.',"Ilma Aadam, ati guyyoota qofa. Guyyaan tokko yoo darbe, kutaan kee tokko darba.","Ina Aadamow, waxaad tahay maalmo keliya. Mar kasta oo maalin tagto, qayb adiga ka mid ah ayaa tagta.","Al-Hasan al-Basri, in Hilyat al-Awliya'",'الحسن البصري، حلية الأولياء','']];
/* Fastaqim's own words: [tags, en, ar, om, so] */
const OW=[
 ['n',"Nobody has ever regretted a salah they prayed on time. Many wish they had not delayed one.",'لم يندم أحدٌ قطّ على صلاةٍ صلّاها في وقتها، وكم من أحدٍ تمنّى لو لم يؤخّر صلاة.',"Namni salaata yeroo isheetti salaateef gaabbe hin jiru. Baay'een garuu salaata tokko waan turfataniif gaabbu.","Qofna kama qoomamin salaad uu waqtigeeda tukaday. Dad badan ayaa jeclaan lahaa inaanay mid dib u dhigin."],
 ['nh',"Your desire says \"later\". The adhan says \"come to success\". Whose call will you answer first?",'هواك يقول: «بعدين»، والأذان يقول: «حيّ على الفلاح». فأيَّ النداءين تُجيب أولًا؟',"Fedhiin kee \"booda\" jetti. Azaanni \"gara milkaa'inaa kottaa\" jedha. Waamicha kamiif dursitee deebista?","Hawadaadu waxay leedahay \"goor dambe\". Aadaanku wuxuu leeyahay \"u kaalaya liibaanta\". Yaa baaqiisa ugu horrayn ka jawaabaysaa?"],
 ['h',"The nafs is like a child: give it everything it asks for and it never grows. Tell it \"not now\", and tell your Lord \"here I am\".",'النفس كالطفل؛ إن أعطيتها كلَّ ما تطلب لم تكبر أبدًا. قل لها: «ليس الآن»، وقل لربّك: «لبّيك».',"Lubbuun akka daa'imaati: waan gaafattu hunda yoo kenniteef gonkumaa hin guddattu. \"Amma miti\" jedhiin, Gooftaa keetiin immoo \"kunoo ani\" jedhi.","Naftu waa sida ilmo yar: haddaad siiso wax kasta oo ay weydiisato, weligeed ma koroto. Waxaad ku dhahdaa \"hadda maaha\", Rabbigaana waxaad ku dhahdaa \"waan kuu jawaabay\"."],
 ['h',"Heaviness is not a sign to stop. It is exactly where the reward is waiting.",'الثِّقَل ليس علامةً على التوقّف، بل هو المكان الذي ينتظرك فيه الأجر.',"Ulfaatinni mallattoo dhaabachuu miti. Bakka mindaan si eeggatu sanuma.","Culayska ma aha calaamad joogsi. Waa meesha ajarku kugu sugayo."],
 ['l',"Late is not the end of the road. The door you are coming back to has never closed.",'التأخير ليس نهاية الطريق؛ فالباب الذي تعود إليه لم يُغلَق قطّ.',"Turuun dhuma karaa miti. Balballi ati itti deebitu gonkumaa hin cufamne.","Daahitaanku ma aha dhammaadka jidka. Albaabka aad ku soo laabanaysid weligiis lama xirin."],
 ['n',"Tomorrow is a guest who may never come. Today is the guest already at your door.",'الغدُ ضيفٌ قد لا يأتي، واليومُ ضيفٌ واقفٌ على بابك.',"Boru keessummaa dhufuu dhiisuu danda'uudha. Har'a keessummaa duraanuu balbala kee irra jiruudha.","Berri waa marti laga yaabo inuusan iman. Maantana waa martida horeba albaabkaaga taagan."],
 ['h',"Put what Allah loves before what you love, and see how He takes care of what you love.",'قدِّم ما يحبّه الله على ما تحبّ، وانظر كيف يتولّى هو ما تحبّ.',"Waan Rabbiin jaallatu waan ati jaallattu dursi, akkamitti Inni waan ati jaallattu siif eegu ilaali.","Ka hormari waxa Alle jecel yahay waxa aad jeceshahay, oo eeg sida Uu kuugu daryeelo waxa aad jeceshahay."],
 ['l',"A fall does not define you. What you do after it does.",'السقوطُ لا يُعرِّفك، بل ما تفعله بعده.',"Kufaatiin si hin ibsitu. Waan booda gootu si ibsa.","Dhicitaanku kuma qeexo. Waxa aad ka dib samayso ayaa ku qeexa."]];
const ASK={n:["If this were my last salah, how would I pray it?",'لو كانت هذه آخرَ صلاةٍ لي، كيف سأصلّيها؟',"Osoo kun salaata koo isa dhumaa ta'ee, akkamittan salaata?","Haddii tani tahay salaaddaydii ugu dambaysay, sidee ayaan u tukan lahaa?"],
 l:["What held me back this time, and what will help me next time?",'ما الذي أخّرني هذه المرّة، وما الذي يُعينني في المرّة القادمة؟',"Yeroo kana maaltu na turse, yeroo itti aanu immoo maaltu na gargaara?","Maxaa i daahiyay markan, maxaase i caawin doona marka xigta?"],
 h:["What am I putting before Allah right now, and is it worth it?",'ما الذي أقدّمه على الله الآن، وهل يستحقّ ذلك؟',"Amma maal Rabbii dura kaa'aa jira? Sun ni malaa?","Maxaan hadda ka hormarinayaa Alle, ma u qalmaa?"]};
/* one list, mixed so the kinds take turns */
const ALL=(()=>{const q=Q.map(x=>({k:'q',g:x.g,x})),h=HD.map(x=>({k:'h',g:x[3],x})),s=SA.map(x=>({k:'s',g:x[0],x})),w=OW.map(x=>({k:'w',g:x[0],x}));
 const out=[],n=Math.max(q.length,h.length,s.length,w.length);for(let i=0;i<n;i++)[q[i],h[i],w[i],s[i]].forEach(o=>o&&out.push(o));return out})();
/* ---------- Qur'an text from the site's own files ---------- */
const QC={};
function ayat(ref){if(QC[ref])return Promise.resolve(QC[ref]);const[s,v]=ref.split(':'),[a,b]=v.split('-').map(Number);
 return fetch('q/'+s+'.json').then(r=>r.json()).then(j=>{const vs=[];for(let i=a;i<=(b||a);i++)vs.push(j.v[i-1]);
  return QC[ref]={ar:vs.map(x=>x[0].replace(/۞\s*/g,'')),en:vs.map(x=>x[1]).join(' ')}})}
function qLabel(ref){const s=ref.split(':')[0],n=SU[s];return X("Qur'an, Surah "+n[0]+' '+ref,'القرآن، سورة '+n[1]+' '+AR(ref).replace('-','–'))}
function kind(o){return o.k==='q'?X("Qur'an",'القرآن الكريم','Qur\'aana','Qur\'aanka'):o.k==='h'?X('Hadith','حديث','Hadiisa','Xadiis'):o.k==='s'?X('From the righteous before us','من كلام السلف','Jechoota warra dur','Erayada wanaagsanaha hore'):X('A thought to keep','خاطرة','Yaada qabachuu','Fikir lagu xusuusto')}
function lines(t){return t.split(' | ').map(l=>'<span class="fqk-l">'+l+'</span>').join('')}
function body(o){const meaning=(t)=>L==='ar'?'':'<p class="fqk-m">'+esc(t)+'</p>';
 if(o.k==='q'){const v=QC[o.x.r];if(!v)return '<div class="fqk-ar">…</div>';const p=o.x.r.split(':');
  return '<div class="fqk-ar notranslate" dir="rtl" lang="ar">'+v.ar.map((a,i)=>'<span class="fqk-l">'+a+' <span class="fqk-n">'+AR(+p[1].split('-')[0]+i)+'</span></span>').join('')+'</div>'
   +meaning(LI===1?o.x.so:v.en)+'<a class="fqk-s" href="https://quran.com/'+p[0]+'/'+p[1]+'" target="_blank" rel="noopener">'+qLabel(o.x.r)+' ↗</a>'}
 if(o.k==='h'){const x=o.x,b=BK[x[0]];
  return '<div class="fqk-ar fqk-hd notranslate" dir="rtl" lang="ar">'+lines(x[4])+'</div>'+meaning(X(x[5],'',x[6],x[7]))
   +'<a class="fqk-s" href="https://sunnah.com/'+b[2]+':'+x[1]+'" target="_blank" rel="noopener">'+X(b[0]+' '+x[1],b[1]+' '+AR(x[1]))+' · '+(x[2]?X('Hasan','حسن'):X('Sahih','صحيح'))+' ↗</a>'}
 if(o.k==='s'){const x=o.x,src=esc(X(x[5],x[6]));
  return '<div class="fqk-ar fqk-hd notranslate" dir="rtl" lang="ar">'+lines(x[1])+'</div>'+meaning(X(x[2],'',x[3],x[4]))
   +(x[7]?'<a class="fqk-s" href="'+x[7]+'" target="_blank" rel="noopener">'+src+' ↗</a>':'<span class="fqk-s">'+src+'</span>')}
 const x=o.x;return '<div class="fqk-t" dir="auto">'+esc(X(x[1],x[2],x[3],x[4]))+'</div><span class="fqk-s fqk-own">Fastaqim</span>'}
/* ---------- state ---------- */
function st(){const dk=dkey(NOW());const o=S.nudge=S.nudge&&typeof S.nudge==='object'?S.nudge:{};if(o.d!==dk){o.d=dk;o.n=0;o.seen={}}o.i=o.i||{};return o}
function pick(ctx){const o=st(),list=ALL.filter(a=>a.g.indexOf(ctx)>=0),i=(o.i[ctx]||0)%list.length;o.i[ctx]=i+1;return list[i]}
function salName(k){const s=SAL.find(x=>x[0]===k);return s?T(s[1],s[2]):''}
function salahWord(k){return X(salName(k),salName(k),{fajr:'Fajrii',dhuhr:'Zuhrii',asr:'Asrii',maghrib:'Maghribii',isha:'Ishaa'}[k],{fajr:'Subax',dhuhr:'Duhur',asr:'Casar',maghrib:'Maqrib',isha:'Cishe'}[k])}
/* ---------- the sheet ---------- */
let CUR=null;
function open(ctx,k){CUR={ctx,k,o:pick(ctx)};save();draw(true)}
function draw(first){const {ctx,k,o}=CUR;
 if(o.k==='q'&&!QC[o.x.r]){ayat(o.x.r).then(()=>{if(CUR&&CUR.o===o)draw(first)}).catch(()=>{CUR.o=pick(ctx);draw(first)});if(!first)return}
 const title=ctx==='n'?X('There is still time','ما زال في الوقت متّسع','Yeroon ammallee jira','Waqti weli waa jiraa'):ctx==='l'?X('Welcome back','أهلًا بعودتك','Baga deebite','Ku soo dhowow'):X('A word for your heart','كلمةٌ لقلبك','Dubbii onnee keetiif','Eray qalbigaaga');
 const sub=ctx==='n'&&k?X('Have you prayed '+salName(k)+' yet?','هل صلّيت '+salName(k)+'؟',salahWord(k)+' salaatteettaa?','Ma tukatay '+salahWord(k)+'?')
  :ctx==='l'&&k?X(salName(k)+' is marked as made up. Allah sees that you came back.','سُجّلت '+salName(k)+' قضاءً. والله يرى أنّك عدت.',salahWord(k)+' akka qadaatti galmeeffame. Rabbiin akka ati deebite arga.',salahWord(k)+' waxaa loo calaamadeeyay qadaa. Alle wuu arkaa inaad soo laabatay.')
  :X('When salah feels heavy, read this first.','حين تثقل عليك الصلاة، اقرأ هذا أولًا.','Yeroo salaanni sitti ulfaattu, dura kana dubbisi.','Marka salaaddu kugu culus tahay, marka hore tan akhri.');
 const a=ASK[ctx],ask=X(a[0],a[1],a[2],a[3]);
 const main=ctx==='l'?'':`<button class="big" id="fqkGo">${ctx==='n'&&k?X("I'm going to pray now",'سأصلّي الآن','Amma nan salaata','Hadda ayaan tukanayaa'):X("I'm getting up for it",'سأقوم إليها','Ka ka\'eera','Waan u kacayaa')}</button>`;
 const html=`<div class="hd sub"><span style="width:44px"></span><h1>${title}</h1>${XB}</div>
  <p class="note fqk-sub">${esc(sub)}</p>
  <div class="fqk-card" id="fqkCard"><span class="fqk-e">${kind(o)}</span>${body(o)}</div>
  <div class="fqk-ask"><i class="ph ph-lightbulb"></i><span><small>${X('Ask yourself','اسأل نفسك','Of gaafadhu','Is weydii')}</small>${esc(ask)}</span></div>
  ${main}
  <button class="fqk-nx" id="fqkNx"><i class="ph ph-arrows-clockwise"></i>${X('Another reminder','تذكيرٌ آخر','Yaadachiisa biraa','Xusuusin kale')}</button>
  ${ctx==='n'&&k?`<button class="fqk-lk" id="fqkMk">${X('I already prayed it: mark it','صلّيتها: سجّلها','Duraan salaadheera: galmeessi','Horay ayaan u tukaday: calaamadee')}</button>`:''}
  ${ctx!=='h'?`<div class="fqk-ft"><button id="fqkPz">${X('Not today','ليس اليوم','Har\'a miti','Maanta maaha')}</button><span>·</span><button id="fqkSet">${X('Reminder settings','إعدادات التذكير','Qindaa\'ina yaadachiisaa','Dejinta xusuusinta')}</button></div>`:''}`;
 const sh=$('sh');
 if(first||!sh.classList.contains('on')||!sh.querySelector('#fqkCard'))openSheet(html);
 else{const c=$('fqkCard');c.classList.add('out');setTimeout(()=>{if(!CUR)return;c.innerHTML=`<span class="fqk-e">${kind(CUR.o)}</span>${body(CUR.o)}`;c.classList.remove('out');c.classList.add('in');setTimeout(()=>c.classList.remove('in'),320)},160);return}
 sh.classList.add('fqk-on');
 $('fqkNx').onclick=()=>{CUR.o=pick(ctx);save();vib(8);if(CUR.o.k==='q'&&!QC[CUR.o.x.r])ayat(CUR.o.x.r).then(()=>draw(false)).catch(()=>{});else draw(false)};
 const go=$('fqkGo');if(go)go.onclick=()=>{vib([10,40,10]);closeSheet();toast(X('May Allah accept it from you','تقبّل الله منك','Rabbiin si irraa haa qeebalu','Alle ha kaa aqbalo'))};
 const mk=$('fqkMk');if(mk)mk.onclick=()=>{closeSheet();setTimeout(()=>salSheet(k),260)};
 const pz=$('fqkPz');if(pz)pz.onclick=()=>{st().pause=dkey(NOW());save();closeSheet();toast(X('No more reminders today','لا تذكيرات أخرى اليوم','Har\'a yaadachiisni biraa hin jiru','Maanta xusuusin kale ma jirto'))};
 const se=$('fqkSet');if(se)se.onclick=settings}
/* ---------- when it shows by itself ---------- */
function allowed(){const o=st();return !o.off&&o.pause!==o.d&&o.n<DAILY}
function auto(ctx,k){const o=st(),key=ctx+k;if(!allowed()||o.seen[key])return false;o.seen[key]=1;o.n++;open(ctx,k);return true}
function busy(){const sh=$('sh');return (sh&&sh.classList.contains('on'))||document.hidden||($('cel')&&$('cel').classList.contains('on'))}
const ORDER=['fajr','dhuhr','asr','maghrib','isha'];
function endOf(k,now){const i=SAL.findIndex(x=>x[0]===k);
 if(k==='isha'){const m=at(SAL.find(x=>x[0]==='maghrib')[3],now),f=at(SAL[0][3],now,1);return new Date((+m+ +f)/2)}
 return at(SAL[i+1][3],now)}
function check(){try{if(!S||!S.loc||!isFinite(S.loc.lat)||busy()||!allowed())return;const now=NOW(),dk=dkey(now),day=S.salah[dk]||{};
 for(const k of ORDER){const s=SAL.find(x=>x[0]===k);if(!s)continue;const t0=at(s[3],now),t1=endOf(k,now);
  if(day[k]||now<t0)continue;if(now-t0<AFTER*6e4)continue;if(t1-now>NEAR*6e4||now>=t1)continue;
  if(auto('n',k))return}}catch(e){console.warn('nudge',e)}}
/* ---------- settings ---------- */
const onOff=()=>st().off?X('Off','متوقّفة','Cufaa','Damsan'):X('On','مفعّلة','Banaa','Shidan');
function settings(){const o=st(),on=!o.off;
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Salah reminders','تذكيرات الصلاة','Yaadachiisa salaataa','Xusuusinta salaadda')}</h1>${XB}</div>
 <p class="note" style="text-align:center">${X('A calm word from the Qur\'an and Sunnah when a salah is nearly out of time or prayed late. Twice a day at most. Nothing is ever marked for you.','كلمةٌ هادئة من القرآن والسنة حين يقترب خروج وقت الصلاة أو تُصلّى بعد وقتها. مرّتين في اليوم على الأكثر، ولا يُسجَّل شيءٌ عنك أبدًا.',"Yeroo yeroon salaataa xumuramuu ga'u ykn salaanni yeroo ishee booda salaatamtu, dubbii tasgabbaa'aa Qur'aanaa fi Sunnaa irraa. Guyyaatti si'a lama hin caalu. Wanti tokkollee siif hin galmeeffamu.","Eray deggan oo Qur'aanka iyo Sunnada ka yimid marka waqtiga salaaddu dhammaanayo ama la tukado waqtigeeda kadib. Maalintii laba jeer ugu badnaan. Waxba laguuma calaamadeeyo.")}</p>
 ${[[1,X('On','مفعّلة','Banaa','Shidan'),X('Recommended','موصى به','Ni gorfama','Lagu talinayo'),'ph-bell-ringing'],[0,X('Off','متوقّفة','Cufaa','Damsan'),X('You can still read them below','يمكنك قراءتها من الزر أدناه','Amma iyyuu gadii dubbisuu dandeessa','Weli hoos ayaad ka akhrisan kartaa'),'ph-bell-slash']].map(([v,a,b,ic])=>`<button class="opt ${(v===1)===on?'on':''}" data-nv="${v}"><i class="ph ${ic}"></i><span><b>${a}</b><small>${b}</small></span><span class="rd">✓</span></button>`).join('')}
 ${o.pause===o.d?`<p class="note" style="text-align:center">${X('Paused for today.','متوقّفة لليوم.','Har\'aaf dhaabateera.','Maanta waa la hakiyay.')} <button class="fqk-lk" id="fqkRes" style="display:inline;width:auto;margin:0">${X('Turn back on','أعِدها','Deebisi','Dib u shid')}</button></p>`:''}
 <button class="ghost" id="fqkRead"><i class="ph ph-book-open"></i>${X('Read one now','اقرأ واحدًا الآن','Amma tokko dubbisi','Hadda mid akhri')}</button>`);
 $$('#sh [data-nv]').forEach(b=>b.onclick=()=>{st().off=b.dataset.nv!=='1';save();vib(10);settings();const e=document.querySelector('#fqkMore em');if(e)e.textContent=onOff()});
 const r=$('fqkRes');if(r)r.onclick=()=>{st().pause='';save();settings()};
 $('fqkRead').onclick=()=>open('h')}
/* ---------- hooks into the page ---------- */
function boot(){
 const _ss=window.salSheet;
 if(typeof _ss==='function')window.salSheet=salSheet=function(k){_ss.apply(this,arguments);const dk=dkey(NOW()),cur=(S.salah[dk]||{})[k];
  const late=document.querySelector('#sh [data-v="late"]');
  if(late&&cur!=='late')late.addEventListener('click',()=>{const o=st();if(!o.off&&o.pause!==o.d&&!o.seen['l'+k]&&o.n<DAILY+1){o.seen['l'+k]=1;o.n++;setTimeout(()=>open('l',k),380)}});
  if(!cur){const sh=$('sh'),b=document.createElement('button');b.className='fqk-lk fqk-heavy';b.innerHTML='<i class="ph ph-heart"></i>'+X('Finding it heavy? Read this first','تشعر بثقلها؟ اقرأ هذا أولًا','Sitti ulfaateeraa? Dura kana dubbisi','Ma kugu culus tahay? Marka hore tan akhri');
   b.onclick=()=>open('h',k);sh.appendChild(b)}};
 const _rh=window.renderHero;
 if(typeof _rh==='function')window.renderHero=renderHero=function(){_rh.apply(this,arguments);const mk=document.querySelector('#hero .nw-mk');if(mk&&!document.querySelector('#hero .fqk-hl')){
  const b=document.createElement('button');b.className='fqk-hl';b.innerHTML='<i class="ph ph-heart"></i>'+X('Finding it heavy?','تشعر بثقلها؟','Sitti ulfaateeraa?','Ma kugu culus tahay?');b.onclick=()=>open('h',mk.dataset.mk);mk.insertAdjacentElement('afterend',b)}};
 try{renderHero()}catch(e){}
 const addRow=()=>{const n=$('fqpNot');if(!n||$('fqkMore'))return;const b=document.createElement('button');b.id='fqkMore';b.innerHTML='<span class="ic c-a"><i class="ph ph-heart"></i></span><span>'+X('Salah reminders','تذكيرات الصلاة','Yaadachiisa salaataa','Xusuusinta salaadda')+'</span><em>'+onOff()+'</em><i class="ph ph-caret-right cv flip"></i>';b.onclick=settings;n.insertAdjacentElement('afterend',b)};
 if(typeof R.settings==='function'){const _s=R.settings;R.settings=function(){_s.apply(this,arguments);try{addRow()}catch(e){}}}
 addRow();
 const sh=$('sh');if(sh)new MutationObserver(()=>{if(!sh.classList.contains('on')&&sh.classList.contains('fqk-on')){sh.classList.remove('fqk-on');CUR=null}}).observe(sh,{attributes:true,attributeFilter:['class']});
 setTimeout(check,4000);setInterval(check,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(check,1500)});
 window.fqNudge={open,settings,check,all:ALL}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
