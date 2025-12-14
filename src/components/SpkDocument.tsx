import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

// Register font for better typography support
Font.register({
  family: 'Helvetica',
  src: 'https://cdn.jsdelivr.net/npm/@react-pdf/font@2.2.2/fonts/Roboto-Regular.ttf'
});

Font.register({
  family: 'Helvetica-Bold',
  src: 'https://cdn.jsdelivr.net/npm/@react-pdf/font@2.2.2/fonts/Roboto-Bold.ttf'
});

interface SpkDocumentProps {
  data: {
    spkNumber: string;
    date: string;
    customer: {
      nama: string;
      alamat: string;
      noHp: string;
      email: string;
      ktp: string;
    };
    sales: {
      nama: string;
      noHp: string;
      email: string;
    };
    vehicle: {
      type: string;
      warna: string;
      noRangka: string;
      noMesin: string;
      tahun: string;
      harga: string;
    };
    payment: {
      type: 'cash' | 'credit';
      dp: string;
      tenor?: string;
      angsuran?: string;
      bunga?: string;
    };
    signatures: {
      spv: string;
      sales: string;
      customer: string;
    };
  };
}

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
    borderRight: 1,
    borderRightColor: '#ccc',
    paddingRight: 10,
  },
  headerCenter: {
    flex: 2,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  headerRight: {
    flex: 1,
    borderLeft: 1,
    borderLeftColor: '#ccc',
    paddingLeft: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
  },
  companyInfo: {
    fontSize: 9,
    lineHeight: 1.2,
  },
  twoColumn: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  leftColumn: {
    flex: 1,
    marginRight: 10,
    border: 1,
    borderColor: '#000',
    padding: 10,
  },
  rightColumn: {
    flex: 1,
    marginLeft: 10,
    border: 1,
    borderColor: '#000',
    padding: 10,
  },
  section: {
    marginBottom: 15,
    border: 1,
    borderColor: '#000',
  },
  sectionHeader: {
    backgroundColor: '#f0f0f0',
    borderBottom: 1,
    borderBottomColor: '#000',
    padding: 5,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  sectionContent: {
    padding: 10,
  },
  vehicleGrid: {
    display: 'flex',
    flexDirection: 'column',
  },
  vehicleRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#ccc',
    padding: 3,
  },
  vehicleRowLast: {
    borderBottom: 0,
  },
  vehicleLabel: {
    flex: 1,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    borderRight: 1,
    borderRightColor: '#ccc',
    paddingRight: 5,
  },
  vehicleValue: {
    flex: 2,
    paddingLeft: 5,
  },
  paymentGrid: {
    display: 'flex',
    flexDirection: 'column',
  },
  paymentRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#ccc',
    padding: 3,
    minHeight: 20,
  },
  paymentRowLast: {
    borderBottom: 0,
  },
  paymentLabel: {
    flex: 1,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    borderRight: 1,
    borderRightColor: '#ccc',
    paddingRight: 5,
  },
  paymentValue: {
    flex: 2,
    paddingLeft: 5,
  },
  footer: {
    marginTop: 20,
    fontSize: 8,
    textAlign: 'justify',
    fontStyle: 'italic',
    marginBottom: 20,
    lineHeight: 1.3,
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: 'row',
  },
  signatureColumn: {
    flex: 1,
    textAlign: 'center',
  },
  signatureBox: {
    borderTop: 1,
    borderTopColor: '#000',
    marginTop: 40,
    paddingTop: 5,
    fontSize: 9,
  },
  signatureTitle: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 20,
  },
  boldText: {
    fontFamily: 'Helvetica-Bold',
  },
  borderRight: {
    borderRight: 1,
    borderRightColor: '#ccc',
  },
  logoPlaceholder: {
    width: 60,
    height: 40,
    border: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 8,
    color: '#666',
  },
});

