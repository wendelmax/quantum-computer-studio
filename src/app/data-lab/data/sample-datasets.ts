export type SampleDataset = {
  id: string
  name: string
  description: string
  category: 'Finance' | 'Science' | 'Social' | 'Random'
  data: string[][]
  columns?: string[]
}

export const sampleDatasets: SampleDataset[] = [
  {
    id: 'random-numbers',
    name: 'Random Numbers',
    description: '100 random numbers between 0 and 1',
    category: 'Random',
    data: Array.from({ length: 100 }, (_, i) => [Math.random().toFixed(4)]),
    columns: ['value']
  },
  {
    id: 'sin-wave',
    name: 'Sine Wave',
    description: 'One period of a sine wave with 50 points',
    category: 'Science',
    data: Array.from({ length: 50 }, (_, i) => {
      const x = (i / 50) * 2 * Math.PI
      return [x.toFixed(4), Math.sin(x).toFixed(4)]
    }),
    columns: ['x', 'sin(x)']
  },
  {
    id: 'quadratic',
    name: 'Quadratic Function',
    description: 'Quadratic function y = x² with noise',
    category: 'Science',
    data: Array.from({ length: 30 }, (_, i) => {
      const x = i / 10
      const noise = (Math.random() - 0.5) * 0.2
      return [x.toFixed(2), (x * x + noise).toFixed(4)]
    }),
    columns: ['x', 'y']
  },
  {
    id: 'stock-like',
    name: 'Simulated Stock Prices',
    description: 'Simulated daily stock prices over 20 days',
    category: 'Finance',
    data: (() => {
      let price = 100
      const data: string[][] = []
      for (let i = 0; i < 20; i++) {
        const change = (Math.random() - 0.5) * 5
        price += change
        price = Math.max(50, Math.min(150, price))
        data.push([price.toFixed(2)])
      }
      return data
    })(),
    columns: ['price']
  },
  {
    id: 'classification',
    name: 'Simple Classification',
    description: '2D classification dataset with two features',
    category: 'Social',
    data: [
      ['1.2', '0.8', '0'],
      ['2.1', '1.5', '0'],
      ['0.9', '1.1', '0'],
      ['3.4', '2.8', '1'],
      ['4.1', '3.2', '1'],
      ['5.0', '4.0', '1'],
      ['1.8', '2.2', '0'],
      ['3.9', '3.5', '1'],
    ],
    columns: ['feature1', 'feature2', 'class']
  },
  {
    id: 'correlated',
    name: 'Correlated Data',
    description: 'Two correlated variables',
    category: 'Science',
    data: Array.from({ length: 25 }, (_, i) => {
      const x = i / 5
      const y = 2 * x + 1 + (Math.random() - 0.5) * 0.5
      return [x.toFixed(2), y.toFixed(4)]
    }),
    columns: ['x', 'y']
  }
]

