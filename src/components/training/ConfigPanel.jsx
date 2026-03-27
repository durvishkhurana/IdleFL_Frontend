import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'

const DEFAULTS = { learningRate: 0.01, numRounds: 10, batchSize: 32 }

const LIMITS = {
  learningRate: { min: 0.0001, max: 1.0, step: 0.001 },
  numRounds:    { min: 1,      max: 100, step: 1 },
  batchSize:    { min: 8,      max: 512, step: 8 },
}

function validateConfig(config) {
  const errors = {}
  const lr = parseFloat(config.learningRate)
  const rounds = parseInt(config.numRounds)
  const batch = parseInt(config.batchSize)

  if (isNaN(lr) || lr < 0.0001 || lr > 1.0) errors.learningRate = 'Must be between 0.0001 and 1.0'
  if (isNaN(rounds) || rounds < 1 || rounds > 100) errors.numRounds = 'Must be between 1 and 100'
  if (isNaN(batch) || batch < 8 || batch > 512) errors.batchSize = 'Must be between 8 and 512'
  return errors
}

export default function ConfigPanel({ onChange, className = '' }) {
  const [config, setConfig] = useState({ ...DEFAULTS })
  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    const newConfig = { ...config, [field]: value }
    setConfig(newConfig)
    const newErrors = validateConfig(newConfig)
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0 && onChange) {
      onChange({
        learningRate: parseFloat(newConfig.learningRate),
        numRounds: parseInt(newConfig.numRounds),
        batchSize: parseInt(newConfig.batchSize),
      })
    }
  }

  const reset = () => {
    setConfig({ ...DEFAULTS })
    setErrors({})
    if (onChange) onChange({ ...DEFAULTS })
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white font-mono">Training Config</h3>
        <Button variant="ghost" size="sm" onClick={reset}>Reset Defaults</Button>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Learning Rate"
          type="number"
          value={config.learningRate}
          onChange={(e) => handleChange('learningRate', e.target.value)}
          error={errors.learningRate}
          hint={`Range: ${LIMITS.learningRate.min} – ${LIMITS.learningRate.max}`}
          step={LIMITS.learningRate.step}
          min={LIMITS.learningRate.min}
          max={LIMITS.learningRate.max}
        />
        <Input
          label="Number of Rounds"
          type="number"
          value={config.numRounds}
          onChange={(e) => handleChange('numRounds', e.target.value)}
          error={errors.numRounds}
          hint="Range: 1 – 100"
          step={1}
          min={1}
          max={100}
        />
        <Input
          label="Batch Size"
          type="number"
          value={config.batchSize}
          onChange={(e) => handleChange('batchSize', e.target.value)}
          error={errors.batchSize}
          hint="Range: 8 – 512"
          step={LIMITS.batchSize.step}
          min={LIMITS.batchSize.min}
          max={LIMITS.batchSize.max}
        />
      </div>
    </div>
  )
}
