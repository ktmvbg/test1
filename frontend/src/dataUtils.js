export const MONTH_ORDER = ['Tháng 5', 'Tháng 6', 'Tháng 7']

export const DINH_NGHIA_CHI_SO = {
  revenue: { nhan: 'Doanh thu', loai: 'currency' },
  transactions: { nhan: 'Số giao dịch', loai: 'number' },
  students: { nhan: 'Số học viên', loai: 'number' },
  avgTicket: { nhan: 'Giá trị trung bình giao dịch', loai: 'currency' },
  revenuePerAdvisor: { nhan: 'Doanh thu trung bình nhân sự', loai: 'currency' },
}

const boDinhDangTien = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const boDinhDangSo = new Intl.NumberFormat('vi-VN')

export function dinhDangTien(giaTri = 0) {
  return boDinhDangTien.format(giaTri || 0)
}

export function dinhDangTienRutGon(giaTri = 0) {
  const triTuyetDoi = Math.abs(giaTri || 0)
  const dau = (giaTri || 0) < 0 ? '-' : ''

  if (triTuyetDoi >= 1_000_000_000) {
    return `${dau}${(triTuyetDoi / 1_000_000_000).toFixed(2)} tỷ`
  }

  if (triTuyetDoi >= 1_000_000) {
    return `${dau}${(triTuyetDoi / 1_000_000).toFixed(1)} triệu`
  }

  if (triTuyetDoi >= 1_000) {
    return `${dau}${(triTuyetDoi / 1_000).toFixed(1)} nghìn`
  }

  return `${dau}${boDinhDangSo.format(triTuyetDoi)}`
}

export function dinhDangSo(giaTri = 0) {
  return boDinhDangSo.format(giaTri || 0)
}

export function dinhDangPhanTram(giaTri = 0, soLe = 1) {
  return `${(giaTri || 0).toFixed(soLe)}%`
}

export function dinhDangNgay(ngay) {
  if (!ngay) return '-'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(ngay))
}

export function sapXepChiNhanh(danhSach = []) {
  return [...danhSach].sort((a, b) => {
    const soA = Number(String(a).replace(/\D/g, '')) || 1_000_000
    const soB = Number(String(b).replace(/\D/g, '')) || 1_000_000
    if (soA !== soB) return soA - soB
    return String(a).localeCompare(String(b))
  })
}

export function taoBoLocMacDinh(payload) {
  return {
    thangNhanh: 'all',
    tuNgay: payload?.dataWindow?.start ?? '',
    denNgay: payload?.dataWindow?.end ?? '',
    chiNhanh: payload?.dimensions?.branches ?? [],
    loaiPhieu: payload?.dimensions?.recordTypes ?? [],
    loaiDangKy: payload?.dimensions?.registrationTypes ?? [],
    hinhThucThanhToan: payload?.dimensions?.paymentMethods ?? [],
    gioiTinh: payload?.dimensions?.genders ?? [],
  }
}

export function taoTuyChonSelect(danhSach = []) {
  return danhSach.map((giaTri) => ({ value: giaTri, label: giaTri }))
}

export function locBanGhi(records = [], boLoc) {
  return records.filter((dong) => {
    if (boLoc.tuNgay && dong.payment_date < boLoc.tuNgay) return false
    if (boLoc.denNgay && dong.payment_date > boLoc.denNgay) return false
    if (!boLoc.chiNhanh.includes(dong.branch)) return false
    if (!boLoc.loaiPhieu.includes(dong.record_type)) return false
    if (!boLoc.loaiDangKy.includes(dong.registration_type)) return false
    if (!boLoc.hinhThucThanhToan.includes(dong.payment_method)) return false
    if (!boLoc.gioiTinh.includes(dong.gender)) return false
    return true
  })
}

function taoScope(ten) {
  return {
    ten,
    revenue: 0,
    gross: 0,
    net: 0,
    discountValue: 0,
    discountTong: 0,
    soDong: 0,
    newRevenue: 0,
    transactionsSet: new Set(),
    studentsSet: new Set(),
    advisorsSet: new Set(),
  }
}

