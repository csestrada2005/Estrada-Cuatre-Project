import { describe, it, expect } from 'vitest'

describe('infraestructura de test', () => {
  it('arranca el runner', () => {
    expect(1 + 1).toBe(2)
  })

  it('tiene un DOM disponible', () => {
    const el = document.createElement('div')
    el.textContent = 'hola'
    document.body.appendChild(el)
    expect(document.body.textContent).toBe('hola')
  })
})
