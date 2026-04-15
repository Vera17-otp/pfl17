import { useState } from 'react';
import InputField from './components/InputField';
import SelectField from './components/SelectField';

export default function AirportTransferForm() {
  const [formData, setFormData] = useState({
    passengerName: '',
    flightNumber: '',
    passengerCount: '',
    departureAirport: '',
    arrivalAirport: '',
  });

  const [errors, setErrors] = useState({
    passengerName: '',
    flightNumber: '',
    passengerCount: '',
    departureAirport: '',
    arrivalAirport: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const airportOptions = [
    { value: 'hnd', label: 'Haneda Airport (HND) - Tokyo' },
    { value: 'nrt', label: 'Narita Airport (NRT) - Tokyo' },
    { value: 'kix', label: 'Kansai Airport (KIX) - Osaka' },
    { value: 'cts', label: 'New Chitose Airport (CTS) - Sapporo' },
    { value: 'fuk', label: 'Fukuoka Airport (FUK) - Fukuoka' },
  ];

  const passengerCountOptions = [
    { value: '1', label: '1 Orang' },
    { value: '2', label: '2 Orang' },
    { value: '3', label: '3 Orang' },
    { value: '4', label: '4 Orang' },
    { value: '5', label: '5+ Orang' },
  ];

  const validateField = (name, value) => {
    switch (name) {
      case 'passengerName':
        if (!value.trim()) return 'Nama penumpang wajib diisi';
        if (/[0-9]/.test(value)) return 'Nama tidak boleh mengandung angka';
        if (value.trim().length < 3) return 'Nama minimal 3 karakter';
        return '';
      case 'flightNumber':
        if (!value.trim()) return 'Nomor penerbangan wajib diisi';
        if (!/^[A-Z]{2,3}\d{3,4}$/i.test(value.trim()))
          return 'Format nomor penerbangan salah (contoh: JL123 atau NH2024)';
        return '';
      case 'passengerCount':
        if (!value) return 'Jumlah penumpang wajib dipilih';
        return '';
      case 'departureAirport':
        if (!value) return 'Bandara keberangkatan wajib dipilih';
        return '';
      case 'arrivalAirport':
        if (!value) return 'Bandara tujuan wajib dipilih';
        if (value === formData.departureAirport)
          return 'Bandara tujuan tidak boleh sama dengan bandara keberangkatan';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    setIsSubmitted(false);
  };

  const isFormValid = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateField(key, formData[key]);
    });
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      setIsSubmitted(true);
    }
  };

  const calculatePrice = () => {
    const basePrice = {
      hnd: 12000,
      nrt: 18000,
      kix: 11000,
      cts: 15000,
      fuk: 10000,
    };
    const multiplier = parseInt(formData.passengerCount) || 1;
    const departurePrice = basePrice[formData.departureAirport] || 10000;
    const total = departurePrice * multiplier;
    return total.toLocaleString('id-ID');
  };

  const isAllFieldsFilled = () => {
    return Object.values(formData).every(val => val !== '');
  };

  const isNoErrors = () => {
    return Object.values(errors).every(err => err === '');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-5">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-center mb-2 text-gray-700">
          🚐 Airport Transfer Jepang
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Pesan antar-jemput dari bandara ke hotel di seluruh Jepang
        </p>

        <form onSubmit={handleSubmit}>
          <InputField
            label="Nama Penumpang"
            type="text"
            placeholder="Contoh: Takumi Fujiwara"
            name="passengerName"
            value={formData.passengerName}
            onChange={handleChange}
            error={errors.passengerName}
            required
          />

          <InputField
            label="Nomor Penerbangan"
            type="text"
            placeholder="Contoh: JL123, NH2024"
            name="flightNumber"
            value={formData.flightNumber}
            onChange={handleChange}
            error={errors.flightNumber}
            required
          />

          <SelectField
            label="Jumlah Penumpang"
            name="passengerCount"
            value={formData.passengerCount}
            onChange={handleChange}
            options={passengerCountOptions}
            error={errors.passengerCount}
            required
          />

          <SelectField
            label="Bandara Keberangkatan"
            name="departureAirport"
            value={formData.departureAirport}
            onChange={handleChange}
            options={airportOptions}
            error={errors.departureAirport}
            required
          />

          <SelectField
            label="Bandara Tujuan (Hotel Area)"
            name="arrivalAirport"
            value={formData.arrivalAirport}
            onChange={handleChange}
            options={airportOptions}
            error={errors.arrivalAirport}
            required
          />

          {isAllFieldsFilled() && isNoErrors() && (
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition mt-2"
            >
              Pesan Transfer Sekarang
            </button>
          )}
        </form>

        {isSubmitted && (
          <div className="mt-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
            <h3 className="font-bold text-lg mb-2">✅ Pesanan Berhasil!</h3>
            <p><strong>Nama:</strong> {formData.passengerName}</p>
            <p><strong>Nomor Penerbangan:</strong> {formData.flightNumber}</p>
            <p><strong>Jumlah Penumpang:</strong> {formData.passengerCount} orang</p>
            <p><strong>Dari Bandara:</strong> {airportOptions.find((o) => o.value === formData.departureAirport)?.label}</p>
            <p><strong>Ke Area:</strong> {airportOptions.find((o) => o.value === formData.arrivalAirport)?.label}</p>
            <p className="mt-2 text-lg font-semibold">💴 Estimasi Biaya: ¥ {calculatePrice()}</p>
            <p className="text-sm mt-1">✨ Driver akan menjemput Anda di lobi kedatangan dengan papan nama.</p>
          </div>
        )}
      </div>
    </div>
  );
}