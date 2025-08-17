import { createContext, useContext, useReducer } from 'react'

// Initial state
const initialState = {
  currentTranscript: null,
  currentSummary: null,
  summaries: [],
  transcripts: [],
  loading: false,
  error: null
}

// Action types
export const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_CURRENT_TRANSCRIPT: 'SET_CURRENT_TRANSCRIPT',
  SET_CURRENT_SUMMARY: 'SET_CURRENT_SUMMARY',
  ADD_TRANSCRIPT: 'ADD_TRANSCRIPT',
  ADD_SUMMARY: 'ADD_SUMMARY',
  UPDATE_SUMMARY: 'UPDATE_SUMMARY',
  SET_SUMMARIES: 'SET_SUMMARIES',
  SET_TRANSCRIPTS: 'SET_TRANSCRIPTS',
  CLEAR_CURRENT: 'CLEAR_CURRENT'
}

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false }
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null }
    
    case ActionTypes.SET_CURRENT_TRANSCRIPT:
      return { ...state, currentTranscript: action.payload }
    
    case ActionTypes.SET_CURRENT_SUMMARY:
      return { ...state, currentSummary: action.payload }
    
    case ActionTypes.ADD_TRANSCRIPT:
      return { 
        ...state, 
        transcripts: [action.payload, ...state.transcripts],
        currentTranscript: action.payload
      }
    
    case ActionTypes.ADD_SUMMARY:
      return { 
        ...state, 
        summaries: [action.payload, ...state.summaries],
        currentSummary: action.payload
      }
    
    case ActionTypes.UPDATE_SUMMARY:
      return {
        ...state,
        summaries: state.summaries.map(summary =>
          summary._id === action.payload._id ? action.payload : summary
        ),
        currentSummary: state.currentSummary?._id === action.payload._id 
          ? action.payload 
          : state.currentSummary
      }
    
    case ActionTypes.SET_SUMMARIES:
      return { ...state, summaries: action.payload }
    
    case ActionTypes.SET_TRANSCRIPTS:
      return { ...state, transcripts: action.payload }
    
    case ActionTypes.CLEAR_CURRENT:
      return { ...state, currentTranscript: null, currentSummary: null }
    
    default:
      return state
  }
}

// Create context
const AppContext = createContext()

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Action creators
  const actions = {
    setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR }),
    setCurrentTranscript: (transcript) => dispatch({ type: ActionTypes.SET_CURRENT_TRANSCRIPT, payload: transcript }),
    setCurrentSummary: (summary) => dispatch({ type: ActionTypes.SET_CURRENT_SUMMARY, payload: summary }),
    addTranscript: (transcript) => dispatch({ type: ActionTypes.ADD_TRANSCRIPT, payload: transcript }),
    addSummary: (summary) => dispatch({ type: ActionTypes.ADD_SUMMARY, payload: summary }),
    updateSummary: (summary) => dispatch({ type: ActionTypes.UPDATE_SUMMARY, payload: summary }),
    setSummaries: (summaries) => dispatch({ type: ActionTypes.SET_SUMMARIES, payload: summaries }),
    setTranscripts: (transcripts) => dispatch({ type: ActionTypes.SET_TRANSCRIPTS, payload: transcripts }),
    clearCurrent: () => dispatch({ type: ActionTypes.CLEAR_CURRENT })
  }

  const value = {
    ...state,
    ...actions
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
