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
};

export function joke(hazard, tool, lang) {
  const j = J[hazard] && J[hazard][tool];
  return j ? j[lang === 'tr' ? 1 : 0] : '';
}
