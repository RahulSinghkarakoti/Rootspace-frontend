import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'
import { useAppStore } from './appStore'
import { useTreeStore } from './treeStore'
import { useSharedTreeStore } from './sharedTreeStore'

describe('authStore logout data isolation', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('sets user and tokens on login', () => {
    const user = {
      id: 'usr-1',
      email: 'test@rootspace.app',
      firstName: 'Rahul',
      lastName: 'Karakoti',
    }
    const tokens = {
      accessToken: 'token-abc',
      expiresAt: Date.now() + 3600 * 1000,
    }

    useAuthStore.getState().login(user, tokens)

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.email).toBe('test@rootspace.app')
    expect(state.tokens?.accessToken).toBe('token-abc')
  })

  it('resets appStore dashboard, treeStore, and sharedTreeStore on logout', () => {
    // Populate stores with mock session data
    useAuthStore.getState().login(
      { id: 'usr-1', email: 'test@rootspace.app', firstName: 'Test', lastName: 'User' },
      { accessToken: 'token-123', expiresAt: Date.now() + 3600 }
    )

    useAppStore.getState().setDashboard({
      stats: { totalTrees: 5, totalPersons: 50, sharedWithMe: 2 },
      recentTrees: [],
    } as any)

    useTreeStore.setState({
      trees: [{ id: 1, name: 'Secret Family Tree' } as any],
      people: [{ id: 'p1', fullName: 'Secret Person' } as any],
      treesLoaded: true,
    })

    useSharedTreeStore.setState({
      token: 'shared-token-xyz',
      people: [{ id: 'sp1', fullName: 'Shared Member' } as any],
    })

    // Confirm populated
    expect(useAppStore.getState().dashboard).not.toBeNull()
    expect(useTreeStore.getState().trees.length).toBe(1)
    expect(useSharedTreeStore.getState().token).toBe('shared-token-xyz')

    // Perform logout
    useAuthStore.getState().logout()

    // Assert everything is thoroughly reset
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAppStore.getState().dashboard).toBeNull()
    expect(useTreeStore.getState().trees).toEqual([])
    expect(useTreeStore.getState().people).toEqual([])
    expect(useTreeStore.getState().treesLoaded).toBe(false)
    expect(useSharedTreeStore.getState().token).toBeNull()
    expect(useSharedTreeStore.getState().people).toEqual([])
  })
})
