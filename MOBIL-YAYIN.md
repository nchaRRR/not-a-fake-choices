# Mobil yayın (Google Play + App Store)

Uygulama kimliği: **`com.nimoriq.nfachoices`** (yayından sonra değişmez). Sürüm: **0.1.0**.
Telefonda görünen ad: **NFA Choices** (mağaza adı: *Not a Fake Ad: Choices*).
Derleme GitHub'ın bulut makinelerinde yapılır (Tower ve Not a Fake Ad ile aynı düzen, Capacitor 8).

## GitHub Secrets (Settings → Secrets and variables → Actions)

Not a Fake Ad ve Tower'dakilerle **aynı değerler** (aynı yükleme anahtarı, alias `not-a-fake-ad-upload`).

| Ad | Değer |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | yükleme anahtarı `.jks` dosyasının base64 hali |
| `ANDROID_KEYSTORE_PASSWORD` | anahtar deposu şifresi |
| `ANDROID_KEY_ALIAS` | `not-a-fake-ad-upload` |
| `ANDROID_KEY_PASSWORD` | anahtar şifresi |
| `APPLE_TEAM_ID` | 10 karakterlik Team ID |
| `APPSTORE_KEY_ID` | App Store Connect API anahtar kimliği |
| `APPSTORE_ISSUER_ID` | Issuer ID |
| `APPSTORE_KEY_P8` | `AuthKey_XXXX.p8` dosyasının tam metni |

## Supabase

1. SQL Editor → `supabase/001_not_a_fake_choices.sql` dosyasını bir kez çalıştır.
2. Authentication → URL Configuration → Redirect URLs → **`com.nimoriq.nfachoices://auth-callback`** ekle.

## AdMob

1. AdMob → Uygulamalar → **Uygulama ekle**: Android ve iOS için ayrı ayrı *Not a Fake Ad: Choices*.
2. Her birine **Ödüllü** reklam birimi aç.
3. Bana 4 kimliği gönder (2 uygulama kimliği `~` ile, 2 birim kimliği `/` ile). Şu an Google'ın test kimlikleri takılı.

## Google Play (kapalı test)

1. Play Console → **Uygulama oluştur**: ad *Not a Fake Ad: Choices*, varsayılan dil Türkçe, Oyun, Ücretsiz.
2. GitHub → Actions → **Android (Play)** → Run workflow → ~10 dk sonra `.aab` dosyası.
3. Dahili test → yeni sürüm → `.aab` → test kullanıcıları.
4. Gizlilik: nimoriq.com/nfa-choices-privacy/ · destek: nimoriq.com/nfa-choices-support/ · veri silme: nimoriq.com/nfa-choices-privacy/#silme
5. Mağaza görselleri: `assets/store/` (ikon 512, öne çıkan görsel TR/EN).

## App Store (TestFlight)

1. developer.apple.com → Identifiers → **+** → App ID: `com.nimoriq.nfachoices`.
2. App Store Connect → **Yeni uygulama**: *Not a Fake Ad: Choices*, Türkçe, paket kimliği `com.nimoriq.nfachoices`, SKU `not-a-fake-choices`.
3. GitHub → Actions → **iOS (TestFlight)** → Run workflow.

İmzalama Tower'daki gibi geçici sertifikayla yapılır (`scripts/asc.py`, ad öneki `NFAChoices CI`).

## Yayından önce

| Ne | Şu an | Yayından önce |
|---|---|---|
| Reklamlar | Google test reklamları (`ADS_TESTING = true`, test kimlikleri) | Gerçek kimlikler + `ADS_TESTING = false` |
| Giriş + bulut kaydı | Gerçek (Supabase), SQL çalıştırılınca | — |
| Bildirimler | Gerçek (telefon kendisi planlar) | — |
| Sürüm | 0.1.0 | 1.0.0 |

## Paylaş, puanla, sıralama, hediyeler, ara reklam, uzaktan ayar (Ekim 2026)

- **Supabase:** `game_events` (istatistik) ve `003/004_leaderboard_config.sql` (sıralama + `game_config`) dosyaları bir kez çalıştırılır. Üç oyun aynı tabloları kullanır.
- **Uzaktan ayar:** Supabase → Table editor → `game_config` → oyunun satırındaki `data` (altın çarpanı, süre/zorluk, ara reklam sıklığı, duyuru). Oyun açılışta okur; güncelleme gerekmez.
- **Ara reklam:** Şu an Google'ın test birimleri. AdMob'da bu uygulamaya **Geçiş reklamı (Interstitial)** birimi açılıp kimliği `src/ads.js` → `INTERSTITIAL` içine yazılır.
- **Yeni eklentiler:** `@capacitor/share`, `@capacitor/filesystem`, `@capacitor-community/in-app-review` (CI'daki `npm install` + `cap sync` kurar). iOS'ta "Resmi kaydet" için `NSPhotoLibraryAddUsageDescription` eklendi.