function themDong(scope, dong) {
  scope.revenue += Number(dong.revenue || 0)
  scope.gross += Number(dong.gross_before_discount || 0)
  scope.net += Number(dong.net_after_discount || 0)
  scope.discountValue += Number(dong.discount_value || 0)
  scope.discountTong += Number(dong.discount_pct || 0)
  scope.soDong += 1
  scope.transactionsSet.add(dong.receipt_key)
  scope.studentsSet.add(dong.student_id)
  scope.advisorsSet.add(dong.employee_id || dong.employee_name)
  if (dong.registration_type === 'Ghi danh mới') {
    scope.newRevenue += Number(dong.revenue || 0)
  }
}

function chotScope(scope) {
  const soGiaoDich = scope.transactionsSet.size
  const soHocVien = scope.studentsSet.size
  const soTuVan = scope.advisorsSet.size

  return {
    ten: scope.ten,
    revenue: scope.revenue,
    gross: scope.gross,
    net: scope.net,
    discountValue: scope.discountValue,
    transactions: soGiaoDich,
    students: soHocVien,
    advisors: soTuVan,
    avgTicket: soGiaoDich ? scope.revenue / soGiaoDich : 0,
    revenuePerAdvisor: soTuVan ? scope.revenue / soTuVan : 0,
    avgDiscount: scope.soDong ? scope.discountTong / scope.soDong : 0,
    newRegistrationShare: scope.revenue ? scope.newRevenue / scope.revenue : 0,
  }
}

function nhomTheo(records, layKhoa) {
  const bang = new Map()

  records.forEach((dong) => {
    const khoa = layKhoa(dong)
    if (!bang.has(khoa)) {
      bang.set(khoa, taoScope(khoa))
    }
    themDong(bang.get(khoa), dong)
  })

  return Array.from(bang.values()).map(chotScope)
}

function layGiaTriChiSo(dong, chiSo) {
  return dong?.[chiSo] ?? 0
}

export function tongQuanDieuHanh(records = []) {
  const tong = nhomTheo(records, () => 'Tổng')
  const tongHop = tong[0] ?? {
    revenue: 0,
    transactions: 0,
    students: 0,
    advisors: 0,
    avgTicket: 0,
    revenuePerAdvisor: 0,
  }

  const theoThangMap = new Map(MONTH_ORDER.map((thang) => [thang, taoScope(thang)]))
  const coChiNhanhTheoThang = new Map(MONTH_ORDER.map((thang) => [thang, new Set()]))
  const coTuVanTheoThang = new Map(MONTH_ORDER.map((thang) => [thang, new Set()]))

  records.forEach((dong) => {
    const thang = MONTH_ORDER.includes(dong.month_label) ? dong.month_label : dong.month_label
    if (!theoThangMap.has(thang)) {
      theoThangMap.set(thang, taoScope(thang))
      coChiNhanhTheoThang.set(thang, new Set())
      coTuVanTheoThang.set(thang, new Set())
    }
    themDong(theoThangMap.get(thang), dong)
    coChiNhanhTheoThang.get(thang).add(dong.branch)
    coTuVanTheoThang.get(thang).add(dong.employee_id || dong.employee_name)
  })

  const theoThang = Array.from(theoThangMap.values())
    .map(chotScope)
    .sort((a, b) => MONTH_ORDER.indexOf(a.ten) - MONTH_ORDER.indexOf(b.ten))
    .map((dong) => ({
      ...dong,
      thang: dong.ten,
      soChiNhanh: coChiNhanhTheoThang.get(dong.ten)?.size ?? 0,
      soNhanSu: coTuVanTheoThang.get(dong.ten)?.size ?? 0,
      doanhThuMoiChiNhanh: (coChiNhanhTheoThang.get(dong.ten)?.size ?? 0) ? dong.revenue / coChiNhanhTheoThang.get(dong.ten).size : 0,
      doanhThuMoiNhanSu: (coTuVanTheoThang.get(dong.ten)?.size ?? 0) ? dong.revenue / coTuVanTheoThang.get(dong.ten).size : 0,
    }))

  return {
    tongQuan: {
      doanhThu: tongHop.revenue,
      soChiNhanh: new Set(records.map((dong) => dong.branch)).size,
      soNhanSu: new Set(records.map((dong) => dong.employee_id || dong.employee_name)).size,
      doanhThuMoiChiNhanh: tongHop.revenue / (new Set(records.map((dong) => dong.branch)).size || 1),
      doanhThuMoiNhanSu: tongHop.revenue / (new Set(records.map((dong) => dong.employee_id || dong.employee_name)).size || 1),
      soHocVien: new Set(records.map((dong) => dong.student_id)).size,
      soGiaoDich: new Set(records.map((dong) => dong.receipt_key)).size,
      giamTru: tongHop.discountValue,
    },
    theoThang,
  }
}

