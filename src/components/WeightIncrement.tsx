import { Plus, Minus } from 'lucide-react';

interface WeightIncrementProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
}

const WeightIncrement = ({ value, onChange, onConfirm }: WeightIncrementProps) => {
  const currentValue = parseFloat(value) || 0;

  const handleIncrement = (amount: number) => {
    const newValue = Math.max(0, currentValue + amount);
    onChange(newValue.toFixed(1));
  };

  const handleClear = () => {
    onChange('0.0');
  };

  return (
    <div className="space-y-4">
      {/* Increment Buttons Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 gap-y-6">
        {/* Row 1: +10.0 | +5.0 */}
        <button
          type="button"
          onClick={() => handleIncrement(10)}
          className="weight-btn-positive"
        >
          <Plus className="w-5 h-5 mr-1" />
          + 10.0
        </button>
        <button
          type="button"
          onClick={() => handleIncrement(5)}
          className="weight-btn-positive"
        >
          <Plus className="w-5 h-5 mr-1" />
          + 5.0
        </button>
        
        {/* Row 2: +1.0 | +0.1 */}
        <button
          type="button"
          onClick={() => handleIncrement(1)}
          className="weight-btn-positive"
        >
          <Plus className="w-5 h-5 mr-1" />
          + 1.0
        </button>
        <button
          type="button"
          onClick={() => handleIncrement(0.1)}
          className="weight-btn-positive"
        >
          <Plus className="w-5 h-5 mr-1" />
          + 0.1
        </button>
        
        {/* Row 3: -10.0 | -5.0 */}
        <button
          type="button"
          onClick={() => handleIncrement(-10)}
          className="weight-btn-negative"
        >
          <Minus className="w-5 h-5 mr-1" />
          – 10.0
        </button>
        <button
          type="button"
          onClick={() => handleIncrement(-5)}
          className="weight-btn-negative"
        >
          <Minus className="w-5 h-5 mr-1" />
          – 5.0
        </button>
        
        {/* Row 4: -1.0 | -0.1 */}
        <button
          type="button"
          onClick={() => handleIncrement(-1)}
          className="weight-btn-negative"
        >
          <Minus className="w-5 h-5 mr-1" />
          – 1.0
        </button>
        <button
          type="button"
          onClick={() => handleIncrement(-0.1)}
          className="weight-btn-negative"
        >
          <Minus className="w-5 h-5 mr-1" />
          – 0.1
        </button>
      </div>

      {/* Action Row */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleClear}
          className="weight-btn border-zinc-700 text-zinc-400 h-16"
        >
          CLEAR
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="relative w-full h-16 bg-[#F97316] border-2 border-[#F97316] rounded-none text-black font-black text-sm uppercase tracking-widest flex items-center justify-center py-4"
        >
          CONFIRM
        </button>
      </div>
    </div>
  );
};

export default WeightIncrement;
