import { createStore } from 'redux';

// Định nghĩa reducer
const initialState = {
  data: null,
  isChatOpen: true,
  isTutorialOpen: false,
  isOpenSidebar: true,
  notebooks: {},
  successBotChat : null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_DATA':
      return { ...state, data: action.payload };
    case 'TOGGLE_CHAT':
      return { ...state, isChatOpen: !state.isChatOpen };
    case 'TOGGLE_TUTORIAL':
      return { ...state, isTutorialOpen: !state.isTutorialOpen };
    case 'TOGGLE_SIDEBAR':
      return { ...state, isOpenSidebar: !state.isOpenSidebar };
    case 'ADD_USER_MESSAGE':
      const { notebookIdUser, userMessage } = action.payload;
      const newUserMessage = { type: 'user', content: userMessage };
      return {
        ...state,
        notebooks: {
          ...state.notebooks,
          [notebookIdUser]: [...(state.notebooks[notebookIdUser] || []), newUserMessage],
        },
      };
    case 'ADD_BOT_MESSAGE':
      const { notebookIdBot, botMessage } = action.payload;
      const newBotMessage = { type: 'bot', content: botMessage, loading: true };
      return {
        ...state,
        notebooks: {
          ...state.notebooks,
          [notebookIdBot]: [...(state.notebooks[notebookIdBot] || []), newBotMessage],
        },
      };
    case 'UPDATE_BOT_MESSAGE':
      const { notebookId, messageIndex, newContent } = action.payload;
      return {
        ...state,
        notebooks: {
          ...state.notebooks,
          [notebookId]: state.notebooks[notebookId].map((msg, index) =>
            index === messageIndex ? { ...msg, content: newContent, loading: false } : msg
          ),
        },
      };
    case 'SET_SUCCESS_BOT_CHAT':
      return {
        ...state,
        successBotChat: action.payload
      };
    default:
      return state;
  }
};

// Tạo store
const store = createStore(reducer);

export default store;