export function duLieuXepHangChiNhanh(records = [], chiSo = 'revenue', topN = 12) {
  return nhomTheo(records, (dong) => dong.branch)
    .sort((a, b) => layGiaTriChiSo(b, chiSo) - layGiaTriChiSo(a, chiSo))
    .slice(0, topN)
}

export function duLieuMaTranChiNhanh(records = [], chiSo = 'revenue', topN = 12) {
  const topBranches = duLieuXepHangChiNhanh(records, chiSo, topN).map((dong) => dong.ten)
  const rows = topBranches.map((chiNhanh) => ({ ten: chiNhanh, giaTri: {} }))

  rows.forEach((dong) => {
    MONTH_ORDER.forEach((thang) => {
      dong.giaTri[thang] = 0
    })
  })

  records.forEach((dong) => {
    if (!topBranches.includes(dong.branch)) return
    const row = rows.find((item) => item.ten === dong.branch)
    if (!row) return
    row.giaTri[dong.month_label] = (row.giaTri[dong.month_label] || 0) + Number(dong.revenue || 0)
  })

  if (chiSo !== 'revenue') {
    const chiTiet = new Map()
    topBranches.forEach((chiNhanh) => {
      chiTiet.set(chiNhanh, {})
      MONTH_ORDER.forEach((thang) => {
        chiTiet.get(chiNhanh)[thang] = taoScope(`${chiNhanh}-${thang}`)
      })
    })

    records.forEach((dong) => {
      if (!topBranches.includes(dong.branch)) return
      const scope = chiTiet.get(dong.branch)?.[dong.month_label]
      if (scope) {
        themDong(scope, dong)
      }
    })

    rows.forEach((dong) => {
      MONTH_ORDER.forEach((thang) => {
        const scope = chiTiet.get(dong.ten)?.[thang]
        dong.giaTri[thang] = layGiaTriChiSo(chotScope(scope), chiSo)
      })
    })
  }

  const giaTriLonNhat = Math.max(
    0,
    ...rows.flatMap((dong) => MONTH_ORDER.map((thang) => dong.giaTri[thang] || 0)),
  )

  return { months: MONTH_ORDER, rows, giaTriLonNhat }
}

export function duLieuTanXaChiNhanh(records = [], topN = 12) {
  return duLieuXepHangChiNhanh(records, 'revenue', topN).map((dong) => ({
    ten: dong.ten,
    x: dong.transactions,
    y: dong.revenue,
    z: dong.students,
    doanhThu: dong.revenue,
    soGiaoDich: dong.transactions,
    soHocVien: dong.students,
    tyLeGhiDanhMoi: dong.newRegistrationShare,
  }))
}

