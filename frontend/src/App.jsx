import { useEffect, useState } from "react";
import { getSiswa, createSiswa, updateSiswa, deleteSiswa } from "./api";
import "./App.css";

const EMPTY = {
  kode_siswa: "",
  nama_siswa: "",
  alamat_siswa: "",
  tgl_siswa: "",
  jurusan_siswa: "",
};

export default function App() {
  const [siswa, setSiswa] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null); // { type: "ok" | "error", text }

  const load = async () => {
    try {
      setSiswa(await getSiswa());
    } catch (err) {
      setNotice({ type: "error", text: `Gagal memuat data: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(EMPTY);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editId ? await updateSiswa(editId, form) : await createSiswa(form);
      setNotice({ type: "ok", text: res.message });
      resetForm();
      load();
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    }
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setForm({
      kode_siswa: s.kode_siswa,
      nama_siswa: s.nama_siswa,
      alamat_siswa: s.alamat_siswa,
      tgl_siswa: s.tgl_siswa.slice(0, 10),
      jurusan_siswa: s.jurusan_siswa,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Hapus data ${s.nama_siswa}?`)) return;
    try {
      const res = await deleteSiswa(s.id);
      setNotice({ type: "ok", text: res.message });
      if (editId === s.id) resetForm();
      load();
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    }
  };

  return (
    <main className="page">
      <header className="head">
        <h1>Data Siswa</h1>
        <p>{siswa.length} siswa terdaftar</p>
      </header>

      {notice && (
        <div className={`notice ${notice.type}`} role="status" onClick={() => setNotice(null)}>
          {notice.text}
        </div>
      )}

      <section className="panel">
        <h2>{editId ? "Edit data siswa" : "Tambah siswa"}</h2>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Kode siswa
            <input name="kode_siswa" value={form.kode_siswa} onChange={handleChange} required />
          </label>
          <label>
            Nama siswa
            <input name="nama_siswa" value={form.nama_siswa} onChange={handleChange} required />
          </label>
          <label>
            Tanggal
            <input type="date" name="tgl_siswa" value={form.tgl_siswa} onChange={handleChange} required />
          </label>
          <label>
            Jurusan
            <input name="jurusan_siswa" value={form.jurusan_siswa} onChange={handleChange} required />
          </label>
          <label className="wide">
            Alamat
            <textarea name="alamat_siswa" rows="2" value={form.alamat_siswa} onChange={handleChange} required />
          </label>
          <div className="actions wide">
            <button type="submit" className="primary">
              {editId ? "Simpan perubahan" : "Tambah siswa"}
            </button>
            {editId && (
              <button type="button" onClick={resetForm}>
                Batal
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Daftar siswa</h2>
        {loading ? (
          <p className="empty">Memuat data…</p>
        ) : siswa.length === 0 ? (
          <p className="empty">Belum ada data. Isi formulir di atas untuk menambah siswa pertama.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama</th>
                  <th>Alamat</th>
                  <th>Tanggal</th>
                  <th>Jurusan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {siswa.map((s) => (
                  <tr key={s.id} className={s.id === editId ? "editing" : ""}>
                    <td>{s.kode_siswa}</td>
                    <td>{s.nama_siswa}</td>
                    <td>{s.alamat_siswa}</td>
                    <td>{s.tgl_siswa.slice(0, 10)}</td>
                    <td>{s.jurusan_siswa}</td>
                    <td className="row-actions">
                      <button onClick={() => handleEdit(s)}>Edit</button>
                      <button className="danger" onClick={() => handleDelete(s)}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}