// Info umum situs. Ganti di sini, tidak perlu sentuh HTML.
const SITE = {
  school: "SMA Negeri 9 Bandar Lampung",
  program: "Pendidikan Teknologi Informasi",
  executor: "Teknik Informatika, Universitas Lampung",
  driveUrl: "https://drive.google.com/drive/folders/1k8MBvo3wMi6KZpJC0miQroc3Y34HRQzL?usp=sharing"
};

// Proyek pertama tampil sebagai Karya Unggulan. Proyek kedua dst. otomatis muncul di "Karya Lainnya".
// embedUrl: AssemblrEdu -> Share -> Embed -> ambil isi atribut src iframe-nya saja.
const PROJECTS = [
  {
    id: "ayam-berkokok",
    title: "AR Ayam Berkokok",
    subject: "Biologi",
    embedUrl: "https://viewer-edu.assemblrworld.com/Embed/-gfdP6zkHtZyfvdhiigu",
    thumbnail: "assets/img/cover-ayam.jpg",
    description: "AR 3D interaktif bertema ayam. Ayam bisa berkokok lengkap dengan animasi dan suara saat disentuh, lalu menjelaskan dirinya sendiri lewat narasi suara saat tombol Play ditekan.",
    interactions: [
      { title: "Sentuh ayamnya", text: "Ayam memutar animasi, berkokok, dan memunculkan bubble \"Kukuruyukkk...\"." },
      { title: "Tekan tombol Play", text: "Bubble deskripsi ayam muncul dan dibacakan dengan suara Bahasa Indonesia." }
    ]
  }
];
