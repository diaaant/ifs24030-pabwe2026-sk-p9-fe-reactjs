// SweetAlert2 dimuat saat dibutuhkan agar tidak ikut bundle awal beranda.
const loadSwal = () => import('sweetalert2').then((module) => module.default)

export const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const showSuccessAlert = async (message) => {
  const Swal = await loadSwal()
  return Swal.fire({ icon: 'success', title: 'Berhasil', text: message, timer: 1800, showConfirmButton: false })
}

export const showErrorAlert = async (message) => {
  const Swal = await loadSwal()
  return Swal.fire({ icon: 'error', title: 'Gagal', text: message })
}

export const showConfirmDialog = async (text) => {
  const Swal = await loadSwal()
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Apakah Anda yakin?',
    text,
    showCancelButton: true,
    confirmButtonText: 'Ya, lanjutkan',
    cancelButtonText: 'Batal',
  })
  return result.isConfirmed
}