import { jokes as esJ } from './lang/es.js';
import { jokes as ptJ } from './lang/pt.js';
import { jokes as deJ } from './lang/de.js';
import { jokes as frJ } from './lang/fr.js';
// One line for every wrong pick: what the album and the fail screen say, per danger and item.
const J = {
  lava: {
    gasoline: ['Gasoline on fire. Bold move.', 'Yangına benzin. Cesur hamle.'],
    sword: ['He cut the only thing holding him up.', 'Onu tutan tek şeyi kesti.'],
    fan: ['He cooled the lava down. The lava said thanks.', 'Lavı serinletmeye çalıştı. Lav teşekkür etti.'],
  },
  shark: {
    banana: ['Sharks don\'t eat fruit. They ate him.', 'Köpekbalığı meyve yemez. Onu yedi.'],
    rod: ['He caught the shark. The shark caught him.', 'Köpekbalığını tuttu. Köpekbalığı da onu.'],
    icecream: ['Dessert came first. He was the main course.', 'Önce tatlı geldi. Ana yemek oydu.'],
  },
  bees: {
    honey: ['Took their honey right in front of them. Brave.', 'Arıların balını gözlerinin önünde aldı. Cesur.'],
    stick: ['Poking the hive. A classic.', 'Kovanı sopayla dürttü. Klasik.'],
    water: ['Wet bees are angry bees.', 'Islak arı, sinirli arı.'],
  },
  fire: {
    gasoline: ['Well, that escalated.', 'Eh, işler biraz büyüdü.'],
    fan: ['More air, more fire. Science.', 'Daha çok hava, daha çok ateş. Bilim.'],
    banana: ['The banana did not put it out. Shocking.', 'Muz yangını söndürmedi. Şaşırtıcı.'],
  },
  bear: {
    drum: ['The bear did not enjoy the concert.', 'Ayı konseri beğenmedi.'],
    broccoli: ['Bears skip their vegetables too.', 'Ayılar da sebze sevmiyor.'],
    teddy: ['The bear took it personally.', 'Ayı bunu kişisel algıladı.'],
  },
  ghost: {
    candle: ['Candlelight made it spookier. Thanks.', 'Mum ışığında hayalet daha da korkunç oldu.'],
    teddy: ['Hugging a teddy never stopped a ghost.', 'Ayıcığa sarılmak hayaleti durdurmadı.'],
    mirror: ['The ghost wasn\'t in the mirror. His own face was scarier.', 'Aynada hayalet yoktu. Kendi yüzü daha korkunçtu.'],
  },
  cold: {
    icecream: ['Ice cream in a snowstorm. Brrr.', 'Kar fırtınasında dondurma. Brrr.'],
    fan: ['Wind chill: freezer.', 'Rüzgârla hissedilen sıcaklık: buzdolabı.'],
    ice: ['Fighting cold with ice. Bold.', 'Soğuğa buzla karşılık verdi. Cesur.'],
  },
  flood: {
    anchor: ['The anchor did its job. Straight down.', 'Çapa işini yaptı: dibe.'],
    sponge: ['The sponge tried its best. Not enough.', 'Sünger elinden geleni yaptı. Yetmedi.'],
    rocket: ['Rockets can\'t swim.', 'Roketler yüzmeyi bilmiyor.'],
  },
  bomb: {
    hammer: ['Hitting the bomb. Interesting strategy.', 'Bombaya çekiçle vurdu. İlginç strateji.'],
    match: ['It was already lit. Now it\'s extra lit.', 'Zaten yanıyordu. Şimdi daha çok yanıyor.'],
    fan: ['He fanned the fuse. Faster boom.', 'Fitili yelledi. Patlama hızlandı.'],
  },
  thief: {
    cat: ['The cat didn\'t care. Cats never do.', 'Kedi hiç umursamadı. Kediler umursamaz.'],
    paper: ['A strongly worded letter. The thief laughed.', 'Hırsıza dilekçe yazdı. Hırsız güldü.'],
    candle: ['Now the thief can see better. Thanks.', 'Hırsıza ışık tuttu. Sağ olsun.'],
  },
  dragon: {
    paper: ['Paper vs dragon fire. Paper lost.', 'Kâğıt ejderha ateşine karşı. Kâğıt kaybetti.'],
    umbrella: ['It wasn\'t raining. It was fire.', 'Yağmur yağmıyordu. Ateş yağıyordu.'],
    water: ['One bucket against a dragon. Cute.', 'Ejderhaya bir kova su. Tatlı.'],
  },
  vampire: {
    ketchup: ['The vampire wanted the real thing.', 'Vampir ketçapla kandırılmadı.'],
    mirror: ['The vampire didn\'t even look at it.', 'Vampir aynaya bakmadı bile.'],
    teddy: ['The vampire had dinner. With a teddy on the side.', 'Vampir akşam yemeğini buldu. Yanında ayıcık.'],
  },
  desert: {
    salt: ['Salt in the desert. Even thirstier now.', 'Çölde tuz. Şimdi daha da susadı.'],
    icecream: ['It melted in two seconds. So did he.', 'Dondurma iki saniyede eridi. O da.'],
    banana: ['Dry banana, dry mouth.', 'Kuru muz, kupkuru ağız.'],
  },
  meteor: {
    umbrella: ['It was not that kind of rain.', 'Bu o tür bir yağmur değildi.'],
    magnet: ['He attracted the meteor. Literally.', 'Meteoru resmen kendine çekti.'],
    paper: ['Flat as a pancake.', 'Gözleme gibi oldu.'],
  },
  dino: {
    skateboard: ['Cliff edge plus skateboard. There was no plan B.', 'Uçurum kenarında kaykay. B planı yoktu.'],
    drumstick: ['He brought the dino a snack. Himself.', 'Dinozora atıştırmalık getirdi. Kendini.'],
    balloon: ['One balloon. One very short flight.', 'Tek balon. Çok kısa bir uçuş.'],
  },
  snake: {
    drum: ['The snake hated the music.', 'Yılan müzikten hoşlanmadı.'],
    stick: ['Poking a snake. Never a good idea.', 'Yılanı sopayla dürtmek. Asla iyi fikir değil.'],
    cheese: ['Snakes don\'t do cheese.', 'Yılanlar peynir sevmez.'],
  },
  alien: {
    magnet: ['Now the UFO pulls even harder.', 'UFO şimdi daha da güçlü çekiyor.'],
    balloon: ['He floated up to them himself.', 'Uzaylılara balonla kendisi gitti.'],
    kite: ['Nice kite. Nice ride to space.', 'Güzel uçurtma. Uzaya güzel yolculuk.'],
  },
  tornado: {
    kite: ['Kite in a tornado. He flew with it.', 'Hortumda uçurtma. Kendisi de uçtu.'],
    umbrella: ['He flew with the umbrella. Not like in the movies.', 'Şemsiyeyle uçtu. Filmlerdeki gibi olmadı.'],
    balloon: ['Up, up and away.', 'Yukarı, yukarı ve gitti.'],
  },
  carsink: {
    sponge: ['He tried to soak up the lake.', 'Gölü süngerle çekmeye çalıştı.'],
    umbrella: ['Staying dry was not the problem.', 'Sorun ıslanmak değildi.'],
    banana: ['No way out, but a healthy snack.', 'Kaçamadı ama sağlıklı atıştırdı.'],
  },
  airballoon: {
    anchor: ['An anchor in a balloon. Heavy idea.', 'Balona çapa. Ağır bir fikir.'],
    steak: ['Lunch made the balloon even heavier.', 'Öğle yemeği balonu daha da ağırlaştırdı.'],
    drum: ['A drum roll for the crash.', 'Düşüşe davul eşliği.'],
  },
  boulder: {
    banana: ['He slipped. The boulder didn\'t.', 'O kaydı. Kaya kaymadı.'],
    broccoli: ['Healthy. Also flat.', 'Sağlıklı. Ama yassı.'],
    umbrella: ['Umbrella vs boulder. Guess who won.', 'Şemsiye kayaya karşı. Bil bakalım kim kazandı.'],
  },
  spider: {
    honey: ['Sticky and wrapped. Ready to serve.', 'Hem yapışkan hem paketli. Servise hazır.'],
    teddy: ['Wrapped up for later. Teddy included.', 'Ayıcığıyla birlikte paketlendi.'],
    fan: ['The web flew right into his face.', 'Örümcek ağı tam suratına uçtu.'],
  },
  mice: {
    cheese: ['They brought friends.', 'Arkadaşlarını da getirdiler.'],
    ketchup: ['Now it\'s a mouse party.', 'Fare partisi başladı.'],
    icecream: ['Mice love dessert. Lots of mice.', 'Fareler tatlıya bayılır. Çok fare.'],
  },
  zombie: {
    garlic: ['Garlic is for vampires. He\'s on the zombie team now.', 'Sarımsak vampirler içindi. Artık zombi takımında.'],
    flower: ['Flowers for the zombie. It wanted brains.', 'Zombiye çiçek. O beyin istiyordu.'],
    mirror: ['The zombie saw itself. Still hungry.', 'Zombi aynada kendini gördü. Yine de acıktı.'],
  },
  lion: {
    broccoli: ['Lions are not vegetarians.', 'Aslanlar vejetaryen değil.'],
    teddy: ['The lion wanted a real snack.', 'Aslan gerçek bir atıştırmalık istiyordu.'],
    flower: ['Romantic. The lion was not.', 'Romantik. Aslan değildi.'],
  },
  gorilla: {
    drum: ['The gorilla drums better. And throws farther.', 'Goril daha iyi davul çalıyor. Daha uzağa da atıyor.'],
    mirror: ['The gorilla saw a rival. Bad timing.', 'Goril aynada rakip gördü. Kötü zamanlama.'],
    broccoli: ['Even gorillas want the banana.', 'Goril bile muz istedi, brokoli değil.'],
  },
  witch: {
    cat: ['The cat switched sides. Ribbit.', 'Kedi cadının tarafına geçti. Vrak.'],
    candle: ['Perfect light for a spell. Ribbit.', 'Büyü için mükemmel ışık. Vrak.'],
    broom: ['She already had a broom. Ribbit.', 'Cadının zaten süpürgesi vardı. Vrak.'],
  },
  robot: {
    hammer: ['The robot was made of metal. Ouch.', 'Robot metaldendi. Çekiç değil, adam çarpıldı.'],
    paper: ['A paper shield against 10,000 volts.', '10.000 volta karşı kâğıt kalkan.'],
    teddy: ['Robots don\'t do hugs.', 'Robotlar sarılmayı sevmez.'],
  },
  bull: {
    flower: ['The bull did not stop to smell it.', 'Boğa çiçeği koklamak için durmadı.'],
    steak: ['Showing a bull a steak. Rude.', 'Boğaya biftek göstermek. Ayıp.'],
    drum: ['The bull loved the beat. Charged to it.', 'Boğa ritmi sevdi. Ritimle saldırdı.'],
  },
  avalanche: {
    umbrella: ['An umbrella vs a whole mountain of snow.', 'Bir şemsiye, koca bir dağ kara karşı.'],
    fan: ['He blew the snow back. The snow won.', 'Kara üfledi. Kar kazandı.'],
    sponge: ['The sponge soaked up exactly nothing.', 'Sünger hiçbir şey çekmedi.'],
  },
  quicksand: {
    anchor: ['An anchor in quicksand. Express elevator down.', 'Bataklıkta çapa. Ekspres asansör: aşağı.'],
    broccoli: ['Healthy. And deep underground.', 'Sağlıklı. Ve yerin dibinde.'],
    skateboard: ['Skateboards don\'t work on sand.', 'Kaykay kumda gitmiyor.'],
  },
  tsunami: {
    umbrella: ['That\'s a lot of water for an umbrella.', 'Bir şemsiye için fazla su.'],
    sponge: ['The biggest sponge challenge ever. Lost.', 'Tarihin en büyük sünger sınavı. Kaybetti.'],
    water: ['More water. Just what was missing.', 'Biraz daha su. Tam da eksik olan buydu.'],
  },
  skunk: {
    flower: ['Flowers can\'t beat a skunk.', 'Çiçek kokarcayı yenemedi.'],
    cheese: ['Old cheese plus skunk. A deadly combo.', 'Eski peynir artı kokarca. Ölümcül kombo.'],
    fan: ['He fanned it straight at himself.', 'Kokuyu tam kendine yelledi.'],
  },
  lightning: {
    umbrella: ['A metal stick in a storm. Shocking.', 'Fırtınada metal çubuk. Çarpıcı.'],
    kite: ['Benjamin Franklin would be proud. And worried.', 'Benjamin Franklin gurur duyardı. Ve endişelenirdi.'],
    sword: ['He raised a sword at the sky. The sky answered.', 'Gökyüzüne kılıç kaldırdı. Gökyüzü cevap verdi.'],
  },
  piranha: {
    steak: ['He fed the piranhas. Then he was dessert.', 'Piranaları besledi. Tatlı da kendisiydi.'],
    banana: ['Piranhas are not monkeys.', 'Piranalar maymun değil.'],
    ring: ['Floating is easy. Floating with piranhas is not.', 'Yüzmek kolay. Piranalarla yüzmek değil.'],
  },
  grease: {
    water: ['Water on an oil fire. Instant fireball.', 'Yağ yangınına su. Anında ateş topu.'],
    ice: ['Ice in hot oil. The kitchen exploded.', 'Kızgın yağa buz. Mutfak havaya uçtu.'],
    fan: ['Fanning an oil fire. Bold.', 'Yağ yangınını yelledi. Cesur.'],
  },
  electric: {
    water: ['Water and electricity. Classic mistake.', 'Su ve elektrik. Klasik hata.'],
    sponge: ['A wet sponge on a live socket. Zzzt.', 'Prize ıslak sünger. Zzzt.'],
    fan: ['More air, more sparks.', 'Daha çok hava, daha çok kıvılcım.'],
  },
  sleepbear: {
    honey: ['The bear smelled the honey. And him.', 'Ayı balın kokusunu aldı. Onun da.'],
    drum: ['Drumming next to a sleeping bear. Brave.', 'Uyuyan ayının yanında davul. Cesur.'],
    steak: ['Breakfast in bed. For the bear.', 'Yatağa kahvaltı. Ayıya.'],
  },
  vampsun: {
    garlic: ['He was wearing garlic. It didn\'t work on him.', 'Boynunda sarımsak vardı. Ona işlemiyor.'],
    ketchup: ['The vampire wanted the real thing.', 'Vampir ketçapla kandırılmadı.'],
    teddy: ['The sun was right there. He picked a teddy.', 'Güneş tam oradaydı. O ayıcık seçti.'],
  },
  thiefbone: {
    dog: ['The thief had a bone. The dog switched sides.', 'Hırsızın elinde kemik vardı. Köpek taraf değiştirdi.'],
    cat: ['The cat watched the whole thing. Did nothing.', 'Kedi her şeyi izledi. Hiçbir şey yapmadı.'],
    candle: ['Now the thief can see better. Thanks.', 'Hırsıza ışık tuttu. Sağ olsun.'],
  },
  ghostbaby: {
    vacuum: ['Vacuuming a crying baby. Cold.', 'Ağlayan bebeği süpürmek. Soğuk.'],
    candle: ['The baby ghost was scared of the dark. And of fire.', 'Bebek hayalet karanlıktan korkuyordu. Ateşten de.'],
    mirror: ['It saw itself crying. Cried louder.', 'Aynada ağladığını gördü. Daha çok ağladı.'],
  },
};

const MORE = { es: esJ || {}, pt: ptJ || {}, de: deJ || {}, fr: frJ || {} };
export function joke(hazard, tool, lang) {
  const j = J[hazard] && J[hazard][tool];
  if (!j) return '';
  if (lang === 'tr') return j[1];
  return (MORE[lang] && MORE[lang][`${hazard}.${tool}`]) || j[0];
}
export const _J = J;