export function duLieuXepHangNhanSu(records = [], chiSo = 'revenue', topN = 12, chiNhanhTapTrung = 'Tất cả') {
  const daLoc = chiNhanhTapTrung === 'Tất cả'
    ? records
    : records.filter((dong) => dong.branch === chiNhanhTapTrung)

  return nhomTheo(daLoc, (dong) => `${dong.employee_name} | ${dong.branch}`)
    .map((dong) => {
      const [ten, chiNhanh] = dong.ten.split(' | ')
      return { ...dong, tenNhanSu: ten, chiNhanh }
    })
    .sort((a, b) => layGiaTriChiSo(b, chiSo) - layGiaTriChiSo(a, chiSo))
    .slice(0, topN)
}

export function duLieuMaTranNhanSu(records = [], chiSo = 'revenue', topN = 12, chiNhanhTapTrung = 'Tất cả') {
  const daLoc = chiNhanhTapTrung === 'Tất cả'
    ? records
    : records.filter((dong) => dong.branch === chiNhanhTapTrung)

  const topPeople = duLieuXepHangNhanSu(daLoc, chiSo, topN, 'Tất cả').map((dong) => dong.ten)
  const chiTiet = new Map()

  topPeople.forEach((ten) => {
    chiTiet.set(ten, {})
    MONTH_ORDER.forEach((thang) => {
      chiTiet.get(ten)[thang] = taoScope(`${ten}-${thang}`)
    })
  })

  daLoc.forEach((dong) => {
    const ten = `${dong.employee_name} | ${dong.branch}`
    if (!chiTiet.has(ten)) return
    themDong(chiTiet.get(ten)[dong.month_label], dong)
  })

  const rows = topPeople.map((ten) => ({
    ten,
    giaTri: Object.fromEntries(
      MONTH_ORDER.map((thang) => [thang, layGiaTriChiSo(chotScope(chiTiet.get(ten)[thang]), chiSo)]),
    ),
  }))

  const giaTriLonNhat = Math.max(
    0,
    ...rows.flatMap((dong) => MONTH_ORDER.map((thang) => dong.giaTri[thang] || 0)),
  )

  return { months: MONTH_ORDER, rows, giaTriLonNhat }
}

export function duLieuTanXaNhanSu(records = [], topN = 12, chiNhanhTapTrung = 'Tất cả') {
  return duLieuXepHangNhanSu(records, 'revenue', topN, chiNhanhTapTrung).map((dong) => ({
    ten: dong.tenNhanSu,
    nhanDayDu: dong.ten,
    chiNhanh: dong.chiNhanh,
    x: dong.transactions,
    y: dong.revenue,
    z: dong.students,
    doanhThu: dong.revenue,
    soGiaoDich: dong.transactions,
    soHocVien: dong.students,
    giaTriMoiGiaoDich: dong.avgTicket,
    tyLeGhiDanhMoi: dong.newRegistrationShare,
  }))
}

export function duLieuCoCauTheoChieu(records = [], chieu = 'registration_type', doDo = 'revenue') {
  const bang = new Map()

  records.forEach((dong) => {
    const ten = dong[chieu] || 'Khác'
    if (!bang.has(ten)) {
      bang.set(ten, { ten, giaTri: 0 })
    }
    bang.get(ten).giaTri += doDo === 'revenue' ? Number(dong.revenue || 0) : 1
  })

  return Array.from(bang.values()).sort((a, b) => b.giaTri - a.giaTri)
}

export function duLieuXuHuongTheoChieu(records = [], chieu = 'registration_type', doDo = 'revenue') {
  const categories = duLieuCoCauTheoChieu(records, chieu, doDo).map((dong) => dong.ten)
  const bang = new Map(MONTH_ORDER.map((thang) => [thang, { thang }]))

  MONTH_ORDER.forEach((thang) => {
    categories.forEach((category) => {
      bang.get(thang)[category] = 0
    })
  })

  records.forEach((dong) => {
    const thang = dong.month_label
    const category = dong[chieu] || 'Khác'
    if (!bang.has(thang)) {
      bang.set(thang, { thang, [category]: 0 })
    }
    bang.get(thang)[category] = (bang.get(thang)[category] || 0) + (doDo === 'revenue' ? Number(dong.revenue || 0) : 1)
  })

  return {
    categories,
    data: MONTH_ORDER.filter((thang) => bang.has(thang)).map((thang) => bang.get(thang)),
  }
}

