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
  oxygen: {
    scissors: ['He cut the only thing tying him to the station.', 'İstasyona bağlı olduğu tek ipi kesti.'],
    fan: ['A fan in space. The air left faster.', 'Uzayda vantilatör. Hava daha hızlı kaçtı.'],
    balloon: ['He tried to save the air in a balloon. Cute.', 'Havayı balona doldurmaya çalıştı. Tatlı.'],
  },
  blackhole: {
    anchor: ['An anchor. In space. It fell in first.', 'Uzayda çapa. Önce o düştü.'],
    vacuum: ['The black hole is the bigger vacuum.', 'Kara delik daha büyük bir süpürge.'],
    kite: ['No wind in space. The kite agreed.', 'Uzayda rüzgar yok. Uçurtma da hak verdi.'],
  },
  moon: {
    balloon: ['Low gravity plus a balloon. Goodbye, Earth.', 'Düşük yerçekimi artı balon. Elveda Dünya.'],
    parachute: ['A parachute only works if you fall. He went up.', 'Paraşüt düşersen işe yarar. O yükseldi.'],
    skateboard: ['One kickflip on the moon. Never came down.', 'Ayda tek kickflip. Bir daha inmedi.'],
  },
  octopus: {
    sword: ['Eight arms. He cut one. Seven left.', 'Sekiz kol. Birini kesti. Yedi kaldı.'],
    rod: ['He went fishing. The fish went fishing too.', 'Balık tutmaya çalıştı. Balık da onu tuttu.'],
    steak: ['The octopus said thanks and took both.', 'Ahtapot teşekkür etti, ikisini de aldı.'],
  },
  jellyfish: {
    ring: ['Floating right into the jellyfish. Great plan.', 'Denizanalarının içine süzüldü. Harika plan.'],
    banana: ['Jellyfish do not eat bananas. They zap.', 'Denizanası muz yemez. Çarpar.'],
    sponge: ['A sponge is a sea animal too. Not a friendly one.', 'Sünger de deniz canlısı. Ama dostu değil.'],
  },
  whale: {
    honey: ['Honey on the raft. The whale loves sweets.', 'Salda bal. Balina tatlıya bayılır.'],
    torch: ['Now he can see the inside of the whale.', 'Artık balinanın içini görebiliyor.'],
    flute: ['The whale liked the song. It ate the band.', 'Balina şarkıyı sevdi. Grubu da yedi.'],
  },
  traffic: {
    balloon: ['The driver saw a balloon. Did not brake.', 'Şoför balonu gördü. Fren yapmadı.'],
    drum: ['Louder than the horn. Still not a brake.', 'Kornadan yüksek. Ama fren değil.'],
    banana: ['He threw a banana. The car slid faster.', 'Muz attı. Araba daha hızlı kaydı.'],
  },
  pigeons: {
    cheese: ['Cheese, for pigeons. Now they want lunch.', 'Güvercinlere peynir. Şimdi öğle yemeği istiyorlar.'],
    broccoli: ['The pigeons took one look and attacked anyway.', 'Güvercinler bir baktı, yine saldırdı.'],
    yarn: ['Pigeons are not cats. Bad news.', 'Güvercinler kedi değil. Kötü haber.'],
  },
  subway: {
    hammer: ['He hit the rail. The rail won.', 'Raya vurdu. Ray kazandı.'],
    magnet: ['A magnet on a steel rail. Stuck even harder.', 'Çelik raya mıknatıs. Daha da yapıştı.'],
    rope: ['He tied himself to the rail. Very safe.', 'Kendini raya bağladı. Çok güvenli.'],
  },
};

