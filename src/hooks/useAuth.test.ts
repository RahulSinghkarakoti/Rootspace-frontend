import { describe, it, expect } from 'vitest'
import { parseName } from './useAuth'

describe('useAuth parseName helper', () => {
  it('returns empty strings for empty or whitespace-only inputs', () => {
    expect(parseName('')).toEqual(['', ''])
    expect(parseName('   ')).toEqual(['', ''])
  })

  it('assigns single-word names to firstName and leaves lastName empty', () => {
    expect(parseName('Rahul')).toEqual(['Rahul', ''])
    expect(parseName('  Priya  ')).toEqual(['Priya', ''])
  })

  it('splits standard two-part names correctly', () => {
    expect(parseName('Rahul Karakoti')).toEqual(['Rahul', 'Karakoti'])
  })

  it('handles multi-word names with middle names or multiple surnames', () => {
    expect(parseName('Mary Jane Watson')).toEqual(['Mary', 'Jane Watson'])
    expect(parseName('Arthur Conan Doyle')).toEqual(['Arthur', 'Conan Doyle'])
  })

  it('collapses irregular internal whitespace', () => {
    expect(parseName('  John    Edward   Smith  ')).toEqual(['John', 'Edward Smith'])
  })
})