export function cauNoiDoanhThu(records = []) {
  return records.reduce(
    (tong, dong) => {
      tong.gross += Number(dong.gross_before_discount || 0)
      tong.discountValue += Number(dong.discount_value || 0)
      tong.net += Number(dong.net_after_discount || 0)
      return tong
    },
    { gross: 0, discountValue: 0, net: 0 },
  )
}

export function duLieuTheoBangUuDai(records = []) {
  const thuTu = ['0%', '1-10%', '11-25%', '26-50%', 'Trên 50%', 'Không rõ']
  const bang = new Map(thuTu.map((nhom) => [nhom, { nhom, soGiaoDich: 0, doanhThu: 0, soGhiDanhMoi: 0 }]))

  records.forEach((dong) => {
    const nhom = bang.has(dong.discount_band) ? dong.discount_band : 'Không rõ'
    bang.get(nhom).soGiaoDich += 1
    bang.get(nhom).doanhThu += Number(dong.revenue || 0)
    if (dong.registration_type === 'Ghi danh mới') {
      bang.get(nhom).soGhiDanhMoi += 1
    }
  })

  return thuTu.map((nhom) => {
    const dong = bang.get(nhom)
    return {
      ...dong,
      tyLeGhiDanhMoi: dong.soGiaoDich ? (dong.soGhiDanhMoi / dong.soGiaoDich) * 100 : 0,
    }
  })
}

export function duLieuTheoThoiLuong(records = []) {
  const thuTu = ['0-3 tháng', '4-6 tháng', '7-12 tháng', '13-18 tháng', '19-24 tháng', 'Trên 24 tháng', 'Không rõ']
  const bang = new Map(thuTu.map((nhom) => [nhom, { nhom, doanhThu: 0, hocVien: new Set() }]))

  records.forEach((dong) => {
    const nhom = bang.has(dong.planned_months_band) ? dong.planned_months_band : 'Không rõ'
    bang.get(nhom).doanhThu += Number(dong.revenue || 0)
    bang.get(nhom).hocVien.add(dong.student_id)
  })

  return thuTu.map((nhom) => ({
    nhom,
    doanhThu: bang.get(nhom).doanhThu,
    soHocVien: bang.get(nhom).hocVien.size,
  }))
}

export function duLieuGioiTinh(records = [], doDo = 'revenue') {
  const bang = new Map()

  records.forEach((dong) => {
    const nhom = dong.gender || 'Không rõ'
    if (!bang.has(nhom)) {
      bang.set(nhom, { nhom, giaTri: 0, hocVien: new Set() })
    }
    bang.get(nhom).giaTri += doDo === 'revenue' ? Number(dong.revenue || 0) : 0
    bang.get(nhom).hocVien.add(dong.student_id)
  })

  return Array.from(bang.values()).map((dong) => ({
    nhom: dong.nhom,
    giaTri: doDo === 'revenue' ? dong.giaTri : dong.hocVien.size,
  }))
}

export function duLieuTanXaKhachHang(records = [], gioiHan = 220) {
  if (records.length <= gioiHan) return records
  const buoc = Math.ceil(records.length / gioiHan)
  return records.filter((_, index) => index % buoc === 0).slice(0, gioiHan)
}

export function tongKetBoLoc(records = []) {
  return {
    soDong: records.length,
    soChiNhanh: new Set(records.map((dong) => dong.branch)).size,
    soNhanSu: new Set(records.map((dong) => dong.employee_id || dong.employee_name)).size,
    soHocVien: new Set(records.map((dong) => dong.student_id)).size,
    doanhThu: records.reduce((tong, dong) => tong + Number(dong.revenue || 0), 0),
  }
}