// Endings only puzzle levels reach: clue states (danger~clue), wrong orders (danger~two-step scenes),
// combined items and the items chains and inventory puzzles hand out.
const PZ = {
  'bear~asleep': {
    honey: ["He woke the bear up to give it breakfast. Thoughtful.", "Ayıyı kahvaltı vermek için uyandırdı. Ne düşünceli."],
  },
  'ghost~cry': {
    vacuum: ["He vacuumed a crying ghost. It cried louder.", "Ağlayan hayaleti süpürdü. Daha çok ağladı."],
  },
  'lion~thorn': {
    yarn: ["The lion had a thorn in its paw. It did not want to play.", "Aslanın patisinde diken vardı. Oyun oynayacak hali yoktu."],
  },
  'zombie~vegan': {
    brain: ["This zombie is vegan. He was offended. Then hungry.", "Bu zombi vegan. Önce alındı. Sonra acıktı."],
  },
  'mice~robot': {
    cat: ["Robot mice. The cat broke a tooth.", "Robot fareler. Kedinin dişi kırıldı."],
  },
  'alien~peace': {
    mirror: ["They waved a white flag. He blinded them. Now it's personal.", "Beyaz bayrak salladılar. O gözlerini kamaştırdı. Artık mesele kişisel."],
  },
  'meteor~tiny': {
    rocket: ["A rocket for a pebble. He's in orbit. The pebble is fine.", "Çakıl taşına roket. Kendisi yörüngede. Çakıl gayet iyi."],
  },
  'thief~bone': {
    dog: ["The thief had a bone. The dog switched teams.", "Hırsızın elinde kemik vardı. Köpek taraf değiştirdi."],
  },
  bear: {
    slippers: ["Tiptoeing past an awake bear. The bear noticed.", "Uyanık bir ayının yanından parmak ucunda geçti. Ayı fark etti."],
  },
  lion: {
    tape: ["Nothing was wrong with the lion. Until the bandage.", "Aslanın hiçbir derdi yoktu. Ta ki yara bandını görene kadar."],
  },
  zombie: {
    broccoli: ["This zombie is not vegan. Clearly.", "Bu zombi vegan değil. Belli oldu."],
  },
  mice: {
    magnet: ["Real mice aren't made of metal. They tickled.", "Gerçek fareler metal değil. Gıdıkladılar."],
  },
  alien: {
    flower: ["He offered a flower. They took the flower. And him.", "Çiçek uzattı. Çiçeği aldılar. Onu da."],
    scissors: ["He tried to cut the beam. Beams don't cut.", "Işını kesmeye çalıştı. Işın kesilmez."],
    garlic: ["Garlic is for vampires. Aliens think it's a snack.", "Sarımsak vampirler için. Uzaylılar atıştırmalık sanıyor."],
  },
  thief: {
    whistle: ["He whistled. The thief whistled back.", "Düdük çaldı. Hırsız da ona çaldı."],
    drumstick: ["He gave the thief a snack. The thief took it. And the bag.", "Hırsıza atıştırmalık verdi. Hırsız aldı. Çantayı da."],
  },
  'oxygen~tether': {
    rope: ["He was pulled home safely. Without air, sadly.", "Onu güvenle istasyona çektiler. Ama havasız."],
  },
  'cold~ice': {
    campfire: ["The ice melted, the water put out the fire, then it all froze again.", "Buz eridi, su ateşi söndürdü, sonra her şey yeniden dondu."],
  },
  'carsink~belt': {
    hammer: ["Window broken. Seatbelt still on. Safety first, apparently.", "Cam kırıldı. Emniyet kemeri hâlâ takılı. Önce güvenlik, demek."],
  },
  'flood~tied': {
    ring: ["The ring floated. He didn't. The rope saw to that.", "Simit yüzdü. O yüzemedi. Halat izin vermedi."],
  },
  'dragon~hungry': {
    steak: ["He walked up to a dragon with a steak. Now there are two steaks.", "Elinde biftekle ejderhaya yürüdü. Artık iki biftek var."],
  },
  'mice~hole': {
    tape: ["He sealed the hole. With all the mice inside. With him.", "Deliği kapattı. Bütün fareler içerideyken. Onunla birlikte."],
  },
  dino: {
    umbrella: ["An umbrella off a cliff. It turned inside out. So did his day.", "Uçurumdan şemsiyeyle atladı. Şemsiye ters döndü. Günü de."],
    fan: ["A fan can't fly. Neither can he.", "Vantilatör uçamaz. O da uçamaz."],
    candle: ["A candle. For the dino's birthday dinner.", "Mum. Dinozorun doğum günü yemeği için."],
    bottle: ["He threw a bottle at a T. rex. The T. rex had a drink. And a snack.", "T. rex'e şişe fırlattı. T. rex bir yudum aldı. Yanına da bir atıştırmalık."],
    lantern: ["The lantern lit up the dinner table. He was the dinner.", "Fener yemek masasını aydınlattı. Yemek oydu."],
  },
  cold: {
    candle: ["The wind blew the candle out. Then him.", "Rüzgâr mumu söndürdü. Sonra da onu."],
    bottle: ["The water in the bottle froze. He's next.", "Şişedeki su dondu. Sıra onda."],
    cooler: ["He built an air cooler. In a blizzard. Engineering.", "Kar fırtınasında soğutucu yaptı. Mühendislik."],
  },
  moon: {
    rope: ["He held on to the rope. The rope held on to nothing.", "İpe tutundu. İp hiçbir şeye tutunmadı."],
    magnet: ["The lander was too far for a magnet. Space is big.", "Uzay aracı mıknatıs için çok uzaktı. Uzay büyük."],
    rocket: ["A rocket on the moon. He went back up. Way up.", "Ay'da roket. Yukarı çıktı. Hem de çok yukarı."],
    jetboard: ["A rocket board in low gravity. Goodbye, moon.", "Düşük yer çekiminde roketli kaykay. Hoşça kal, Ay."],
  },
  avalanche: {
    skateboard: ["Skateboard wheels in deep snow. They did not roll.", "Derin karda kaykay tekerleği. Dönmedi bile."],
    rocket: ["A rocket in an avalanche. Now the avalanche is bigger.", "Çığın içinde roket. Çığ daha da büyüdü."],
    glider: ["He glided gently. Right into the snow.", "Süzüle süzüle uçtu. Doğruca karın içine."],
  },
  desert: {
    ice: ["The ice melted before he could lick it.", "Buz o yalayamadan eridi."],
    fan: ["A fan in the desert. Hot air, but faster.", "Çölde vantilatör. Sıcak hava, ama daha hızlı."],
    plank: ["He sat on a plank in the desert. Very relaxing. Very hot.", "Çölde tahtaya oturdu. Çok rahat. Çok sıcak."],
    rope: ["A rope. For tying up the sun, maybe.", "Bir ip. Güneşi bağlamak için galiba."],
    raft: ["A raft in the desert. He's waiting for the sea.", "Çölde sal. Denizin gelmesini bekliyor."],
  },
  flood: {
    plank: ["One plank, no rope. It floated away without him.", "Tek tahta, ip yok. Tahta onsuz yüzüp gitti."],
    rope: ["He tied himself to the furniture. It sank first.", "Kendini mobilyaya bağladı. Önce mobilya battı."],
    magnet: ["A magnet in a flood. It found the drain. So did he.", "Selde mıknatıs. Gideri buldu. O da buldu."],
    grabber: ["He grabbed the fridge with the magnet. The fridge went down. He followed.", "Mıknatısla buzdolabını yakaladı. Buzdolabı battı. O da peşinden."],
  },
  lava: {
    scissors: ["Scissors against lava. The scissors melted first.", "Lava karşısında makas. Önce makas eridi."],
    hammer: ["He hit the lava with a hammer. Splash. Hot splash.", "Lavaya çekiçle vurdu. Şap. Sıcak bir şap."],
    extinguisher: ["Foam on lava. Lava doesn't care about foam.", "Lavaya köpük sıktı. Lav köpükten anlamaz."],
  },
  blackhole: {
    plank: ["A plank against a black hole. Spaghetti, with a side of wood.", "Kara deliğe karşı tahta. Spagetti, yanında odun."],
    surfboard: ["He surfed the black hole. One wave. The last one.", "Kara delikte sörf yaptı. Tek dalga. Son dalga."],
  },
  lightning: {
    anchor: ["He held a metal anchor in a storm. The lightning loved it.", "Fırtınada metal çapa tuttu. Yıldırım bayıldı."],
  },
  'ghost~dark': {
    vacuum: ["He cut the power. The vacuum needs power. Oops.", "Elektriği kesti. Süpürge elektrikle çalışır. Hay aksi."],
  },
  witch: {
    scissors: ["He cut the witch's broom. She still had her magic.", "Cadının süpürgesini kesti. Büyüsü hâlâ yerindeydi."],
    extinguisher: ["Foam isn't water. The witch stayed solid.", "Köpük su değil. Cadı erimedi."],
  },
  bomb: {
    extinguisher: ["Foam everywhere except the fuse.", "Her yere köpük sıktı. Fitil hariç."],
  },
  fire: {
    scissors: ["He cut the fire into smaller fires.", "Yangını küçük yangınlara böldü."],
  },
  piranha: {
    rope: ["He threw a rope. The piranhas pulled the other end.", "İp attı. Piranalar öbür ucundan çekti."],
    anchor: ["An anchor. To make sure he sinks faster.", "Çapa. Daha hızlı batsın diye."],
  },
  quicksand: {
    surfboard: ["He tried to surf the quicksand. It's sand. No waves.", "Bataklıkta sörf yapmaya kalktı. Kum bu. Dalga yok."],
  },
};
for (const [h, m] of Object.entries(PZ)) J[h] = { ...(J[h] || {}), ...m };

const MORE = { es: esJ || {}, pt: ptJ || {}, de: deJ || {}, fr: frJ || {} };
// hazard can be a puzzle scene like 'bear~asleep'; without its own line it falls back to the danger's
export function joke(hazard, tool, lang) {
  const key = J[hazard] && J[hazard][tool] ? hazard : hazard.split('~')[0];
  const j = J[key] && J[key][tool];
  if (!j) return '';
  if (lang === 'tr') return j[1];
  return (MORE[lang] && MORE[lang][`${key}.${tool}`]) || j[0];
}
export const _J = J;
