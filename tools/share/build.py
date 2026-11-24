# Builds next/v6/fq-share.js from tools/share/src.js (adds the du'a library with Qur'an text from next/v6/q). Run: python3 tools/share/build.py
import json,sys,os
R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))+'/'
Q=R+'next/v6/q/'
def ay(k):
  s,a=map(int,k.split(':'));return json.load(open(Q+f'{s}.json'))['v'][a-1]
L=[]
for g in [['2:201'],['3:8'],['7:23'],['14:40','14:41'],['17:24'],['25:74'],['59:10'],['71:28'],['3:193']]:
  vs=[ay(k) for k in g];s=g[0].split(':')[0];a=g[0].split(':')[1];b=g[-1].split(':')[1]
  r=s+':'+a+('-'+b if len(g)>1 else '')
  L.append({'id':'q'+r.replace(':','-'),'qk':g,'ar':' '.join(v[0]+' '+''.join('٠١٢٣٤٥٦٧٨٩'[int(c)] for c in k.split(':')[1]) for v,k in zip(vs,g)),'en':' '.join(v[1] for v in vs),'sa':'القرآن '+''.join('٠١٢٣٤٥٦٧٨٩'[int(c)] if c.isdigit() else ('–' if c=='-' else c) for c in r),'src':["Qur'an "+r.replace('-','–'),'https://quran.com/'+s+'/'+a+('-'+b if len(g)>1 else '')]})
H=[
 ('m2721','اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى، وَالتُّقَى، وَالْعَفَافَ، وَالْغِنَى','O Allah, I ask You for guidance, piety, chastity and contentment.','Muslim (Riyad as-Salihin 1468)','https://sunnah.com/riyadussalihin:1468'),
 ('m2697','اللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَارْزُقْنِي','O Allah, forgive me, have mercy on me, guide me and provide for me.','Muslim 2697','https://sunnah.com/muslim:2697'),
 ('t2140','يَا مُقَلِّبَ الْقُلُوبِ، ثَبِّتْ قَلْبِي عَلَى دِينِكَ','O Turner of hearts, keep my heart firm on Your religion.','Tirmidhi, hasan (Riyad as-Salihin 1489)','https://sunnah.com/riyadussalihin:1489'),
 ('d1522','اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ','O Allah, help me to remember You, to thank You, and to worship You well.','Abu Dawud 1522 (sahih)','https://sunnah.com/abudawud:1522'),
 ('b3370','اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ','O Allah, send prayers on Muhammad and the family of Muhammad, as You sent prayers on Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious.','Bukhari 3370','https://sunnah.com/bukhari:3370'),
]
SA={'m2721':'رواه مسلم (رياض الصالحين ١٤٦٨)','m2697':'مسلم ٢٦٩٧','t2140':'رواه الترمذي، حسن (رياض الصالحين ١٤٨٩)','d1522':'أبو داود ١٥٢٢ (صحيح)','b3370':'البخاري ٣٣٧٠'}
for i,a,e,s,u in H:L.append({'id':i,'ar':a,'en':e,'sa':SA[i],'src':[s,u]})
src=open(R+'tools/share/src.js',encoding='utf8').read().replace('/*LIB*/[]',json.dumps(L,ensure_ascii=False))
open(R+'next/v6/fq-share.js','w',encoding='utf8').write(src);print(len(L),'items')
