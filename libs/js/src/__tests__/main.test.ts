import { createState } from '../index'

describe('createState', () => {
  describe('readOnly', () => {
    it('returns readOnly state which can be read and subscribed to', (done) => {
      const state = createState({
        todos: ['one'],
      })

      const readOnlyState = state.readOnly()
      expect(readOnlyState.get()).toEqual({ todos: ['one'] })

      readOnlyState.asObservable().subscribe((value) => {
        try {
          expect(value).toEqual({ todos: ['one'] })
          done()
        } catch (error) {
          done(error)
        }
      })
    })
  })
})