const SpkDocument: React.FC<SpkDocumentProps> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          {/* Logo */}
          <View style={styles.headerLeft}>
            <View style={styles.logoPlaceholder}>
              <Text>LOGO</Text>
            </View>
          </View>

          {/* Company Info */}
          <View style={styles.headerCenter}>
            <Text style={styles.title}>SURAT PESANAN KENDARAAN</Text>
            <Text style={[styles.companyInfo, { marginTop: 5 }]}>
              PT. SINAR BAJA MOTOR
            </Text>
            <Text style={styles.companyInfo}>
              Jl. MH. Thamrin No. 9 Cikarang - 17550
            </Text>
            <Text style={styles.companyInfo}>
              Telp: (021) 8901234 Fax: (021) 8901235
            </Text>
            <Text style={styles.companyInfo}>
              E-mail: info@sinarbajamotor.co.id
            </Text>
            <Text style={styles.companyInfo}>
              Website: www.sinarbajamotor.co.id
            </Text>
          </View>

          {/* SPK Number & Date */}
          <View style={styles.headerRight}>
            <Text style={[styles.boldText, { marginBottom: 5 }]}>No. SPK</Text>
            <Text style={{ marginBottom: 10, borderBottom: 1, borderBottomColor: '#000', paddingBottom: 2 }}>
              {data.spkNumber}
            </Text>
            <Text style={[styles.boldText, { marginBottom: 5 }]}>Tanggal</Text>
            <Text style={{ borderBottom: 1, borderBottomColor: '#000', paddingBottom: 2 }}>
              {data.date}
            </Text>
          </View>
        </View>

        {/* Two Column Section: Customer & Sales Info */}
        <View style={styles.twoColumn}>
          {/* Customer Information */}
          <View style={styles.leftColumn}>
            <Text style={[styles.boldText, { marginBottom: 8, textAlign: 'center', fontSize: 11 }]}>
              DATA PEMBELI
            </Text>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.boldText, { fontSize: 9 }]}>Nama</Text>
              <Text style={{ borderBottom: 1, borderBottomColor: '#ccc', padding: 2 }}>
                {data.customer.nama}
              </Text>
            </View>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.boldText, { fontSize: 9 }]}>Alamat</Text>
              <Text style={{ borderBottom: 1, borderBottomColor: '#ccc', padding: 2, minHeight: 30 }}>
                {data.customer.alamat}
              </Text>
            </View>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.boldText, { fontSize: 9 }]}>No. HP</Text>
              <Text style={{ borderBottom: 1, borderBottomColor: '#ccc', padding: 2 }}>
                {data.customer.noHp}
              </Text>
            </View>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.boldText, { fontSize: 9 }]}>Email</Text>
              <Text style={{ borderBottom: 1, borderBottomColor: '#ccc', padding: 2 }}>
                {data.customer.email}
              </Text>
            </View>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.boldText, { fontSize: 9 }]}>No. KTP</Text>
              <Text style={{ borderBottom: 1, borderBottomColor: '#ccc', padding: 2 }}>
                {data.customer.ktp}
              </Text>
            </View>
          </View>

          {/* Sales Information */}
          <View style={styles.rightColumn}>
            <Text style={[styles.boldText, { marginBottom: 8, textAlign: 'center', fontSize: 11 }]}>
              DATA SALES
            </Text>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.boldText, { fontSize: 9 }]}>Nama</Text>
              <Text style={{ borderBottom: 1, borderBottomColor: '#ccc', padding: 2 }}>
                {data.sales.nama}
              </Text>
            </View>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.boldText, { fontSize: 9 }]}>No. HP</Text>
              <Text style={{ borderBottom: 1, borderBottomColor: '#ccc', padding: 2 }}>
                {data.sales.noHp}
              </Text>
            </View>
            <View style={{ marginBottom: 5 }}>
              <Text style={[styles.boldText, { fontSize: 9 }]}>Email</Text>
              <Text style={{ borderBottom: 1, borderBottomColor: '#ccc', padding: 2 }}>
                {data.sales.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Vehicle Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={{ fontSize: 11 }}>DATA KENDARAAN</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.vehicleGrid}>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>Type Kendaraan</Text>
                <Text style={styles.vehicleValue}>{data.vehicle.type}</Text>
              </View>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>Warna</Text>
                <Text style={styles.vehicleValue}>{data.vehicle.warna}</Text>
              </View>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>No. Rangka</Text>
                <Text style={styles.vehicleValue}>{data.vehicle.noRangka}</Text>
              </View>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>No. Mesin</Text>
                <Text style={styles.vehicleValue}>{data.vehicle.noMesin}</Text>
              </View>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>Tahun Pembuatan</Text>
                <Text style={styles.vehicleValue}>{data.vehicle.tahun}</Text>
              </View>
              <View style={[styles.vehicleRow, styles.vehicleRowLast]}>
                <Text style={styles.vehicleLabel}>Harga</Text>
                <Text style={styles.vehicleValue}>{data.vehicle.harga}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={{ fontSize: 11 }}>DATA PEMBAYARAN</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.paymentGrid}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Cara Pembayaran</Text>
                <Text style={styles.paymentValue}>
                  {data.payment.type === 'cash' ? 'TUNAI' : 'KREDIT'}
                </Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Uang Muka (DP)</Text>
                <Text style={styles.vehicleValue}>{data.payment.dp}</Text>
              </View>
              {data.payment.type === 'credit' && (
                <>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Tenor</Text>
                    <Text style={styles.paymentValue}>{data.payment.tenor}</Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Angsuran</Text>
                    <Text style={styles.paymentValue}>{data.payment.angsuran}</Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Bunga</Text>
                    <Text style={styles.paymentValue}>{data.payment.bunga}</Text>
                  </View>
                </>
              )}
              <View style={[styles.paymentRow, styles.paymentRowLast]}>
                <Text style={styles.paymentLabel}>Sisa Pembayaran</Text>
                <Text style={styles.paymentValue}>
                  {data.payment.type === 'cash'
                    ? parseInt(data.vehicle.harga.replace(/\D/g, '')) - parseInt(data.payment.dp.replace(/\D/g, ''))
                    : 'Sesuai Perjanjian Kredit'
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer Disclaimer */}
        <View style={styles.footer}>
          <Text>
            Pembeli telah menyetujui dan memahami semua ketentuan dan syarat yang berlaku.
            Kendaraan yang telah dibeli tidak dapat dikembalikan dengan alasan apapun.
            Kelengkapan dokumen kendaraan akan diserahkan setelah pembayaran lunas.
            Segala biaya administrasi dan pajak atas pembelian kendaraan menjadi tanggung jawab pembeli.
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureColumn}>
            <Text style={styles.signatureTitle}>MENGETAHUI,</Text>
            <Text style={styles.signatureTitle}>Kepala Cabang / SPV</Text>
            <View style={styles.signatureBox}>
              <Text>{data.signatures.spv}</Text>
            </View>
          </View>
          <View style={styles.signatureColumn}>
            <Text style={styles.signatureTitle}>Sales,</Text>
            <View style={styles.signatureBox}>
              <Text>{data.signatures.sales}</Text>
            </View>
          </View>
          <View style={styles.signatureColumn}>
            <Text style={styles.signatureTitle}>Pembeli,</Text>
            <View style={styles.signatureBox}>
              <Text>{data.signatures.customer}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default SpkDocument;