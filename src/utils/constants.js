export const MODEL_TYPES = {
  LINEAR_REGRESSION: {
    id: 'LINEAR_REGRESSION',
    label: 'Linear Regression',
    description: 'Predict continuous values from numerical features.',
    bestFor: 'Best for: numerical tabular data',
    icon: '📈',
    acceptedFormats: ['.csv'],
  },
  LOGISTIC_REGRESSION: {
    id: 'LOGISTIC_REGRESSION',
    label: 'Logistic Regression',
    description: 'Binary and multi-class classification on tabular data.',
    bestFor: 'Best for: classification tasks',
    icon: '🔀',
    acceptedFormats: ['.csv'],
  },
  CNN: {
    id: 'CNN',
    label: 'CNN',
    description: 'Convolutional network for image classification tasks.',
    bestFor: 'Best for: image datasets (e.g. MNIST)',
    icon: '🖼️',
    acceptedFormats: ['.zip'],
  },
}

export const DEVICE_STATUS = {
  ACTIVE: 'active',
  IDLE: 'idle',
  TRAINING: 'training',
  DROPPED: 'dropped',
}

export const SESSION_STATUS = {
  IDLE: 'idle',
  ACTIVE: 'active',
  TRAINING: 'training',
  COMPLETE: 'complete',
}

export const SCORE_THRESHOLD = 0.3
