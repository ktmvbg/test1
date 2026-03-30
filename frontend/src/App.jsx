import { useEffect, useState } from 'react'
import Select, { components } from 'react-select'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import './App.css'
import {
  DINH_NGHIA_CHI_SO,
  dinhDangNgay,
  dinhDangPhanTram,
  dinhDangSo,
  dinhDangTien,
  dinhDangTienRutGon,
  duLieuCoCauTheoChieu,
  duLieuMaTranChiNhanh,
  duLieuMaTranNhanSu,
  duLieuTanXaChiNhanh,
  duLieuTanXaNhanSu,
  duLieuXuHuongTheoChieu,
  duLieuXepHangChiNhanh,
  duLieuXepHangNhanSu,
  locBanGhi,
  sapXepChiNhanh,
  taoBoLocMacDinh,
  taoTuyChonSelect,
  tongKetBoLoc,
  tongQuanDieuHanh,
} from './dataUtils'

const TABS = [
  { id: 'tong-quan', label: 'Tổng quan điều hành' },
  { id: 'chi-nhanh', label: 'Hiệu quả chi nhánh' },
  { id: 'nhan-su', label: 'Xếp hạng nhân sự' },
]

const LUA_CHON_CHI_SO = [
  { value: 'revenue', label: 'Doanh thu' },
  { value: 'transactions', label: 'Số giao dịch' },
  { value: 'students', label: 'Số học viên' },
  { value: 'avgTicket', label: 'Giá trị trung bình giao dịch' },
  { value: 'revenuePerAdvisor', label: 'Doanh thu trung bình nhân sự' },
]

const MAU_HE = [
  '#00b8ee',
  '#1f69d8',
  '#4fd9f5',
  '#f6b332',
  '#7ed7ff',
  '#0d87df',
  '#52d7c9',
]

const MAU_THEO_CHI_SO = {
  revenue: '#00b8ee',
  transactions: '#f6b332',
  students: '#52d7c9',
  avgTicket: '#1f69d8',
  revenuePerAdvisor: '#7ed7ff',
}

const GIA_TRI_TAT_CA = '__all__'

const reactSelectStyles = {
  control: (base, state) => ({
    ...base,
    background: 'rgba(255,255,255,0.06)',
    borderColor: state.isFocused ? 'rgba(64, 223, 255, 0.6)' : 'rgba(255,255,255,0.08)',
    boxShadow: 'none',
    borderRadius: 18,
    minHeight: 50,
  }),
  menu: (base) => ({
    ...base,
    background: '#0e1930',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    overflow: 'hidden',
  }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? 'rgba(64, 223, 255, 0.12)' : '#0e1930',
    color: '#eef5ff',
    cursor: 'pointer',
  }),
  multiValue: (base) => ({
    ...base,
    background: 'rgba(64, 223, 255, 0.14)',
    borderRadius: 999,
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#eef5ff',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#eef5ff',
    ':hover': {
      background: 'rgba(255,255,255,0.10)',
      color: '#ffffff',
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: '#eef5ff',
  }),
  input: (base) => ({
    ...base,
    color: '#eef5ff',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#93a9ca',
  }),
  indicatorSeparator: (base) => ({
    ...base,
    background: 'rgba(255,255,255,0.08)',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#93a9ca',
  }),
}

const reactSelectMultiStyles = {
  ...reactSelectStyles,
  control: (base, state) => ({
    ...reactSelectStyles.control(base, state),
    minHeight: 44,
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '2px 8px',
    gap: 8,
    flexWrap: 'nowrap',
    alignItems: 'center',
    overflow: 'hidden',
  }),
  multiValue: (base) => ({
    ...reactSelectStyles.multiValue(base),
    margin: 0,
  }),
  inputContainer: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    width: 0,
    minWidth: 0,
  }),
}

function taoTuyChonCoTatCa(danhSach = [], nhanTatCa = 'Tất cả') {
  return [{ value: GIA_TRI_TAT_CA, label: nhanTatCa }, ...taoTuyChonSelect(danhSach)]
}

function layDanhSachLuaChonThuc(options = []) {
  return options.filter((item) => item.value !== GIA_TRI_TAT_CA)
}

function kiemTraDangChonTatCa(selectProps) {
  const luaChonThuc = layDanhSachLuaChonThuc(selectProps.options)
  const danhSachDangChon = selectProps.value ?? []

  return luaChonThuc.length > 0 && danhSachDangChon.length === luaChonThuc.length
}

