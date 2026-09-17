# AR Pengabdian — SMA Negeri 9 Bandar Lampung

Landing page statis untuk karya AR AssemblrEdu hasil pengabdian. Tanpa backend dan tanpa build step: edit file, push, selesai.

Library dimuat dari CDN jsDelivr (dengan SRI): GSAP + ScrollTrigger, Lenis, SplitType, qrcode-generator. Font dari Google Fonts.

## Ubah info situs

Buka `js/data/projects.js`, lalu ubah objek `SITE`:

- `school`: nama sekolah (tampil di hero, marquee, footer)
- `program`: nama program studi
- `driveUrl`: link Google Drive dokumentasi

## Tambah / ganti proyek AR

1. Di AssemblrEdu: buka proyek, pilih Share, lalu Embed. Salin isi atribut `src` iframe-nya.
2. Simpan gambar cover ke `assets/img/` (JPG sekitar 900px agar ringan).
3. Tambah objek di array `PROJECTS`:

```js
{
  id: "slug-unik",
  title: "Nama Proyek AR",
  subject: "Mapel",
  embedUrl: "https://viewer-edu.assemblrworld.com/Embed/xxxxx",
  thumbnail: "assets/img/nama-file.jpg",
  description: "Deskripsi singkat.",
  interactions: [
    { title: "Aksi 1", text: "Apa yang terjadi." },
    { title: "Aksi 2", text: "Apa yang terjadi." }
  ]
}
```

Proyek pertama tampil sebagai Karya Unggulan. Jika ada lebih dari satu proyek, bagian "Karya Lainnya" muncul otomatis.

Catatan: teks bagian "Cara Pakai" dan "Di Balik Layar" di `index.html` masih khusus untuk proyek ayam.

## Menjalankan lokal

```
npx serve .
```

Lalu buka alamat yang ditampilkan. Untuk mencoba kamera AR dari HP, buka lewat IP laptop di jaringan yang sama, atau langsung dari situs yang sudah di-deploy (kamera butuh HTTPS).

## Deploy ke GitHub Pages

```
git init
git add .
git commit -m "Initial site"
gh repo create nama-repo --public --source=. --push
```

Lalu di GitHub buka Settings, pilih Pages, set Source ke branch `main` dengan folder `/ (root)`. Situs akan tayang di `https://<username>.github.io/<nama-repo>/`.
