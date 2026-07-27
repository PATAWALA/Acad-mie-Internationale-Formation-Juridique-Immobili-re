interface Country {
  code: string;
  name: string;
  dial_code: string;
}

const countries: Country[] = [
  { code: 'CI', name: 'Côte d\'Ivoire', dial_code: '+225' },
  { code: 'BJ', name: 'Bénin', dial_code: '+229' },
  { code: 'TG', name: 'Togo', dial_code: '+228' },
  { code: 'SN', name: 'Sénégal', dial_code: '+221' },
  { code: 'BF', name: 'Burkina Faso', dial_code: '+226' },
  { code: 'ML', name: 'Mali', dial_code: '+223' },
  { code: 'GN', name: 'Guinée', dial_code: '+224' },
  { code: 'CM', name: 'Cameroun', dial_code: '+237' },
  { code: 'CD', name: 'RDC', dial_code: '+243' },
  { code: 'FR', name: 'France', dial_code: '+33' },
];

interface CountrySelectProps {
  value: string;
  onChange: (dialCode: string) => void;
}

export default function CountrySelect({ value, onChange }: CountrySelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#0B0F19] border border-[#1E293B] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
    >
      {countries.map((c) => (
        <option key={c.code} value={c.dial_code}>
          {c.name} ({c.dial_code})
        </option>
      ))}
    </select>
  );
}