function layTomTatBoLoc(selectProps) {
  const danhSachDangChon = selectProps.value ?? []
  const luaChonThuc = layDanhSachLuaChonThuc(selectProps.options)
  const dangChonTatCa = kiemTraDangChonTatCa(selectProps)

  if (!danhSachDangChon.length || dangChonTatCa) {
    return {
      nhan: selectProps.tatCaLabel ?? 'Tất cả',
      soLuong: luaChonThuc.length,
    }
  }

  if (danhSachDangChon.length === 1) {
    return {
      nhan: danhSachDangChon[0].label,
      soLuong: null,
    }
  }

  return {
    nhan: selectProps.nhanDaChon ?? 'Đã chọn',
    soLuong: danhSachDangChon.length,
  }
}

function GiaTriBoLocContainer(props) {
  const { nhan, soLuong } = layTomTatBoLoc(props.selectProps)
  return (
    <components.ValueContainer {...props}>
      <div className="chip-tom-tat-select">
        <span>{nhan}</span>
        {soLuong ? <strong>{dinhDangSo(soLuong)}</strong> : null}
      </div>
    </components.ValueContainer>
  )
}

function LuaChonCheckbox(props) {
  const { data, isSelected, label, selectProps } = props
  const checked = data.value === GIA_TRI_TAT_CA ? kiemTraDangChonTatCa(selectProps) : isSelected

  return (
    <components.Option {...props}>
      <div className="lua-chon-checkbox">
        <input type="checkbox" checked={checked} readOnly tabIndex={-1} />
        <span>{label}</span>
      </div>
    </components.Option>
  )
}

function layGiaTriDangChon(options = [], danhSachGiaTri = []) {
  return options.filter((item) => item.value !== GIA_TRI_TAT_CA && danhSachGiaTri.includes(item.value))
}

function xuLyThayDoiMultiSelect(values, actionMeta, options = []) {
  const danhSachTatCa = layDanhSachLuaChonThuc(options).map((item) => item.value)
  const giaTriTacDong = actionMeta?.option?.value ?? actionMeta?.removedValue?.value

  if (giaTriTacDong === GIA_TRI_TAT_CA) {
    return danhSachTatCa
  }

  const danhSachDangChon = (values ?? [])
    .map((item) => item.value)
    .filter((value) => value !== GIA_TRI_TAT_CA)

  return danhSachDangChon.length ? danhSachDangChon : danhSachTatCa
}

function tachDongNhan(value = '', gioiHan = 14) {
  const danhSachTu = String(value).trim().split(/\s+/).filter(Boolean)
  if (!danhSachTu.length) return ['-']

  return danhSachTu.reduce((cacDong, tu) => {
    const dongCuoi = cacDong[cacDong.length - 1]
    if (!dongCuoi) {
      return [tu]
    }

    if (`${dongCuoi} ${tu}`.length <= gioiHan) {
      cacDong[cacDong.length - 1] = `${dongCuoi} ${tu}`
      return cacDong
    }

    cacDong.push(tu)
    return cacDong
  }, [])
}

function tinhChieuCaoXepHang(danhSach = [], truongNhan = 'ten', gioiHan = 14) {
  const tongSoDong = danhSach.reduce(
    (tong, dong) => tong + Math.max(1, tachDongNhan(dong?.[truongNhan], gioiHan).length),
    0,
  )

  return Math.max(360, tongSoDong * 34 + 56)
}

function NhanTrucDungNhieuDong({ x, y, payload, gioiHan = 14 }) {
  const cacDong = tachDongNhan(payload?.value, gioiHan)

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        className="nhan-truc-dung"
        x={0}
        y={0}
        dy={4 - ((cacDong.length - 1) * 8)}
        textAnchor="end"
        fill="#eef5ff"
      >
        {cacDong.map((dong, index) => (
          <tspan key={`${payload?.value}-${index}`} x={0} dy={index === 0 ? 0 : 16}>
            {dong}
          </tspan>
        ))}
      </text>
    </g>
  )
}

function MauTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null

  return (
    <div className="tooltip-card">
      {label ? <div className="tooltip-title">{label}</div> : null}
      <div className="tooltip-list">
        {payload.map((dong) => (
          <div className="tooltip-row" key={dong.dataKey ?? dong.name}>
            <span className="tooltip-dot" style={{ background: dong.color || '#00b8ee' }} />
            <span>{dong.name}</span>
            <strong>{formatter ? formatter(dong.value, dong) : dinhDangSo(dong.value)}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function TheChiSo({ nhan, giaTri, moTa, mau }) {
  return (
    <div className="the-chi-so" style={{ '--mau': mau }}>
      <span className="the-chi-so__nhan">{nhan}</span>
      <strong className="the-chi-so__gia-tri">{giaTri}</strong>
      <span className="the-chi-so__mo-ta">{moTa}</span>
    </div>
  )
}

function KhungBieuDo({ tieuDe, moTa, children, rong = '' }) {
  const coPhanDau = Boolean(tieuDe || moTa)

  return (
    <section className={`khung-bieu-do ${rong}`.trim()}>
      {coPhanDau ? (
        <div className="khung-bieu-do__dau">
          <div>
            {tieuDe ? <h3>{tieuDe}</h3> : null}
            {moTa ? <p>{moTa}</p> : null}
          </div>
        </div>
      ) : null}
      {children}
    </section>
  )
}

function BangNhiet({ title, months, rows, maxValue, dinhDang }) {
  return (
    <KhungBieuDo tieuDe={title}>
      <div className="bang-nhiet">
        <div className="bang-nhiet__hang bang-nhiet__hang--tieu-de">
          <span>Đối tượng</span>
          {months.map((thang) => (
            <span key={thang}>{thang}</span>
          ))}
        </div>
        {rows.map((dong) => (
          <div className="bang-nhiet__hang" key={dong.ten}>
            <span className="bang-nhiet__ten">{dong.ten}</span>
            {months.map((thang) => {
              const giaTri = dong.giaTri[thang] || 0
              const mucDo = maxValue ? giaTri / maxValue : 0
              return (
                <span
                  className="bang-nhiet__o"
                  key={`${dong.ten}-${thang}`}
                  style={{ background: `rgba(0, 184, 238, ${0.08 + mucDo * 0.7})` }}
                  title={`${dong.ten} | ${thang}: ${dinhDang(giaTri)}`}
                >
                  {dinhDang(giaTri)}
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </KhungBieuDo>
  )
}

function BangXepHang({ cot, rows }) {
  return (
    <div className="bang-wrapper">
      <table className="bang-dashboard">
        <thead>
          <tr>
            {cot.map((item) => (
              <th key={item.key}>{item.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((dong) => (
            <tr key={dong.id}>
              {cot.map((item) => (
                <td key={`${dong.id}-${item.key}`}>{item.render ? item.render(dong) : dong[item.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function App() {
  const [payload, setPayload] = useState(null)
  const [boLoc, setBoLoc] = useState(null)
  const [dangTai, setDangTai] = useState(true)
  const [loiTai, setLoiTai] = useState('')
  const [tabDangChon, setTabDangChon] = useState('tong-quan')
  const [chiSoChiNhanh, setChiSoChiNhanh] = useState('revenue')
  const [topNChiNhanh, setTopNChiNhanh] = useState(12)
  const [chiSoNhanSu, setChiSoNhanSu] = useState('revenue')
  const [topNNhanSu, setTopNNhanSu] = useState(12)
  const luaChonSoMuc = [10, 12, 15, 20].map((item) => ({ value: item, label: `${item} mục` }))

  useEffect(() => {
    let dangConHoatDong = true

    async function napDuLieu() {
      try {
        setDangTai(true)
        const response = await fetch('/dashboard-data.json')
        if (!response.ok) {
          throw new Error('Không đọc được dữ liệu bảng điều hành.')
        }
        const data = await response.json()
        if (!dangConHoatDong) return
        setPayload(data)
        setBoLoc(taoBoLocMacDinh(data))
      } catch (error) {
        if (!dangConHoatDong) return
        setLoiTai(error.message || 'Có lỗi khi tải dữ liệu.')
      } finally {
        if (dangConHoatDong) {
          setDangTai(false)
        }
      }
    }

    napDuLieu()

    return () => {
      dangConHoatDong = false
    }
  }, [])

  if (dangTai) {
    return (
      <main className="trang-dashboard trang-dashboard--trong">
        <div className="man-hinh-trang-thai">Đang tải dữ liệu bảng điều hành...</div>
      </main>
    )
  }

  if (loiTai || !payload || !boLoc) {
    return (
      <main className="trang-dashboard trang-dashboard--trong">
        <div className="man-hinh-trang-thai man-hinh-trang-thai--loi">
          {loiTai || 'Không có dữ liệu để hiển thị.'}
        </div>
      </main>
    )
  }

  const danhSachChiNhanh = sapXepChiNhanh(payload.dimensions.branches)
  const recordOptions = taoTuyChonCoTatCa(payload.dimensions.recordTypes)
  const registrationOptions = taoTuyChonCoTatCa(payload.dimensions.registrationTypes)
  const paymentOptions = taoTuyChonCoTatCa(payload.dimensions.paymentMethods)
  const genderOptions = taoTuyChonCoTatCa(payload.dimensions.genders)
  const branchOptions = taoTuyChonCoTatCa(danhSachChiNhanh)

  const banGhiDaLoc = locBanGhi(payload.records, boLoc)
  const tongKet = tongKetBoLoc(banGhiDaLoc)
  const tongQuan = tongQuanDieuHanh(banGhiDaLoc)
  const topChiNhanh = duLieuXepHangChiNhanh(banGhiDaLoc, chiSoChiNhanh, topNChiNhanh)
  const maTranChiNhanh = duLieuMaTranChiNhanh(banGhiDaLoc, chiSoChiNhanh, topNChiNhanh)
  const tanXaChiNhanh = duLieuTanXaChiNhanh(banGhiDaLoc, topNChiNhanh)
  const topNhanSu = duLieuXepHangNhanSu(banGhiDaLoc, chiSoNhanSu, topNNhanSu, 'Tất cả')
  const maTranNhanSu = duLieuMaTranNhanSu(banGhiDaLoc, chiSoNhanSu, topNNhanSu, 'Tất cả')
  const tanXaNhanSu = duLieuTanXaNhanSu(banGhiDaLoc, topNNhanSu, 'Tất cả')
  const chieuCaoXepHangChiNhanh = tinhChieuCaoXepHang(topChiNhanh, 'ten', 12)
  const chieuCaoXepHangNhanSu = tinhChieuCaoXepHang(topNhanSu, 'tenNhanSu', 16)
  const mauChiSoChiNhanh = MAU_THEO_CHI_SO[chiSoChiNhanh] || MAU_THEO_CHI_SO.revenue
  const mauChiSoNhanSu = MAU_THEO_CHI_SO[chiSoNhanSu] || MAU_THEO_CHI_SO.revenue

  function capNhatBoLoc(truong, giaTri) {
    setBoLoc((cu) => ({ ...cu, [truong]: giaTri }))
  }

  function capNhatKhoangNgay(truong, giaTri) {
    setBoLoc((cu) => ({
      ...cu,
      thangNhanh: 'custom',
      [truong]: giaTri,
    }))
  }

  function datLaiBoLoc() {
    setBoLoc(taoBoLocMacDinh(payload))
  }

  function apDungThangNhanh(giaTri) {
    if (giaTri === 'all') {
      setBoLoc((cu) => ({
        ...cu,
        thangNhanh: 'all',
        tuNgay: payload.dataWindow.start,
        denNgay: payload.dataWindow.end,
      }))
      return
    }

    const thang = Number(giaTri)
    const trongThang = payload.records.filter((dong) => dong.payment_month === thang)
    if (!trongThang.length) return

    const sapTheoNgayTang = [...trongThang].sort((a, b) => a.payment_date.localeCompare(b.payment_date))
    const sapTheoNgayGiam = [...trongThang].sort((a, b) => b.payment_date.localeCompare(a.payment_date))

    setBoLoc((cu) => ({
      ...cu,
      thangNhanh: giaTri,
      tuNgay: sapTheoNgayTang[0].payment_date,
      denNgay: sapTheoNgayGiam[0].payment_date,
    }))
  }

  return (
    <main className="trang-dashboard">
      <section className="hero-banner">
        <div className="hero-copy">
          <div className="hero-heading">
            <h1>Tổng hợp tình hình kinh doanh tháng 5, 6, 7/2023</h1>
          </div>
          <div className="hero-brand">
              <div className="hero-brand__plate">
                <img
                  className="hero-brand__logo"
                  src="https://ocean.edu.vn/Content/images/v2/logo.png"
                  alt="Ocean Edu"
                  loading="eager"
                  decoding="async"
                />
              </div>
          </div>
          <div className="hero-chip-list">
            <span className="hero-chip">{dinhDangNgay(boLoc.tuNgay)} - {dinhDangNgay(boLoc.denNgay)}</span>
            <span className="hero-chip">{dinhDangSo(tongKet.soChiNhanh)} chi nhánh đang xem</span>
            <span className="hero-chip">{dinhDangTienRutGon(tongKet.doanhThu)} doanh thu</span>
            <span className="hero-chip">{dinhDangSo(tongKet.soHocVien)} học viên</span>
          </div>
        </div>
      </section>

      <section className="bo-loc-toan-cuc">
        <div className="bo-loc-toan-cuc__dau">
          <button className="nut-phu" onClick={datLaiBoLoc}>Đặt lại bộ lọc</button>
        </div>

        <div className="thang-nhanh">
          {[
            { value: 'all', label: 'Toàn bộ' },
            { value: '5', label: 'Tháng 5' },
            { value: '6', label: 'Tháng 6' },
            { value: '7', label: 'Tháng 7' },
          ].map((item) => (
            <button
              key={item.value}
              className={boLoc.thangNhanh === item.value ? 'chip-thang active' : 'chip-thang'}
              onClick={() => apDungThangNhanh(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="luoi-bo-loc">
          <label className="truong-bo-loc">
            <span>Từ ngày</span>
            <input
              type="date"
              value={boLoc.tuNgay}
              onChange={(event) => capNhatKhoangNgay('tuNgay', event.target.value)}
            />
          </label>

          <label className="truong-bo-loc">
            <span>Đến ngày</span>
            <input
              type="date"
              value={boLoc.denNgay}
              onChange={(event) => capNhatKhoangNgay('denNgay', event.target.value)}
            />
          </label>

          <div className="truong-bo-loc truong-bo-loc--rong">
            <span>Chi nhánh</span>
            <Select
              isMulti
              options={branchOptions}
              value={layGiaTriDangChon(branchOptions, boLoc.chiNhanh)}
              onChange={(values, actionMeta) =>
                capNhatBoLoc('chiNhanh', xuLyThayDoiMultiSelect(values, actionMeta, branchOptions))
              }
              components={{ ValueContainer: GiaTriBoLocContainer, Option: LuaChonCheckbox }}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              styles={reactSelectMultiStyles}
              tatCaLabel="Tất cả"
              nhanDaChon="Đã chọn"
              placeholder="Chọn chi nhánh"
            />
          </div>

          <div className="truong-bo-loc">
            <span>Loại phiếu</span>
            <Select
              isMulti
              options={recordOptions}
              value={layGiaTriDangChon(recordOptions, boLoc.loaiPhieu)}
              onChange={(values, actionMeta) =>
                capNhatBoLoc('loaiPhieu', xuLyThayDoiMultiSelect(values, actionMeta, recordOptions))
              }
              components={{ ValueContainer: GiaTriBoLocContainer, Option: LuaChonCheckbox }}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              styles={reactSelectMultiStyles}
              tatCaLabel="Tất cả"
              nhanDaChon="Đã chọn"
              placeholder="Chọn loại phiếu"
            />
          </div>

          <div className="truong-bo-loc">
            <span>Loại đăng ký</span>
            <Select
              isMulti
              options={registrationOptions}
              value={layGiaTriDangChon(registrationOptions, boLoc.loaiDangKy)}
              onChange={(values, actionMeta) =>
                capNhatBoLoc('loaiDangKy', xuLyThayDoiMultiSelect(values, actionMeta, registrationOptions))
              }
              components={{ ValueContainer: GiaTriBoLocContainer, Option: LuaChonCheckbox }}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              styles={reactSelectMultiStyles}
              tatCaLabel="Tất cả"
              nhanDaChon="Đã chọn"
              placeholder="Chọn loại đăng ký"
            />
          </div>

          <div className="truong-bo-loc">
            <span>Thanh toán</span>
            <Select
              isMulti
              options={paymentOptions}
              value={layGiaTriDangChon(paymentOptions, boLoc.hinhThucThanhToan)}
              onChange={(values, actionMeta) =>
                capNhatBoLoc('hinhThucThanhToan', xuLyThayDoiMultiSelect(values, actionMeta, paymentOptions))
              }
              components={{ ValueContainer: GiaTriBoLocContainer, Option: LuaChonCheckbox }}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              styles={reactSelectMultiStyles}
              tatCaLabel="Tất cả"
              nhanDaChon="Đã chọn"
              placeholder="Chọn hình thức"
            />
          </div>

          <div className="truong-bo-loc">
            <span>Giới tính</span>
            <Select
              isMulti
              options={genderOptions}
              value={layGiaTriDangChon(genderOptions, boLoc.gioiTinh)}
              onChange={(values, actionMeta) =>
                capNhatBoLoc('gioiTinh', xuLyThayDoiMultiSelect(values, actionMeta, genderOptions))
              }
              components={{ ValueContainer: GiaTriBoLocContainer, Option: LuaChonCheckbox }}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              styles={reactSelectMultiStyles}
              tatCaLabel="Tất cả"
              nhanDaChon="Đã chọn"
              placeholder="Chọn giới tính"
            />
          </div>
        </div>
      </section>

      <nav className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={tabDangChon === tab.id ? 'tab-bar__nut active' : 'tab-bar__nut'}
            onClick={() => setTabDangChon(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {tabDangChon === 'tong-quan' && (
        <section className="noi-dung-tab">
          <div className="luoi-the">
            <TheChiSo nhan="Doanh thu" giaTri={dinhDangTienRutGon(tongQuan.tongQuan.doanhThu)} mau="#00b8ee" />
            <TheChiSo nhan="Số chi nhánh phát sinh" giaTri={dinhDangSo(tongQuan.tongQuan.soChiNhanh)} mau="#1f69d8" />
            <TheChiSo nhan="Số nhân sự phát sinh giao dịch" giaTri={dinhDangSo(tongQuan.tongQuan.soNhanSu)} mau="#52d7c9" />
            <TheChiSo nhan="TB doanh thu / chi nhánh" giaTri={dinhDangTienRutGon(tongQuan.tongQuan.doanhThuMoiChiNhanh)} mau="#f6b332" />
            <TheChiSo nhan="TB doanh thu / nhân sự" giaTri={dinhDangTienRutGon(tongQuan.tongQuan.doanhThuMoiNhanSu)} mau="#7ed7ff" />
          </div>

          <div className="luoi-bieu-do">
            <KhungBieuDo tieuDe="Tổng quan" rong="span-8">
              <ResponsiveContainer width="100%" height={340}>
                <ComposedChart data={tongQuan.theoThang} margin={{ top: 18, right: 10, bottom: 0, left: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="thang" stroke="#93a9ca" />
                  <YAxis yAxisId="left" stroke="#93a9ca" width={78} tickMargin={8} tickFormatter={dinhDangTienRutGon} />
                  <YAxis yAxisId="right" orientation="right" stroke="#93a9ca" width={58} tickMargin={8} />
                  <Tooltip content={<MauTooltip formatter={(value, dong) => dong.dataKey === 'revenue' ? dinhDangTien(value) : dinhDangSo(value)} />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" name="Doanh thu" fill="#00b8ee" radius={[10, 10, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="transactions" name="Giao dịch" stroke="#f6b332" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </KhungBieuDo>

            <KhungBieuDo tieuDe="Chi nhánh dẫn đầu" rong="span-4">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={duLieuXepHangChiNhanh(banGhiDaLoc, 'revenue', 10)} layout="vertical" margin={{ left: 12, right: 12 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                  <XAxis type="number" stroke="#93a9ca" tickFormatter={dinhDangTienRutGon} />
                  <YAxis dataKey="ten" type="category" stroke="#eef5ff" width={64} />
                  <Tooltip content={<MauTooltip formatter={(value) => dinhDangTien(value)} />} />
                  <Bar dataKey="revenue" name="Doanh thu" fill={MAU_THEO_CHI_SO.revenue} radius={[0, 12, 12, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </KhungBieuDo>

            <KhungBieuDo tieuDe="Cơ cấu loại đăng ký theo tháng" rong="span-7">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={duLieuXuHuongTheoChieu(banGhiDaLoc, 'registration_type', 'revenue').data} margin={{ top: 18, right: 10, bottom: 0, left: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="thang" stroke="#93a9ca" />
                  <YAxis stroke="#93a9ca" width={78} tickMargin={8} tickFormatter={dinhDangTienRutGon} />
                  <Tooltip content={<MauTooltip formatter={(value) => dinhDangTien(value)} />} />
                  <Legend />
                  {duLieuXuHuongTheoChieu(banGhiDaLoc, 'registration_type', 'revenue').categories.map((item, index) => (
                    <Bar key={item} dataKey={item} stackId="a" fill={MAU_HE[index % MAU_HE.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </KhungBieuDo>

            <KhungBieuDo tieuDe="Hình thức thanh toán" rong="span-5">
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie
                    data={duLieuCoCauTheoChieu(banGhiDaLoc, 'payment_method', 'revenue')}
                    dataKey="giaTri"
                    nameKey="ten"
                    innerRadius={76}
                    outerRadius={118}
                    paddingAngle={4}
                  >
                    {duLieuCoCauTheoChieu(banGhiDaLoc, 'payment_method', 'revenue').map((item, index) => (
                      <Cell key={item.ten} fill={MAU_HE[index % MAU_HE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<MauTooltip formatter={(value) => dinhDangTien(value)} />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </KhungBieuDo>
          </div>
        </section>
      )}

      {tabDangChon === 'chi-nhanh' && (
        <section className="noi-dung-tab">
          <div className="bo-loc-cuc-bo">
            <div className="bo-loc-cuc-bo__item">
              <span>Chỉ số</span>
              <Select
                options={LUA_CHON_CHI_SO}
                value={LUA_CHON_CHI_SO.find((item) => item.value === chiSoChiNhanh)}
                onChange={(value) => setChiSoChiNhanh(value.value)}
                styles={reactSelectStyles}
                isSearchable={false}
              />
            </div>
            <div className="bo-loc-cuc-bo__item">
              <span>Số mục hiển thị</span>
              <Select
                options={luaChonSoMuc}
                value={{ value: topNChiNhanh, label: `${topNChiNhanh} mục` }}
                onChange={(value) => setTopNChiNhanh(value.value)}
                styles={reactSelectStyles}
                isSearchable={false}
              />
            </div>
          </div>

          <div className="luoi-bieu-do">
            <KhungBieuDo tieuDe="Xếp hạng chi nhánh" rong="span-7">
              <ResponsiveContainer width="100%" height={chieuCaoXepHangChiNhanh}>
                <BarChart data={topChiNhanh} layout="vertical" margin={{ left: 28, right: 12, top: 6, bottom: 6 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#93a9ca"
                    tickFormatter={(value) => DINH_NGHIA_CHI_SO[chiSoChiNhanh].loai === 'currency' ? dinhDangTienRutGon(value) : dinhDangSo(value)}
                  />
                  <YAxis
                    dataKey="ten"
                    type="category"
                    stroke="#eef5ff"
                    width={96}
                    interval={0}
                    tick={<NhanTrucDungNhieuDong gioiHan={12} />}
                  />
                  <Tooltip
                    content={
                      <MauTooltip
                        formatter={(value) =>
                          DINH_NGHIA_CHI_SO[chiSoChiNhanh].loai === 'currency'
                            ? dinhDangTien(value)
                            : dinhDangSo(value)
                        }
                      />
                    }
                  />
                  <Bar dataKey={chiSoChiNhanh} name={DINH_NGHIA_CHI_SO[chiSoChiNhanh].nhan} fill={mauChiSoChiNhanh} radius={[0, 12, 12, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </KhungBieuDo>

            <div className="span-5">
              <BangNhiet
                title={null}
                months={maTranChiNhanh.months}
                rows={maTranChiNhanh.rows}
                maxValue={maTranChiNhanh.giaTriLonNhat}
                dinhDang={(giaTri) =>
                  DINH_NGHIA_CHI_SO[chiSoChiNhanh].loai === 'currency'
                    ? dinhDangTienRutGon(giaTri)
                    : dinhDangSo(giaTri)
                }
              />
            </div>

            <KhungBieuDo tieuDe="Hiệu suất chi nhánh" moTa="Trục X là số giao dịch, trục Y là doanh thu, kích thước thể hiện số học viên" rong="span-7">
              <ResponsiveContainer width="100%" height={360}>
                <ScatterChart margin={{ top: 12, right: 16, bottom: 12, left: 8 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Số giao dịch"
                    stroke="#93a9ca"
                    tickFormatter={dinhDangSo}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Doanh thu"
                    stroke="#93a9ca"
                    tickFormatter={dinhDangTienRutGon}
                  />
                  <ZAxis type="number" dataKey="z" range={[100, 480]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const item = payload[0].payload
                      return (
                        <div className="tooltip-card">
                          <div className="tooltip-title">{item.ten}</div>
                          <div className="tooltip-list">
                            <div className="tooltip-row"><span>Doanh thu</span><strong>{dinhDangTien(item.doanhThu)}</strong></div>
                            <div className="tooltip-row"><span>Giao dịch</span><strong>{dinhDangSo(item.soGiaoDich)}</strong></div>
                            <div className="tooltip-row"><span>Học viên</span><strong>{dinhDangSo(item.soHocVien)}</strong></div>
                            <div className="tooltip-row"><span>Tỷ lệ ghi danh mới</span><strong>{dinhDangPhanTram(item.tyLeGhiDanhMoi * 100)}</strong></div>
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Scatter data={tanXaChiNhanh} fill="#00b8ee" />
                </ScatterChart>
              </ResponsiveContainer>
            </KhungBieuDo>

            <KhungBieuDo rong="span-5">
              <BangXepHang
                cot={[
                  { key: 'ten', label: 'Chi nhánh' },
                  { key: 'revenue', label: 'Doanh thu', render: (dong) => dinhDangTien(dong.revenue) },
                  { key: 'transactions', label: 'Giao dịch', render: (dong) => dinhDangSo(dong.transactions) },
                  { key: 'students', label: 'Học viên', render: (dong) => dinhDangSo(dong.students) },
                  { key: 'newRegistrationShare', label: 'Tỷ lệ ghi danh mới', render: (dong) => dinhDangPhanTram(dong.newRegistrationShare * 100) },
                ]}
                rows={topChiNhanh.map((dong) => ({ ...dong, id: dong.ten }))}
              />
            </KhungBieuDo>
          </div>
        </section>
      )}

      {tabDangChon === 'nhan-su' && (
        <section className="noi-dung-tab">
          <div className="bo-loc-cuc-bo bo-loc-cuc-bo--2cot">
            <div className="bo-loc-cuc-bo__item">
              <span>Chỉ số</span>
              <Select
                options={LUA_CHON_CHI_SO.filter((item) => item.value !== 'revenuePerAdvisor')}
                value={LUA_CHON_CHI_SO.find((item) => item.value === chiSoNhanSu)}
                onChange={(value) => setChiSoNhanSu(value.value)}
                styles={reactSelectStyles}
                isSearchable={false}
              />
            </div>
            <div className="bo-loc-cuc-bo__item">
              <span>Số mục hiển thị</span>
              <Select
                options={luaChonSoMuc}
                value={{ value: topNNhanSu, label: `${topNNhanSu} mục` }}
                onChange={(value) => setTopNNhanSu(value.value)}
                styles={reactSelectStyles}
                isSearchable={false}
              />
            </div>
          </div>

          <div className="luoi-bieu-do">
            <KhungBieuDo tieuDe="Bảng phong thần" rong="span-7">
              <ResponsiveContainer width="100%" height={chieuCaoXepHangNhanSu}>
                <BarChart data={topNhanSu} layout="vertical" margin={{ left: 48, right: 12, top: 6, bottom: 6 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#93a9ca"
                    tickFormatter={(value) => DINH_NGHIA_CHI_SO[chiSoNhanSu].loai === 'currency' ? dinhDangTienRutGon(value) : dinhDangSo(value)}
                  />
                  <YAxis
                    dataKey="tenNhanSu"
                    type="category"
                    stroke="#eef5ff"
                    width={150}
                    interval={0}
                    tick={<NhanTrucDungNhieuDong gioiHan={16} />}
                  />
                  <Tooltip
                    content={
                      <MauTooltip
                        formatter={(value) =>
                          DINH_NGHIA_CHI_SO[chiSoNhanSu].loai === 'currency'
                            ? dinhDangTien(value)
                            : dinhDangSo(value)
                        }
                      />
                    }
                  />
                  <Bar dataKey={chiSoNhanSu} name={DINH_NGHIA_CHI_SO[chiSoNhanSu].nhan} fill={mauChiSoNhanSu} radius={[0, 12, 12, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </KhungBieuDo>

            <div className="span-5">
              <BangNhiet
                title={null}
                months={maTranNhanSu.months}
                rows={maTranNhanSu.rows}
                maxValue={maTranNhanSu.giaTriLonNhat}
                dinhDang={(giaTri) =>
                  DINH_NGHIA_CHI_SO[chiSoNhanSu].loai === 'currency'
                    ? dinhDangTienRutGon(giaTri)
                    : dinhDangSo(giaTri)
                }
              />
            </div>

            <KhungBieuDo tieuDe="Hiệu suất nhân sự" moTa="Trục X là số giao dịch, trục Y là doanh thu, kích thước thể hiện số học viên" rong="span-7">
              <ResponsiveContainer width="100%" height={360}>
                <ScatterChart margin={{ top: 12, right: 16, bottom: 12, left: 8 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Số giao dịch"
                    stroke="#93a9ca"
                    tickFormatter={dinhDangSo}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Doanh thu"
                    stroke="#93a9ca"
                    tickFormatter={dinhDangTienRutGon}
                  />
                  <ZAxis type="number" dataKey="z" range={[100, 520]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const item = payload[0].payload
                      return (
                        <div className="tooltip-card">
                          <div className="tooltip-title">{item.ten}</div>
                          <div className="tooltip-list">
                            <div className="tooltip-row"><span>Chi nhánh</span><strong>{item.chiNhanh}</strong></div>
                            <div className="tooltip-row"><span>Doanh thu</span><strong>{dinhDangTien(item.doanhThu)}</strong></div>
                            <div className="tooltip-row"><span>Giao dịch</span><strong>{dinhDangSo(item.soGiaoDich)}</strong></div>
                            <div className="tooltip-row"><span>Học viên</span><strong>{dinhDangSo(item.soHocVien)}</strong></div>
                            <div className="tooltip-row"><span>TB / giao dịch</span><strong>{dinhDangTien(item.giaTriMoiGiaoDich)}</strong></div>
                            <div className="tooltip-row"><span>Tỷ lệ ghi danh mới</span><strong>{dinhDangPhanTram(item.tyLeGhiDanhMoi * 100)}</strong></div>
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Scatter data={tanXaNhanSu} fill="#1f69d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </KhungBieuDo>

            <KhungBieuDo rong="span-5">
              <BangXepHang
                cot={[
                  { key: 'tenNhanSu', label: 'Nhân sự' },
                  { key: 'chiNhanh', label: 'Chi nhánh' },
                  { key: 'revenue', label: 'Doanh thu', render: (dong) => dinhDangTien(dong.revenue) },
                  { key: 'transactions', label: 'Giao dịch', render: (dong) => dinhDangSo(dong.transactions) },
                  { key: 'newRegistrationShare', label: 'Tỷ lệ ghi danh mới', render: (dong) => dinhDangPhanTram(dong.newRegistrationShare * 100) },
                ]}
                rows={topNhanSu.map((dong) => ({ ...dong, id: dong.ten }))}
              />
            </KhungBieuDo>
          </div>
        </section>
      )}

    </main>
  )
}

export default App
